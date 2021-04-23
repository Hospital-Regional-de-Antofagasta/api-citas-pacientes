const express = require('express')
const horasMedicasController = require('../controllers/citasPacientesController')
const estaAutenticado = require('../middleware/auth')
const router = express.Router()

router.get('/horas_medicas/historico/',estaAutenticado, horasMedicasController.getHorasMedicasPacienteHistorico)

router.get('/horas_medicas/proximas/:timeZone',estaAutenticado, horasMedicasController.getHorasMedicasPacienteProximas)

//router.get('/imagenologia/historico/',estaAutenticado, horasMedicasController.getHorasMedicasPacienteHistorico)

//router.get('/imagenologia/proximas/:timeZone',estaAutenticado, horasMedicasController.getHorasMedicasPacienteProximas)

//router.get('/laboratorio/historico/',estaAutenticado, horasMedicasController.getHorasMedicasPacienteHistorico)

//router.get('/laboratorio/proximas/:timeZone',estaAutenticado, horasMedicasController.getHorasMedicasPacienteProximas)

module.exports = router