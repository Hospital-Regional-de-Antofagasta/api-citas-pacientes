const express = require("express");
const solicitudesCitasPacientesController = require("../controllers/solicitudesCitasPacientesController");
const isAuthenticated = require("../middleware/auth");
const {
  validarFechaSolicitudAnularCambiarHoraMedica,
  validarBodySolicitudAnularCambiarHoraMedica,
  validarSinSolicitudAnularCambiarHoraMedica,
} = require("../middleware/validaciones");

const router = express.Router();

router.get(
  "/motivos/:tipoSolicitud",
  isAuthenticated,
  solicitudesCitasPacientesController.getMotivosSolicitudesCitas
);

router.post(
  "/horas-medicas/anular-cambiar",
  isAuthenticated,
  validarBodySolicitudAnularCambiarHoraMedica,
  validarFechaSolicitudAnularCambiarHoraMedica,
  validarSinSolicitudAnularCambiarHoraMedica,
  solicitudesCitasPacientesController.createSolicitudCambiarOAnularHoraMedica
);

router.get(
  "/horas-medicas/anular-cambiar/existe/:idCita",
  isAuthenticated,
  solicitudesCitasPacientesController.checkExisteSolicitudCambiarOAnularHoraMedica
);

module.exports = router;
