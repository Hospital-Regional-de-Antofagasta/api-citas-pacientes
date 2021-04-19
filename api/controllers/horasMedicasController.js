const Recetas = require('../models/HorasMedicas')
const {mensajes} = require ('../config')

exports.getHorasMedicasPacienteHistorico = (req, res) =>{
    try {
        Recetas.find({
            NumeroPaciente: req.pacPacNumero
        })
        .sort({ FechaCitacion: 1})//1 ascendente    
        .exec()
        .then(arregloHorasMedicas => res.status(200).send(arregloHorasMedicas))
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

exports.getHorasMedicasPacienteHoy = (req, res) =>{
    try {
        Recetas.find({
            NumeroPaciente: req.pacPacNumero,
            FechaCitacion: new Date('1987-10-26') 
        })
        .sort({ FechaCitacion: 1})//1 ascendente    
        .exec()
        .then(arregloHorasMedicas => res.status(200).send(arregloHorasMedicas))
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

exports.getHorasMedicasPacienteProximas = (req, res) =>{
    try {
        Recetas.find({
            NumeroPaciente: req.pacPacNumero,
            FechaCitacion: { $gte: '1987-10-19', $lte: '1987-10-26' }
        })
        .sort({ FechaCitacion: 1})//1 ascendente    
        .exec()
        .then(arregloHorasMedicas => res.status(200).send(arregloHorasMedicas))
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

