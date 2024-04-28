const sql = require("mssql");
const pool = require("../db");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../constants");
const multer = require("multer");
const { google } = require("googleapis");
const path = require("path");

const serviceAccountJson = {
  type: "service_account",
  project_id: "possible-byway-421323",
  private_key_id: "0c2b51fcaa445a0d0dad8e5a15aa46b51b3e1782",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDKgl/1tyguQ5hH\nm0mmnc4q20aMlS3E+Hi0k/ygFVAN2LU+VjidMLKPRz8jgbmx+aEa8ypJ6n+TYGAm\nBrEIa7AfLO6ElNmJT4ZXk5nfzbKft2HM58u99mXUrQzbklIn34kpQCfXWwLlGasM\n8scPumFX4dfqq9O2rQfs1XQ22CGMlG2sDsHwYxGoNMWG1Q/TIQMYREkojE8v9uH5\nlLOECn4qMRUUokLEWVaeEPCLprxtTG1QjqTLvr2xYfLVdkVo8O8SCtandwDQA9ef\ny0X9elZxcoSiETuVbuuCriK6w8jcvxv3loTWLIQTfB6/B+DdstoTS/dRL6qRRlWK\ntl6wGpEtAgMBAAECggEACQY7UX9afolLmXFNnGuu2tEPuUcSlZL/CgkIOngIq71L\nAl6kQjj/1Au4QBRRWqGFsOZCLa4SBlbGohstO3NVE2aUsHrToN9W3MM6mbMYcS6i\nYJe5yBrZWdtmVciU+arn+VsfC2VGYUA+E6MkBMro+JobXZ1Pn3XhgwfWGHWUNSf5\n2CyfuUaW/pfUGC3cAVHuGTVfyQBJoJ2Ws94Ip6gX61l6aWDgHaGWpsr8M14T1oeL\nWQx7WXLxx8xAhretWGIWnScXAn6dHImTw+s1UPeUzj0y+cjYBzCUCy6MIkp1gT3Q\nciG9loU/dl9cgJTnMZiFnAFjT6LgX+2lZNtat9STvwKBgQDqCIRtg/z1STctfO5C\nfJLOddfarGPgsgx5hZHJGPmQmoSRDjZ8W6zWzg59qN/Die7zWgRczZeLk1uO4NiM\nyzSTjpT7Rd73Fs0wdGGF8dIwFdN2xOda+fV5IWyEPy3as0qs/loBynedYEHQTU9R\nVZmneEW6f+iNFFl8kqSWo53g1wKBgQDdhGGfVZ/le3NX9hhmPRjXT/EDHfcGq+qO\nMWpvjSSDMgWu25NlaqwJRJSSf7OJ0X5btqdZIrlMb84spanxlmDjcnslWw187zF0\nar88++54VQvyvFomBzHPqsq6xBzwVfTKJApD/340hz1ip2suDtnZGy2RRas3tt03\naxizIGcpmwKBgHgakOOnJc03msKUZ63lQm4EGheV+tfYaACBZLTARWtJcRkEI0Ak\nyAmgy9z/Kn6uLdvjaXO66rftksI7b8apjjzfomNlkyxZHkpsn5Pe61BUEybTnCub\nNbfJSGiCB+VBt+QZ0FU087fnKz9cPYVvGaDRX297rvuf4uDEXQUVyLMXAoGBAIBd\nCxkCzDJ19CP/tqngM7npWDc/MPuLudMGLbBQsNzZqtNl6Cb3xpNkS1gNaiOt4zQQ\nRy9u4MO7clUK9szJIIIMv/Gorss77IOSrBkRwGG4nsDdhrvMpX+6b9oEdOSMWtqc\nQdqffinASMEXVROOhYy6pBAvuAUEEXLgu6JpX36LAoGBAKWu+n6TDWi6CHq4ws2B\ntjw8L6ogmgxt5guuqla9JB4Dj+F8Njs4nd9ESodK/EA2JemYr0VhprVx4SK+Km0l\n7QLELP/5Nh22iJ2eFUWA3dPf38KjLV++uhJsxxfzSvP5yktbe7fr+HMrI7gIxAzx\nQuGrbNKL4yedDEoUkU5xJB5w\n-----END PRIVATE KEY-----\n",
  client_email: "almacenamiento@possible-byway-421323.iam.gserviceaccount.com",
  client_id: "108911738175578738177",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/almacenamiento%40possible-byway-421323.iam.gserviceaccount.com",
};

// Crea una instancia de autenticación utilizando el objeto JSON
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountJson,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({
  version: "v3",
  auth,
});

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const folderId = "1oah9MD3PkIaARCEwsBBX8qT1Z1iSokAy"; // ID de la carpeta de Google Drive
      const fileMetadata = {
        name: file.originalname,
        parents: [folderId],
      };

      const media = {
        mimeType: file.mimetype,
        body: file.stream,
      };

      // Subir archivo a Google Drive
      const fileUpload = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id, name",
      });

      // Devuelve solo el nombre original del archivo en el callback
      cb(null, file.originalname);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Puedes crear un nombre único para el archivo si lo deseas, pero mantendremos el original para tu caso
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

async function crearHabitacion(req, res) {
  const {
    idEstado,
    descripcion,
    precio,
    capacidad,
    idTipoHabitacion,
    nombreArchivo,
  } = req.body;

  try {
    const request = pool.request();

    request.input("idEstado", sql.Int, idEstado);
    request.input("descripcion", sql.NVarChar, descripcion);
    request.input("precio", sql.Decimal, precio);
    request.input("capacidadP", sql.Int, capacidad);
    request.input("idTipoHabitacion", sql.Int, idTipoHabitacion);
    request.input("Imagen", sql.NVarChar, nombreArchivo);

    const result = await request.query(`
            INSERT INTO tblhabitacion (Id_estado, vchdescripcion, precio, capacidadP, Id_tipohabitacion, Imagen)
            VALUES (@idEstado, @descripcion, @precio, @capacidadP, @idTipoHabitacion, @Imagen);
        `);

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: "Habitación creada exitosamente" });
  } catch (error) {
    console.error("Error al crear habitación:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Error al crear habitación" });
  }
}

async function obtenerHabitaciones(req, res) {
  try {
    const request = pool.request();
    const result = await request.query(`
        SELECT 
        h.Id_habitacion, 
        h.vchdescripcion AS descripcion_habitacion, 
        h.precio, 
        h.imagen,
        h.capacidadP,
        th.vchtipohabitacion AS tipo_habitacion, 
        e.vchestado AS estado_habitacion
    FROM 
        tblhabitacion h
    INNER JOIN 
        tbltipohabitacion th ON h.Id_tipohabitacion = th.Id_tipohabitacion
    INNER JOIN 
        tblestadohabitacion e ON h.Id_estado = e.Id_estado;
    
        `);

    res.status(HTTP_STATUS.OK).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: ERROR_MESSAGES.ROOM_NOT_FOUND });
  }
}

async function obtenerHabitacionPorId(req, res) {
  const { id } = req.params; // Obtén el ID de la habitación desde los parámetros de la solicitud

  try {
    // Configura la solicitud de base de datos
    const request = pool.request();

    // Agrega el parámetro @id a la consulta
    request.input("id", sql.Int, id);

    // Realiza la consulta SQL para obtener la habitación por ID
    const result = await request.query(`
            SELECT h.Id_habitacion, h.vchdescripcion AS descripcion_habitacion, h.precio, h.Imagen,
                h.capacidadP, -- Incluye la capacidad en la consulta
                th.vchtipohabitacion AS tipo_habitacion, e.vchestado AS estado_habitacion
            FROM tblhabitacion h
            INNER JOIN tbltipohabitacion th ON h.Id_tipohabitacion = th.Id_tipohabitacion
            INNER JOIN tblestadohabitacion e ON h.Id_estado = e.Id_estado
            WHERE h.Id_habitacion = @id;  -- Filtrar por ID
        `);

    // Si no se encuentra la habitación, devuelve un error 404
    if (result.recordset.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: ERROR_MESSAGES.ROOM_NOT_FOUND });
    }

    // Si se encuentra la habitación, devuelve los datos de la habitación
    res.status(HTTP_STATUS.OK).json(result.recordset[0]);
  } catch (error) {
    console.error("Error al obtener habitación por ID:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
}

async function actualizarHabitacion(req, res) {
  const {
    idHabitacion,
    idEstado,
    descripcion,
    precio,
    capacidadP,
    idTipoHabitacion,
    nombreArchivo,
  } = req.body;

  try {
    const request = pool.request();
    request.input("idHabitacion", sql.Int, idHabitacion);
    request.input("idEstado", sql.Int, idEstado);
    request.input("descripcion", sql.NVarChar, descripcion);
    request.input("precio", sql.Decimal, precio);
    request.input("idTipoHabitacion", sql.Int, idTipoHabitacion);
    request.input("Imagen", sql.NVarChar, nombreArchivo);
    request.input("capacidadP", sql.Int, capacidadP);

    const result = await request.query(`
        UPDATE tblhabitacion
        SET Id_estado = @idEstado, Imagen = @Imagen, capacidadP = @capacidadP, vchdescripcion = @descripcion, precio = @precio, Id_tipohabitacion = @idTipoHabitacion
        WHERE Id_habitacion = @idHabitacion;        
        `);

    if (
      result.rowsAffected &&
      result.rowsAffected.length > 0 &&
      result.rowsAffected[0] > 0
    ) {
      res
        .status(HTTP_STATUS.OK)
        .json({ message: "Habitación actualizada exitosamente" });
    } else {
      console.error("Error al actualizar habitación:", result);
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: ERROR_MESSAGES.ROOM_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error al actualizar habitación:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: ERROR_MESSAGES.UPDATE_ROOM_ERROR });
  }
}

async function eliminarHabitacion(req, res) {
  const { id } = req.params;

  try {
    const request = pool.request();
    request.input("id", sql.Int, id);

    const result = await request.query(`
            DELETE FROM tblhabitacion WHERE Id_habitacion = @id;
        `);

    if (result.rowsAffected[0] > 0) {
      res
        .status(HTTP_STATUS.OK)
        .json({ message: "Habitación eliminada exitosamente" });
    } else {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: ERROR_MESSAGES.ROOM_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error al eliminar habitación:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: ERROR_MESSAGES.DELETE_ROOM_ERROR });
  }
}

async function VerIma(req, res) {
  const id = req.params.id;

  try {
    const request = pool.request();
    request.input("id", sql.Int, id);

    const result = await request.query(`
            SELECT Imagen
            FROM tblhabitacion
            WHERE Id_habitacion = @id;
        `);

    if (result.recordset.length > 0) {
      const image = result.recordset[0].Imagen;
      res.set("Content-Type", "image/jpeg");
      res.send(image);
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Imagen no encontrada" });
    }
  } catch (error) {
    console.error("Error al obtener la imagen:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Error al obtener la imagen" });
  }
}

async function actualizarEstado(req, res) {
  const { idHabitacion, idEstado } = req.body;

  try {
    const request = pool.request();
    request.input("idHabitacion", sql.Int, idHabitacion);
    request.input("idEstado", sql.Int, idEstado);

    const result = await request.query(`
        UPDATE tblhabitacion
        SET Id_estado = @idEstado
        WHERE Id_habitacion = @idHabitacion;        
        `);

    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      res
        .status(HTTP_STATUS.OK)
        .json({ message: "Habitación actualizada exitosamente" });
    } else {
      console.error("Error al actualizar habitación:", result);
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: ERROR_MESSAGES.ROOM_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error al actualizar habitación:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: ERROR_MESSAGES.UPDATE_ROOM_ERROR });
  }
}


module.exports = {
  crearHabitacion,
  obtenerHabitaciones,
  actualizarHabitacion,
  eliminarHabitacion,
  VerIma,
  upload,
  obtenerHabitacionPorId,
  actualizarEstado,
};
