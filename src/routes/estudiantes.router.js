const Router = require('express').Router;
const router = Router();
const estudiantesCtrl = require('../controllers/estudiantes.controller');

router.post('/', estudiantesCtrl.crear);
router.get('/:id', estudiantesCtrl.obtener);


module.exports = router;
