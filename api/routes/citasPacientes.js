const express = require("express");
const citasPacientesController = require("../controllers/citasPacientesController");
const estaAutenticado = require("../middleware/auth");
const {
  validarFecha,
  validarSolicitudAnularCambiarHoraMedica,
} = require("../middleware/validarSolicitud");
const router = express.Router();

router.get(
  "/:correlativoCita",
  estaAutenticado,
  citasPacientesController.getCita
);

router.get(
  "/horas_medicas/historico/",
  estaAutenticado,
  citasPacientesController.getHorasMedicasPaciente
);

router.get(
  "/horas_medicas/proximas/:timeZone",
  estaAutenticado,
  citasPacientesController.getHorasMedicasPacienteProximas
);

router.get(
  "/motivos_solicitudes/:tipoSolicitud",
  estaAutenticado,
  citasPacientesController.getMotivosSolicitudesCitas
);

router.post(
  "/horas_medicas/guardar_solicitud_anular_cambiar/",
  estaAutenticado,
  validarSolicitudAnularCambiarHoraMedica,
  validarFecha,
  citasPacientesController.postSolicitudCambiarOAnularHoraMedica
);

router.get(
  "/horas_examenes/historico/",
  estaAutenticado,
  citasPacientesController.getHorasExamenesPaciente
);

router.get(
  "/horas_examenes/proximas/:timeZone",
  estaAutenticado,
  citasPacientesController.getHorasExamenesPacienteProximas
);

module.exports = router;
