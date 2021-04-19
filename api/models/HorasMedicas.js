const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HorasMedicas =mongoose.model('horas_medica', new Schema({
    CorrelativoHora: Number,
    NombreLugar: String,
    NombreServicio: String,
    NombreProfesional: String,
    FechaCitacion: Date,
    HoraCitacion: String,
    NumeroPaciente: Number 
}))
module.exports = HorasMedicas