require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// rutas
const authRouter = require('./src/routes/auth.router');
const estudiantesRouter = require('./src/routes/estudiantes.router');
const pagosRouter = require('./src/routes/pagos.router');
const usuariosRouter = require('./src/routes/usuarios.router');

app.use('/api/auth', authRouter);
app.use('/api/estudiantes', estudiantesRouter);
app.use('/api/pagos', pagosRouter);
app.use('/api/usuarios', usuariosRouter);

// middleware simple de error
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`ERP backend corriendo en http://localhost:${port}`);
});
