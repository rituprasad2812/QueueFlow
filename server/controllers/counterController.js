const Counter = require("../models/Counter");

// @desc    Create counter
// @route   POST /api/counters
// @access  Private (Admin)
const createCounter = async (req, res, next) => {
  try {
    const { name, queueId } = req.body;

    if (!name || !queueId) {
      return res.status(400).json({
        success: false,
        message: "Counter name and Queue ID are required",
      });
    }

    let counter = await Counter.create({
      businessId: req.user.businessId,
      queueId,
      name,
    });

    // Populate queue name before sending response
    counter = await counter.populate("queueId", "name");

    res.status(201).json({
      success: true,
      message: "Counter created successfully",
      counter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all counters for business
// @route   GET /api/counters
// @access  Private (Admin, Staff)
const getCounters = async (req, res, next) => {
  try {
    const counters = await Counter.find({
      businessId: req.user.businessId,
    }).populate("queueId", "name").sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: counters.length,
      counters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update counter
// @route   PUT /api/counters/:id
// @access  Private (Admin)
const updateCounter = async (req, res, next) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!counter) {
      return res.status(404).json({
        success: false,
        message: "Counter not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Counter updated successfully",
      counter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete counter
// @route   DELETE /api/counters/:id
// @access  Private (Admin)
const deleteCounter = async (req, res, next) => {
  try {
    const counter = await Counter.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user.businessId,
    });

    if (!counter) {
      return res.status(404).json({
        success: false,
        message: "Counter not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Counter deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCounter,
  getCounters,
  updateCounter,
  deleteCounter,
};