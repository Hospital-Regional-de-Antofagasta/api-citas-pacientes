const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CitasPacientes = mongoose.model(
  "citas_paciente",
  new Schema({
    correlativoCita: Number,
    nombreLugar: String,
    codigoServicio: String,
    nombreServicio: String,
    codigoProfesional: String,
    nombreProfesional: String,
    fechaCitacion: Date,
    horaCitacion: String,
    numeroPaciente: {
      type: Number,
      require: true,
      select: false,
    },
    codigoAmbito: String,
    tipoCita: String,
    alta: {
      type: Boolean,
      default: false,
    },
    blockedAt: Date,
  })
);
module.exports = CitasPacientes;
