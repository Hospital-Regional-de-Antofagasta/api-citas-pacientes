var moment = require('moment-timezone')
const HorasMedicas = require('../models/HorasMedicas')
const { mensajes } = require ('../config')

exports.getHorasMedicasPacienteHistorico = async (req, res) =>{
    try {
        const arregloHorasMedicas = await HorasMedicas.find({
            NumeroPaciente: req.pacPacNumero
        })
        .sort({ FechaCitacion: 1 }) //1 ascendente
        .exec()
        res.status(200).send(arregloHorasMedicas)
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError})
    }
}

exports.getHorasMedicasPacienteProximas = async (req, res) => {
    const timeZone = req.params.timeZone
    const fechaHoy = new Date()
    // sumarle un dia a la fecha de hoy para obtener la de maniana
    // const fechaManiana = new Date()
    // fechaManiana.setDate(fechaManiana.getDate() + 1)
    // aplicar la zona horaria a las fechas y obtener solo el dia
    const fechaInicio = moment.tz(fechaHoy, timeZone).startOf('day')
    const fechaFin = moment.tz(fechaHoy, timeZone).endOf('day')
    // const fechaInicio =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),0,0,0,0)
    // const fechaFin = new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),23,59,59,999)
    try {
        const arregloDeArreglosHorasMedicas = await Promise.all([
            HorasMedicas.find({
                NumeroPaciente: req.pacPacNumero,
                FechaCitacion: { $gte: fechaInicio, $lte: fechaFin }
            })
            .sort({ FechaCitacion: 1 }) //1 ascendente, -1 descendente
            .exec(),
            HorasMedicas.find({
                NumeroPaciente: req.pacPacNumero,
                FechaCitacion: { $gte: fechaFin }
            })
            .sort({ FechaCitacion: 1 }) //1 ascendente, -1 descendente
            .exec()
        ])
        res.status(200).send(arregloDeArreglosHorasMedicas)
    } catch (error) {
        res.status(500).send({ respuesta: mensajes.serverError })
    }
}

