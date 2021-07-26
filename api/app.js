const setTZ = require("set-tz");
setTZ("UTC");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { cargarFeriados } = require("./config");
const citasPacientes = require("./routes/citasPacientes");
const citasPacientesPorTipo = require("./routes/citasPacientesPorTipo");
const solicitudesCitasPacientes = require("./routes/solicitudesCitasPacientes");
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

cargarFeriados();

app.use("/v1/citas-pacientes", citasPacientes);

app.use("/v1/citas-pacientes/tipo", citasPacientesPorTipo);

app.use("/v1/citas-pacientes/solicitudes", solicitudesCitasPacientes);

module.exports = app;