const express = require("express");
const router = express.Router();
const {
  createStaff,
  getStaff,
  deleteStaff,
} = require("../controllers/staffController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);
router.use(authorize("admin"));

router.post("/", createStaff);
router.get("/", getStaff);
router.delete("/:id", deleteStaff);

module.exports = router;