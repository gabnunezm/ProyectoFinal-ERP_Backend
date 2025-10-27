// roles.middleware.js
// Uso: checkRole(['admin','administrativo'])
module.exports = function checkRole(allowedRoles = []) {
  // allowedRoles puede ser array de names o ids, por ejemplo ['admin'] o [1,2]
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    // Si allowedRoles son strings (nombres), comparar role_name en req.user.role_name
    // En nuestro diseño simple comparamos por role_id numérico.
    if (allowedRoles.length === 0) return next();

    // si allowedRoles contienen strings -> se asume role_name en req.user
    const firstIsString = typeof allowedRoles[0] === 'string';

    if (firstIsString) {
      const roleName = req.user.role_name; // debes poblar esto en auth middleware al hacer verify JWT
      if (!roleName) return res.status(403).json({ error: 'Rol no disponible en token' });
      if (allowedRoles.includes(roleName)) return next();
    } else {
      // comparacion por role_id
      if (allowedRoles.includes(req.user.role_id)) return next();
    }

    return res.status(403).json({ error: 'No autorizado' });
  };
};
