const momentBussinessDays = require("moment-business-days");
const moment = require("moment");
const CitasPacientes = require("../models/CitasPacientes");
const SolicitudesCambiarOAnularHorasMedicas = require("../models/SolicitudesCambiarOAnularHorasMedicas");
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
      })
        .sort({ createdAt: -1 }) // -1 descendente
        .select("alta -_id") //quitar el _id
        .exec();
      if (!cita || cita.alta === true)
        return res.status(400).send({ respuesta: mensajes.badRequest });
    }
    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.validarSolicitudAnularCambiarHoraMedica = async (req, res, next) => {
  try {
    req.body.numeroPaciente = req.numeroPaciente;
    const solicitud = req.body;

    if (
      (solicitud.tipoSolicitud !== "ANULAR" &&
        solicitud.tipoSolicitud !== "CAMBIAR") ||
      typeof solicitud.correlativoCita !== "number"
    ) {
      return res.status(400).send({ respuesta: mensajes.badRequest });
    }
    const solicitudExistente = await SolicitudesCambiarOAnularHorasMedicas.findOne(
      {
        numeroPaciente: solicitud.numeroPaciente,
        correlativoCita: solicitud.correlativoCita,
        tipoSolicitud: { $in: ["ANULAR", "CAMBIAR"] },
      }
    )
      .sort({ createdAt: -1 }) // -1 descendente
      .select("tipoSolicitud -_id") //quitar el _id
      .exec();

    if (solicitudExistente) {
      // Ya existe una solicitud de anular o cambiar control
      return res.status(400).send({ respuesta: mensajes.badRequest });
    }
    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};

exports.validarFecha = async (req, res, next) => {
  try {
    req.body.numeroPaciente = req.numeroPaciente;
    const solicitud = req.body;
    if (
      solicitud.tipoSolicitud === "ANULAR" ||
      solicitud.tipoSolicitud === "CAMBIAR"
    ) {
      const cita = await CitasPacientes.findOne({
        numeroPaciente: solicitud.numeroPaciente,
        correlativoCita: solicitud.correlativoCita,
        codigoAmbito: "01",
        //tipoCita: "C",
      })
        .select("fechaCitacion -_id") //quitar el _id
        .exec();
      if (!cita) {
        return res.status(400).send({ respuesta: mensajes.badRequest });
      }
      const diferencia = momentBussinessDays(
        moment(new Date()),
        "MM-DD-YYYY"
      ).businessDiff(momentBussinessDays(cita.fechaCitacion, "MM-DD-YYYY"));
      if (diferencia < 3) {
        return res.status(400).send({ respuesta: mensajes.badRequest });
      }
    }
    next();
  } catch (error) {
    res.status(500).send({ respuesta: mensajes.serverError });
  }
};
