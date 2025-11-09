const db = require('../db');


async function createCalificacion({ inscripcion_id, periodo_id = null, tipo = 'Parcial', nota = 0, peso = 100 }) {
  const [ins] = await db.execute('SELECT id FROM inscripciones WHERE id = ?', [inscripcion_id]);
  if (!ins || ins.length === 0) throw Object.assign(new Error('Inscripción no encontrada'), { status: 404 });

  const sql = `INSERT INTO calificaciones (inscripcion_id, periodo_id, tipo, nota, peso)
               VALUES (?, ?, ?, ?, ?)`;
  const params = [inscripcion_id, periodo_id, tipo, nota, peso];
  const [result] = await db.execute(sql, params);
  const [rows] = await db.execute(
    `SELECT c.*, p.nombre AS periodo_nombre,
            i.seccion_id, s.curso_id, cu.nombre AS curso_nombre
     FROM calificaciones c
     LEFT JOIN periodos p ON p.id = c.periodo_id
     LEFT JOIN inscripciones i ON i.id = c.inscripcion_id
     LEFT JOIN secciones s ON s.id = i.seccion_id
     LEFT JOIN cursos cu ON cu.id = s.curso_id
     WHERE c.id = ?`, [result.insertId]
  );
  return rows[0];
}

async function listCalificacionesByInscripcion(inscripcion_id) {
  const [rows] = await db.execute(
    `SELECT c.*, p.nombre AS periodo_nombre
     FROM calificaciones c
     LEFT JOIN periodos p ON p.id = c.periodo_id
     WHERE c.inscripcion_id = ?
     ORDER BY c.fecha_registro DESC`, [inscripcion_id]
  );
  return rows;
}

async function getAcademicHistoryByEstudiante(estudiante_id) {
  const [rows] = await db.execute(
    `SELECT i.id AS inscripcion_id, cu.id AS curso_id, cu.nombre AS curso, s.nombre_seccion,
            c.tipo, c.nota, c.peso, c.fecha_registro, p.nombre AS periodo
     FROM inscripciones i
     JOIN secciones s ON s.id = i.seccion_id
     JOIN cursos cu ON cu.id = s.curso_id
     LEFT JOIN calificaciones c ON c.inscripcion_id = i.id
     LEFT JOIN periodos p ON p.id = c.periodo_id
     WHERE i.estudiante_id = ?
     ORDER BY cu.nombre, c.fecha_registro`, [estudiante_id]
  );
  return rows;
}

async function getCalificacionById(id) {
  const [rows] = await db.execute('SELECT * FROM calificaciones WHERE id = ?', [id]);
  return rows[0];
}

async function updateCalificacion(id, fields = {}) {
  const allowed = ['tipo', 'nota', 'peso', 'periodo_id'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (keys.length === 0) return null;

  const sets = keys.map(k => `${k} = ?`).join(', ');
  const params = keys.map(k => fields[k]);
  params.push(id);
  const [res] = await db.execute(`UPDATE calificaciones SET ${sets} WHERE id = ?`, params);
  if (res.affectedRows === 0) return null;
  return await getCalificacionById(id);
}

module.exports = {
  createCalificacion,
  listCalificacionesByInscripcion,
  getAcademicHistoryByEstudiante,
  getCalificacionById,
  updateCalificacion
};
