async function insertLoginLog(req, requestedURL, httpStatus) {
  try {
    // Extraer la dirección IP del cliente de la solicitud
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    await sql.connect(config);
    const result =
      await sql.query`INSERT INTO LoginLogs (IPAddress, RequestedURL, HttpStatus, LogDateTime) VALUES (${ipAddress}, ${requestedURL}, ${httpStatus}, GETDATE())`;
    return result.recordset;
  } catch (err) {
    console.error("Error al insertar registro de inicio de sesión:", err);
    throw err;
  } finally {
    sql.close();
  }
}
