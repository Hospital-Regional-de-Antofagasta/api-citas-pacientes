const momentBussinessDays = require("moment-business-days");
const moment = require("moment");
const CitasPacientes = require("../models/CitasPacientes");
const SolicitudesAnularCambiarCitasPacientes = require("../models/SolicitudesAnularCambiarCitasPacientes");
const MotivosSolicitudesCitas = require("../models/MotivosSolicitudesCitas");

const { getMensajes } = require("../config");

exports.validarBodySolicitudAnularCambiarHoraMedica = async (
  req,
  res,
  next
) => {
  try {
    const solicitud = req.body;
    if (
      (solicitud.tipoSolicitud !== "ANULAR" &&
        solicitud.tipoSolicitud !== "CAMBIAR") ||
      typeof solicitud.correlativoCita !== "number" ||
      typeof solicitud.motivo !== "number" ||
      typeof solicitud.detallesMotivo !== "string" ||
      typeof solicitud.idCita !== "string"
    ) {
      return res.status(400).send({
        respuesta: await getMensajes("badRequest"),
      });
    }
    const motivo = await MotivosSolicitudesCitas.findOne({
      indice: solicitud.motivo,
      tipoSolicitud: solicitud.tipoSolicitud,
    }).exec();
    if (!motivo) {
      return res.status(400).send({
        respuesta: await getMensajes("badRequest"),
      });
    } else {
      req.body.motivo = motivo.nombre;
    }
    next();
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

exports.validarFechaSolicitudAnularCambiarHoraMedica = async (
  req,
  res,
  next
) => {
  try {
    const cita = await CitasPacientes.findById(req.body.idCita)
      .select(
        "numeroPaciente correlativoCita fechaCitacion"
      )
      .exec();
    if (!cita) {
      return res.status(400).send({
        respuesta: await getMensajes("badRequest"),
      });
    }
    req.cita = cita;
    const fechaActual = moment().startOf("day");
    const fechaCita = moment(cita.fechaCitacion).startOf("day");
    const diferencia = momentBussinessDays(
      fechaActual,
      "MM-DD-YYYY"
    ).businessDiff(momentBussinessDays(fechaCita, "MM-DD-YYYY"));
    if (req.body.tipoSolicitud === "CAMBIAR") {
      if (diferencia < 3) {
        return res.status(400).send({
          respuesta: await getMensajes("badRequest"),
        });
      }
    } else {
      if (diferencia < 1) {
        return res.status(400).send({
          respuesta: await getMensajes("badRequest"),
        });
      }
    }
    next();
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

exports.validarSinSolicitudAnularCambiarHoraMedica = async (req, res, next) => {
  try {
    const solicitudExistente =
      await SolicitudesAnularCambiarCitasPacientes.findOne({
        numeroPaciente: req.cita.numeroPaciente,
        correlativoCita: req.cita.correlativoCita,
        tipoSolicitud: { $in: ["ANULAR", "CAMBIAR"] },
      }).exec();
    if (solicitudExistente) {
      return res.status(400).send({
        respuesta: await getMensajes("badRequest"),
      });
    }
    next();
  } catch (error) {
    res.status(500).send({ respuesta: await getMensajes("serverError") });
  }
};
