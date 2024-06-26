const Router = require("express");
const router = Router();
const {
  getClientes,
  getFiles,
  crearCliente,
  getAutoId,
  actualizarCliente,
  agregarNuevoEstado,
  eliminarClientePermanentemente,
  subirNuevaFactura,
  eliminarDanio
} = require("../controllers/clientes.controller.js");
const { autenticacion } = require("../middlewares/authenticated.js");
const configureCloudinary = require("../utils/cloudinary.js");

const multipart = require("connect-multiparty");

const md_upload = multipart({ uploadDir: "./uploads" });

router.get("/files", [autenticacion, configureCloudinary], getFiles);
router.get("/", autenticacion, getClientes);
router.get("/:id", autenticacion, getAutoId);

router.post(
  "/crear",
  [autenticacion, configureCloudinary, md_upload],
  crearCliente
);

router.patch("/editar/:id", autenticacion, actualizarCliente);

router.patch("/agregar/:id", autenticacion, agregarNuevoEstado);

router.post(
  "/factura/:id",
  [autenticacion, configureCloudinary, md_upload],
  subirNuevaFactura
);

router.delete(
  "/eliminar/:id",
  [configureCloudinary, autenticacion],
  eliminarClientePermanentemente
);

router.delete(
  "/danio/:id",
   autenticacion,
  eliminarDanio
);

module.exports = router;
