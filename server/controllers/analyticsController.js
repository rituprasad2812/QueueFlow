const Token = require("../models/Token");
const Queue = require("../models/Queue");

// @desc    Get overview stats
// @route   GET /api/analytics/overview
// @access  Private (Admin)
const getOverview = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const todayTokens = await Token.find({
      businessId: req.user.businessId,
      date: today,
    });

    const totalServed = todayTokens.filter(
      (t) => t.status === "completed"
    ).length;

    const totalWaiting = todayTokens.filter(
      (t) => t.status === "waiting"
    ).length;

    const totalNoShow = todayTokens.filter(
      (t) => t.status === "no_show"
    ).length;

    const totalCancelled = todayTokens.filter(
      (t) => t.status === "cancelled"
    ).length;

    // Calculate avg wait time
    const completedTokens = todayTokens.filter(
      (t) => t.status === "completed" && t.calledAt && t.joinedAt
    );

    let avgWaitTime = 0;
    if (completedTokens.length > 0) {
      const totalWaitMs = completedTokens.reduce((sum, t) => {
        return sum + (new Date(t.calledAt) - new Date(t.joinedAt));
      }, 0);
      avgWaitTime = Math.round(
        totalWaitMs / completedTokens.length / 1000 / 60
      );
    }

    // Calculate avg service time
    let avgServiceTime = 0;
    const servedTokens = completedTokens.filter(
      (t) => t.completedAt && t.servingStartedAt
    );
    if (servedTokens.length > 0) {
      const totalServiceMs = servedTokens.reduce((sum, t) => {
        return sum + (new Date(t.completedAt) - new Date(t.servingStartedAt));
      }, 0);
      avgServiceTime = Math.round(
        totalServiceMs / servedTokens.length / 1000 / 60
      );
    }

    res.status(200).json({
      success: true,
      overview: {
        totalServed,
        totalWaiting,
        totalNoShow,
        totalCancelled,
        totalTokens: todayTokens.length,
        avgWaitTime,
        avgServiceTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get peak hours data
// @route   GET /api/analytics/peak-hours
// @access  Private (Admin)
const getPeakHours = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const tokens = await Token.find({
      businessId: req.user.businessId,
      date: today,
    });

    // Group by hour
    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0");
      hourlyData[hour] = 0;
    }

    tokens.forEach((token) => {
      const hour = new Date(token.joinedAt)
        .getHours()
        .toString()
        .padStart(2, "0");
      hourlyData[hour]++;
    });

    const peakHours = Object.entries(hourlyData).map(([hour, count]) => ({
      hour: `${hour}:00`,
      customers: count,
    }));

    res.status(200).json({
      success: true,
      peakHours,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly stats
// @route   GET /api/analytics/weekly
// @access  Private (Admin)
const getWeeklyStats = async (req, res, next) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayTokens = await Token.find({
        businessId: req.user.businessId,
        date: dateStr,
      });

      const served = dayTokens.filter(
        (t) => t.status === "completed"
      ).length;

      const noShow = dayTokens.filter(
        (t) => t.status === "no_show"
      ).length;

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      days.push({
        day: dayNames[date.getDay()],
        date: dateStr,
        served,
        noShow,
        total: dayTokens.length,
      });
    }

    res.status(200).json({
      success: true,
      weekly: days,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOverview, getPeakHours, getWeeklyStats };