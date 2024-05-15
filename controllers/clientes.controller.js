const Client = require("../models/Client");
const TestClient = require("../models/TestClient");
const path = require('path');

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
function guardarImagenBase64(rutaCarpeta, nombreImagen, base64Data) {
  // Crear la ruta completa del archivo
  const savePath = path.join(rutaCarpeta, nombreImagen);

  // Eliminar el prefijo data:image/png;base64, si es necesario
  const base64Image = base64Data.split(';base64,').pop();

  // Guardar la imagen en la ruta especificada
  fs.writeFile(savePath, base64Image, { encoding: 'base64' }, (err) => {
    if (err) {
      console.error('Error al guardar la imagen:', err);
      return { success: false, message: 'Error al guardar la imagen' };
    } else {
      console.log('Imagen guardada correctamente en', savePath);
      return { success: true, message: 'Imagen guardada correctamente' };
    }
  });
}

function crearClienteConFs(req, res) {

  // Obtiene los datos del formulario
  const clienteFs = new TestClient(req.body);

  //console.log(req.files);
  const file = req.files.factura; // `file` es el nombre del campo del archivo en el formulario

  if (!file) {
    return res.status(400).send('No se subió ningún archivo PDF.');
  }

  // Verifica que el archivo sea un PDF
  if (file.type !== 'application/pdf') {
    // Elimina el archivo temporal subido que no es un PDF
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Error al eliminar el archivo temporal:', err);
      }
    });
    return res.status(400).send('Solo se permiten archivos PDF.');
  }

  // Define la ruta de destino del archivo
  const targetPath = path.join('D:\\Escritorio\\temp\\FACTURAS', `${req.body.patente}-${file.originalFilename}`);

  const id = file.path.split('\\').pop().split('.').shift();


  clienteFs.factura = {
    url: targetPath,
    public_id: id,
  };

  // Mueve el archivo desde la ubicación temporal a la ubicación final
  fs.rename(file.path, targetPath, (err) => {
    if (err) {
      console.error('Error al mover el archivo:', err);
      return res.status(500).send('Error al guardar el archivo.');
    }

    console.log('Archivo PDF guardado correctamente en', targetPath);
    // Guarda el cliente en la base de datos
    clienteFs.save();
    res.status(200).send(`Archivo PDF guardado correctamente en ${targetPath}`);
  });
}

const crearCliente = async (req, res) => {
  try {
    const { patente, aseguradora, numeroSiniestro } = req.body;
    const { factura } = req.files;

    const clientExist = await Client.findOne({ patente });

    if (clientExist) {
      return res.status(400).json({ message: "El cliente ya existe" });
    }

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
  crearClienteConFs
};
