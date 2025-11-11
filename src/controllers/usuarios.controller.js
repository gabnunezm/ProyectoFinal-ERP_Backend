// usuarios.controller.js
const usuariosModel = require('../models/usuarios.model');
const bcrypt = require('bcryptjs');

/**
 * Crear usuario (admin o self-register)
 * POST /api/usuarios
 * Body: { nombre, email, password, role_id, activo }
 */
async function crearUsuario(req, res, next) {
  try {
    const { nombre, email, password, role_id, activo } = req.body;

    if (!nombre || !email || !password || !role_id) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, email, password, role_id' });
    }

    // verificar si email existe
    const existing = await usuariosModel.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email ya registrado' });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = await usuariosModel.createUsuario({
      nombre,
      email,
      password_hash: hash,
      role_id,
      activo: activo == null ? 1 : Number(activo)
    });

    return res.status(201).json({ usuario: user });
  } catch (err) {
    next(err);
  }
}

/**
 * Listar TODOS los usuarios (GET simple, sin filtros).
 * GET /api/usuarios
 */
async function listarUsuarios(req, res, next) {
  try {
    const usuarios = await usuariosModel.listUsuarios();
    return res.json({ usuarios });
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener usuario por id
 * GET /api/usuarios/:id
 */
async function obtenerUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const usuario = await usuariosModel.findById(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ usuario });
  } catch (err) {
    next(err);
  }
}

/**
 * Actualizar usuario (PATCH)
 * PATCH /api/usuarios/:id
 * Body: { nombre?, email?, role_id?, activo? }
 */
async function actualizarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const fields = req.body;

    // evitar actualizar password por aquí
    if (fields.password || fields.password_hash) {
      return res.status(400).json({ error: 'Use el endpoint /:id/password para cambiar la contraseña' });
    }

    // Si email viene, comprobar que no exista en otro usuario
    if (fields.email) {
      const existing = await usuariosModel.findByEmail(fields.email);
      if (existing && existing.id !== Number(id)) {
        return res.status(409).json({ error: 'Email ya en uso por otro usuario' });
      }
    }

    const updated = await usuariosModel.updateUsuario(id, fields);
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado o no modificado' });
    return res.json({ usuario: updated });
  } catch (err) {
    next(err);
  }
}

// Cambiar contraseña
// PATCH /api/usuarios/:id/password
// Body: { oldPassword?, newPassword }
// - Si es admin (o tiene permisos) se permite sin oldPassword.
// - Si es el mismo usuario, requiere oldPassword para confirmar.
async function cambiarPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ error: 'newPassword es requerido' });

    // obtener usuario con password (consulta directa)
    const db = require('../db');
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // requester puede venir de req.user (si tienes auth.middleware)
    let requester = req.user || {};

    // Si no hay requester.role_id, intentar decodificar token (fallback)
    let tokenPayload = null;
    if ((!requester.role_id && !requester.roleId && !requester.role) && req.headers && req.headers.authorization) {
      const authHeader = String(req.headers.authorization || '');
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const jwt = require('jsonwebtoken');
          tokenPayload = jwt.decode(token) || {};
        } catch (e) {
          tokenPayload = null;
        }
      }
    }

    // Normalizar requester fields from tokenPayload if needed
    if (tokenPayload) {
      // if requester doesn't have id, try to set from token
      if (!requester.id && (tokenPayload.id || tokenPayload.userId)) {
        requester.id = tokenPayload.id || tokenPayload.userId;
      }
      // map role id/name from payload if not present already
      if (!requester.role_id && (tokenPayload.role_id || tokenPayload.roleId || tokenPayload.role)) {
        requester.role_id = tokenPayload.role_id ?? tokenPayload.roleId ?? undefined;
        // also keep role string if present
        requester.role = tokenPayload.role ?? undefined;
      }
    }

    // determine admin/self
    const isAdmin = Number(requester.role_id) === 1 || String(requester.role) === 'admin' || String(requester.role) === '1';
    const isSelf = Number(requester.id) === Number(id);

    if (!isAdmin) {
      if (!isSelf) return res.status(403).json({ error: 'No autorizado para cambiar esta contraseña' });
      if (!oldPassword) return res.status(400).json({ error: 'oldPassword es requerido' });

      const bcrypt = require('bcryptjs');
      const ok = bcrypt.compareSync(oldPassword, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'oldPassword incorrecta' });
    }

    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);
    const updated = await usuariosModel.updatePassword(id, newHash);

    return res.json({ usuario: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Eliminar usuario (soft delete)
 * DELETE /api/usuarios/:id
 * - Cambia activo = 0
 */
async function eliminarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const ok = await usuariosModel.deleteUsuarioSoft(id);
    if (!ok) return res.status(404).json({ error: 'Usuario no encontrado o ya eliminado' });
    return res.json({ message: 'Usuario desactivado correctamente' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  cambiarPassword,
  eliminarUsuario
};
