const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ConfigApiHorasMedicas = mongoose.model('config_api_horas_medica', new Schema ({
    mensajes: {
        forbiddenAccess: String,
        serverError: String,
    }
}))

module.exports = ConfigApiHorasMedicas