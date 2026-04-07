const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const estudianteController = require('../controllers/estudianteController');
const { Configuracion } = require('../models');

// Proteger todas las rutas de estudiante
router.use(auth, role('estudiante'));

// Cargar configuración para el layout
router.use(async (req, res, next) => {
  try {
    const configCambio = await Configuracion.findOne({ where: { clave: 'permitir_cambio_carrera' } });
    res.locals.permitirCambioCarrera = configCambio && configCambio.valor === 'true';
  } catch (e) {
    res.locals.permitirCambioCarrera = false;
  }
  next();
});

// Elegir carrera (primera vez) — antes del middleware de verificación
router.get('/elegir-carrera', estudianteController.elegirCarrera);
router.post('/elegir-carrera', estudianteController.guardarCarrera);

// Middleware: redirigir si no ha elegido área
router.use((req, res, next) => {
  if (req.session.user && req.session.user.necesita_elegir_carrera) {
    return res.redirect('/estudiante/elegir-carrera');
  }
  next();
});

// Dashboard estudiante
router.get('/', estudianteController.dashboard);

// Mis Exámenes
router.get('/examenes', estudianteController.examenes);

// Evolución
router.get('/evolucion', estudianteController.evolucion);

// Rankings
router.get('/rankings', estudianteController.rankings);

// Simulación de Admisión
router.get('/simulacion', estudianteController.simulacion);

// Promedios
router.get('/promedios', estudianteController.promedios);

// Cambiar Área y Carrera
router.get('/cambiar-carrera', estudianteController.cambiarCarrera);
router.post('/cambiar-carrera', estudianteController.guardarCambioCarrera);

module.exports = router;
