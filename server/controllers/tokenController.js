const Token = require("../models/Token");
const Queue = require("../models/Queue");
const Counter = require("../models/Counter");
const generateTokenNumber = require("../utils/tokenNumber");
const { emitToQueue, emitToToken } = require("../socket/socketManager");
const { startNoShowTimer, clearNoShowTimer } = require("../services/noShowService");

// @desc    Customer joins queue
const joinQueue = async (req, res, next) => {
  try {
    const { queueId, customerName, customerPhone } = req.body;

    if (!queueId || !customerName) {
      return res.status(400).json({
        success: false,
        message: "Queue ID and customer name are required",
      });
    }

    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue not found",
      });
    }

    if (queue.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Queue is currently not accepting new entries",
      });
    }

    // Check capacity
    if (queue.maxCapacity > 0) {
      const currentWaiting = await Token.countDocuments({
        queueId,
        status: "waiting",
      });

      if (currentWaiting >= queue.maxCapacity) {
        return res.status(400).json({
          success: false,
          message: "Queue is full. Please try again later.",
        });
      }
    }

    // Daily reset
    const today = new Date().toISOString().split("T")[0];
    if (queue.date !== today) {
      queue.currentTokenNumber = 0;
      queue.totalServedToday = 0;
      queue.date = today;
      await queue.save();
    }

    // Generate token
    queue.currentTokenNumber += 1;
    await queue.save();

    const tokenNumber = generateTokenNumber(queue.currentTokenNumber);

    const waitingCount = await Token.countDocuments({
      queueId,
      status: "waiting",
    });

    const position = waitingCount + 1;
    const estimatedWaitMinutes = position * queue.avgServiceTime;

    const token = await Token.create({
      queueId,
      businessId: queue.businessId,
      tokenNumber,
      customerName,
      customerPhone: customerPhone || "",
      status: "waiting",
      position,
      estimatedWaitMinutes,
    });

    // BROADCAST: new token joined
    emitToQueue(queueId, "token:new", {
      tokenNumber: token.tokenNumber,
      customerName: token.customerName,
      position: token.position,
    });

    res.status(201).json({
      success: true,
      message: "Successfully joined the queue!",
      token: {
        id: token._id,
        tokenNumber: token.tokenNumber,
        customerName: token.customerName,
        position: token.position,
        estimatedWaitMinutes: token.estimatedWaitMinutes,
        status: token.status,
        joinedAt: token.joinedAt,
      },
    });
  } catch (error) {
    console.log("JOIN QUEUE ERROR:", error.message);
    next(error);
  }
};

// @desc    Track token
const trackToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.tokenId)
      .populate("queueId", "name avgServiceTime")
      .populate("businessId", "name type")
      .populate("counterId", "name");

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    let position = token.position;
    if (token.status === "waiting") {
      position = (await Token.countDocuments({
        queueId: token.queueId._id,
        status: "waiting",
        joinedAt: { $lt: token.joinedAt },
      })) + 1;

      const estimatedWaitMinutes = position * token.queueId.avgServiceTime;

      if (position !== token.position) {
        token.position = position;
        token.estimatedWaitMinutes = estimatedWaitMinutes;
        await token.save();
      }
    }

    res.status(200).json({
      success: true,
      token: {
        id: token._id,
        tokenNumber: token.tokenNumber,
        customerName: token.customerName,
        position: token.position,
        estimatedWaitMinutes: token.estimatedWaitMinutes,
        status: token.status,
        joinedAt: token.joinedAt,
        calledAt: token.calledAt,
        queue: token.queueId,
        business: token.businessId,
        counter: token.counterId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tokens in queue
const getQueueTokens = async (req, res, next) => {
  try {
    const tokens = await Token.find({
      queueId: req.params.queueId,
      date: new Date().toISOString().split("T")[0],
    })
      .populate("counterId", "name")
      .sort({ joinedAt: 1 });

    const waiting = tokens.filter((t) => t.status === "waiting");
    const called = tokens.filter((t) => t.status === "called");
    const serving = tokens.filter((t) => t.status === "serving");
    const completed = tokens.filter((t) => t.status === "completed");
    const noShow = tokens.filter((t) => t.status === "no_show");

    res.status(200).json({
      success: true,
      summary: {
        total: tokens.length,
        waiting: waiting.length,
        called: called.length,
        serving: serving.length,
        completed: completed.length,
        noShow: noShow.length,
      },
      tokens: { waiting, called, serving, completed, noShow },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Call next token
const callToken = async (req, res, next) => {
  try {
    const { counterId } = req.body;

    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    if (token.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Token is not in waiting status",
      });
    }

    token.status = "called";
    token.calledAt = new Date();
    token.counterId = counterId || null;

    const queue = await Queue.findById(token.queueId);
    const noShowMinutes = queue?.settings?.noShowTimer || 5;
    token.noShowTimerExpiry = new Date(Date.now() + noShowMinutes * 60 * 1000);

    await token.save();

    if (counterId) {
      await Counter.findByIdAndUpdate(counterId, {
        currentToken: token._id,
      });
    }

    await recalculatePositions(token.queueId);

    // START NO-SHOW TIMER
    startNoShowTimer(token._id.toString(), token.queueId.toString(), noShowMinutes);

    // BROADCAST
    emitToQueue(token.queueId.toString(), "token:called", {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      counterId: token.counterId,
    });

    emitToToken(token._id.toString(), "your:turn", {
      tokenNumber: token.tokenNumber,
    });

    const populatedToken = await Token.findById(token._id)
      .populate("counterId", "name");

    res.status(200).json({
      success: true,
      message: `Token ${token.tokenNumber} called`,
      token: populatedToken,
    });
  } catch (error) {
    console.log("CALL TOKEN ERROR:", error.message);
    next(error);
  }
};

// @desc    Start serving
const serveToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    if (token.status !== "called") {
      return res.status(400).json({
        success: false,
        message: "Token must be called first",
      });
    }

    // CLEAR NO-SHOW TIMER (customer showed up!)
    clearNoShowTimer(token._id.toString());

    token.status = "serving";
    token.servingStartedAt = new Date();
    token.noShowTimerExpiry = null;
    await token.save();

    emitToQueue(token.queueId.toString(), "token:serving", {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
    });

    emitToToken(token._id.toString(), "your:serving", {});

    res.status(200).json({
      success: true,
      message: `Now serving ${token.tokenNumber}`,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete token
const completeToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    if (!["called", "serving"].includes(token.status)) {
      return res.status(400).json({
        success: false,
        message: "Token must be called or serving to complete",
      });
    }

    token.status = "completed";
    token.completedAt = new Date();
    token.noShowTimerExpiry = null;
    await token.save();

    if (token.counterId) {
      await Counter.findByIdAndUpdate(token.counterId, {
        currentToken: null,
        $inc: { totalServedToday: 1 },
      });
    }

    await Queue.findByIdAndUpdate(token.queueId, {
      $inc: { totalServedToday: 1 },
    });

    await recalculatePositions(token.queueId);

    // BROADCAST
    emitToQueue(token.queueId.toString(), "token:completed", {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
    });

    emitToToken(token._id.toString(), "your:completed", {});

    res.status(200).json({
      success: true,
      message: `Token ${token.tokenNumber} completed`,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    No show
const noShowToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    token.status = "no_show";
    token.completedAt = new Date();
    token.noShowTimerExpiry = null;
    await token.save();

    if (token.counterId) {
      await Counter.findByIdAndUpdate(token.counterId, {
        currentToken: null,
      });
    }

    await recalculatePositions(token.queueId);

    // BROADCAST
    emitToQueue(token.queueId.toString(), "token:no_show", {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
    });

    emitToToken(token._id.toString(), "your:no_show", {});

    res.status(200).json({
      success: true,
      message: `Token ${token.tokenNumber} marked as no show`,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel token
const cancelToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    if (!["waiting", "called"].includes(token.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel token in current status",
      });
    }

    token.status = "cancelled";
    token.completedAt = new Date();
    await token.save();

    await recalculatePositions(token.queueId);

    // BROADCAST
    emitToQueue(token.queueId.toString(), "token:cancelled", {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
    });

    res.status(200).json({
      success: true,
      message: "Token cancelled successfully",
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get next waiting token
const getNextToken = async (req, res, next) => {
  try {
    const nextToken = await Token.findOne({
      queueId: req.params.queueId,
      status: "waiting",
    }).sort({ joinedAt: 1 });

    res.status(200).json({
      success: true,
      token: nextToken,
    });
  } catch (error) {
    next(error);
  }
};

// Helper
const recalculatePositions = async (queueId) => {
  const waitingTokens = await Token.find({
    queueId,
    status: "waiting",
  }).sort({ joinedAt: 1 });

  const queue = await Queue.findById(queueId);
  const avgTime = queue?.avgServiceTime || 10;

  for (let i = 0; i < waitingTokens.length; i++) {
    waitingTokens[i].position = i + 1;
    waitingTokens[i].estimatedWaitMinutes = (i + 1) * avgTime;
    await waitingTokens[i].save();
  }

  // Broadcast position updates
  emitToQueue(queueId.toString(), "positions:updated", {
    positions: waitingTokens.map((t) => ({
      tokenId: t._id,
      position: t.position,
      estimatedWaitMinutes: t.estimatedWaitMinutes,
    })),
  });
};

module.exports = {
  joinQueue,
  trackToken,
  getQueueTokens,
  callToken,
  serveToken,
  completeToken,
  noShowToken,
  cancelToken,
  getNextToken,
};