const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Counter name is required"],
      trim: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "break"],
      default: "active",
    },
    currentToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
      default: null,
    },
    totalServedToday: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Counter", counterSchema);