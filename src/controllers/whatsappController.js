const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");
const path = require("path");

let qrCode = null;
let isAuthenticated = null;
let isReady = null;
let authFailure = null;

const client = new Client({
  authStrategy: new LocalAuth(),
});

const handleQrCode = (qr) => {
  console.log("QRcode gerado");
  qrCode = qr;
  authFailure = null;
};

const handleAuthenticated = () => {
  console.log("Client authenticated.");
  qrCode = null;
  isAuthenticated = true;
  authFailure = null;
};

const handleAuthFailure = (msg) => {
  console.error("Failure authenticated", msg);
  qrCode = null;
  isAuthenticated = false;
  authFailure = msg;

  // Evita loop de reinicialização
  if (!isReady) {
    client.initialize();
  }
};

const handleClientReady = () => {
  console.log("Client is ready.");
  isReady = true;
};

const handleDisconnected = () => {
  const authDir = path.join(__dirname, ".wwebjs_auth");
  const cacheDir = path.join(__dirname, ".wwebjs_cache");

  if (fs.existsSync(authDir)) {
    fs.rmSync(authDir, { recursive: true, force: true });
    console.log(".wwebjs_auth removed!");
  }

  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log(".wwebjs_cache removed!");
  }

  qrCode = null;
  isAuthenticated = null;
  isReady = null;
  authFailure = null;

  client.initialize();
};

// Eventos do client
client.on("qr", handleQrCode);
client.on("authenticated", handleAuthenticated);
client.on("auth_failure", handleAuthFailure);
client.on("ready", handleClientReady);
client.on("disconnected", handleDisconnected);

client.initialize();

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
