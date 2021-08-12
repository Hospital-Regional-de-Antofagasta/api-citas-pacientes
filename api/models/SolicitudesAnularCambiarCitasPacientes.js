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
        numero: {type: Number, require: true, select: false},
        codigoEstablecimiento: {type: String, require: true, select: false},
        nombreEstablecimiento: String,
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
      codigoEstablecimiento: String,
    },
    { timestamps: true }
  ),
  "solicitudes_anular_cambiar_citas_pacientes"
);

module.exports = SolicitudesAnularCambiarCitasPacientes;
