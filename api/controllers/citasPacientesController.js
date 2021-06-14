const moment = require("moment-timezone");

const CitasPacientes = require("../../models/CitasPacientes");//SOLO VERSION GRATUITA DE VERCEL
//const CitasPacientes = require("../models/CitasPacientes");

const { mensajes } = require("../config");



exports.getCita = async (req, res) => {
  try {
    const correlativo = req.params.correlativoCita
    if(typeof correlativo !== 'string'){
      res.status(400).send({ respuesta: mensajes.badRequest });
    }
    const cita = await CitasPacientes.findOne({
      correlativoCita: correlativo
    })
    .exec();
    res.status(200).send(cita);
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

exports.getHorasMedicasPacienteHistorico = async (req, res) => {
  const ambitos = ["01"];//ambito 01 son horas médicas.
  await citasHistorico(req, res, ambitos);
};

exports.getHorasExamenesPaciente = async (req, res) => {
  const ambitos = ["04", "06"];//ambito 04 son horas de laboratorio y 06 horas de imagenología.
  await citas(req, res, ambitos);
};

exports.getHorasExamenesPacienteProximas = async (req, res) => {
  const ambitos = ["04", "06"];//ambito 04 son horas de laboratorio y 06 horas de imagenología.
  await citasProximas(req, res, ambitos);
};

exports.getHorasExamenesPacienteHistorico = async (req, res) => {
  const ambitos = ["04", "06"];//ambito 04 son horas de laboratorio y 06 horas de imagenología.
  await citasHistorico(req, res, ambitos);
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
  try {
    const timeZone = req.params.timeZone;
    if(typeof timeZone !== 'string'){
      res.status(400).send({ respuesta: mensajes.badRequest });
    }      
    const fechaHoy = new Date();
    // sumarle un dia a la fecha de hoy para obtener la de maniana
    // const fechaManiana = new Date()
    // fechaManiana.setDate(fechaManiana.getDate() + 1)
    // aplicar la zona horaria a las fechas y obtener solo el dia
    const fechaInicio = moment.tz(fechaHoy, timeZone).startOf("day");
    const fechaFin = moment.tz(fechaHoy, timeZone).endOf("day");
    // const fechaInicio =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),0,0,0,0)
    // const fechaFin = new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),23,59,59,999)
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

const citasHistorico = async (req, res, codigoAmbito) => {
  try {
    const timeZone = req.params.timeZone;
    if(typeof timeZone !== 'string'){
      res.status(400).send({ respuesta: mensajes.badRequest });
    }   
    const fechaHoy = new Date();
    const hoy = moment.tz(fechaHoy, timeZone).startOf("day");
    const arregloCitasPaciente = await CitasPacientes.find({
      numeroPaciente: req.numeroPaciente,
      codigoAmbito: { $in: codigoAmbito },
      fechaCitacion: {$lt: hoy}
    })
      .sort({ fechaCitacion: -1 }) //-1 descendente
      .exec();
    res.status(200).send(arregloCitasPaciente);
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};
