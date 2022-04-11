const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CitasPacientes = mongoose.model(
  "citas_paciente",
  new Schema({
    correlativo: { type: Number, required: true },
    codigoLugar: { type: String, required: true },
    nombreLugar: String,
    codigoServicio: { type: String, required: true },
    nombreServicio: String,
    codigoProfesional: { type: String, required: true },
    nombreProfesional: String,
    tipo: { type: String, required: true },
    codigoAmbito: { type: String, required: true },
    fechaCitacion: { type: Date, required: true },
    horaCitacion: { type: String, required: true },
    rutPaciente: { type: String, required: true, select: false },
    alta: { type: Boolean, default: false },
    bloqueadaEl: Date,
    codigoEstablecimiento: { type: String, required: true },
    nombreEstablecimiento: { type: String, required: true },
  })
);
module.exports = CitasPacientes;
