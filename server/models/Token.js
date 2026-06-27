const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    counterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counter",
      default: null,
    },
    tokenNumber: {
      type: String,
      required: true,
    },

    // Customer info (no account needed)
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["waiting", "called", "serving", "completed", "no_show", "cancelled"],
      default: "waiting",
    },

    position: {
      type: Number,
      default: 0,
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 0,
    },

    // Timestamps for analytics
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    servingStartedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // No show timer
    noShowTimerExpiry: {
      type: Date,
      default: null,
    },

    // Notification tracking
    notificationSent: {
      nearlyThere: { type: Boolean, default: false },
      called: { type: Boolean, default: false },
    },

    // Date for daily grouping
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", tokenSchema);