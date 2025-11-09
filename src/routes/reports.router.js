const Router = require('express').Router;
const router = Router();
const reportsCtrl = require('../controllers/reports.controller');
// const auth = require('../middlewares/auth.middleware');
// const checkRole = require('../middlewares/roles.middleware');

// boletin por estudiante
router.get('/boletin/estudiante/:id', /* auth, checkRole(['admin','docente','estudiante','padre']), */ reportsCtrl.boletinEstudiante);

// reporte financiero
router.get('/finanzas', /* auth, checkRole(['admin','administrativo']), */ reportsCtrl.reporteFinanciero);

// dashboard admin
router.get('/admin-dashboard', /* auth, checkRole(['admin']), */ reportsCtrl.adminDashboard);

module.exports = router;
