module.exports = {
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  ERROR_MESSAGES: {
    ROOM_NOT_FOUND: "Sala no encontrada",
    INVALID_ROOM_DATA: "Datos de sala inválidos",
    CREATE_ROOM_ERROR: "Error al crear la sala",
    UPDATE_ROOM_ERROR: "Error al actualizar la sala",
    DELETE_ROOM_ERROR: "Error al eliminar la sala",
    INVALID_EMAIL_PASSWORD: "Correo electrónico o contraseña incorrectos",
    EMAIL_ALREADY_REGISTERED: "El correo electrónico ya está registrado",
    USER_NOT_FOUND: "Usuario no encontrado",
    INVALID_ANSWER: "Respuesta inválida",
    INTERNAL_SERVER_ERROR: "Error interno del servidor",
  },
  JWT_SECRET: "hola12345",
};
