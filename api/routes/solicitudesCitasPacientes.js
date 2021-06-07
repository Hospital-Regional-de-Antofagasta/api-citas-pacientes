const express = require("express");
const solicitudesCitasPacientesController = require("../controllers/solicitudesCitasPacientesController");
const estaAutenticado = require("../middleware/auth");
const {
  validarFechaSolicitudAnularCambiarHoraMedica,
  validarBodySolicitudAnularCambiarHoraMedica,
  validarParametro
} = require("../middleware/validaciones");
const router = express.Router();

router.get(
  "/motivos/:tipoSolicitud",
  estaAutenticado,
  solicitudesCitasPacientesController.getMotivosSolicitudesCitas
);

router.post(
  "/horas_medicas/guardar_solicitud_anular_cambiar/",
  estaAutenticado,
  validarBodySolicitudAnularCambiarHoraMedica,
  validarFechaSolicitudAnularCambiarHoraMedica,
  solicitudesCitasPacientesController.postSolicitudCambiarOAnularHoraMedica
);

module.exports = router;
