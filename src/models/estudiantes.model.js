const db = require('../db');

async function createEstudiante({ usuario_id, codigo_estudiante, fecha_nacimiento, genero }) {
  const [res] = await db.execute(
    'INSERT INTO estudiantes (usuario_id, codigo_estudiante, fecha_nacimiento, genero) VALUES (?, ?, ?, ?)',
    [usuario_id, codigo_estudiante, fecha_nacimiento, genero]
  );
  return { id: res.insertId };
}

async function findById(id) {
  const [rows] = await db.execute(
    `SELECT e.*, u.email, u.nombre AS nombre_usuario
     FROM estudiantes e
     JOIN usuarios u ON u.id = e.usuario_id
     WHERE e.id = ?`, [id]
  );
  return rows[0];
}

module.exports = { createEstudiante, findById };
