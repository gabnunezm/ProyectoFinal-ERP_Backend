const inscripcionesModel = require('../models/inscripciones.model');

async function inscribirEstudiante(req, res, next) {
  try {
    const { estudiante_id, seccion_id } = req.body;
    if (!estudiante_id || !seccion_id) return res.status(400).json({ error: 'estudiante_id y seccion_id son requeridos' });

    const inscripcion = await inscripcionesModel.createInscripcion({ estudiante_id, seccion_id });
    return res.status(201).json({ inscripcion });
  } catch (err) {
    next(err);
  }
}

async function obtenerInscripcion(req, res, next) {
  try {
    const { id } = req.params;
    const insc = await inscripcionesModel.findInscripcionById(id);
    if (!insc) return res.status(404).json({ error: 'Inscripción no encontrada' });
    return res.json({ inscripcion: insc });
  } catch (err) {
    next(err);
  }
}

async function listarInscripcionesEstudiante(req, res, next) {
  try {
    const { id } = req.params; 
    const inscripciones = await inscripcionesModel.listInscripcionesByEstudiante(id);
    return res.json({ inscripciones });
  } catch (err) {
    next(err);
  }
}

async function listarInscripcionesSeccion(req, res, next) {
  try {
    const { id } = req.params; 
    const inscripciones = await inscripcionesModel.listInscripcionesBySeccion(id);
    return res.json({ inscripciones });
  } catch (err) {
    next(err);
  }
}

async function cambiarEstadoInscripcion(req, res, next) {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: 'estado es requerido' });
    const updated = await inscripcionesModel.updateInscripcionEstado(id, estado);
    if (!updated) return res.status(404).json({ error: 'Inscripción no encontrada o no actualizada' });
    return res.json({ inscripcion: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  inscribirEstudiante,
  obtenerInscripcion,
  listarInscripcionesEstudiante,
  listarInscripcionesSeccion,
  cambiarEstadoInscripcion
};
