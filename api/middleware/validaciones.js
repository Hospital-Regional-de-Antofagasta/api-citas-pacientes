const momentBussinessDays = require("moment-business-days");
const moment = require("moment");

const CitasPacientes = require("../../models/CitasPacientes"); //SOLO VERSION GRATUITA DE VERCEL
const SolicitudesCambiarOAnularHorasMedicas = require("../../models/SolicitudesCambiarOAnularHorasMedicas"); //SOLO VERSION GRATUITA DE VERCEL
const MotivosSolicitudesCitas = require("../../models/MotivosSolicitudesCitas"); //SOLO VERSION GRATUITA DE VERCEL
//const CitasPacientes = require("../models/CitasPacientes");
//const SolicitudesCambiarOAnularHorasMedicas = require("../models/SolicitudesCambiarOAnularHorasMedicas");
//const MotivosSolicitudesCitas = require("../models/MotivosSolicitudesCitas");

const { mensajes } = require("../config");

exports.validarAlta = async (req, res, next) => {
  try {
    const solicitud = req.body;
    if (solicitud.tipoSolicitud === "AGENDAR") {
      const cita = await CitasPacientes.findOne({
        numeroPaciente: solicitud.numeroPaciente,
        codigoServicio: solicitud.codigoServicio,
        codigoProfesional: solicitud.codigoProfesional,
        codigoAmbito: "01",
      }).exec();
      if (!cita || cita.alta === true)
        return res.status(400).send({ respuesta: mensajes.badRequest });
    }
    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.validarBodySolicitudAnularCambiarHoraMedica = async (
  req,
  res,
  next
) => {
  try {
    req.body.numeroPaciente = req.numeroPaciente;
    const solicitud = req.body;
    if (
      (solicitud.tipoSolicitud !== "ANULAR" &&
        solicitud.tipoSolicitud !== "CAMBIAR") ||
      typeof solicitud.correlativoCita !== "number" ||
      typeof solicitud.motivo !== "number" ||
      typeof solicitud.detallesMotivo !== "string"
    ) {
      return res.status(400).send({
        respuesta: mensajes.badRequest,
        detalles_error: "Algun dato es incorrecto",
      });
    }
    const motivo = await MotivosSolicitudesCitas.findOne({
      indice: solicitud.motivo,
      tipoSolicitud: solicitud.tipoSolicitud,
    }).exec();
    if (!motivo) {
      return res.status(400).send({
        respuesta: mensajes.badRequest,
        detalles_error: "El motivo no existe",
      });
    } else {
      req.body.motivo = motivo.nombre;
    }
    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.validarExistenciaSolicitudAnularCambiarHoraMedica = async (
  req,
  res,
  next
) => {
  try {
    const solicitud = req.body;
    const solicitudExistente =
      await SolicitudesCambiarOAnularHorasMedicas.findOne({
        numeroPaciente: solicitud.numeroPaciente,
        correlativoCita: solicitud.correlativoCita,
        tipoSolicitud: { $in: ["ANULAR", "CAMBIAR"] },
      }).exec();

    if (solicitudExistente) {
      return res.status(400).send({
        respuesta: mensajes.badRequest,
        detalles_error: "La solicitud ya existe",
      });
    }
    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.validarFechaSolicitudAnularCambiarHoraMedica = async (
  req,
  res,
  next
) => {
  try {
    const solicitud = req.body;
    const cita = await CitasPacientes.findOne({
      numeroPaciente: req.numeroPaciente,
      correlativoCita: solicitud.correlativoCita,
      codigoAmbito: "01",//Horas médicas
    }).exec();
    if (!cita) {
      return res.status(400).send({
        respuesta: mensajes.badRequest,
        detalles_error: "La cita no existe",
      });
    }
    const fechaActual = moment().startOf("day");
    const fechaCita = moment(cita.fechaCitacion).startOf("day");
    const diferencia = momentBussinessDays(
      fechaActual,
      "MM-DD-YYYY"
    ).businessDiff(momentBussinessDays(fechaCita, "MM-DD-YYYY"));
    if (solicitud.tipoSolicitud === "CAMBIAR") {
      if (diferencia < 3) {
        return res.status(400).send({
          respuesta: mensajes.badRequest,
          detalles_error:
            "La fecha es incorrecta para poder realizar esta acción",
        });
      }
    } else {
      if (diferencia < 1) {
        return res.status(400).send({
          respuesta: mensajes.badRequest,
          detalles_error:
            "La fecha es incorrecta para poder realizar esta acción",
        });
      }
    }
    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};
