const pagosModel = require('../models/pagos.model');

/**
 * POST /api/pagos
 */
async function crearPago(req, res, next) {
  try {
    const {
      estudiante_id,
      tipo_pago,
      monto,
      fecha_pago,
      metodo_pago,
      referencia,
      estado
    } = req.body;

    // Validaciones básicas
    if (!estudiante_id) return res.status(400).json({ error: 'estudiante_id es requerido' });
    if (monto == null || isNaN(Number(monto)) || Number(monto) < 0)
      return res.status(400).json({ error: 'monto inválido' });

    const pago = await pagosModel.createPago({
      estudiante_id,
      tipo_pago,
      monto: Number(monto),
      fecha_pago: fecha_pago || null,
      metodo_pago: metodo_pago || null,
      referencia: referencia || null,
      estado: estado || 'pendiente'  // Cambiado de 'pagado' a 'pendiente'
    });

    return res.status(201).json({ pago });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/pagos/:id
 */
async function obtenerPago(req, res, next) {
  try {
    const { id } = req.params;
    const pago = await pagosModel.getPagoById(id);
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    return res.json({ pago });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/pagos
 * Query params: estudiante_id, tipo_pago, estado, fecha_inicio, fecha_fin, limit, offset
 * Si no hay filtros, usa findAllWithStudentInfo para obtener datos completos (panel admin)
 */
async function listarPagos(req, res, next) {
  try {
    const filters = {
      estudiante_id: req.query.estudiante_id,
      tipo_pago: req.query.tipo_pago,
      estado: req.query.estado,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      limit: req.query.limit,
      offset: req.query.offset
    };

    // Si no hay filtros específicos, usar método con info de estudiante (para panel admin)
    const hasFilters = Object.values(filters).some(v => v != null);
    
    let pagos;
    if (!hasFilters) {
      pagos = await pagosModel.findAllWithStudentInfo();
    } else {
      pagos = await pagosModel.listPagos(filters);
    }

    return res.json({ pagos });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/pagos/estudiante/:id
 */
async function pagosPorEstudiante(req, res, next) {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const pagos = await pagosModel.getPagosByEstudiante(id, { limit, offset });
    return res.json({ pagos });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/pagos/:id/estado
 * Body: { estado: "pagado"|"pendiente"|"anulado" }
 */
async function actualizarEstadoPago(req, res, next) {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: 'estado es requerido' });

    const updated = await pagosModel.updatePagoEstado(id, estado);
    if (!updated) return res.status(404).json({ error: 'Pago no encontrado o no actualizado' });
    return res.json({ pago: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/pagos/:id
 * Body: campos a actualizar (tipo_pago, monto, fecha_pago, metodo_pago, referencia, estado)
 */
async function actualizarPago(req, res, next) {
  try {
    const { id } = req.params;
    const fields = req.body;

    // Validación simple: si viene monto, debe ser número y >= 0
    if (fields.monto != null) {
      if (isNaN(Number(fields.monto)) || Number(fields.monto) < 0)
        return res.status(400).json({ error: 'monto inválido' });
      fields.monto = Number(fields.monto);
    }

    const updated = await pagosModel.updatePago(id, fields);
    if (!updated) return res.status(404).json({ error: 'Pago no encontrado o no actualizado' });
    return res.json({ pago: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearPago,
  obtenerPago,
  listarPagos,
  pagosPorEstudiante,
  actualizarEstadoPago,
  actualizarPago
};