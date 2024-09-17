const express = require("express");
const {
  sendMessage,
  getQrCode,
  getStatus,
  restartClient,
} = require("../controllers/whatsappController");
const validateRequest = require("../middlewares/validation");
const disableCache = require("../middlewares/disableCache");

const router = express.Router();

router.get("/qr-code", disableCache, getQrCode);
router.get("/status", getStatus);
router.post("/send-message", validateRequest, sendMessage);
router.post("/restart", restartClient);

module.exports = router;
