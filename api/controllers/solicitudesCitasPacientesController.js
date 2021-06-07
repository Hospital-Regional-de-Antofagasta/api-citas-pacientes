const SolicitudesCambiarOAnularHorasMedicas = require("../models/SolicitudesCambiarOAnularHorasMedicas");
const MotivosSolicitudesCitas = require('../models/MotivosSolicitudesCitas')
const { mensajes } = require("../config");


exports.getMotivosSolicitudesCitas = async (req, res) => {
  try {
    const tipo = req.params.tipoSolicitud
    if(typeof tipo !== 'string'){
      console.log('motivo')
      res.status(400).send({ respuesta: mensajes.badRequest });
    }      
    const motivos = await MotivosSolicitudesCitas.find({
      tipoSolicitud: tipo,
      habilitado: true
    })
    .sort({ indice: 1 }) //1 ascendente
    .exec();
    res.status(200).send(motivos);
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.postSolicitudCambiarOAnularHoraMedica = async (req, res) => {
  try {
    req.body.numeroPaciente = req.numeroPaciente;
    const solicitud = req.body;
    await SolicitudesCambiarOAnularHorasMedicas.create(solicitud);
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};


