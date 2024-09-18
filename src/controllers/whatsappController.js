const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");
const path = require("path");

let qrCode = null;
let isAuthenticated = null;
let isReady = null;
let authFailure = null;
let retryCount = 0;
const maxRetries = 3;

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
  if (!isReady && retryCount < maxRetries) {
    retryCount++;
    console.log(`Try restart client... Try ${retryCount}`);
    setTimeout(() => client.initialize(), 5000);
  } else if (retryCount >= maxRetries) {
    console.error("Limite try restart client.");
  }
};

const handleClientReady = () => {
  console.log("Client is ready.");
  isReady = true;
};

const cleanDirectory = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`${dirPath} removed!`);
  }
};

const handleDisconnected = () => {
  const authDir = path.join(__dirname, ".wwebjs_auth");
  const cacheDir = path.join(__dirname, ".wwebjs_cache");

  cleanDirectory(authDir);
  cleanDirectory(cacheDir);

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

const restartClient = async () => {
  if (client) {
    await client.destroy();
    console.log("Client destroy, restar application");
    client.initialize();
  }
};

module.exports = {
  getQrCode,
  getStatus,
  sendMessage,
  restartClient,
};
