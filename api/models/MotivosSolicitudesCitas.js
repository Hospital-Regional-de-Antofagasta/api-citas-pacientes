const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MotivosSolicitudesCitas = mongoose.model(
  "motivos_solicitudes_cita",
  new Schema({
    indice: Number,
    nombre: String,
    tipoSolicitud: String,
  })
);
module.exports = MotivosSolicitudesCitas;