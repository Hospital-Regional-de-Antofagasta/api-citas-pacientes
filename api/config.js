const ConfigApiRecetas = require('./models/ConfigApiHorasMedicas')

let mensajes = {
    forbiddenAccess: 'No tiene la autorización para realizar esta acción.',
    serverError: 'Se produjo un error.',
}

const loadConfig = async () => {
    try {
        const config = await ConfigApiRecetas.findOne().exec()
        mensajes = config.mensajes
    } catch (error) {

    }
}

module.exports = {
    loadConfig,
    mensajes
 }