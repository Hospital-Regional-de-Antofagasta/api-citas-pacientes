const moment = require("moment-timezone");

const CitasPacientes = require("../models/CitasPacientes");

const { getMensajes } = require("../config");

exports.getCita = async (req, res) => {
  try {
    const idCita = req.params.idCita;
    if (typeof idCita !== "string") {
      res.status(400).send({ respuesta: await getMensajes("badRequest") });
    }
    const cita = await CitasPacientes.findById(idCita).exec();
    res.status(200).send(cita);
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

exports.getHorasMedicasPaciente = async (req, res) => {
  const ambitos = ["01"]; //ambito 01 son horas médicas.
  await citas(req, res, ambitos);
};

exports.getHorasMedicasPacienteProximas = async (req, res) => {
  const ambitos = ["01"]; //ambito 01 son horas médicas.
  await citasProximas(req, res, ambitos);
};

exports.getHorasMedicasPacienteHistorico = async (req, res) => {
  const ambitos = ["01"]; //ambito 01 son horas médicas.
  await citasHistorico(req, res, ambitos);
};

exports.getHorasExamenesPaciente = async (req, res) => {
  const ambitos = ["04", "06"]; //ambito 04 son horas de laboratorio y 06 horas de imagenología.
  await citas(req, res, ambitos);
};

exports.getHorasExamenesPacienteProximas = async (req, res) => {
  const ambitos = ["04", "06"]; //ambito 04 son horas de laboratorio y 06 horas de imagenología.
  await citasProximas(req, res, ambitos);
};

exports.getHorasExamenesPacienteHistorico = async (req, res) => {
  const ambitos = ["04", "06"]; //ambito 04 son horas de laboratorio y 06 horas de imagenología.
  await citasHistorico(req, res, ambitos);
};

const citas = async (req, res, codigoAmbito) => {
  try {
    const arregloCitasPaciente = await CitasPacientes.find({
      numeroPaciente: req.numeroPaciente,
      codigoAmbito: { $in: codigoAmbito },
      blockedAt: null,
    })
      .sort({ fechaCitacion: 1 }) //1 ascendente
      .exec();
    res.status(200).send(arregloCitasPaciente);
  } catch (error) {
    res.status(500).send({ respuesta: getMensajes("serverError") });
  }
};

const citasProximas = async (req, res, codigoAmbito) => {
  try {
    const timeZone = req.params.timeZone;
    if (typeof timeZone !== "string") {
      res.status(400).send({ respuesta: getMensajes("badRequest") });
    }
    const fechaHoy = new Date();
    const fechaInicio = moment.tz(fechaHoy, timeZone).utc(true).startOf("day");
    const fechaFin = moment.tz(fechaHoy, timeZone).utc(true).endOf("day");
    const arregloDeArreglosCitasPaciente = await Promise.all([
      CitasPacientes.find({
        numeroPaciente: req.numeroPaciente,
        fechaCitacion: { $gte: fechaInicio, $lte: fechaFin },
        codigoAmbito: { $in: codigoAmbito },
        blockedAt: null,
      })
        .sort({ fechaCitacion: 1 }) //1 ascendente, -1 descendente
        .exec(),
      CitasPacientes.find({
        numeroPaciente: req.numeroPaciente,
        fechaCitacion: { $gt: fechaFin },
        codigoAmbito: { $in: codigoAmbito },
        blockedAt: null,
      })
        .sort({ fechaCitacion: 1 }) //1 ascendente, -1 descendente
        .exec(),
    ]);
    res.status(200).send(arregloDeArreglosCitasPaciente);
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};

const citasHistorico = async (req, res, codigoAmbito) => {
  try {
    const timeZone = req.params.timeZone;
    if (typeof timeZone !== "string") {
      res.status(400).send({ respuesta: await getMensajes("badRequest") });
    }
    const fechaHoy = new Date();
    const hoy = moment.tz(fechaHoy, timeZone).utc(true).startOf("day");
    const arregloCitasPaciente = await CitasPacientes.find({
      numeroPaciente: req.numeroPaciente,
      fechaCitacion: { $lt: hoy },
      codigoAmbito: { $in: codigoAmbito },
      blockedAt: null,
    })
      .sort({ fechaCitacion: -1 }) //-1 descendente
      .exec();
    res.status(200).send(arregloCitasPaciente);
  } catch (error) {
    if (process.env.NODE_ENV === "dev")
      return res.status(500).send({
        respuesta: await getMensajes("serverError"),
        detalles_error: {
          nombre: error.name,
          mensaje: error.message,
        },
      });
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};
