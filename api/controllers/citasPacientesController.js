var moment = require("moment-timezone");
const CitasPacientes = require("../models/CitasPacientes");
const SolicitudesCambiarOAnularHorasMedicas = require("../models/SolicitudesCambiarOAnularHorasMedicas");
const MotivosSolicitudesCitas = require('../models/MotivosSolicitudesCitas')
const { mensajes } = require("../config");



exports.getCita = async (req, res) => {
  try {
    const cita = await CitasPacientes.findOne({
      correlativoCita: req.params.correlativoCita
    })
    .exec();
    res.status(200).send(cita);
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.getMotivosSolicitudesCitas = async (req, res) => {
  try {
    const motivos = await MotivosSolicitudesCitas.find({
      tipoSolicitud: req.params.tipoSolicitud
    })
    .sort({ indice: 1 }) //1 ascendente
    .exec();
    res.status(200).send(motivos);
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.getHorasMedicasPaciente = async (req, res) => {
  const ambitos = ["01"];//ambito 01 son horas médicas.
  await citas(req, res, ambitos);
};

exports.getHorasMedicasPacienteProximas = async (req, res) => {
  const ambitos = ["01"];//ambito 01 son horas médicas.
  await citasProximas(req, res, ambitos);
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

exports.getHorasExamenesPaciente = async (req, res) => {
  const ambitos = ["04", "06"];//ambito 04 son horas de laboratorio y 06 horas de imagenología.
  await citas(req, res, ambitos);
};

exports.getHorasExamenesPacienteProximas = async (req, res) => {
  const ambitos = ["04", "06"];//ambito 04 son horas de laboratorio y 06 horas de imagenología.
  await citasProximas(req, res, ambitos);
};

const citas = async (req, res, codigoAmbito) => {
  try {
    const arregloCitasPaciente = await CitasPacientes.find({
      numeroPaciente: req.numeroPaciente,
      codigoAmbito: { $in: codigoAmbito },
    })
      .sort({ fechaCitacion: 1 }) //1 ascendente
      .exec();
    res.status(200).send(arregloCitasPaciente);
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

const citasProximas = async (req, res, codigoAmbito) => {
  const timeZone = req.params.timeZone;
  const fechaHoy = new Date();
  // sumarle un dia a la fecha de hoy para obtener la de maniana
  // const fechaManiana = new Date()
  // fechaManiana.setDate(fechaManiana.getDate() + 1)
  // aplicar la zona horaria a las fechas y obtener solo el dia
  const fechaInicio = moment.tz(fechaHoy, timeZone).startOf("day");
  const fechaFin = moment.tz(fechaHoy, timeZone).endOf("day");
  // const fechaInicio =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),0,0,0,0)
  // const fechaFin = new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),23,59,59,999)
  try {
    const arregloDeArreglosCitasPaciente = await Promise.all([
      CitasPacientes.find({
        numeroPaciente: req.numeroPaciente,
        fechaCitacion: { $gte: fechaInicio, $lte: fechaFin },
        codigoAmbito: { $in: codigoAmbito },
      })
        .sort({ fechaCitacion: 1 }) //1 ascendente, -1 descendente
        .exec(),
      CitasPacientes.find({
        numeroPaciente: req.numeroPaciente,
        fechaCitacion: { $gte: fechaFin },
        codigoAmbito: { $in: codigoAmbito },
      })
        .sort({ fechaCitacion: 1 }) //1 ascendente, -1 descendente
        .exec(),
    ]);
    res.status(200).send(arregloDeArreglosCitasPaciente);
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};
