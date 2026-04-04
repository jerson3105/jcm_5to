const bcrypt = require('bcryptjs');
const { Usuario, Estudiante, Padre } = require('../models');

const authController = {
  // Mostrar formulario de login
  showLogin(req, res) {
    if (req.session.user) {
      return res.redirect(`/${req.session.user.rol === 'admin' ? 'admin' : req.session.user.rol}`);
    }
    res.render('auth/login', { title: 'Iniciar Sesión', layout: false });
  },

  // Procesar login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.session.error = 'Todos los campos son obligatorios.';
        return res.redirect('/login');
      }

      // Buscar usuario
      const usuario = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });

      if (!usuario) {
        req.session.error = 'Credenciales incorrectas.';
        return res.redirect('/login');
      }

      if (!usuario.activo) {
        req.session.error = 'Tu cuenta está desactivada. Contacta al administrador.';
        return res.redirect('/login');
      }

      // Verificar password
      const isValid = await bcrypt.compare(password, usuario.password);
      if (!isValid) {
        req.session.error = 'Credenciales incorrectas.';
        return res.redirect('/login');
      }

      // Crear sesión
      req.session.user = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      };

      // Si es estudiante, cargar datos extra
      if (usuario.rol === 'estudiante') {
        const estudiante = await Estudiante.findOne({ where: { usuario_id: usuario.id } });
        if (estudiante) {
          req.session.user.estudiante_id = estudiante.id;
          req.session.user.necesita_elegir_carrera = !estudiante.area_id;
        }
      }

      // Si es padre, cargar datos extra
      if (usuario.rol === 'padre') {
        const padre = await Padre.findOne({ where: { usuario_id: usuario.id } });
        if (padre) {
          req.session.user.padre_id = padre.id;
        }
      }

      // Redirigir según rol
      const redirectMap = {
        admin: '/admin',
        estudiante: '/estudiante',
        padre: '/padre'
      };

      return res.redirect(redirectMap[usuario.rol] || '/login');
    } catch (error) {
      console.error('Error en login:', error);
      req.session.error = 'Error al iniciar sesión. Intenta de nuevo.';
      return res.redirect('/login');
    }
  },

  // Cerrar sesión
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) console.error('Error al cerrar sesión:', err);
      res.redirect('/login');
    });
  }
};

module.exports = authController;
