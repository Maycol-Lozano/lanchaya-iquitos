const { Router } = require("express");
const controller = require("../controllers/salidas.controller");

const router = Router();

router.get("/destinos", controller.listarDestinos);

router.get("/salidas", controller.listarSalidas);
router.get("/salidas/:id", controller.obtenerSalida);
router.post("/salidas", controller.crearSalida);
router.put("/salidas/:id", controller.actualizarSalida);
router.delete("/salidas/:id", controller.eliminarSalida);

module.exports = router;
