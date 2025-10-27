const db = require('../db');

/**
 * Devuelve usuario sin password_hash (mínimos campos)
 */
function sanitizeUser(row) {
  if (!row) return null;
  const { password_hash, ...safe } = row;
  return safe;
}

async function createUsuario({ nombre, email, password_hash, role_id, activo = 1 }) {
  const sql = `INSERT INTO usuarios (nombre, email, password_hash, role_id, activo)
               VALUES (?, ?, ?, ?, ?)`;
  const params = [nombre, email, password_hash, role_id, activo];
  const [result] = await db.execute(sql, params);
  const [rows] = await db.execute('SELECT id, nombre, email, role_id, creado_en, activo FROM usuarios WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function findByEmail(email) {
  const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await db.execute('SELECT id, nombre, email, role_id, creado_en, activo FROM usuarios WHERE id = ?', [id]);
  return rows[0];
}

async function listUsuarios() {
  const sql = `SELECT id, nombre, email, role_id, creado_en, activo
               FROM usuarios
               ORDER BY creado_en ASC`;
  const [rows] = await db.execute(sql);
  return rows;
}

async function updateUsuario(id, fields = {}) {
  const allowed = ['nombre', 'email', 'role_id', 'activo'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (keys.length === 0) return null;

  const sets = keys.map(k => `${k} = ?`).join(', ');
  const params = keys.map(k => fields[k]);
  params.push(id);
  const sql = `UPDATE usuarios SET ${sets} WHERE id = ?`;
  const [result] = await db.execute(sql, params);
  if (result.affectedRows === 0) return null;

  return await findById(id);
}

async function updatePassword(id, password_hash) {
  const [result] = await db.execute('UPDATE usuarios SET password_hash = ? WHERE id = ?', [password_hash, id]);
  if (result.affectedRows === 0) return null;
  return await findById(id);
}

async function deleteUsuarioSoft(id) {
  const [result] = await db.execute('UPDATE usuarios SET activo = 0 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createUsuario,
  findByEmail,
  findById,
  listUsuarios,
  updateUsuario,
  updatePassword,
  deleteUsuarioSoft
};
