const sql = require("mssql");
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, HTTP_STATUS, ERROR_MESSAGES } = require("../constants");

const {
  generateRememberToken,
  saveRememberToken,
  deleteRememberToken,
  generarContrasenaAleatoria,
  enviarCorreoElectronico,
  correoExiste,
  consultarUsuario,
  actualizarContrasena,
} = require("../models/auth");

async function login(req, res) {
  const { correo, contraseña } = req.body;
  console.log(correo, contraseña);

  // Extraer la dirección IP del cliente
  const ipAddress =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    const request = pool.request();
    request.input("correo", sql.NVarChar, correo);

    const result = await request.query(`
      SELECT u.Id_usuario, u.vchnombre, a.Contraseña, a.remember_token, r.Nombre AS rol
      FROM [hotelsantac].[dbo].[tblusuario] AS u
      JOIN [hotelsantac].[dbo].[tblusuario_autenticacion] AS a ON u.Id_usuario = a.Id_usuario
      JOIN [hotelsantac].[dbo].[Roles] AS r ON a.Id_rol = r.Id_rol
      WHERE u.vchcorreo = @correo
    `);
    console.log(result);

    if (result.recordset.length === 0) {
      console.log("Usuario no encontrado");
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.INVALID_EMAIL_PASSWORD });
    }

    const storedPassword = result.recordset[0].Contraseña;
    const userId = result.recordset[0].Id_usuario;
    const userRole = result.recordset[0].rol;
    console.log(storedPassword, userId, userRole);
    const passwordMatch = await bcrypt.compare(contraseña, storedPassword);

    if (!passwordMatch) {
      // Registro de inicio de sesión fallido
      // await insertLoginLog(ipAddress, correo, 401);
      // console.log(ipAddress);
      await insertLog(
        "Inicio de Sesion ",
        ipAddress,
        correo,
        "inicio de sesión fallido",
        "iniciarsesion",
        "500",
        userId
      );
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.INVALID_EMAIL_PASSWORD });
    }

    // Registro de inicio de sesión exitoso
    // await insertLoginLog(ipAddress, correo, 200);
    await insertLog(
      "Inicio de Sesion ",
      ipAddress,
      correo,
      "Verificacion de identidad",
      "Login",
      "200",
      userId
    );
    // Generar el token JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "2m" });

    // Guardar el token en la base de datos
    const rememberToken = generateRememberToken(); // Implementa esta función para generar un token único
    await saveRememberToken(userId, rememberToken);

    res.setHeader("Authorization", `Bearer ${token}`);
    res.json({ token, rememberToken, role: userRole, userId });
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
}

async function logout(req, res) {
  try {
    const { userId } = req.params; // Cambiado para obtener el ID de los parámetros
    await deleteRememberToken(userId);

    res.status(HTTP_STATUS.OK).json({ message: "Logout exitoso" });
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
}

async function registerUser(req, res) {
  const {
    nombre,
    apellidoP,
    apellidoM,
    correo,
    telefono,
    sexoId,
    contraseña,
    preguntaSecreta,
    RespuestaSecreta,
  } = req.body;

  try {
    const correoExistente = await correoExiste(correo);
    if (correoExistente) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED });
    }
    console.log(contraseña);
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const request = pool.request();

    request.input("sexoId", sql.Int, sexoId);
    request.input("nombre", sql.NVarChar, nombre);
    request.input("apellidoP", sql.NVarChar, apellidoP);
    request.input("apellidoM", sql.NVarChar, apellidoM);
    request.input("correo", sql.NVarChar, correo);
    request.input("telefono", sql.NVarChar, telefono);

    const resultUsuario = await request.query(`
      INSERT INTO tblusuario (Id_sexo, vchnombre, vchapellidop, vchapellidom, vchcorreo, vchtelefono)
      OUTPUT INSERTED.Id_usuario
      VALUES (@sexoId, @nombre, @apellidoP, @apellidoM, @correo, @telefono);
    `);

    const usuarioId = resultUsuario.recordset[0].Id_usuario;

    request.input("usuarioId", sql.Int, usuarioId);
    request.input("contraseña", sql.NVarChar, hashedPassword);
    request.input("preguntaSecreta", sql.NVarChar, preguntaSecreta);
    request.input("RespuestaSecreta", sql.NVarChar, RespuestaSecreta);
    request.input("fechaCreacion", sql.DateTime, new Date());

    // Incluir Id_rol con valor 1 en la inserción de tblusuario_autenticacion
    await request.query(`
      INSERT INTO tblusuario_autenticacion (Id_usuario, Contraseña, PreguntaSecreta, RespuestaSecreta, created_at, Id_rol)
      VALUES (@usuarioId, @contraseña, @preguntaSecreta, @RespuestaSecreta, @fechaCreacion, 4); 
    `);

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error(error);
    console.log("Error al registrar usuario:", error.message);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
}
async function recuperarContrasena(req, res) {
  const { correo, RespuestaSecreta } = req.body;

  try {
    const usuarios = await consultarUsuario(correo);
    if (usuarios.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    const storedRespuestaSecreta = usuarios[0].RespuestaSecreta;
    const userId = usuarios[0].Id_usuario;

    if (RespuestaSecreta !== storedRespuestaSecreta) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: ERROR_MESSAGES.INVALID_ANSWER });
    }

    const nuevaContrasena = generarContrasenaAleatoria(10);
    console.log("Nueva contraseña generada:", nuevaContrasena);

    await actualizarContrasena(userId, nuevaContrasena);

    await enviarCorreoElectronico(correo, nuevaContrasena);

    res.status(HTTP_STATUS.OK).json({
      message: "Se ha enviado una nueva contraseña a tu correo electrónico",
    });
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
}

async function getUserInfo(req, res) {
  try {
    const userId = req.params.userId; // Obtener el ID del usuario de los parámetros de la solicitud
    const request = pool.request();
    request.input("userId", sql.Int, userId);

    const result = await request.query(`
      SELECT u.Id_usuario, u.vchnombre, a.Contraseña, a.remember_token, r.Nombre AS rol
      FROM [hotelsantac].[dbo].[tblusuario] AS u
      JOIN [hotelsantac].[dbo].[tblusuario_autenticacion] AS a ON u.Id_usuario = a.Id_usuario
      JOIN [hotelsantac].[dbo].[Roles] AS r ON a.Id_rol = r.Id_rol
      WHERE u.Id_usuario = @userId
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const userInfo = {
      userId: result.recordset[0].Id_usuario,
      nombre: result.recordset[0].vchnombre,
      contraseña: result.recordset[0].Contraseña,
      rememberToken: result.recordset[0].remember_token,
      rol: result.recordset[0].rol,
    };

    res.status(200).json(userInfo); // Enviar la información del usuario como respuesta
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" }); // Manejar errores
  }
}



const insertLog = async (
  accionRealizada,
  ipAddress,
  usernameEmail,
  actionDescription,
  requestedURL,
  httpStatusCode,
  userId
) => {
  try {
    const request = pool.request();
    request.input("accionRealizada", accionRealizada);
    request.input("ipAddress", ipAddress);
    request.input("usernameEmail", usernameEmail);
    request.input("actionDescription", actionDescription);
    request.input("requestedURL", requestedURL);
    request.input("httpStatusCode", httpStatusCode);
    request.input("userId", userId);
    request.query(
      "INSERT INTO Logs (AccionRealizada, IPAddress, UsernameEmail, fecha, ActionDescription, RequestedURL, HttpStatusCode, ID_Usuario) VALUES (@accionRealizada, @ipAddress, @usernameEmail, GETDATE(), @actionDescription, @requestedURL, @httpStatusCode, @userId)"
    );
    console.log("Log registrado exitosamente");
  } catch (error) {
    console.error("Error al registrar el log:", error);
  }
};

module.exports = {
  login,
  logout,
  registerUser,
  recuperarContrasena,
  getUserInfo,
  // getUser,
};
