const Business = require("../models/Business");

// @desc    Get business info
// @route   GET /api/business
// @access  Private
const getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.user.businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.status(200).json({
      success: true,
      business,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update business info
// @route   PUT /api/business
// @access  Private (Admin)
const updateBusiness = async (req, res, next) => {
  try {
    const { name, address, phone, email, operatingHours } = req.body;

    const business = await Business.findByIdAndUpdate(
      req.user.businessId,
      { name, address, phone, email, operatingHours },
      { new: true, runValidators: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Business updated successfully",
      business,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBusiness, updateBusiness };