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

module.exports = { listCursos, getCursoById, createCurso };
