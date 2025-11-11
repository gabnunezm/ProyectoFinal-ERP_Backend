const db = require('../db');

async function createEstudiante({ usuario_id, codigo_estudiante = null, fecha_nacimiento = null, genero = 'O', telefono = null, direccion = null }) {
  const sql = `INSERT INTO estudiantes (usuario_id, codigo_estudiante, fecha_nacimiento, genero, telefono, direccion)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [usuario_id, codigo_estudiante, fecha_nacimiento, genero, telefono, direccion];
  const [result] = await db.execute(sql, params);
  const [rows] = await db.execute(
    `SELECT e.id, e.usuario_id, e.codigo_estudiante, e.fecha_nacimiento, e.genero, e.telefono, e.direccion, e.creado_en,
            u.nombre AS nombre_usuario, u.email
     FROM estudiantes e
     JOIN usuarios u ON u.id = e.usuario_id
     WHERE e.id = ?`, [result.insertId]
  );
  return rows[0];
}

async function findById(id) {
  const [rows] = await db.execute(
    `SELECT e.id, e.usuario_id, e.codigo_estudiante, e.fecha_nacimiento, e.genero, e.telefono, e.direccion, e.creado_en, e.usuario_id,
            u.nombre AS nombre_usuario, u.email, u.activo
     FROM estudiantes e
     JOIN usuarios u ON u.id = e.usuario_id
     WHERE e.id = ?`, [id]
  );
  return rows[0];
}

async function findByUsuarioId(usuario_id) {
  const [rows] = await db.execute('SELECT * FROM estudiantes WHERE usuario_id = ?', [usuario_id]);
  return rows[0];
}

async function updateEstudiante(id, fields = {}) {
  const allowed = ['codigo_estudiante', 'fecha_nacimiento', 'genero', 'telefono', 'direccion'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (keys.length === 0) return null;

  const sets = keys.map(k => `${k} = ?`).join(', ');
  const params = keys.map(k => fields[k]);
  params.push(id);

  const sql = `UPDATE estudiantes SET ${sets} WHERE id = ?`;
  const [result] = await db.execute(sql, params);
  if (result.affectedRows === 0) return null;
  return await findById(id);
}

async function deleteEstudianteSoft(id) {
  const [row] = await db.execute('SELECT usuario_id FROM estudiantes WHERE id = ?', [id]);
  if (!row || row.length === 0) return false;
  const usuarioId = row[0].usuario_id;
  const [res] = await db.execute('UPDATE usuarios SET activo = 0 WHERE id = ?', [usuarioId]);
  return res.affectedRows > 0;
}

module.exports = {
  createEstudiante,
  findById,
  findByUsuarioId,
  updateEstudiante,
  deleteEstudianteSoft
};
