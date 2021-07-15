const ConfigApiCitasPacientes = require("../models/ConfigApiCitasPacientes"); //SOLO VERSION GRATUITA DE VERCEL
const DiasFeriados = require("../models/DiasFeriados"); //SOLO VERSION GRATUITA DE VERCEL
//const ConfigApiCitasPacientes = require("./models/ConfigApiCitasPacientes");
//const DiasFeriados = require("./models/DiasFeriados");

const mensajesPorDefecto = {
  forbiddenAccess: {
    titulo: "Alerta",
    mensaje: "Su sesión ha expirado.",
    color: "",
    icono: "",
  },
  serverError: {
    titulo: "Alerta",
    mensaje: "Ocurrió un error inesperado.",
    color: "",
    icono: "",
  },
  badRequest: {
    titulo: "Alerta",
    mensaje: "La solicitud no está bien formada.",
    color: "",
    icono: "",
  },
  solicitudCreada: {
    titulo: "!Todo ha salido bien¡",
    mensaje:
      "Su solicitud ha sido creada con éxito, pronto nos comunicaremos con usted.",
    color: "",
    icono: "",
  },
  solicitudDuplicada: {
    titulo: "Solicitud Pendiente",
    mensaje: "Ya tiene una solicitud en curso.",
    color: "",
    icono: "",
  },
};

exports.getMensajes = async (tipo) => {
  try {
    const { mensajes } = await ConfigApiCitasPacientes.findOne({
      version: 1,
    }).exec();
    if (mensajes) {
      return mensajes[tipo];
    }
    return mensajesPorDefecto[tipo];
  } catch (error) {
    return mensajesPorDefecto[tipo];
  }
};

exports.cargarFeriados = async () => {
  try {
    const feriados = await DiasFeriados.find()
      .select("fecha -_id") //quitar el _id
      .exec();
    momentBussinessDays.updateLocale("cl", {
      holidays: feriados.map((feriado) => {
        return feriado.fecha;
      }),
      holidayFormat: "YYYY-MM-DD",
    });
    momentBussinessDays.updateLocale("cl", {
      workingWeekdays: [1, 2, 3, 4, 5],
    });
  } catch (error) {}
};
