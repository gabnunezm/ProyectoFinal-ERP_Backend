const calificacionesModel = require('../models/calificaciones.model');

async function registrarCalificacion(req, res, next) {
  try {
    const { inscripcion_id, periodo_id, tipo, nota, peso } = req.body;
    if (!inscripcion_id) return res.status(400).json({ error: 'inscripcion_id es requerido' });
    if (nota == null || isNaN(Number(nota))) return res.status(400).json({ error: 'nota inválida' });

    const cal = await calificacionesModel.createCalificacion({ inscripcion_id, periodo_id, tipo, nota: Number(nota), peso: peso != null ? Number(peso) : 100 });
    return res.status(201).json({ calificacion: cal });
  } catch (err) {
    next(err);
  }
}

async function listarPorInscripcion(req, res, next) {
  try {
    const { id } = req.params; 
    const rows = await calificacionesModel.listCalificacionesByInscripcion(id);
    return res.json({ calificaciones: rows });
  } catch (err) {
    next(err);
  }
}

async function historialAcademico(req, res, next) {
  try {
    const { id } = req.params; 
    const history = await calificacionesModel.getAcademicHistoryByEstudiante(id);
    return res.json({ historial: history });
  } catch (err) {
    next(err);
  }
}

async function actualizarCalificacion(req, res, next) {
  try {
    const { id } = req.params;
    const fields = req.body;
    const updated = await calificacionesModel.updateCalificacion(id, fields);
    if (!updated) return res.status(404).json({ error: 'Calificación no encontrada o no actualizada' });
    return res.json({ calificacion: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registrarCalificacion,
  listarPorInscripcion,
  historialAcademico,
  actualizarCalificacion
};
