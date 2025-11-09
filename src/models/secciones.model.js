const db = require('../db');

async function listSecciones() {
  const [rows] = await db.execute(
    `SELECT s.*, c.nombre AS nombre_curso, d.usuario_id AS docente_usuario_id, u.nombre AS docente_nombre
     FROM secciones s
     LEFT JOIN cursos c ON c.id = s.curso_id
     LEFT JOIN docentes d ON d.id = s.docente_id
     LEFT JOIN usuarios u ON u.id = d.usuario_id
     ORDER BY s.nombre_seccion`
  );
  return rows;
}

async function getSeccionById(id) {
  const [rows] = await db.execute(
    `SELECT s.*, c.nombre AS nombre_curso, d.usuario_id AS docente_usuario_id, u.nombre AS docente_nombre
     FROM secciones s
     LEFT JOIN cursos c ON c.id = s.curso_id
     LEFT JOIN docentes d ON d.id = s.docente_id
     LEFT JOIN usuarios u ON u.id = d.usuario_id
     WHERE s.id = ?`, [id]
  );
  return rows[0];
}

async function listSeccionesByDocenteUsuarioId(usuarioId) {
  const [rows] = await db.execute(
    `SELECT s.*, c.nombre AS nombre_curso
     FROM secciones s
     JOIN docentes d ON d.id = s.docente_id
     WHERE d.usuario_id = ?`, [usuarioId]
  );
  return rows;
}

async function createSeccion({ curso_id, nombre_seccion, docente_id = null, jornada = null, horario = null }) {
  const [res] = await db.execute(
    `INSERT INTO secciones (curso_id, nombre_seccion, docente_id, jornada, horario)
     VALUES (?, ?, ?, ?, ?)`, [curso_id, nombre_seccion, docente_id, jornada, horario]
  );
  const [rows] = await db.execute('SELECT * FROM secciones WHERE id = ?', [res.insertId]);
  return rows[0];
}

module.exports = { listSecciones, getSeccionById, listSeccionesByDocenteUsuarioId, createSeccion };
