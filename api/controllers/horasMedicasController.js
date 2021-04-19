const HorasMedicas = require('../models/HorasMedicas')
const {mensajes} = require ('../config')

exports.getHorasMedicasPacienteHistorico = async (req, res) =>{
    try {
        const arregloHorasMedicas = await HorasMedicas.find({
            NumeroPaciente: req.pacPacNumero
        })
        .sort({ FechaCitacion: 1})//1 ascendente    
        .exec()
        res.status(200).send(arregloHorasMedicas)
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

exports.getHorasMedicasPacienteHoy = async (req, res) =>{
    const fechaHoy = new Date()
    const fechaInicio =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),0,0,0,0)
    const fechaFin = new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),23,59,59,999)
    try {
        const arregloHorasMedicas = await HorasMedicas.find({
            NumeroPaciente: req.pacPacNumero,
            FechaCitacion: { $gte: fechaInicio, $lte: fechaFin } 
        })
        .sort({ FechaCitacion: 1})//1 ascendente, -1 descendente    
        .exec()
        res.status(200).send(arregloHorasMedicas)
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

exports.getHorasMedicasPacienteProximas = async (req, res) =>{
    try {
        await HorasMedicas.find({
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

