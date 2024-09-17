const client = require("../services/whatsappClient");
const {
  qrCode,
  isAuthenticated,
  isReady,
  authFailure,
} = require("../services/whatsappEvents");

const getQrCode = (req, res) => {
  if (qrCode) {
    return res.status(200).json({ qrCode });
  } else {
    return res.status(404).json({ error: "QR Code ainda não gerado." });
  }
};

const getStatus = (req, res) => {
  res.json({
    isAuthenticated,
    isReady,
    authFailure,
  });
};

const sendMessage = async (req, res) => {
  console.log("Mensagem chegou: ", req.body);
  const { number, message, repeatTimes } = req.body;

  if (!isAuthenticated || !isReady) {
    return res
      .status(400)
      .json({ error: "Client not authenticated or not ready." });
  }

  const chatId = `5581${number}@c.us`;

  try {
    for (let i = 0; i < parseInt(repeatTimes); i++) {
      await client.sendMessage(chatId, message);
    }
    res.json({ success: true, message: "Message send success." });
  } catch (err) {
    res.status(500).json({ error: "Error sending message." });
  }
};

const restartClient = () => {
  if (client) {
    client.destroy();
    client.initialize();
  }
};

module.exports = {
  getQrCode,
  getStatus,
  sendMessage,
  restartClient,
};
