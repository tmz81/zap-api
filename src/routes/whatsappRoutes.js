const express = require("express");
const {
  sendMessage,
  getQrCode,
  getStatus,
  restartClient,
} = require("../controllers/whatsappController");
const validateRequest = require("../middlewares/validationMiddleware");

const router = express.Router();

router.use("/qr-code", (req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

router.get("/qr-code", getQrCode);
router.get("/status", getStatus);
router.post("/send-message", validateRequest, sendMessage);
router.post("/restart", restartClient);

module.exports = router;
