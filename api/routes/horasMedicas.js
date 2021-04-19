const express = require('express')
const horasMedicasController = require('../controllers/horasMedicasController')
const estaAutenticado = require('../middleware/auth')
const router = express.Router()

router.get('/horas_medicas_paciente_historico/',estaAutenticado, horasMedicasController.getHorasMedicasPacienteHistorico)

router.get('/horas_medicas_paciente_hoy/',estaAutenticado, horasMedicasController.getHorasMedicasPacienteHoy)

router.get('/horas_medicas_paciente_proximas/',estaAutenticado, horasMedicasController.getHorasMedicasPacienteProximas)



module.exports = router