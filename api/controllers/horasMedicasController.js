const Recetas = require('../models/HorasMedicas')
const {mensajes} = require ('../config')

exports.getHorasMedicasPacienteHistorico = (req, res) =>{
    try {
        Recetas.find({
            NumeroPaciente: req.pacPacNumero
        })    
        .exec()
        .then(arregloHorasMedicas => res.status(200).send(arregloHorasMedicas))
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

exports.getHorasMedicasPacienteHoy = (req, res) =>{
    try {
        Recetas.find({
            NumeroPaciente: req.pacPacNumero
        })    
        .exec()
        .then(arregloHorasMedicas => res.status(200).send(arregloHorasMedicas))
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

exports.getHorasMedicasPacienteProximas = (req, res) =>{
    try {
        Recetas.find({
            NumeroPaciente: req.pacPacNumero
        })    
        .exec()
        .then(arregloHorasMedicas => res.status(200).send(arregloHorasMedicas))
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

