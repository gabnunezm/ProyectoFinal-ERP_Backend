// usuarios.router.js
const Router = require('express').Router;
const router = Router();
const usuariosCtrl = require('../controllers/usuarios.controller');
// const auth = require('../middlewares/auth.middleware'); // descomenta si quieres proteger rutas
// const checkRole = require('../middlewares/roles.middleware');


// Crear usuario (ej: admin crea otro usuario) 
// router.post('/', auth, checkRole(['admin']), usuariosCtrl.crearUsuario);
router.post('/', usuariosCtrl.crearUsuario);

// Listar usuarios (opcionalmente protegido)
router.get('/', /* auth, checkRole(['admin','administrativo']), */ usuariosCtrl.listarUsuarios);

// Obtener usuario
router.get('/:id', /* auth, */ usuariosCtrl.obtenerUsuario);

// Actualizar usuario
router.patch('/:id', /* auth, checkRole(['admin','administrativo']), */ usuariosCtrl.actualizarUsuario);

// Cambiar contraseña
router.patch('/:id/password', /* auth, */ usuariosCtrl.cambiarPassword);

// Eliminar (soft)
router.delete('/:id', /* auth, checkRole(['admin']), */ usuariosCtrl.eliminarUsuario);

module.exports = router;
