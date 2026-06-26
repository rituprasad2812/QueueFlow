const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Queue name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "paused", "closed"],
      default: "active",
    },
    maxCapacity: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    avgServiceTime: {
      type: Number,
      default: 10, // minutes per customer
    },
    currentTokenNumber: {
      type: Number,
      default: 0,
    },
    totalServedToday: {
      type: Number,
      default: 0,
    },
    qrCode: {
      type: String,
      default: null,
    },
    settings: {
      noShowTimer: {
        type: Number,
        default: 5, // minutes
      },
      notifyBeforePosition: {
        type: Number,
        default: 3, // notify when 3 spots away
      },
      requirePhone: {
        type: Boolean,
        default: false,
      },
    },
    date: {
      type: String, // "2024-01-15" - for daily reset
      default: () => new Date().toISOString().split("T")[0],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Queue", queueSchema);