/**
 * Middleware de verificación de rol
 * @param  {...string} roles - Roles permitidos ('admin', 'estudiante', 'padre')
 */
function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      req.session.error = 'Debes iniciar sesión.';
      return res.redirect('/login');
    }
    if (!roles.includes(req.session.user.rol)) {
      return res.status(403).render('errors/403', { title: 'Acceso denegado' });
    }
    next();
  };
}

module.exports = roleMiddleware;
