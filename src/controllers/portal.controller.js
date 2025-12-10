const db = require('../db');

/**
 * GET /api/portal/estudiante/:id
 * Devuelve:
 * - perfil del estudiante (usuario)
 * - inscripciones con nota final por curso (global o por periodo si se pasa periodo_id)
 * - resumen asistencia por inscripcion (presentes/ausentes/tardes)
 * - pagos: historico y totales
 */
async function portalEstudiante(req, res, next) {
  try {
    const estudiante_id = req.params.id;
    const periodo_id = req.query.periodo_id || null;

    // perfil
    const [perfilRows] = await db.execute(
      `SELECT e.*, u.nombre AS nombre_usuario, u.email FROM estudiantes e JOIN usuarios u ON u.id = e.usuario_id WHERE e.id = ?`, [estudiante_id]
    );
    if (!perfilRows || perfilRows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const perfil = perfilRows[0];

    // inscripciones
    const [insRows] = await db.execute(
      `SELECT i.id AS inscripcion_id, s.id AS seccion_id, s.curso_id, c.nombre AS curso_nombre, s.nombre_seccion
       FROM inscripciones i
       JOIN secciones s ON s.id = i.seccion_id
       JOIN cursos c ON c.id = s.curso_id
       WHERE i.estudiante_id = ? AND i.estado = 'inscrito'`, [estudiante_id]
    );

    // Para cada inscripcion: calificaciones y promedio, asistencia resumen
    const detalleInscripciones = [];
    for (const ins of insRows) {
      const params = [ins.inscripcion_id];
      let periodClause = '';
      if (periodo_id) { periodClause = ' AND c.periodo_id = ? '; params.push(periodo_id); }

      const [calRows] = await db.execute(
        `SELECT c.nota, c.peso FROM calificaciones c WHERE c.inscripcion_id = ? ${periodClause} ORDER BY c.fecha_registro`, params
      );
      // calcular promedio
      let sumaPonderada = 0, sumaPesos = 0;
      for (const c of calRows) {
        sumaPonderada += Number(c.nota || 0) * Number(c.peso || 0);
        sumaPesos += Number(c.peso || 0);
      }
      const nota_final = sumaPesos ? +(sumaPonderada / sumaPesos).toFixed(2) : null;

      // asistencia resumen
      const [asRows] = await db.execute(
        `SELECT a.estado, COUNT(*) AS cantidad FROM asistencias a
        JOIN inscripciones i ON i.id = a.inscripcion_id
        WHERE a.inscripcion_id = ? GROUP BY a.estado`, [ins.inscripcion_id]
      );
      const resumenAsistencia = {};
      for (const r of asRows) resumenAsistencia[r.estado] = r.cantidad;

      detalleInscripciones.push({
        ...ins,
        nota_final,
        calificaciones_count: calRows.length,
        asistencia: resumenAsistencia
      });
    }

    // pagos: historico y totales (pagado / pendiente)
    const [pagos] = await db.execute(
      `SELECT p.* FROM pagos p WHERE p.estudiante_id = ? ORDER BY p.creado_en DESC`, [estudiante_id]
    );
    let total_pagado = 0, total_pendiente = 0;
    for (const p of pagos) {
      if (p.estado === 'pagado') total_pagado += Number(p.monto || 0);
      else total_pendiente += Number(p.monto || 0);
    }

    return res.json({
      perfil,
      inscripciones: detalleInscripciones,
      pagos: {
        historico: pagos,
        total_pagado,
        total_pendiente
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/portal/docente/:usuario_id
 * Dado el usuario de un docente (usuario_id), devuelve sus secciones y estudiantes inscritos.
 */
async function portalDocente(req, res, next) {
  try {
    const usuario_id = req.params.usuario_id;

    // Obtener docente id
    const [docRows] = await db.execute('SELECT id FROM docentes WHERE usuario_id = ?', [usuario_id]);
    if (!docRows || docRows.length === 0) return res.status(404).json({ error: 'Docente no encontrado' });
    const docente_id = docRows[0].id;

    // Secciones del docente
    const [secs] = await db.execute(
      `SELECT s.id AS seccion_id, s.nombre_seccion, s.horario, c.id AS curso_id, c.nombre AS curso_nombre
       FROM secciones s
       JOIN cursos c ON c.id = s.curso_id
       WHERE s.docente_id = ?`, [docente_id]
    );

    // Para cada seccion, obtener estudiantes (inscritos)
    const secciones_detalle = [];
    for (const s of secs) {
      const [estudiantes] = await db.execute(
        `SELECT i.id AS inscripcion_id, e.id AS estudiante_id, e.codigo_estudiante, u.nombre AS nombre_estudiante, u.email
         FROM inscripciones i
         JOIN estudiantes e ON e.id = i.estudiante_id
         JOIN usuarios u ON u.id = e.usuario_id
         WHERE i.seccion_id = ? AND i.estado = 'inscrito'`, [s.seccion_id]
      );
      secciones_detalle.push({ ...s, estudiantes });
    }

    return res.json({ docente_id, secciones: secciones_detalle });
  } catch (err) {
    next(err);
  }
}

module.exports = { portalEstudiante, portalDocente };
