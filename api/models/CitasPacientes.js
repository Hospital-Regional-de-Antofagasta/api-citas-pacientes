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
      numero: {type: Number, require: true, select: false},
      codigoEstablecimiento: {type: String, require: true, select: false},
      nombreEstablecimiento: String,
    },
    codigoAmbito: String,
    tipoCita: String,
    alta: {
      type: Boolean,
      default: false,
    },
    blockedAt: Date,
    codigoEstablecimiento: String,
  })
);
module.exports = CitasPacientes;
