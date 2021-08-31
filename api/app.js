const setTZ = require("set-tz");
setTZ("UTC");
require("dotenv").config();
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

const connection = process.env.MONGO_URI;
const port = process.env.PORT;
const localhost = process.env.HOSTNAME;

mongoose.connect(connection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

cargarFeriados();

app.use("/v1/citas-pacientes", citasPacientes);

app.use("/v1/citas-pacientes/tipo", citasPacientesPorTipo);

app.use("/v1/citas-pacientes/solicitudes", solicitudesCitasPacientes);

if (require.main === module) {
  // true if file is executed
  process.on("SIGINT", function () {
    process.exit();
  });
  app.listen(port, () => {
    console.log(`App listening at http://${localhost}:${port}`);
  });
}

module.exports = app;
