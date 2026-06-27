const express = require("express");
const router = express.Router();
const {
  getBusiness,
  updateBusiness,
} = require("../controllers/businessController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", getBusiness);
router.put("/", authorize("admin"), updateBusiness);

module.exports = router;