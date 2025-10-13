const db = require('../db');

async function findByEmail(email) {
  const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0];
}

async function createUsuario({ nombre, email, password_hash, role_id }) {
  const [result] = await db.execute(
    'INSERT INTO usuarios (nombre, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
    [nombre, email, password_hash, role_id]
  );
  const insertedId = result.insertId;
  const [rows] = await db.execute('SELECT id, nombre, email, role_id FROM usuarios WHERE id = ?', [insertedId]);
  return rows[0];
}

module.exports = { findByEmail, createUsuario };
