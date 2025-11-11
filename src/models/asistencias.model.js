const db = require('../db');


async function createAsistencia({ inscripcion_id, seccion_id, fecha, estado = 'presente', anotaciones = null, registrado_por = null }) {
  const [ins] = await db.execute('SELECT id FROM inscripciones WHERE id = ?', [inscripcion_id]);
  if (!ins || ins.length === 0) throw Object.assign(new Error('Inscripción no encontrada'), { status: 404 });

  const sql = `INSERT INTO asistencias (inscripcion_id, seccion_id, fecha, estado, anotaciones, registrado_por)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [inscripcion_id, seccion_id, fecha, estado, anotaciones, registrado_por];
  const [result] = await db.execute(sql, params);
  const [rows] = await db.execute('SELECT * FROM asistencias WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function listAsistenciasByEstudiante(estudiante_id, opts = {}) {
  const limit = Number(opts.limit) || 100;
  const offset = Number(opts.offset) || 0;
  const [rows] = await db.execute(
    `SELECT a.*, i.seccion_id, s.curso_id, cu.nombre AS curso_nombre
     FROM asistencias a
     JOIN inscripciones i ON i.id = a.inscripcion_id
     JOIN secciones s ON s.id = i.seccion_id
     JOIN cursos cu ON cu.id = s.curso_id
     WHERE i.estudiante_id = ?
     ORDER BY a.fecha DESC
     LIMIT ? OFFSET ?`, [estudiante_id, limit, offset]
  );
  return rows;
}

async function getAsistenciaById(id) {
  const [rows] = await db.execute('SELECT * FROM asistencias WHERE id = ?', [id]);
  return rows[0];
}

async function updateAsistencia(id, fields = {}) {
  const allowed = ['estado', 'anotaciones'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (keys.length === 0) return null;
  const sets = keys.map(k => `${k} = ?`).join(', ');
  const params = keys.map(k => fields[k]);
  params.push(id);
  const [res] = await db.execute(`UPDATE asistencias SET ${sets} WHERE id = ?`, params);
  if (res.affectedRows === 0) return null;
  return await getAsistenciaById(id);
}

module.exports = {
  createAsistencia,
  listAsistenciasByEstudiante,
  getAsistenciaById,
  updateAsistencia
};
