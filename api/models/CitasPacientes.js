const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CitasPacientes =mongoose.model('citas_paciente', new Schema({
    CorrelativoCita: Number,
    NombreLugar: String,
    NombreServicio: String,
    NombreProfesional: String,
    FechaCitacion: Date,
    HoraCitacion: String,
    NumeroPaciente: Number,
    CodigoAmbito: String 
}))
module.exports = CitasPacientes