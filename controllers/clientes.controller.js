const Client = require("../models/Client");

const fs = require("fs-extra");
const bcrypt = require("bcrypt-nodejs");
const cloudinary = require("cloudinary");

const getClientes = async (req, res) => {
  const clientes = await Client.find();
  /*   const cli = clientes.filter((cliente) => cliente.eliminado === false); */

  return res.status(200).send(clientes.reverse());
};

const getAutoId = async (req, res) => {
  const { id } = req.params;
  const client = await Client.findById(id);
  //console.log(client);

  if (!client) {
    return res.status(404).json({ message: "Cliente no encontrado" });
  }

  res.status(200).json(client);
};

const getFiles = async (req, res) => {
  cloudinary.v2.api
    .resources({
      type: "upload",
    })
    .then((result) => {
      return (files = result.resources);
    })
    .catch((err) => {
      res.status(500).json({ message: "Error al obtener los archivos", err });
    });
};

const eliminarDanio = async (req, res) => {
  const { id } = req.params;
  const { danioId } = req.body;

  try {
    const client = await Client.findById(id);
    const danio = client.daniosRecibidos.id(danioId);

    if (!danio) {
      return res.status(404).json({ message: "Daño no encontrado" });
    }

    danio.remove();
    await client.save();

    res.status(200).json({ client, ok: true });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar el daño", err });
  }
};

const crearCliente = async (req, res) => {
  try {
    const { patente, aseguradora, numeroSiniestro, daniosRecibidos } = req.body;
    const { factura } = req.files;

    const clientExist = await Client.findOne({ patente });

    if (clientExist) {
      return res.status(400).json({ message: "El cliente ya existe" });
    }

    dañosArray = JSON.parse(daniosRecibidos);
    req.body.daniosRecibidos = dañosArray;

    if (factura) {
      const result = await cloudinary.v2.uploader.upload(factura.path);
      req.body.factura = {
        url: result.url,
        public_id: result.public_id,
      };
      await fs.unlink(factura.path);
    }

    !aseguradora ? (req.body.aseguradora = "No especificada") : null;
    !numeroSiniestro ? (req.body.numeroSiniestro = "No especificado") : null;

    const client = new Client(req.body);

    await client.save();

    res.status(200).json({ client, ok: true });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el cliente", error });
  }
};
const actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const client = await Client.findByIdAndUpdate(id, body, { new: true });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.status(200).json(client);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar el cliente", err });
  }
};

const agregarNuevoEstado = async (req, res) => {
  const { id } = req.params;
  const { estado, fecha } = req.body;

  try {
    const client = await Client.findById(id);
    client.historialEstados.push({ estado, fecha });
    client.estadoActual = estado;
    await client.save();
    res.status(200).json({ client, ok: true });
  } catch (err) {
    res.status(500).json({ message: "Error al agregar el estado", err });
  }
};

const subirNuevaFactura = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    const { factura } = req.files;
    console.log(factura);
    if (factura) {
      const result = await cloudinary.v2.uploader.upload(factura.path);
      client.factura.push({
        url: result.url,
        public_id: result.public_id,
      });
      await fs.unlink(factura.path);
    }

    await client.save();
    res.status(200).json({ client, ok: true });
  } catch (error) {
    res.status(500).json({ message: "Error al subir la factura", error });
  }
};

const obtenerArchivo = async (req, res) => {};

const eliminarArchivo = async (req, res) => {};

const eliminarClientePermanentemente = async (req, res) => {
  const { id } = req.params;
  const client = await Client.findById(id);

  if (client.factura.length > 0) {
    client.factura.forEach(async (factura) => {
      await cloudinary.v2.uploader.destroy(factura.public_id);
      console.log("Factura eliminada");
    });
  }

  await Client.deleteOne({ _id: id });

  if (!client) {
    return res.status(404).json({ message: "Cliente no encontrado" });
  }

  res.status(200).json({ message: "Cliente eliminado" });
};

module.exports = {
  getClientes,
  getFiles,
  crearCliente,
  obtenerArchivo,
  eliminarArchivo,
  actualizarCliente,
  eliminarClientePermanentemente,
  getAutoId,
  agregarNuevoEstado,
  subirNuevaFactura,
  eliminarDanio,
};
