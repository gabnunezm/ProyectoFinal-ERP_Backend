const db = require('../db')

const docentesModel = {
  async findAll() {
    const [rows] = await db.query(`
      SELECT d.*, u.nombre, u.email 
      FROM docentes d
      LEFT JOIN usuarios u ON d.usuario_id = u.id
      ORDER BY d.id DESC
    `)
    return rows
  },

  async findById(id) {
    const [rows] = await db.query(`
      SELECT d.*, u.nombre, u.email 
      FROM docentes d
      LEFT JOIN usuarios u ON d.usuario_id = u.id
      WHERE d.id = ?
    `, [id])
    return rows[0] || null
  },

  async findByUsuarioId(usuario_id) {
    const [rows] = await db.query(`
      SELECT d.*, u.nombre, u.email 
      FROM docentes d
      LEFT JOIN usuarios u ON d.usuario_id = u.id
      WHERE d.usuario_id = ?
    `, [usuario_id])
    return rows[0] || null
  },

  async update(id, data) {
    const fields = []
    const values = []
    
    if (data.especialidad !== undefined) {
      fields.push('especialidad = ?')
      values.push(data.especialidad)
    }
    if (data.telefono !== undefined) {
      fields.push('telefono = ?')
      values.push(data.telefono)
    }
    
    if (fields.length === 0) return
    
    values.push(id)
    await db.query(
      `UPDATE docentes SET ${fields.join(', ')} WHERE id = ?`,
      values
    )
  },

  async remove(id) {
    await db.query('DELETE FROM docentes WHERE id = ?', [id])
  }
}

module.exports = docentesModel
