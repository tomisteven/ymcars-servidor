const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestClientSchema = new Schema({
  patente: String,
  marca: String,
  modelo: String,
  numeroSiniestro: String,
  aseguradora: String,
  fechaIngreso: String,
  fechaEntrega: String,
  codigoColor: String,
  eliminado: {
    type: Boolean,
    default: false,
  },
  factura: [
    {
      url: String,
      public_id: String,
    },
  ],
  estadoActual: String,
  historialEstados: [
    {
      estado: String,
      fecha: String,
    },
  ],
});

module.exports = mongoose.model("TestClient", TestClientSchema);
