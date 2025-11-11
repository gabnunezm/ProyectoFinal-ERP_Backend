const Router = require('express').Router;
const router = Router();
const ctrl = require('../controllers/estudiantes.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', /* auth, */ ctrl.crearEstudiante);
router.get('/:id', /* auth, */ ctrl.obtenerEstudiante);
router.patch('/:id', /* auth, */ ctrl.actualizarEstudiante);
router.delete('/:id', /* auth, */ ctrl.eliminarEstudiante);

module.exports = router;
