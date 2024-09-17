const fs = require("fs");
const path = require("path");
const client = require("./whatsappClient");

let qrCode = null;
let isAuthenticated = null;
let isReady = null;
let authFailure = null;

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

client.on("qr", handleQrCode);
client.on("authenticated", handleAuthenticated);
client.on("auth_failure", handleAuthFailure);
client.on("ready", handleClientReady);
client.on("disconnected", handleDisconnected);

module.exports = {
  qrCode,
  isAuthenticated,
  isReady,
  authFailure,
  handleQrCode,
  handleAuthenticated,
  handleAuthFailure,
  handleClientReady,
  handleDisconnected,
};
