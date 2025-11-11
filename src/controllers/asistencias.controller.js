const asistenciasModel = require('../models/asistencias.model');

async function registrarAsistencia(req, res, next) {
  try {
    const { inscripcion_id, seccion_id, fecha, estado, anotaciones } = req.body;
    if (!inscripcion_id || !seccion_id || !fecha) return res.status(400).json({ error: 'inscripcion_id, seccion_id y fecha son requeridos' });

    const registrado_por = req.user ? req.user.id : null;
    const asistencia = await asistenciasModel.createAsistencia({ inscripcion_id, seccion_id, fecha, estado: estado || 'presente', anotaciones: anotaciones || null, registrado_por });
    return res.status(201).json({ asistencia });
  } catch (err) {
    next(err);
  }
}

async function listarAsistenciasEstudiante(req, res, next) {
  try {
    const { id } = req.params; 
    const opts = { limit: req.query.limit, offset: req.query.offset };
    const rows = await asistenciasModel.listAsistenciasByEstudiante(id, opts);
    return res.json({ asistencias: rows });
  } catch (err) {
    next(err);
  }
}

async function obtenerAsistencia(req, res, next) {
  try {
    const { id } = req.params;
    const a = await asistenciasModel.getAsistenciaById(id);
    if (!a) return res.status(404).json({ error: 'Asistencia no encontrada' });
    return res.json({ asistencia: a });
  } catch (err) {
    next(err);
  }
}

async function actualizarAsistencia(req, res, next) {
  try {
    const { id } = req.params;
    const fields = req.body;
    const updated = await asistenciasModel.updateAsistencia(id, fields);
    if (!updated) return res.status(404).json({ error: 'Asistencia no encontrada o no modificada' });
    return res.json({ asistencia: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registrarAsistencia,
  listarAsistenciasEstudiante,
  obtenerAsistencia,
  actualizarAsistencia
};
