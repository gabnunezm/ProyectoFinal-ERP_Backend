const Router = require('express').Router;
const router = Router();
const ctrl = require('../controllers/asistencias.controller');
// const auth = require('../middlewares/auth.middleware');

router.post('/', /* auth, */ ctrl.registrarAsistencia);
router.get('/estudiante/:id', /* auth, */ ctrl.listarAsistenciasEstudiante);
router.get('/:id', /* auth, */ ctrl.obtenerAsistencia);
router.patch('/:id', /* auth, */ ctrl.actualizarAsistencia);

module.exports = router;
