const express = require('express')
const router = express.Router()
const docentesModel = require('../models/docentes.model')

// GET /api/docentes - Obtener todos los docentes
router.get('/', async (req, res, next) => {
  try {
    const docentes = await docentesModel.findAll()
    res.json({ docentes })
  } catch (err) {
    next(err)
  }
})

// GET /api/docentes/:id - Obtener un docente por ID
router.get('/:id', async (req, res, next) => {
  try {
    const docente = await docentesModel.findById(req.params.id)
    if (!docente) return res.status(404).json({ error: 'Docente no encontrado' })
    res.json({ docente })
  } catch (err) {
    next(err)
  }
})

// GET /api/docentes/usuario/:usuario_id - Obtener docente por usuario_id
router.get('/usuario/:usuario_id', async (req, res, next) => {
  try {
    const docente = await docentesModel.findByUsuarioId(req.params.usuario_id)
    if (!docente) return res.status(404).json({ error: 'Docente no encontrado' })
    res.json({ docente })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/docentes/:id - Actualizar docente
router.patch('/:id', async (req, res, next) => {
  try {
    const { especialidad, telefono } = req.body
    await docentesModel.update(req.params.id, { especialidad, telefono })
    const docente = await docentesModel.findById(req.params.id)
    res.json({ docente })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/docentes/:id - Eliminar docente
router.delete('/:id', async (req, res, next) => {
  try {
    await docentesModel.remove(req.params.id)
    res.json({ message: 'Docente eliminado' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
