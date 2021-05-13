const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CitasPacientes = mongoose.model('citas_paciente', new Schema({
    correlativoCita: Number,
    nombreLugar: String,
    nombreServicio: String,
    nombreProfesional: String,
    fechaCitacion: Date,
    horaCitacion: String,
    numeroPaciente: Number,
    codigoAmbito: String,
    tipoCita: String,
    alta: Boolean
}))
module.exports = CitasPacientes