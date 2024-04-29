const sql = require("mssql");
const pool = require("../db");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../constants");


async function crearCita(req, res) {
    const { 
      Id_habitacion, 
      Id_usuario, 
      Id_pago, 
      dtfechallegada, 
      dtfechasalida 
    } = req.body;
  
    try {
      const request = pool.request();
  
      request.input("Id_habitacion", sql.Int, Id_habitacion);
      request.input("Id_usuario", sql.Int, Id_usuario);
      request.input("Id_pago", sql.Int, Id_pago);
      request.input("dtfechallegada", sql.Date, dtfechallegada);
      request.input("dtfechasalida", sql.Date, dtfechasalida);
  
      const result = await request.query(`
        INSERT INTO tblreservacion (
          Id_habitacion, 
          Id_usuario, 
          Id_pago, 
          dtfechallegada, 
          dtfechasalida
        ) VALUES (
          @Id_habitacion, 
          @Id_usuario, 
          @Id_pago, 
          @dtfechallegada, 
          @dtfechasalida
        );
      `);
  
      res.status(HTTP_STATUS.CREATED).json({ message: "Cita creada exitosamente" });
    } catch (error) {
      console.error("Error al crear cita:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Error al crear cita" });
    }
  }

  async function obtenerfechas(req, res) {
    const { Id_habitacion } = req.params; // Obtenemos el ID de la habitación de los parámetros de la solicitud
    try {
        // Crear una solicitud de base de datos
        const request = pool.request();
        request.input("Id_habitacion", sql.Int, Id_habitacion); // Establecer el ID de la habitación como parámetro
        
        // Ejecutar la consulta para obtener las fechas ocupadas
        const result = await request.query(`
            SELECT dtfechallegada, dtfechasalida
            FROM tblreservacion
            WHERE Id_habitacion = @Id_habitacion;
        `);
        
        // Devolver las fechas ocupadas en el formato JSON
        res.status(HTTP_STATUS.OK).json(result.recordset);
    } catch (error) {
        // Manejar errores
        console.error("Error al obtener fechas ocupadas:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Error al obtener fechas ocupadas" });
    }
  }

  
  async function actualizarCita(req, res) {
    const { 
      id, 
      Id_habitacion, 
      Id_usuario, 
      Id_pago, 
      dtfechallegada, 
      dtfechasalida 
    } = req.body;
  
    try {
      const request = pool.request();
  
      request.input("Id_habitacion", sql.Int, Id_habitacion);
      request.input("Id_usuario", sql.Int, Id_usuario);
      request.input("Id_pago", sql.Int, Id_pago);
      request.input("dtfechallegada", sql.Date, dtfechallegada);
      request.input("dtfechasalida", sql.Date, dtfechasalida);
      request.input("id", sql.Int, id);
  
      const result = await request.query(`
        UPDATE tblreservacion
        SET 
          Id_habitacion = @Id_habitacion, 
          Id_usuario = @Id_usuario, 
          Id_pago = @Id_pago, 
          dtfechallegada = @dtfechallegada, 
          dtfechasalida = @dtfechasalida
        WHERE 
          Id_reservacion = @id;
      `);
  
      if (result.rowsAffected[0] > 0) {
        res.status(HTTP_STATUS.OK).json({ message: "Cita actualizada exitosamente" });
      } else {
        res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Cita no encontrada" });
      }
    } catch (error) {
      console.error("Error al actualizar cita:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Error al actualizar cita" });
    }
  }
  
  async function eliminarCita(req, res) {
    const { id } = req.params;
  
    try {
      const request = pool.request();
      request.input("id", sql.Int, id);
  
      const result = await request.query(`
        DELETE FROM tblreservacion 
        WHERE Id_reservacion = @id;
      `);
  
      if (result.rowsAffected[0] > 0) {
        res.status(HTTP_STATUS.OK).json({ message: "Cita eliminada exitosamente" });
      } else {
        res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Cita no encontrada" });
      }
    } catch (error) {
      console.error("Error al eliminar cita:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Error al eliminar cita" });
    }
  }
  
  async function obtenerCitas(req, res) {
    try {
      const request = pool.request();
      const result = await request.query(`
        SELECT 
          Id_reservacion, 
          Id_habitacion, 
          Id_usuario, 
          Id_pago, 
          dtfechallegada, 
          dtfechasalida 
        FROM 
          tblreservacion;
      `);
  
      res.status(HTTP_STATUS.OK).json(result.recordset);
    } catch (error) {
      console.error("Error al obtener citas:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Error al obtener citas" });
    }
  }
  
  async function obtenerCitaPorId(req, res) {
    const { id } = req.params;
  
    try {
      const request = pool.request();
      request.input("id", sql.Int, id);
  
      const result = await request.query(`
        SELECT 
          Id_reservacion, 
          Id_habitacion, 
          Id_usuario, 
          Id_pago, 
          dtfechallegada, 
          dtfechasalida 
        FROM 
          tblreservacion
        WHERE 
          Id_reservacion = @id;
      `);
  
      if (result.recordset.length > 0) {
        res.status(HTTP_STATUS.OK).json(result.recordset[0]);
      } else {
        res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Cita no encontrada" });
      }
    } catch (error) {
      console.error("Error al obtener cita por ID:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Error al obtener cita por ID" });
    }
  }
  
  module.exports = {
    crearCita,
    actualizarCita,
    eliminarCita,
    obtenerCitas,
    obtenerCitaPorId,
    obtenerfechas,
  };
  