const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/logout/:userId", authController.logout); // Esta es la ruta para el cierre de sesión
router.post("/registro", authController.registerUser);
router.post("/recuperarcontrasena", authController.recuperarContrasena);
router.get("/getuserinfo/:userId", authController.getUserInfo);
// router.get("/usuarios", authController.getUser)

module.exports = router;

