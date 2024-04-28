const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Importa el middleware CORS
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const citasRoutes = require("./routes/citasRoutes");


const app = express();

app.use(bodyParser.json({ limit: '50mb' })); // Ajusta el límite según tus necesidades
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Aplica el middleware CORS a todas las rutas
app.use(cors({
  //origin: 'https://r-cruz-roja-r73k.vercel.app',
  origin: ['http://localhost:5174', 'http://localhost:5173'],
   credentials: true,
 }));
 
 // Agregar encabezados CORS a todas las respuestas
 //app.use((req, res, next) => {
    //res.setHeader('Access-Control-Allow-Origin', 'https://r-cruz-roja-r73k.vercel.app');
  //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  /// res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  // res.setHeader('Access-Control-Allow-Credentials', true);
 //  next();
 //});
 
 app.use((req, res, next) => {
   const allowedOrigins = ['http://localhost:5174', 'http://localhost:5173']; // Lista de orígenes permitidos
   const origin = req.headers.origin;
 
   if (allowedOrigins.includes(origin)) {
     res.setHeader('Access-Control-Allow-Origin', origin);
   }
 
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
   res.setHeader('Access-Control-Allow-Credentials', true);
   next();
 });

app.use("/api/rooms", roomRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/citas", citasRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
