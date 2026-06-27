const User = require("../models/User");

// @desc    Create staff account
// @route   POST /api/staff
// @access  Private (Admin)
const createStaff = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const staff = await User.create({
      name,
      email,
      password,
      role: "staff",
      businessId: req.user.businessId,
    });

    res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      staff: {
        _id: staff._id,
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private (Admin)
const getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({
      businessId: req.user.businessId,
      role: "staff",
    }).select("-password");

    res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private (Admin)
const deleteStaff = async (req, res, next) => {
  try {
    console.log("DELETE STAFF - ID:", req.params.id);
    console.log("Business ID:", req.user.businessId);

    const staff = await User.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user.businessId,
      role: "staff",
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff removed successfully",
    });
  } catch (error) {
    console.log("DELETE STAFF ERROR:", error.message);
    next(error);
  }
};

module.exports = { createStaff, getStaff, deleteStaff };