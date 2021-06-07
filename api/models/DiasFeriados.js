const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiasFeriados = mongoose.model(
  "dias_feriado",
  new Schema({
    fecha: String
  })
);
module.exports = DiasFeriados;
