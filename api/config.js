const ConfigApiCitasPacientes = require("../models/ConfigApiCitasPacientes"); //SOLO VERSION GRATUITA DE VERCEL
const DiasFeriados = require("../models/DiasFeriados"); //SOLO VERSION GRATUITA DE VERCEL
//const ConfigApiCitasPacientes = require("./models/ConfigApiCitasPacientes");
//const DiasFeriados = require("./models/DiasFeriados");

let mensajes = {
  forbiddenAccess: "No tiene la autorización para realizar esta acción.",
  serverError: "Se produjo un error.",
  badRequest: "La petición no está bien formada.",
};

const loadConfig = async () => {
  try {
    const config = await ConfigApiCitasPacientes.findOne({ version: 1 }).exec();
    mensajes = config.mensajes;
  } catch (error) {}
};

const cargarFeriados = async () => {
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

module.exports = {
  loadConfig,
  mensajes,
  cargarFeriados,
};
