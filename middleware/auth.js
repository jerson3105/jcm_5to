/**
 * Middleware de autenticación - verifica sesión activa
 */
function authMiddleware(req, res, next) {
  if (!req.session || !req.session.user) {
    req.session.error = 'Debes iniciar sesión para acceder.';
    return res.redirect('/login');
  }
  next();
}

module.exports = authMiddleware;
