const ConfigApiCitasPacientes = require('./models/ConfigApiCitasPacientes')

let mensajes = {
    forbiddenAccess: 'No tiene la autorización para realizar esta acción.',
    serverError: 'Se produjo un error.',
}

const loadConfig = async () => {
    try {
        const config = await ConfigApiCitasPacientes.findOne().exec()
        mensajes = config.mensajes
    } catch (error) {

    }
}

module.exports = {
    loadConfig,
    mensajes
 }