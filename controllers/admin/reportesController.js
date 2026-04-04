const { Estudiante, Usuario, Resultado, Examen, Seccion, Area, Carrera, sequelize } = require('../../models');
const { fn, col, literal, Op } = require('sequelize');

const reportesController = {
  async index(req, res) {
    try {
      // Conteos generales
      const [
        totalEstudiantes,
        totalPadres,
        totalExamenes,
        totalResultados,
        secciones,
        areas
      ] = await Promise.all([
        Estudiante.count(),
        require('../../models').Padre.count(),
        Examen.count(),
        Resultado.count(),
        Seccion.findAll({
          attributes: [
            'id', 'nombre',
            [fn('COUNT', col('estudiantes.id')), 'total_estudiantes']
          ],
          include: [{ association: 'estudiantes', attributes: [] }],
          group: ['Seccion.id'],
          order: [['nombre', 'ASC']],
          raw: true,
          subQuery: false
        }),
        Area.findAll({
          attributes: [
            'id', 'nombre',
            [fn('COUNT', col('estudiantes.id')), 'total_estudiantes']
          ],
          include: [{ association: 'estudiantes', attributes: [] }],
          group: ['Area.id'],
          order: [['nombre', 'ASC']],
          raw: true,
          subQuery: false
        })
      ]);

      // Promedio global
      const promGlobal = await Resultado.findOne({
        attributes: [[fn('AVG', col('nota_vigesimal')), 'promedio']],
        raw: true
      });
      const promedioGlobal = promGlobal && promGlobal.promedio 
        ? parseFloat(promGlobal.promedio).toFixed(2) 
        : '0.00';

      // Promedios por sección
      const promediosPorSeccion = await Resultado.findAll({
        attributes: [
          [fn('AVG', col('nota_vigesimal')), 'promedio'],
          [fn('COUNT', col('Resultado.id')), 'total_resultados']
        ],
        include: [{
          association: 'estudiante',
          attributes: ['seccion_id'],
          include: [{ association: 'seccion', attributes: ['nombre'] }]
        }],
        group: ['estudiante.seccion_id'],
        order: [[literal('promedio'), 'DESC']],
        raw: true,
        nest: true
      });

      // Promedios por área
      const promediosPorArea = await Resultado.findAll({
        attributes: [
          [fn('AVG', col('nota_vigesimal')), 'promedio'],
          [fn('COUNT', col('Resultado.id')), 'total_resultados']
        ],
        include: [{
          association: 'estudiante',
          attributes: ['area_id'],
          include: [{ association: 'area', attributes: ['nombre'] }]
        }],
        group: ['estudiante.area_id'],
        order: [[literal('promedio'), 'DESC']],
        raw: true,
        nest: true
      });

      // Promedios por examen (evolución temporal)
      const promediosPorExamen = await Resultado.findAll({
        attributes: [
          'examen_id',
          [fn('AVG', col('nota_vigesimal')), 'promedio'],
          [fn('MAX', col('nota_vigesimal')), 'nota_maxima'],
          [fn('MIN', col('nota_vigesimal')), 'nota_minima'],
          [fn('COUNT', col('Resultado.id')), 'total_estudiantes']
        ],
        include: [{ association: 'examen', attributes: ['descripcion', 'tipo', 'fecha', 'total_preguntas'] }],
        group: ['examen_id'],
        order: [[{ model: Examen, as: 'examen' }, 'fecha', 'ASC']],
        raw: true,
        nest: true
      });

      // Distribución de notas (rangos)
      const distribucion = await Resultado.findAll({
        attributes: [
          [literal(`CASE
            WHEN nota_vigesimal >= 18 THEN 'Excelente (18-20)'
            WHEN nota_vigesimal >= 14 THEN 'Bueno (14-17.99)'
            WHEN nota_vigesimal >= 11 THEN 'Regular (11-13.99)'
            WHEN nota_vigesimal >= 6 THEN 'Deficiente (6-10.99)'
            ELSE 'Muy deficiente (0-5.99)'
          END`), 'rango'],
          [fn('COUNT', col('Resultado.id')), 'cantidad']
        ],
        group: ['rango'],
        order: [[literal('MIN(nota_vigesimal)'), 'DESC']],
        raw: true
      });

      // Top 10 estudiantes
      const top10 = await Resultado.findAll({
        attributes: [
          'estudiante_id',
          [fn('AVG', col('nota_vigesimal')), 'promedio'],
          [fn('COUNT', col('Resultado.id')), 'total_examenes']
        ],
        group: ['estudiante_id'],
        order: [[literal('promedio'), 'DESC']],
        limit: 10,
        raw: true
      });

      const top10Ids = top10.map(t => t.estudiante_id);
      const top10Estudiantes = await Estudiante.findAll({
        where: { id: { [Op.in]: top10Ids } },
        include: [
          { association: 'usuario', attributes: ['nombre'] },
          { association: 'seccion', attributes: ['nombre'] },
          { association: 'area', attributes: ['nombre'] }
        ]
      });
      const estMap = new Map(top10Estudiantes.map(e => [e.id, e]));

      const top10Data = top10.map((t, idx) => {
        const est = estMap.get(t.estudiante_id);
        return {
          posicion: idx + 1,
          nombre: est ? est.usuario.nombre : 'Desconocido',
          seccion: est && est.seccion ? est.seccion.nombre : '',
          area: est && est.area ? est.area.nombre : '',
          promedio: parseFloat(t.promedio).toFixed(2),
          total_examenes: parseInt(t.total_examenes)
        };
      });

      // Estudiantes en riesgo (promedio < 11)
      const enRiesgo = await Resultado.findAll({
        attributes: [
          'estudiante_id',
          [fn('AVG', col('nota_vigesimal')), 'promedio'],
          [fn('COUNT', col('Resultado.id')), 'total_examenes']
        ],
        group: ['estudiante_id'],
        having: literal('AVG(nota_vigesimal) < 11'),
        order: [[literal('promedio'), 'ASC']],
        limit: 10,
        raw: true
      });

      const riesgoIds = enRiesgo.map(t => t.estudiante_id);
      const riesgoEstudiantes = riesgoIds.length > 0 ? await Estudiante.findAll({
        where: { id: { [Op.in]: riesgoIds } },
        include: [
          { association: 'usuario', attributes: ['nombre'] },
          { association: 'seccion', attributes: ['nombre'] }
        ]
      }) : [];
      const riesgoMap = new Map(riesgoEstudiantes.map(e => [e.id, e]));

      const riesgoData = enRiesgo.map(t => {
        const est = riesgoMap.get(t.estudiante_id);
        return {
          nombre: est ? est.usuario.nombre : 'Desconocido',
          seccion: est && est.seccion ? est.seccion.nombre : '',
          promedio: parseFloat(t.promedio).toFixed(2),
          total_examenes: parseInt(t.total_examenes)
        };
      });

      res.render('admin/reportes', {
        title: 'Reportes',
        layout: 'layouts/admin',
        currentPage: 'reportes',
        stats: { totalEstudiantes, totalPadres, totalExamenes, totalResultados, promedioGlobal },
        secciones,
        areas,
        promediosPorSeccion,
        promediosPorArea,
        promediosPorExamen: JSON.stringify(promediosPorExamen),
        distribucion: JSON.stringify(distribucion),
        top10Data,
        riesgoData
      });
    } catch (error) {
      console.error('Error en reportes:', error);
      req.session.error = 'Error al cargar reportes.';
      res.redirect('/admin');
    }
  }
};

module.exports = reportesController;
