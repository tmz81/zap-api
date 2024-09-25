const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

let qrCode = null;
let isAuthenticated = false;
let isReady = false;
let authFailure = null;
let retryCount = 0;
const maxRetries = 3;
let isAuthenticating = false;

const client = new Client({
  authStrategy: new LocalAuth(),
});

const handleQrCode = (qr) => {
  console.log("QR Code gerado");
  qrCode = qr;
  io.emit("qr", qrCode);
};

const handleAuthenticated = () => {
  console.log("Cliente autenticado.");
  qrCode = null;
  isAuthenticated = true;
  authFailure = null;
  isAuthenticating = false;

  io.emit("authenticated");
};

const handleAuthFailure = (msg) => {
  console.error("Falha na autenticação:", msg);
  qrCode = null;
  isAuthenticated = false;
  authFailure = msg;
  isAuthenticating = false;

  io.emit("auth_failure", msg);

  if (!isReady && retryCount < maxRetries) {
    retryCount++;
    console.log(`Tentativa de reiniciar o cliente... Tentativa ${retryCount}`);
    setTimeout(() => client.initialize(), 5000);
  } else if (retryCount >= maxRetries) {
    console.error("Limite de tentativas para reiniciar o cliente alcançado.");
  }
};

const handleClientReady = () => {
  console.log("Cliente está pronto.");
  isReady = true;

  io.emit("ready");
};

const handleDisconnected = async () => {
  console.log("Cliente desconectado.");

  await client.destroy();

  const authDir = path.join(__dirname, ".wwebjs_auth");
  const cacheDir = path.join(__dirname, ".wwebjs_cache");

  cleanDirectory(authDir);
  cleanDirectory(cacheDir);

  qrCode = null;
  isAuthenticated = false;
  isReady = false;
  authFailure = null;

  io.emit("disconnected");

  client.initialize();
};

client.on("qr", handleQrCode);
client.on("authenticated", handleAuthenticated);
client.on("auth_failure", handleAuthFailure);
client.on("ready", handleClientReady);
client.on("disconnected", handleDisconnected);

client.initialize();

const cleanDirectory = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`${dirPath} removido!`);
  }
};

app.get("/status", (req, res) => {
  res.json({
    isAuthenticated,
    isReady,
    authFailure,
  });
});

app.post("/send-message", async (req, res) => {
  const { ddd, number, message, repeatTimes } = req.body;

  if (!isAuthenticated || !isReady) {
    return res
      .status(400)
      .json({ error: "Cliente não autenticado ou não pronto." });
  }

  const numberFormat = number.slice(1);
  const chatId = `55${ddd}${numberFormat}@c.us`;

  try {
    for (let i = 0; i < parseInt(repeatTimes); i++) {
      await client.sendMessage(chatId, message);
    }
    res.json({ success: true, message: "Mensagem enviada com sucesso." });
  } catch (err) {
    res.status(500).json({ error: "Erro ao enviar a mensagem." });
  }
});

server.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});

io.on("connection", (socket) => {
  console.log("Cliente conectado via Socket.io");

  socket.emit("status", {
    isAuthenticated,
    isReady,
    authFailure,
  });

  if (qrCode) {
    socket.emit("qr", qrCode);
  }

  socket.on("disconnect", () => {
    console.log("Cliente desconectado do Socket.io");
  });
});
