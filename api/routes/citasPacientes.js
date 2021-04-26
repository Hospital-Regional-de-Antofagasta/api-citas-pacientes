const express = require('express')
const horasMedicasController = require('../controllers/citasPacientesController')
const estaAutenticado = require('../middleware/auth')
const router = express.Router()

router.get('/horas_medicas/historico/',estaAutenticado, horasMedicasController.getHorasMedicasPacienteHistorico)

router.get('/horas_medicas/proximas/:timeZone',estaAutenticado, horasMedicasController.getHorasMedicasPacienteProximas)

router.get('/horas_examenes/historico/',estaAutenticado, horasMedicasController.getHorasExamenesPacienteHistorico)

router.get('/horas_examenes/proximas/:timeZone',estaAutenticado, horasMedicasController.getHorasExamenesPacienteProximas)



module.exports = router