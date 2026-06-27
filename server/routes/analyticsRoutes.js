const express = require("express");
const router = express.Router();
const {
  getOverview,
  getPeakHours,
  getWeeklyStats,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);
router.use(authorize("admin"));

router.get("/overview", getOverview);
router.get("/peak-hours", getPeakHours);
router.get("/weekly", getWeeklyStats);

module.exports = router;