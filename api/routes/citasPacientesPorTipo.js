const express = require("express");
const citasPacientesController = require("../controllers/citasPacientesController");
const estaAutenticado = require("../middleware/auth");
const router = express.Router();

router.get(
  "/horas_medicas",
  estaAutenticado,
  citasPacientesController.getHorasMedicasPaciente
);

router.get(
  "/horas_medicas/proximas/:timeZone",
  estaAutenticado,
  citasPacientesController.getHorasMedicasPacienteProximas
);

router.get(
  "/horas_examenes",
  estaAutenticado,
  citasPacientesController.getHorasExamenesPaciente
);

router.get(
  "/horas_examenes/proximas/:timeZone",
  estaAutenticado,
  citasPacientesController.getHorasExamenesPacienteProximas
);

module.exports = router;
