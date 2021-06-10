const express = require("express");
const solicitudesCitasPacientesController = require("../controllers/solicitudesCitasPacientesController");
const estaAutenticado = require("../middleware/auth");
const {
  validarFechaSolicitudAnularCambiarHoraMedica,
  validarBodySolicitudAnularCambiarHoraMedica,
  validarExistenciaSolicitudAnularCambiarHoraMedica
} = require("../middleware/validaciones");
const router = express.Router();

router.get(
  "/motivos/:tipoSolicitud",
  estaAutenticado,
  solicitudesCitasPacientesController.getMotivosSolicitudesCitas
);

router.post(
  "/horas_medicas/anular_cambiar",
  estaAutenticado,
  validarBodySolicitudAnularCambiarHoraMedica,
  validarExistenciaSolicitudAnularCambiarHoraMedica,
  validarFechaSolicitudAnularCambiarHoraMedica,
  solicitudesCitasPacientesController.postSolicitudCambiarOAnularHoraMedica
);

router.get(
  "/horas_medicas/anular_cambiar/:correlativoCita",
  estaAutenticado,
  solicitudesCitasPacientesController.getExisteSolicitudCambiarOAnularHoraMedica
);

module.exports = router;
