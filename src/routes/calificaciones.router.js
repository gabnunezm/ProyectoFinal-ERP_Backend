const Router = require('express').Router;
const router = Router();
const ctrl = require('../controllers/calificaciones.controller');
// const auth = require('../middlewares/auth.middleware');

router.post('/', /* auth, */ ctrl.registrarCalificacion);
router.get('/inscripcion/:id', /* auth, */ ctrl.listarPorInscripcion);
router.get('/historial/:id', /* auth, */ ctrl.historialAcademico); // id = estudiante_id
router.patch('/:id', /* auth, */ ctrl.actualizarCalificacion);

module.exports = router;
