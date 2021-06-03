const express = require("express");
const horasMedicasController = require("../controllers/citasPacientesController");
const estaAutenticado = require("../middleware/auth");
const {
  validarFecha,
  validarSolicitudAnularCambiarHoraMedica,
} = require("../middleware/validarSolicitud");
const router = express.Router();

router.get(
  "/horas_medicas/historico/",
  estaAutenticado,
  horasMedicasController.getHorasMedicasPacienteHistorico
);

router.get(
  "/horas_medicas/proximas/:timeZone",
  estaAutenticado,
  horasMedicasController.getHorasMedicasPacienteProximas
);

router.get(
  "/formulario_solicitud_anular_cambiar_hora_medica/:tipoSolicitud&:correlativoCita",
  estaAutenticado,
  horasMedicasController.getFormularioSolicitudHoraMedica
);

router.post(
  "/guardar_solicitud_anular_cambiar_hora_medica/:tipoSolicitud",
  estaAutenticado,
  validarSolicitudAnularCambiarHoraMedica,
  validarFecha,
  horasMedicasController.postSolicitudCambiarOAnularHoraMedica
);

router.get(
  "/horas_examenes/historico/",
  estaAutenticado,
  horasMedicasController.getHorasExamenesPacienteHistorico
);

router.get(
  "/horas_examenes/proximas/:timeZone",
  estaAutenticado,
  horasMedicasController.getHorasExamenesPacienteProximas
);

module.exports = router;
