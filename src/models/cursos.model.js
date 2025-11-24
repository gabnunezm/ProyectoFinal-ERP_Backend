const db = require('../db');

async function listCursos() {
  const [rows] = await db.execute('SELECT * FROM cursos ORDER BY nombre');
  return rows;
}

async function getCursoById(id) {
  const [rows] = await db.execute('SELECT * FROM cursos WHERE id = ?', [id]);
  return rows[0];
}

async function createCurso({ codigo, nombre, descripcion = null, creditos = 0 }) {
  const [res] = await db.execute('INSERT INTO cursos (codigo, nombre, descripcion, creditos) VALUES (?, ?, ?, ?)', [codigo, nombre, descripcion, creditos]);
  const [rows] = await db.execute('SELECT * FROM cursos WHERE id = ?', [res.insertId]);
  return rows[0];
}

async function updateCurso(id, { codigo, nombre, descripcion, creditos }) {
  const fields = [];
  const values = [];
  if (codigo !== undefined) { fields.push('codigo = ?'); values.push(codigo); }
  if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
  if (descripcion !== undefined) { fields.push('descripcion = ?'); values.push(descripcion); }
  if (creditos !== undefined) { fields.push('creditos = ?'); values.push(creditos); }
  if (fields.length === 0) return null;
  values.push(id);
  await db.execute(`UPDATE cursos SET ${fields.join(', ')} WHERE id = ?`, values);
  const [rows] = await db.execute('SELECT * FROM cursos WHERE id = ?', [id]);
  return rows[0];
}

async function deleteCurso(id) {
  const [result] = await db.execute('DELETE FROM cursos WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll: listCursos,
  findById: getCursoById,
  create: createCurso,
  update: updateCurso,
  remove: deleteCurso,
  // Aliases originales
  listCursos,
  getCursoById,
  createCurso
};
