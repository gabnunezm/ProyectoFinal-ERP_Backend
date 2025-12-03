const Router = require('express').Router;
const router = Router();
const pagosCtrl = require('../controllers/pagos.controller');
// const auth = require('../middlewares/auth.middleware'); // descomenta si quieres proteger rutas

// Crear pago
router.post('/', /* auth, */ pagosCtrl.crearPago);

// Listar pagos con filtros (debe estar ANTES de /:id para evitar conflictos)
router.get('/', /* auth, */ pagosCtrl.listarPagos);

// Pagos por estudiante (debe estar ANTES de /:id)
router.get('/estudiante/:id', /* auth, */ pagosCtrl.pagosPorEstudiante);

// Obtener pago por id
router.get('/:id', /* auth, */ pagosCtrl.obtenerPago);

// Actualizar estado
router.patch('/:id/estado', /* auth, */ pagosCtrl.actualizarEstadoPago);

// Actualizar campos del pago (debe estar DESPUÉS de /estado)
router.patch('/:id', /* auth, */ pagosCtrl.actualizarPago);

module.exports = router;