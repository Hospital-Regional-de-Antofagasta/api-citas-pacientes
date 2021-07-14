const express = require("express");
const solicitudesCitasPacientesController = require("../controllers/solicitudesCitasPacientesController");
const estaAutenticado = require("../middleware/auth");
const {
  validarFechaSolicitudAnularCambiarHoraMedica,
  validarBodySolicitudAnularCambiarHoraMedica,
  validarExistenciaSolicitudAnularCambiarHoraMedica,
} = require("../middleware/validaciones");

const router = express.Router();

router.get(
  "/motivos/:tipoSolicitud",
  estaAutenticado,
  solicitudesCitasPacientesController.getMotivosSolicitudesCitas
);

router.post(
  "/horas-medicas/anular-cambiar",
  estaAutenticado,
  validarBodySolicitudAnularCambiarHoraMedica,
  validarExistenciaSolicitudAnularCambiarHoraMedica,
  validarFechaSolicitudAnularCambiarHoraMedica,
  solicitudesCitasPacientesController.postSolicitudCambiarOAnularHoraMedica
);

router.get(
  "/horas-medicas/anular-cambiar/existe/:correlativoCita",
  estaAutenticado,
  solicitudesCitasPacientesController.getExisteSolicitudCambiarOAnularHoraMedica
);

module.exports = router;
