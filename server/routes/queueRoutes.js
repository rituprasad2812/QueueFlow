const express = require("express");
const router = express.Router();
const {
  createQueue,
  getQueues,
  getQueue,
  updateQueue,
  deleteQueue,
  updateQueueStatus,
  getPublicQueue,
} = require("../controllers/queueController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public route
router.get("/:id/public", getPublicQueue);

// Protected routes
router.use(protect);

router.post("/", authorize("admin"), createQueue);
router.get("/", authorize("admin", "staff"), getQueues);
router.get("/:id", authorize("admin", "staff"), getQueue);
router.put("/:id", authorize("admin"), updateQueue);
router.delete("/:id", authorize("admin"), deleteQueue);
router.put("/:id/status", authorize("admin", "staff"), updateQueueStatus);

module.exports = router;