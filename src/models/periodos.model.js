const db = require('../db');

async function listPeriodos() {
  const [rows] = await db.execute('SELECT * FROM periodos ORDER BY fecha_inicio DESC');
  return rows;
}

async function getPeriodoById(id) {
  const [rows] = await db.execute('SELECT * FROM periodos WHERE id = ?', [id]);
  return rows[0];
}

async function createPeriodo({ nombre, fecha_inicio, fecha_fin }) {
  const [res] = await db.execute('INSERT INTO periodos (nombre, fecha_inicio, fecha_fin) VALUES (?, ?, ?)', [nombre, fecha_inicio, fecha_fin]);
  const [rows] = await db.execute('SELECT * FROM periodos WHERE id = ?', [res.insertId]);
  return rows[0];
}

module.exports = { listPeriodos, getPeriodoById, createPeriodo };
