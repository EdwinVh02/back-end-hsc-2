const express = require("express");
const router = express.Router();
const authController = require("../controllers/citasControllers");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/agendar", authController.crearCita);
router.get("/:userId", authController.obtenerCitaPorId);
router.get("/:citaId", authController.obtenerCitas);
router.get("/:obtenerfechas:Id", authController.obtenerfechas);

module.exports = router;
