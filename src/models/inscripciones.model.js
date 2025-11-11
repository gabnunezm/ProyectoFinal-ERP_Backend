const db = require('../db');


async function createInscripcion({ estudiante_id, seccion_id, fecha_inscripcion = null, estado = 'inscrito' }) {
  const [[est], [sec]] = await Promise.all([
    db.execute('SELECT id FROM estudiantes WHERE id = ?', [estudiante_id]),
    db.execute('SELECT id FROM secciones WHERE id = ?', [seccion_id])
  ]);

  if (!est || est.length === 0) throw Object.assign(new Error('Estudiante no encontrado'), { status: 404 });
  if (!sec || sec.length === 0) throw Object.assign(new Error('Sección no encontrada'), { status: 404 });

  const [existing] = await db.execute('SELECT * FROM inscripciones WHERE estudiante_id = ? AND seccion_id = ? AND estado = ?', [estudiante_id, seccion_id, 'inscrito']);
  if (existing.length) throw Object.assign(new Error('Estudiante ya inscrito en esta sección'), { status: 409 });

  const sql = `INSERT INTO inscripciones (estudiante_id, seccion_id, fecha_inscripcion, estado)
               VALUES (?, ?, ?, ?)`;
  const params = [estudiante_id, seccion_id, fecha_inscripcion || new Date().toISOString().slice(0,10), estado];
  const [result] = await db.execute(sql, params);
  const [rows] = await db.execute(
    `SELECT i.*, s.curso_id, s.nombre_seccion, c.nombre AS nombre_curso
     FROM inscripciones i
     LEFT JOIN secciones s ON s.id = i.seccion_id
     LEFT JOIN cursos c ON c.id = s.curso_id
     WHERE i.id = ?`, [result.insertId]
  );
  return rows[0];
}

async function findInscripcionById(id) {
  const [rows] = await db.execute(
    `SELECT i.*, s.curso_id, s.nombre_seccion, c.nombre AS nombre_curso
     FROM inscripciones i
     LEFT JOIN secciones s ON s.id = i.seccion_id
     LEFT JOIN cursos c ON c.id = s.curso_id
     WHERE i.id = ?`, [id]
  );
  return rows[0];
}

async function listInscripcionesByEstudiante(estudiante_id) {
  const [rows] = await db.execute(
    `SELECT i.*, s.curso_id, s.nombre_seccion, c.nombre AS nombre_curso, d.usuario_id AS docente_usuario_id, u.nombre AS docente_nombre
     FROM inscripciones i
     LEFT JOIN secciones s ON s.id = i.seccion_id
     LEFT JOIN cursos c ON c.id = s.curso_id
     LEFT JOIN docentes d ON d.id = s.docente_id
     LEFT JOIN usuarios u ON u.id = d.usuario_id
     WHERE i.estudiante_id = ?
     ORDER BY i.fecha_inscripcion DESC`, [estudiante_id]
  );
  return rows;
}

async function listInscripcionesBySeccion(seccion_id) {
  const [rows] = await db.execute(
    `SELECT i.*, e.codigo_estudiante, u.nombre AS nombre_estudiante, u.email
     FROM inscripciones i
     JOIN estudiantes e ON e.id = i.estudiante_id
     JOIN usuarios u ON u.id = e.usuario_id
     WHERE i.seccion_id = ? AND i.estado = 'inscrito'`, [seccion_id]
  );
  return rows;
}

async function updateInscripcionEstado(id, estado) {
  const [res] = await db.execute('UPDATE inscripciones SET estado = ? WHERE id = ?', [estado, id]);
  if (res.affectedRows === 0) return null;
  return await findInscripcionById(id);
}

module.exports = {
  createInscripcion,
  findInscripcionById,
  listInscripcionesByEstudiante,
  listInscripcionesBySeccion,
  updateInscripcionEstado
};
