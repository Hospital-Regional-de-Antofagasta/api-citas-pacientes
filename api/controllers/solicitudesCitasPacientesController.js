const SolicitudesAnularCambiarCitasPacientes = require("../models/SolicitudesAnularCambiarCitasPacientes");
const MotivosSolicitudesCitas = require("../models/MotivosSolicitudesCitas");

const { getMensajes } = require("../config");
const CitasPacientes = require("../models/CitasPacientes");

exports.getMotivosSolicitudesCitas = async (req, res) => {
  try {
    const tipo = req.params.tipoSolicitud;
    if (typeof tipo !== "string") {
      res.status(400).send({ respuesta: await getMensajes("badRequest") });
    }
    const motivos = await MotivosSolicitudesCitas.find({
      tipoSolicitud: tipo,
      habilitado: true,
    })
      .sort({ indice: 1 }) //1 ascendente
      .exec();
    res.status(200).send(motivos);
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

exports.checkExisteSolicitudCambiarOAnularHoraMedica = async (req, res) => {
  try {
    const cita = await CitasPacientes.findById(req.params.idCita)
      .select(
        "numeroPaciente.numero numeroPaciente.codigoEstablecimiento numeroPaciente.hospital numeroPaciente.nombreEstablecimiento correlativoCita"
      )
      .exec();
      if (!cita) {
        return res.status(400).send({ respuesta: await getMensajes("badRequest") });
      }
    const solicitud = await SolicitudesAnularCambiarCitasPacientes.findOne({
      numeroPaciente: cita.numeroPaciente,
      correlativoCita: cita.correlativoCita,
      tipoSolicitud: { $in: ["ANULAR", "CAMBIAR"] },
    }).exec();
    if (solicitud) {
      res.status(200).send({
        existeSolicitud: true,
        respuesta: await getMensajes("solicitudDuplicada"),
      });
    } else {
      res.status(200).send({ existeSolicitud: false });
    }
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

exports.createSolicitudCambiarOAnularHoraMedica = async (req, res) => {
  try {
    const cita = req.cita
    const solicitud = req.body;
    solicitud.numeroPaciente = cita.numeroPaciente;
    await SolicitudesAnularCambiarCitasPacientes.create(solicitud);
    res.status(201).send({ respuesta: await getMensajes("solicitudCreada") });
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
