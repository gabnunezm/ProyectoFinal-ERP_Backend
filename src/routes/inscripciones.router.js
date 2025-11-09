const Router = require('express').Router;
const router = Router();
const ctrl = require('../controllers/inscripciones.controller');
// const auth = require('../middlewares/auth.middleware');

router.post('/', /* auth, */ ctrl.inscribirEstudiante);
router.get('/:id', /* auth, */ ctrl.obtenerInscripcion);
router.get('/estudiante/:id', /* auth, */ ctrl.listarInscripcionesEstudiante);
router.get('/seccion/:id', /* auth, */ ctrl.listarInscripcionesSeccion);
router.patch('/:id/estado', /* auth, */ ctrl.cambiarEstadoInscripcion);

module.exports = router;
