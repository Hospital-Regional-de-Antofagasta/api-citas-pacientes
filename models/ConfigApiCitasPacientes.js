const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConfigApiCitasPacientes = mongoose.model(
  "config_api_citas_paciente",
  new Schema({
    mensajes: {
      forbiddenAccess: String,
      serverError: String,
      badRequest: String,
      version: Number,
    },
  })
);

module.exports = ConfigApiCitasPacientes;
