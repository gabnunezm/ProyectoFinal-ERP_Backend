const estudiantesModel = require('../models/estudiantes.model');

async function crear(req, res, next) {
  try {
    const { usuario_id, codigo_estudiante, fecha_nacimiento, genero } = req.body;
    const created = await estudiantesModel.createEstudiante({ usuario_id, codigo_estudiante, fecha_nacimiento, genero });
    res.status(201).json({ created });
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const { id } = req.params;
    const estudiante = await estudiantesModel.findById(id);
    if (!estudiante) return res.status(404).json({ error: 'No encontrado' });
    res.json({ estudiante });
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, obtener };
