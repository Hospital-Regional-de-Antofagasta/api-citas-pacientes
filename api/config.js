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
    titulo: "Éxito",
    mensaje: "La solicitud fue creada con éxito.",
    color: "",
    icono: "",
  },
  solicitudDuplicada: {
    titulo: "Alerta",
    mensaje: "La solicitud ya existe.",
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
  } catch (error) {}
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
