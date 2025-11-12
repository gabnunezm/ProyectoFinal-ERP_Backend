const usuariosModel = require('../models/usuarios.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'secretdev';

async function register(req, res, next) {
  try {
    const { nombre, email, password, role_id } = req.body;
    if (!nombre || !email || !password || !role_id) return res.status(400).json({ error: 'Faltan datos' });

    const existing = await usuariosModel.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email ya registrado' });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = await usuariosModel.createUsuario({ nombre, email, password_hash: hash, role_id });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await usuariosModel.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const [roleRows] = await db.execute('SELECT name FROM roles WHERE id = ?', [user.role_id]);
    const role_name = roleRows && roleRows[0] ? roleRows[0].name : null;

    const token = jwt.sign({ id: user.id, email: user.email, role_id: user.role_id, role_name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
