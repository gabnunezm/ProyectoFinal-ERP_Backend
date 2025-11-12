const Router = require('express').Router;
const router = Router();
const ctrl = require('../controllers/estudiantes.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', /* auth, */ ctrl.crearEstudiante);

// Nueva ruta para obtener estudiante por usuario_id
router.get('/usuario/:usuario_id', /* auth, */ ctrl.obtenerEstudiantePorUsuario);

router.get('/:id', /* auth, */ ctrl.obtenerEstudiante);
router.patch('/:id', /* auth, */ ctrl.actualizarEstudiante);
router.delete('/:id', /* auth, */ ctrl.eliminarEstudiante);

module.exports = router;