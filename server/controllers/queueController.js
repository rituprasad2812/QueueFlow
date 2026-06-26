const Queue = require("../models/Queue");
const Counter = require("../models/Counter");
const qrcode = require("qrcode");

// @desc    Create a new queue
// @route   POST /api/queues
// @access  Private (Admin)
const createQueue = async (req, res, next) => {
  try {
    const { name, description, maxCapacity, avgServiceTime, settings } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Queue name is required",
      });
    }

    // Create queue
    const queue = await Queue.create({
      businessId: req.user.businessId,
      name,
      description,
      maxCapacity: maxCapacity || 0,
      avgServiceTime: avgServiceTime || 10,
      settings: settings || {},
    });

    // Generate QR code for this queue
    const queueUrl = `${process.env.CLIENT_URL}/join/${queue._id}`;
    const qrCode = await qrcode.toDataURL(queueUrl);

    // Save QR code to queue
    queue.qrCode = qrCode;
    await queue.save();

    res.status(201).json({
      success: true,
      message: "Queue created successfully",
      queue,
    });
  } catch (error) {
    console.log("CREATE QUEUE ERROR:", error.message);
    next(error);
  }
};

// @desc    Get all queues for a business
// @route   GET /api/queues
// @access  Private (Admin, Staff)
const getQueues = async (req, res, next) => {
  try {
    const queues = await Queue.find({
      businessId: req.user.businessId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: queues.length,
      queues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single queue
// @route   GET /api/queues/:id
// @access  Private (Admin, Staff)
const getQueue = async (req, res, next) => {
  try {
    const queue = await Queue.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue not found",
      });
    }

    // Get counters for this queue
    const counters = await Counter.find({
      queueId: queue._id,
    }).populate("staffId", "name email");

    res.status(200).json({
      success: true,
      queue,
      counters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update queue
// @route   PUT /api/queues/:id
// @access  Private (Admin)
const updateQueue = async (req, res, next) => {
  try {
    const queue = await Queue.findOneAndUpdate(
      {
        _id: req.params.id,
        businessId: req.user.businessId,
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Queue updated successfully",
      queue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete queue
// @route   DELETE /api/queues/:id
// @access  Private (Admin)
const deleteQueue = async (req, res, next) => {
  try {
    const queue = await Queue.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user.businessId,
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue not found",
      });
    }

    // Also delete all counters for this queue
    await Counter.deleteMany({ queueId: queue._id });

    res.status(200).json({
      success: true,
      message: "Queue deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update queue status (open/pause/close)
// @route   PUT /api/queues/:id/status
// @access  Private (Admin, Staff)
const updateQueueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["active", "paused", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const queue = await Queue.findOneAndUpdate(
      {
        _id: req.params.id,
        businessId: req.user.businessId,
      },
      { status },
      { new: true }
    );

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Queue ${status} successfully`,
      queue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public queue info (for customers)
// @route   GET /api/queues/:id/public
// @access  Public
const getPublicQueue = async (req, res, next) => {
  try {
    const queue = await Queue.findById(req.params.id).populate(
      "businessId",
      "name type address"
    );

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue not found",
      });
    }

    // Count people waiting
    const Token = require("../models/Token");
    const waitingCount = await Token.countDocuments({
      queueId: queue._id,
      status: "waiting",
    });

    res.status(200).json({
      success: true,
      queue: {
        id: queue._id,
        name: queue.name,
        description: queue.description,
        status: queue.status,
        avgServiceTime: queue.avgServiceTime,
        waitingCount,
        estimatedWait: waitingCount * queue.avgServiceTime,
        business: queue.businessId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQueue,
  getQueues,
  getQueue,
  updateQueue,
  deleteQueue,
  updateQueueStatus,
  getPublicQueue,
};