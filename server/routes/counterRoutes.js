const express = require("express");
const router = express.Router();
const {
  createCounter,
  getCounters,
  updateCounter,
  deleteCounter,
} = require("../controllers/counterController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.post("/", authorize("admin"), createCounter);
router.get("/", authorize("admin", "staff"), getCounters);
router.put("/:id", authorize("admin"), updateCounter);
router.delete("/:id", authorize("admin"), deleteCounter);

module.exports = router;