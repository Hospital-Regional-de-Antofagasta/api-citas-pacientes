const express = require("express");
const citasPacientesController = require("../controllers/citasPacientesController");
const isAuthenticated = require("../middleware/auth");
const router = express.Router();

router.get(
  "/:correlativoCita",
  isAuthenticated,
  citasPacientesController.getCita
);

module.exports = router;
