const express = require("express");
const cors = require("cors");
const whatsappRoutes = require("./routes/whatsappRoutes");
const errorHandler = require("./middlewares/errorHandler");
const corsOptions = require("./middlewares/corsConfig");

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/whatsapp", whatsappRoutes);
app.use(errorHandler);

module.exports = app;
