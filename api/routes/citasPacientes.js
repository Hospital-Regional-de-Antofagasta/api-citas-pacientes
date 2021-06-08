const express = require("express");
const citasPacientesController = require("../controllers/citasPacientesController");
const estaAutenticado = require("../middleware/auth");
const router = express.Router();

router.get(
  "/:correlativoCita",
  estaAutenticado,
  citasPacientesController.getCita
);

module.exports = router;
