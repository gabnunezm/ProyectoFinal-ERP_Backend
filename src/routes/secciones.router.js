const express = require('express')
const router = express.Router()
const seccionesModel = require('../models/secciones.model')

// GET /api/secciones - Obtener todas las secciones
router.get('/', async (req, res, next) => {
  try {
    const secciones = await seccionesModel.findAll()
    res.json({ secciones })
  } catch (err) {
    next(err)
  }
})

// GET /api/secciones/:id - Obtener una sección por ID
router.get('/:id', async (req, res, next) => {
  try {
    const seccion = await seccionesModel.findById(req.params.id)
    if (!seccion) return res.status(404).json({ error: 'Sección no encontrada' })
    res.json({ seccion })
  } catch (err) {
    next(err)
  }
})

// POST /api/secciones - Crear nueva sección
router.post('/', async (req, res, next) => {
  try {
    const { curso_id, nombre_seccion, docente_id, jornada, horario } = req.body
    if (!curso_id || !nombre_seccion) {
      return res.status(400).json({ error: 'curso_id y nombre_seccion son requeridos' })
    }
    
    const newId = await seccionesModel.create({ 
      curso_id, 
      nombre_seccion, 
      docente_id: docente_id || null, 
      jornada, 
      horario 
    })
    const seccion = await seccionesModel.findById(newId)
    res.status(201).json({ seccion })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/secciones/:id - Actualizar sección
router.patch('/:id', async (req, res, next) => {
  try {
    const { curso_id, nombre_seccion, docente_id, jornada, horario } = req.body
    await seccionesModel.update(req.params.id, { 
      curso_id, 
      nombre_seccion, 
      docente_id: docente_id || null, 
      jornada, 
      horario 
    })
    const seccion = await seccionesModel.findById(req.params.id)
    res.json({ seccion })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/secciones/:id - Eliminar sección
router.delete('/:id', async (req, res, next) => {
  try {
    await seccionesModel.remove(req.params.id)
    res.json({ message: 'Sección eliminada' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
