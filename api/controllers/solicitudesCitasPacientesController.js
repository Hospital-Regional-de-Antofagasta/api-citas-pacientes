const SolicitudesAnularCambiarCitasPacientes = require("../../models/SolicitudesAnularCambiarCitasPacientes"); //SOLO VERSION GRATUITA DE VERCEL
const MotivosSolicitudesCitas = require("../../models/MotivosSolicitudesCitas"); //SOLO VERSION GRATUITA DE VERCEL
//const SolicitudesAnularCambiarCitasPacientes = require("../models/SolicitudesAnularCambiarCitasPacientes");
//const MotivosSolicitudesCitas = require('../models/MotivosSolicitudesCitas')

const { mensajes } = require("../config");

exports.getMotivosSolicitudesCitas = async (req, res) => {
  try {
    const tipo = req.params.tipoSolicitud;
    if (typeof tipo !== "string") {
      console.log("motivo");
      res.status(400).send({ respuesta: mensajes.badRequest });
    }
    const motivos = await MotivosSolicitudesCitas.find({
      tipoSolicitud: tipo,
      habilitado: true,
    })
      .sort({ indice: 1 }) //1 ascendente
      .exec();
    res.status(200).send(motivos);
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.getExisteSolicitudCambiarOAnularHoraMedica = async (req, res) => {
  try {
    const solicitud = await SolicitudesAnularCambiarCitasPacientes.findOne({
      numeroPaciente: req.numeroPaciente,
      correlativoCita: req.params.correlativoCita,
      tipoSolicitud: { $in: ["ANULAR", "CAMBIAR"] },
    }).exec();
    if (solicitud) {
      res.status(200).send({ respuesta: true });
    } else {
      res.status(200).send({ respuesta: false });
    }
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.postSolicitudCambiarOAnularHoraMedica = async (req, res) => {
  try {
    req.body.numeroPaciente = req.numeroPaciente;
    const solicitud = req.body;
    await SolicitudesAnularCambiarCitasPacientes.create(solicitud);
    res.status(201).send({});
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};
