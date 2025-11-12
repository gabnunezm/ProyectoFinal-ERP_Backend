require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
 
// CORS: permitir peticiones desde el frontend durante desarrollo.
// Puedes configurar CORS_ORIGIN en tu .env (por ejemplo: http://localhost:5174)
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5174';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    return res.sendStatus(204);
  }
  next();
});
// rutas
const authRouter = require('./src/routes/auth.router');
const estudiantesRouter = require('./src/routes/estudiantes.router');
const pagosRouter = require('./src/routes/pagos.router');
const usuariosRouter = require('./src/routes/usuarios.router');
const calificacionesRouter = require('./src/routes/calificaciones.router');
const inscripcionesRouter = require('./src/routes/inscripciones.router');
const asistenciasRouter = require('./src/routes/asistencias.router');
const reportsRouter = require('./src/routes/reports.router');
const portalRouter = require('./src/routes/portal.router');

app.use('/api/auth', authRouter);
app.use('/api/estudiantes', estudiantesRouter);
app.use('/api/pagos', pagosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/calificaciones', calificacionesRouter);
app.use('/api/inscripciones', inscripcionesRouter);
app.use('/api/asistencias', asistenciasRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/portal', portalRouter);

// middleware simple de error
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`ERP backend corriendo en http://localhost:${port}`);
});
