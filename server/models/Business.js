const mongoose = require("mongoose");

const operatingHourSchema = new mongoose.Schema({
  open: { type: String, default: "09:00" },
  close: { type: String, default: "17:00" },
  isOpen: { type: Boolean, default: true },
});

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["clinic", "salon", "bank", "government", "restaurant", "other"],
      required: [true, "Business type is required"],
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    operatingHours: {
      monday:    { type: operatingHourSchema, default: () => ({}) },
      tuesday:   { type: operatingHourSchema, default: () => ({}) },
      wednesday: { type: operatingHourSchema, default: () => ({}) },
      thursday:  { type: operatingHourSchema, default: () => ({}) },
      friday:    { type: operatingHourSchema, default: () => ({}) },
      saturday: {
        type: operatingHourSchema,
        default: () => ({ open: "09:00", close: "14:00", isOpen: true }),
      },
      sunday: {
        type: operatingHourSchema,
        default: () => ({ open: null, close: null, isOpen: false }),
      },
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);