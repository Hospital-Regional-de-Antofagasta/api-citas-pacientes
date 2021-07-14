const express = require("express");
const citasPacientesController = require("../controllers/citasPacientesController");
const estaAutenticado = require("../middleware/auth");
const router = express.Router();

router.get(
  "/horas-medicas",
  estaAutenticado,
  citasPacientesController.getHorasMedicasPaciente
);

router.get(
  "/horas-medicas/proximas/:timeZone",
  estaAutenticado,
  citasPacientesController.getHorasMedicasPacienteProximas
);

router.get(
  "/horas-medicas/historico/:timeZone",
  estaAutenticado,
  citasPacientesController.getHorasMedicasPacienteHistorico
);

router.get(
  "/horas-examenes",
  estaAutenticado,
  citasPacientesController.getHorasExamenesPaciente
);

router.get(
  "/horas-examenes/proximas/:timeZone",
  estaAutenticado,
  citasPacientesController.getHorasExamenesPacienteProximas
);

router.get(
  "/horas-examenes/historico/:timeZone",
  estaAutenticado,
  citasPacientesController.getHorasExamenesPacienteHistorico
);

module.exports = router;
