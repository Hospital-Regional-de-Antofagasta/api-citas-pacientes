require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { cargarFeriados } = require("./config");
const citasPacientes = require("./routes/citasPacientes");
const citasPacientesPorTipo = require("./routes/citasPacientesPorTipo");
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

app.get("/v1/citas-pacientes/health", (req, res) => {
  res.status(200).send("ready");
});

app.use("/v1/citas-pacientes", citasPacientes);

app.use("/v1/citas-pacientes/tipo", citasPacientesPorTipo);

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
