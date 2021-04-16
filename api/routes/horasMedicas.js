const express = require('express')
const horasMedicasController = require('../controllers/horasMedicasController')
const estaAutenticado = require('../middleware/auth')
const router = express.Router()

router.get('/horas_medicas_paciente/',estaAutenticado, horasMedicasController.getHorasMedicasPaciente)



module.exports = router