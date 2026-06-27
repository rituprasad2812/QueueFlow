const express = require("express");
const router = express.Router();
const {
  joinQueue,
  trackToken,
  getQueueTokens,
  callToken,
  serveToken,
  completeToken,
  noShowToken,
  cancelToken,
  getNextToken,
} = require("../controllers/tokenController");
const { protect } = require("../middleware/authMiddleware");

// Public routes (no login needed)
router.post("/join", joinQueue);
router.get("/track/:tokenId", trackToken);
router.put("/:id/cancel", cancelToken);

// Protected routes (staff/admin)
router.use(protect);
router.get("/queue/:queueId", getQueueTokens);
router.put("/:id/call", callToken);
router.put("/:id/serve", serveToken);
router.put("/:id/complete", completeToken);
router.put("/:id/no-show", noShowToken);
router.get("/next/:queueId", getNextToken);

module.exports = router;