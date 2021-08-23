const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SolicitudesAnularCambiarCitasPacientes = mongoose.model(
  "solicitudes_anular_cambiar_citas_paciente",
  new Schema(
    {
      correlativoSolicitud: {
        type: Number,
        default: 0,
      },
      numeroPaciente: {
        type: Number,
        require: true,
        unique: true,
        select: false,
      },
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
  "solicitudes_anular_cambiar_citas_pacientes"
);

module.exports = SolicitudesAnularCambiarCitasPacientes;
