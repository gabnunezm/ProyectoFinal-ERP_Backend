const estudiantesModel = require('../models/estudiantes.model');

async function listarEstudiantes(req, res, next) {
  try {
    const estudiantes = await estudiantesModel.listAll();
    return res.json({ estudiantes });
  } catch (err) {
    next(err);
  }
}

async function crearEstudiante(req, res, next) {
  try {
    const { usuario_id, codigo_estudiante, fecha_nacimiento, genero, telefono, direccion } = req.body;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido' });

    const existing = await estudiantesModel.findByUsuarioId(usuario_id);
    if (existing) return res.status(409).json({ error: 'Ya existe un registro de estudiante para este usuario' });

    const estudiante = await estudiantesModel.createEstudiante({ usuario_id, codigo_estudiante, fecha_nacimiento, genero, telefono, direccion });
    return res.status(201).json({ estudiante });
  } catch (err) {
    next(err);
  }
}

async function obtenerEstudiante(req, res, next) {
  try {
    const { id } = req.params;
    const estudiante = await estudiantesModel.findById(id);
    if (!estudiante) return res.status(404).json({ error: 'Estudiante no encontrado' });
    return res.json({ estudiante });
  } catch (err) {
    next(err);
  }
}

async function obtenerEstudiantePorUsuario(req, res, next) {
  try {
    const usuario_id = req.params.usuario_id;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido' });

    // El modelo ya proporciona findByUsuarioId según el controlador anterior
    const estudiante = await estudiantesModel.findByUsuarioId(usuario_id);
    if (!estudiante) return res.status(404).json({ error: 'Estudiante no encontrado' });
    return res.json({ estudiante });
  } catch (err) {
    next(err);
  }
}

async function actualizarEstudiante(req, res, next) {
  try {
    const { id } = req.params;
    const fields = req.body;
    const updated = await estudiantesModel.updateEstudiante(id, fields);
    if (!updated) return res.status(404).json({ error: 'Estudiante no encontrado o no actualizado' });
    return res.json({ estudiante: updated });
  } catch (err) {
    next(err);
  }
}

async function eliminarEstudiante(req, res, next) {
  try {
    const { id } = req.params;
    const ok = await estudiantesModel.deleteEstudianteSoft(id);
    if (!ok) return res.status(404).json({ error: 'Estudiante no encontrado o no eliminado' });
    return res.json({ message: 'Estudiante desactivado correctamente (usuario marcado como inactivo)' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarEstudiantes,
  crearEstudiante,
  obtenerEstudiante,
  obtenerEstudiantePorUsuario,
  actualizarEstudiante,
  eliminarEstudiante
};