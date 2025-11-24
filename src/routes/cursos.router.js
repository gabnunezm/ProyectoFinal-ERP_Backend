const express = require('express')
const router = express.Router()
const cursosModel = require('../models/cursos.model')

// GET /api/cursos - Obtener todos los cursos
router.get('/', async (req, res, next) => {
  try {
    const cursos = await cursosModel.findAll()
    res.json({ cursos })
  } catch (err) {
    next(err)
  }
})

// GET /api/cursos/:id - Obtener un curso por ID
router.get('/:id', async (req, res, next) => {
  try {
    const curso = await cursosModel.findById(req.params.id)
    if (!curso) return res.status(404).json({ error: 'Curso no encontrado' })
    res.json({ curso })
  } catch (err) {
    next(err)
  }
})

// POST /api/cursos - Crear nuevo curso
router.post('/', async (req, res, next) => {
  try {
    const { codigo, nombre, descripcion, creditos } = req.body
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' })
    
    const curso = await cursosModel.create({ codigo, nombre, descripcion, creditos })
    res.status(201).json({ curso })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/cursos/:id - Actualizar curso
router.patch('/:id', async (req, res, next) => {
  try {
    const { codigo, nombre, descripcion, creditos } = req.body
    await cursosModel.update(req.params.id, { codigo, nombre, descripcion, creditos })
    const curso = await cursosModel.findById(req.params.id)
    res.json({ curso })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/cursos/:id - Eliminar curso
router.delete('/:id', async (req, res, next) => {
  try {
    await cursosModel.remove(req.params.id)
    res.json({ message: 'Curso eliminado' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
