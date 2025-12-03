// pagos.model.js
const db = require('../db');

/**
 * Crea un pago
 * @param {{estudiante_id:number, tipo_pago:string, monto:number, fecha_pago:string, metodo_pago:string, referencia:string, estado:string}} data
 */
async function createPago(data) {
  const {
    estudiante_id,
    tipo_pago = 'mensualidad',
    monto,
    fecha_pago = null,
    metodo_pago = null,
    referencia = null,
    estado = 'pendiente'  // Cambiado de 'pagado' a 'pendiente' por defecto
  } = data;

  const sql = `INSERT INTO pagos
    (estudiante_id, tipo_pago, monto, fecha_pago, metodo_pago, referencia, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const params = [estudiante_id, tipo_pago, monto, fecha_pago, metodo_pago, referencia, estado];
  const [result] = await db.execute(sql, params);
  const insertId = result.insertId;
  const [rows] = await db.execute('SELECT * FROM pagos WHERE id = ?', [insertId]);
  return rows[0];
}

/**
 * Obtiene un pago por su id
 * @param {number} id
 */
async function getPagoById(id) {
  const [rows] = await db.execute('SELECT * FROM pagos WHERE id = ?', [id]);
  return rows[0];
}

/**
 * Obtiene pagos de un estudiante con paginación
 * @param {number} estudianteId
 * @param {{limit?:number, offset?:number}} opts
 */
async function getPagosByEstudiante(estudianteId, opts = {}) {
  const limit = Number(opts.limit) || 20;
  const offset = Number(opts.offset) || 0;
  const [rows] = await db.execute(
    `SELECT * FROM pagos WHERE estudiante_id = ? ORDER BY creado_en DESC LIMIT ${limit} OFFSET ${offset}`,
    [estudianteId]
  );
  return rows;
}

/**
 * Actualiza el estado de un pago
 * @param {number} id
 * @param {string} estado
 */
async function updatePagoEstado(id, estado) {
  const [result] = await db.execute('UPDATE pagos SET estado = ? WHERE id = ?', [estado, id]);
  if (result.affectedRows === 0) return null;
  const [rows] = await db.execute('SELECT * FROM pagos WHERE id = ?', [id]);
  return rows[0];
}

/**
 * Actualiza campos de un pago (patch)
 * @param {number} id
 * @param {object} fields
 */
async function updatePago(id, fields = {}) {
  const allowed = ['tipo_pago', 'monto', 'fecha_pago', 'metodo_pago', 'referencia', 'estado'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (keys.length === 0) return null;

  const sets = keys.map(k => `${k} = ?`).join(', ');
  const params = keys.map(k => fields[k]);
  params.push(id);

  const sql = `UPDATE pagos SET ${sets} WHERE id = ?`;
  const [result] = await db.execute(sql, params);
  if (result.affectedRows === 0) return null;
  const [rows] = await db.execute('SELECT * FROM pagos WHERE id = ?', [id]);
  return rows[0];
}

/**
 * Lista pagos con filtros y paginación
 * @param {{estudiante_id?:number, tipo_pago?:string, estado?:string, fecha_inicio?:string, fecha_fin?:string, limit?:number, offset?:number}} filters
 */
async function listPagos(filters = {}) {
  const where = [];
  const params = [];

  if (filters.estudiante_id) {
    where.push('estudiante_id = ?');
    params.push(filters.estudiante_id);
  }
  if (filters.tipo_pago) {
    where.push('tipo_pago = ?');
    params.push(filters.tipo_pago);
  }
  if (filters.estado) {
    where.push('estado = ?');
    params.push(filters.estado);
  }
  if (filters.fecha_inicio) {
    where.push('fecha_pago >= ?');
    params.push(filters.fecha_inicio);
  }
  if (filters.fecha_fin) {
    where.push('fecha_pago <= ?');
    params.push(filters.fecha_fin);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limit = Number(filters.limit) || 50;
  const offset = Number(filters.offset) || 0;

  const sql = `SELECT * FROM pagos ${whereClause} ORDER BY creado_en DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await db.execute(sql, params);
  return rows;
}

/**
 * Obtiene todos los pagos con información del estudiante (para panel admin)
 * @returns {Promise<Array>}
 */
async function findAllWithStudentInfo() {
  const sql = `
    SELECT 
      p.*,
      e.codigo_estudiante as estudiante_codigo,
      u.nombre as estudiante_nombre
    FROM pagos p
    LEFT JOIN estudiantes e ON p.estudiante_id = e.id
    LEFT JOIN usuarios u ON e.usuario_id = u.id
    ORDER BY p.creado_en DESC
  `;
  const [rows] = await db.execute(sql);
  return rows;
}

module.exports = {
  createPago,
  getPagoById,
  getPagosByEstudiante,
  updatePagoEstado,
  updatePago,
  listPagos,
  findAllWithStudentInfo
};