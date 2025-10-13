const Router = require('express').Router;
const router = Router();
const pagosCtrl = require('../controllers/pagos.controller');
// const auth = require('../middlewares/auth.middleware'); // descomenta si quieres proteger rutas

// Crear pago
router.post('/', /* auth, */ pagosCtrl.crearPago);

// Listar pagos con filtros
router.get('/', /* auth, */ pagosCtrl.listarPagos);

// Obtener pago por id
router.get('/:id', /* auth, */ pagosCtrl.obtenerPago);

// Actualizar estado
router.patch('/:id/estado', /* auth, */ pagosCtrl.actualizarEstadoPago);

// Actualizar campos del pago
router.patch('/:id', /* auth, */ pagosCtrl.actualizarPago);

// Pagos por estudiante (alternativa)
router.get('/estudiante/:id', /* auth, */ pagosCtrl.pagosPorEstudiante);

module.exports = router;
