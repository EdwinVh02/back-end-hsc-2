const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// Define las rutas para las operaciones CRUD
router.post("/insert", roomController.crearHabitacion);
router.get("/habitaciones", roomController.obtenerHabitaciones);
router.put("/actualizar/:id", roomController.actualizarHabitacion);
router.delete("/eliminar/:id", roomController.eliminarHabitacion);
router.get("/image/:id", roomController.VerIma);
router.get('/habitacionesId/:id', roomController.obtenerHabitacionPorId);
router.put("/actualizarEstado/:id", roomController.actualizarEstado);

// Ruta para la carga de imágenes
router.post("/upload", roomController.upload.single('imagen'), (req, res) => {
    // Verifica los valores de req.file para asegurarte de que estén correctamente configurados
    console.log("req.file.path:", req.file.path);
    console.log("req.file.filename:", req.file.filename);

    // Asegúrate de que filePath sea una ruta válida en el sistema de archivos
    // Verifica los permisos de acceso y existencia de la ruta

    try {
        // Devuelve el nombre de la imagen
        res.json({ nombreImagen: req.file.filename });
    } catch (error) {
        console.error("Error en el manejo de la solicitud de carga:", error);
        res.status(500).json({ error: "Error en la carga de la imagen" });
    }
});


module.exports = router;

