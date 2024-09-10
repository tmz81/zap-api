const express = require("express");
const cors = require("cors"); // Importa o CORS
const whatsappRoutes = require("./routes/whatsappRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173", // Substitua pela URL correta do seu frontend
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Permite o envio de cookies de sessão ou de autenticação
};

app.use(cors(corsOptions)); // Aplica o middleware de CORS
app.use(express.json());
app.use("/api/whatsapp", whatsappRoutes);
app.use(errorHandler);

module.exports = app;
