const db = require('../db');

/**
 * Calcula nota final ponderada para una lista de calificaciones:
 * sum(nota * peso) / sum(peso)
 * Si no hay pesos, retorna null.
 */
function calcularPromedioPonderado(calificaciones) {
  if (!calificaciones || calificaciones.length === 0) return null;
  let sumaPonderada = 0;
  let sumaPesos = 0;
  for (const c of calificaciones) {
    const nota = Number(c.nota) || 0;
    const peso = Number(c.peso) || 0;
    sumaPonderada += nota * peso;
    sumaPesos += peso;
  }
  if (sumaPesos === 0) return null;
  return +(sumaPonderada / sumaPesos).toFixed(2);
}

/**
 * GET /api/reports/boletin/estudiante/:id?periodo_id=
 * Genera boletín para un estudiante.
 */
async function boletinEstudiante(req, res, next) {
  try {
    const estudiante_id = req.params.id;
    const periodo_id = req.query.periodo_id || null;

    // Obtener inscripciones del estudiante
    const [insRows] = await db.execute(
      `SELECT i.id AS inscripcion_id, s.id AS seccion_id, s.curso_id, c.nombre AS curso_nombre, s.nombre_seccion
       FROM inscripciones i
       JOIN secciones s ON s.id = i.seccion_id
       JOIN cursos c ON c.id = s.curso_id
       WHERE i.estudiante_id = ? AND i.estado = 'inscrito'`, [estudiante_id]
    );

    const boletin = [];

    for (const ins of insRows) {
      // Obtener calificaciones para esta inscripcion (filtrar por periodo opcional)
      const params = [ins.inscripcion_id];
      let periodClause = '';
      if (periodo_id) {
        periodClause = ' AND c.periodo_id = ? ';
        params.push(periodo_id);
      }
      const [calRows] = await db.execute(
        `SELECT c.id, c.tipo, c.nota, c.peso, p.nombre AS periodo
         FROM calificaciones c
         LEFT JOIN periodos p ON p.id = c.periodo_id
         WHERE c.inscripcion_id = ? ${periodClause}
         ORDER BY c.fecha_registro`, params
      );
      const promedio = calcularPromedioPonderado(calRows);

      boletin.push({
        inscripcion_id: ins.inscripcion_id,
        curso_id: ins.curso_id,
        curso_nombre: ins.curso_nombre,
        seccion: ins.nombre_seccion,
        calificaciones: calRows,
        nota_final: promedio
      });
    }

    return res.json({ estudiante_id, periodo_id, boletin });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/finanzas?fecha_inicio=&fecha_fin=
 * Resumen de pagos: totales por tipo y estado y lista de totales por estudiante
 */
async function reporteFinanciero(req, res, next) {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const where = [];
    const params = [];

    if (fecha_inicio) {
      where.push('fecha_pago >= ?');
      params.push(fecha_inicio);
    }
    if (fecha_fin) {
      where.push('fecha_pago <= ?');
      params.push(fecha_fin);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Totales generales
    const [[totalRow]] = await db.execute(`SELECT IFNULL(SUM(monto),0) AS total_recaudado, COUNT(*) AS total_transacciones FROM pagos ${whereClause}`, params);

    // Totales por tipo
    const [porTipo] = await db.execute(`SELECT tipo_pago, IFNULL(SUM(monto),0) AS total, COUNT(*) AS count FROM pagos ${whereClause} GROUP BY tipo_pago`, params);

    // Totales por estado
    const [porEstado] = await db.execute(`SELECT estado, IFNULL(SUM(monto),0) AS total, COUNT(*) AS count FROM pagos ${whereClause} GROUP BY estado`, params);

    // Top por estudiante (total pagado)
    const [porEstudiante] = await db.execute(
      `SELECT p.estudiante_id, u.nombre AS nombre_usuario, u.email, IFNULL(SUM(p.monto),0) AS total_pagado
       FROM pagos p
       JOIN estudiantes e ON e.id = p.estudiante_id
       JOIN usuarios u ON u.id = e.usuario_id
       ${whereClause ? whereClause.replace(/p\./g, 'p.') : ''}
       GROUP BY p.estudiante_id, u.nombre, u.email
       ORDER BY total_pagado DESC
       LIMIT 50`, params
    );

    // Pagos pendientes: lista / contadores
    const [pendientes] = await db.execute(`SELECT COUNT(*) AS cantidad_pendientes, IFNULL(SUM(monto),0) AS total_pendiente FROM pagos ${whereClause} AND estado != 'pagado'`, params);

    return res.json({
      resumen: totalRow,
      porTipo,
      porEstado,
      porEstudiante,
      pendientes: pendientes[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/admin-dashboard
 * Estadísticas rápidas para panel administrativo
 */
async function adminDashboard(req, res, next) {
  try {
    const [totalesUsuarios] = await db.execute(`SELECT r.name AS role_name, COUNT(u.id) AS cantidad
      FROM usuarios u
      JOIN roles r ON r.id = u.role_id
      GROUP BY r.name`);

    const [[totalEstudiantes]] = await db.execute(`SELECT COUNT(*) AS total FROM estudiantes`);
    const [[totalDocentes]] = await db.execute(`SELECT COUNT(*) AS total FROM docentes`);
    const [[totalCursos]] = await db.execute(`SELECT COUNT(*) AS total FROM cursos`);
    const [[totalSecciones]] = await db.execute(`SELECT COUNT(*) AS total FROM secciones`);

    const today = new Date().toISOString().slice(0,10);
    const [[pagosHoy]] = await db.execute(`SELECT IFNULL(SUM(monto),0) AS total_hoy, COUNT(*) AS transacciones_hoy FROM pagos WHERE fecha_pago = ?`, [today]);
    const [[pagosPendientes]] = await db.execute(`SELECT COUNT(*) AS pendientes FROM pagos WHERE estado != 'pagado'`);

    return res.json({
      usuarios_por_rol: totalesUsuarios,
      total_estudiantes: totalEstudiantes.total,
      total_docentes: totalDocentes.total,
      total_cursos: totalCursos.total,
      total_secciones: totalSecciones.total,
      pagos_hoy: pagosHoy,
      pagos_pendientes: pagosPendientes.pendientes
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { boletinEstudiante, reporteFinanciero, adminDashboard };
