const express = require('express')
const horasMedicasController = require('../controllers/horasMedicasController')
const estaAutenticado = require('../middleware/auth')
const router = express.Router()

router.get('/paciente_historico/',estaAutenticado, horasMedicasController.getHorasMedicasPacienteHistorico)

router.get('/paciente_hoy/',estaAutenticado, horasMedicasController.getHorasMedicasPacienteHoy)

router.get('/paciente_proximas/',estaAutenticado, horasMedicasController.getHorasMedicasPacienteProximas)



module.exports = router