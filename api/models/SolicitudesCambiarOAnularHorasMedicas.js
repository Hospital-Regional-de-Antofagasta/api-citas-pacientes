const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SolicitudesCambiarOAnularHorasMedicas = mongoose.model(
  "solicitudes_cambiar_anular_horas_medica",
  new Schema(
    {
      correlativoSolicitud: {
        type: Number,
        default: 0,
      },
      numeroPaciente: Number,
      correlativoCita: Number,
      tipoSolicitud: String,
      motivo: String,
      detallesMotivo: String,
      respondida: {
        type: Boolean,
        default: false,
      },
      enviadaHospital: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  ),
  "solicitudes_cambiar_anular_horas_medicas"
);

module.exports = SolicitudesCambiarOAnularHorasMedicas;
