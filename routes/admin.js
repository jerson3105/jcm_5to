const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Controladores
const seccionesController = require('../controllers/admin/seccionesController');
const areasController = require('../controllers/admin/areasController');
const estudiantesController = require('../controllers/admin/estudiantesController');
const padresController = require('../controllers/admin/padresController');
const examenesController = require('../controllers/admin/examenesController');
const resultadosController = require('../controllers/admin/resultadosController');
const rankingsController = require('../controllers/admin/rankingsController');
const reportesController = require('../controllers/admin/reportesController');
const configuracionController = require('../controllers/admin/configuracionController');
const upload = require('../config/upload');

// Proteger todas las rutas de admin
router.use(auth, role('admin'));

// Dashboard admin
router.get('/', async (req, res) => {
  try {
    const { Estudiante, Examen, Resultado, Seccion } = require('../models');
    const { fn, col, literal } = require('sequelize');

    const [totalEstudiantes, totalExamenes, totalSecciones, totalResultados] = await Promise.all([
      Estudiante.count(),
      Examen.count(),
      Seccion.count(),
      Resultado.count()
    ]);

    let promedioGeneral = null;
    if (totalResultados > 0) {
      const avg = await Resultado.findOne({
        attributes: [[fn('AVG', col('nota_vigesimal')), 'promedio']],
        raw: true
      });
      promedioGeneral = avg.promedio ? parseFloat(avg.promedio).toFixed(1) : null;
    }

    // Últimos 5 exámenes
    const ultimosExamenes = await Examen.findAll({
      order: [['fecha', 'DESC']],
      limit: 5,
      raw: true
    });

    res.render('admin/dashboard', {
      title: 'Panel de Administración',
      layout: 'layouts/admin',
      currentPage: 'dashboard',
      stats: { totalEstudiantes, totalExamenes, totalSecciones, totalResultados, promedioGeneral },
      ultimosExamenes
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.render('admin/dashboard', {
      title: 'Panel de Administración',
      layout: 'layouts/admin',
      currentPage: 'dashboard',
      stats: { totalEstudiantes: 0, totalExamenes: 0, totalSecciones: 0, totalResultados: 0, promedioGeneral: null },
      ultimosExamenes: []
    });
  }
});

// === SECCIONES ===
router.get('/secciones', seccionesController.index);
router.post('/secciones', seccionesController.store);
router.post('/secciones/:id/update', seccionesController.update);
router.post('/secciones/:id/delete', seccionesController.destroy);

// === ÁREAS Y CARRERAS ===
router.get('/areas', areasController.index);
router.post('/areas', areasController.storeArea);
router.post('/areas/:id/update', areasController.updateArea);
router.post('/areas/:id/delete', areasController.destroyArea);
router.post('/carreras', areasController.storeCarrera);
router.post('/carreras/:id/update', areasController.updateCarrera);
router.post('/carreras/:id/delete', areasController.destroyCarrera);

// === ESTUDIANTES ===
router.get('/estudiantes', estudiantesController.index);
router.post('/estudiantes', estudiantesController.store);
router.post('/estudiantes/:id/update', estudiantesController.update);
router.post('/estudiantes/:id/reset-password', estudiantesController.resetPassword);
router.post('/estudiantes/:id/delete', estudiantesController.destroy);
router.get('/estudiantes/plantilla', estudiantesController.plantilla);
router.post('/estudiantes/importar', upload.single('archivo'), estudiantesController.importar);

// === PADRES ===
router.get('/padres', padresController.index);
router.post('/padres', padresController.store);
router.post('/padres/:id/update', padresController.update);
router.post('/padres/:id/delete', padresController.destroy);

// === EXÁMENES ===
router.get('/examenes', examenesController.index);
router.post('/examenes', examenesController.store);
router.post('/examenes/:id/update', examenesController.update);
router.post('/examenes/:id/delete', examenesController.destroy);

// === RESULTADOS ===
router.get('/resultados', resultadosController.index);
router.post('/resultados', resultadosController.store);
router.post('/resultados/importar', upload.single('archivo'), resultadosController.importar);
router.post('/resultados/:id/update', resultadosController.update);
router.post('/resultados/:id/delete', resultadosController.destroy);

// === RANKINGS ===
router.get('/rankings', rankingsController.index);

// === REPORTES ===
router.get('/reportes', reportesController.index);

// === CONFIGURACIÓN ===
router.get('/configuracion', configuracionController.index);
router.post('/configuracion', configuracionController.update);

module.exports = router;
