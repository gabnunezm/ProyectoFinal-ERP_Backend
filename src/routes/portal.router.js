const Router = require('express').Router;
const router = Router();
const portalCtrl = require('../controllers/portal.controller');
// const auth = require('../middlewares/auth.middleware');

router.get('/estudiante/:id', /* auth, */ portalCtrl.portalEstudiante);
router.get('/docente/:usuario_id', /* auth, checkRole(['docente','admin']), */ portalCtrl.portalDocente);

module.exports = router;
