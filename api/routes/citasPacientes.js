const express = require("express");
const citasPacientesController = require("../controllers/citasPacientesController");
const estaAutenticado = require("../middleware/auth");
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
