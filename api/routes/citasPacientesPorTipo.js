const express = require("express");
const citasPacientesController = require("../controllers/citasPacientesController");
const isAuthenticated = require("../middleware/auth");
const router = express.Router();

router.get(
  "/horas-medicas",
  isAuthenticated,
  citasPacientesController.getHorasMedicasPaciente
);

router.get(
  "/horas-medicas/proximas/:timeZone",
  isAuthenticated,
  citasPacientesController.getHorasMedicasPacienteProximas
);

router.get(
  "/horas-medicas/historico/:timeZone",
  isAuthenticated,
  citasPacientesController.getHorasMedicasPacienteHistorico
);

router.get(
  "/horas-examenes",
  isAuthenticated,
  citasPacientesController.getHorasExamenesPaciente
);

router.get(
  "/horas-examenes/proximas/:timeZone",
  isAuthenticated,
  citasPacientesController.getHorasExamenesPacienteProximas
);

router.get(
  "/horas-examenes/historico/:timeZone",
  isAuthenticated,
  citasPacientesController.getHorasExamenesPacienteHistorico
);

module.exports = router;
