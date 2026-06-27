const Token = require("../models/Token");
const Counter = require("../models/Counter");
const { emitToQueue, emitToToken } = require("../socket/socketManager");

// Store active timers
const activeTimers = new Map();

// Start no-show timer for a token
const startNoShowTimer = (tokenId, queueId, minutes) => {
  // Clear existing timer if any
  clearNoShowTimer(tokenId);

  const timeout = setTimeout(async () => {
    try {
      const token = await Token.findById(tokenId);

      // Only auto-skip if still in "called" status
      if (token && token.status === "called") {
        token.status = "no_show";
        token.completedAt = new Date();
        token.noShowTimerExpiry = null;
        await token.save();

        // Free up counter
        if (token.counterId) {
          await Counter.findByIdAndUpdate(token.counterId, {
            currentToken: null,
          });
        }

        // Recalculate positions
        await recalculatePositions(queueId);

        // Broadcast
        emitToQueue(queueId.toString(), "token:no_show", {
          tokenId: token._id,
          tokenNumber: token.tokenNumber,
        });

        emitToToken(tokenId.toString(), "your:no_show", {
          message: "You were marked as no-show",
        });

        console.log(`⏰ Auto no-show: ${token.tokenNumber}`);
      }

      // Remove timer from map
      activeTimers.delete(tokenId.toString());
    } catch (error) {
      console.log("NO-SHOW TIMER ERROR:", error.message);
    }
  }, minutes * 60 * 1000);

  // Store timer reference
  activeTimers.set(tokenId.toString(), timeout);
  console.log(`⏰ Timer started for ${tokenId}: ${minutes} minutes`);
};

// Clear timer (when customer shows up)
const clearNoShowTimer = (tokenId) => {
  const timer = activeTimers.get(tokenId.toString());
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(tokenId.toString());
    console.log(`⏰ Timer cleared for ${tokenId}`);
  }
};

// Helper: Recalculate positions
const recalculatePositions = async (queueId) => {
  const waitingTokens = await Token.find({
    queueId,
    status: "waiting",
  }).sort({ joinedAt: 1 });

  const Queue = require("../models/Queue");
  const queue = await Queue.findById(queueId);
  const avgTime = queue?.avgServiceTime || 10;

  for (let i = 0; i < waitingTokens.length; i++) {
    waitingTokens[i].position = i + 1;
    waitingTokens[i].estimatedWaitMinutes = (i + 1) * avgTime;
    await waitingTokens[i].save();
  }

  emitToQueue(queueId.toString(), "positions:updated", {
    positions: waitingTokens.map((t) => ({
      tokenId: t._id,
      position: t.position,
      estimatedWaitMinutes: t.estimatedWaitMinutes,
    })),
  });
};

module.exports = { startNoShowTimer, clearNoShowTimer };