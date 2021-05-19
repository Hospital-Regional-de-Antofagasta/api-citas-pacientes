const setTZ = require("set-tz");
setTZ("UTC");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { loadConfig } = require("./config");
const citasPacientes = require("./routes/citasPacientes");
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

loadConfig();

app.use("/v1/citas_pacientes", citasPacientes);

module.exports = app;
