const Router = require("express");
const router = Router();
const {
  getClientes,
  getFiles,
  crearCliente,
  getAutoId,
  actualizarCliente,
  agregarNuevoEstado,
  eliminarClientePermanentemente
} = require("../controllers/clientes.controller.js");
const { autenticacion } = require("../middlewares/authenticated.js");
const configureCloudinary = require("../utils/cloudinary.js");

const multipart = require("connect-multiparty");

const md_upload = multipart({ uploadDir: "./uploads" });

router.get("/", autenticacion, getClientes);
router.get("/:id", autenticacion, getAutoId);

router.post(
  "/crear",
  [autenticacion, configureCloudinary, md_upload],
  crearCliente
);

router.patch("/editar/:id", autenticacion, actualizarCliente);

router.patch("/agregar/:id", autenticacion, agregarNuevoEstado);

router.get("/facturas", configureCloudinary, getFiles);


router.delete("/eliminar/:id", autenticacion, eliminarClientePermanentemente);

module.exports = router;
