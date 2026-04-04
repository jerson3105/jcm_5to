const { Estudiante, Usuario, Resultado, Examen, Seccion, Area, Carrera, sequelize } = require('../../models');
const { fn, col, literal, Op } = require('sequelize');

const rankingsController = {
  async index(req, res) {
    try {
      const examenId = req.query.examen_id || null;
      const seccionId = req.query.seccion_id || null;
      const areaId = req.query.area_id || null;

      // Cargar filtros
      const [examenes, secciones, areas] = await Promise.all([
        Examen.findAll({ order: [['fecha', 'DESC']] }),
        Seccion.findAll({ order: [['nombre', 'ASC']] }),
        Area.findAll({ order: [['nombre', 'ASC']] })
      ]);

      let rankingData = [];
      let tipoRanking = 'general'; // general | examen

      if (examenId) {
        // Ranking por examen específico
        tipoRanking = 'examen';
        const where = { examen_id: examenId };

        const resultados = await Resultado.findAll({
          where,
          include: [
            {
              association: 'estudiante',
              include: [
                { association: 'usuario', attributes: ['nombre', 'email'] },
                { association: 'seccion', attributes: ['id', 'nombre'] },
                { association: 'area', attributes: ['id', 'nombre'] },
                { association: 'carrera', attributes: ['id', 'nombre'] }
              ]
            },
            { association: 'examen' }
          ],
          order: [['nota_vigesimal', 'DESC']]
        });

        let pos = 0;
        let lastNota = null;
        rankingData = resultados
          .filter(r => {
            if (seccionId && r.estudiante.seccion_id !== parseInt(seccionId)) return false;
            if (areaId && r.estudiante.area_id !== parseInt(areaId)) return false;
            return true;
          })
          .map((r, idx) => {
            const nota = parseFloat(r.nota_vigesimal);
            if (nota !== lastNota) {
              pos = idx + 1;
              lastNota = nota;
            }
            return {
              posicion: pos,
              nombre: r.estudiante.usuario.nombre,
              email: r.estudiante.usuario.email,
              seccion: r.estudiante.seccion ? r.estudiante.seccion.nombre : '',
              area: r.estudiante.area ? r.estudiante.area.nombre : '',
              carrera: r.estudiante.carrera ? r.estudiante.carrera.nombre : '',
              correctas: r.correctas,
              incorrectas: r.incorrectas,
              en_blanco: r.en_blanco,
              puntaje_bruto: parseFloat(r.puntaje_bruto),
              nota_vigesimal: nota
            };
          });
      } else {
        // Ranking general por promedio de todos los exámenes
        const whereEstudiante = {};
        if (seccionId) whereEstudiante.seccion_id = seccionId;
        if (areaId) whereEstudiante.area_id = areaId;

        const promedios = await Resultado.findAll({
          attributes: [
            'estudiante_id',
            [fn('AVG', col('nota_vigesimal')), 'promedio'],
            [fn('AVG', col('puntaje_bruto')), 'puntaje_promedio'],
            [fn('COUNT', col('Resultado.id')), 'total_examenes'],
            [fn('SUM', col('correctas')), 'total_correctas'],
            [fn('SUM', col('incorrectas')), 'total_incorrectas']
          ],
          include: [{
            association: 'estudiante',
            attributes: [],
            where: Object.keys(whereEstudiante).length > 0 ? whereEstudiante : undefined
          }],
          group: ['estudiante_id'],
          order: [[literal('promedio'), 'DESC']],
          raw: true
        });

        // Obtener datos de estudiantes
        const estudianteIds = promedios.map(p => p.estudiante_id);
        const estudiantes = await Estudiante.findAll({
          where: { id: { [Op.in]: estudianteIds } },
          include: [
            { association: 'usuario', attributes: ['nombre', 'email'] },
            { association: 'seccion', attributes: ['nombre'] },
            { association: 'area', attributes: ['nombre'] },
            { association: 'carrera', attributes: ['nombre'] }
          ]
        });
        const estMap = new Map(estudiantes.map(e => [e.id, e]));

        let pos = 0;
        let lastProm = null;
        rankingData = promedios.map((p, idx) => {
          const est = estMap.get(p.estudiante_id);
          const prom = parseFloat(p.promedio);
          if (prom !== lastProm) {
            pos = idx + 1;
            lastProm = prom;
          }
          return {
            posicion: pos,
            nombre: est ? est.usuario.nombre : 'Desconocido',
            email: est ? est.usuario.email : '',
            seccion: est && est.seccion ? est.seccion.nombre : '',
            area: est && est.area ? est.area.nombre : '',
            carrera: est && est.carrera ? est.carrera.nombre : '',
            total_examenes: parseInt(p.total_examenes),
            total_correctas: parseInt(p.total_correctas),
            total_incorrectas: parseInt(p.total_incorrectas),
            puntaje_promedio: parseFloat(p.puntaje_promedio),
            nota_vigesimal: prom
          };
        });
      }

      // Estadísticas resumen
      const totalEstudiantes = rankingData.length;
      const promedioGlobal = totalEstudiantes > 0
        ? (rankingData.reduce((s, r) => s + r.nota_vigesimal, 0) / totalEstudiantes).toFixed(2)
        : '0.00';
      const mejorNota = totalEstudiantes > 0 ? rankingData[0]?.nota_vigesimal.toFixed(2) : '0.00';
      const aprobados = rankingData.filter(r => r.nota_vigesimal >= 11).length;

      res.render('admin/rankings', {
        title: 'Rankings',
        layout: 'layouts/admin',
        currentPage: 'rankings',
        rankingData,
        examenes,
        secciones,
        areas,
        filtros: { examen_id: examenId, seccion_id: seccionId, area_id: areaId },
        tipoRanking,
        stats: { totalEstudiantes, promedioGlobal, mejorNota, aprobados }
      });
    } catch (error) {
      console.error('Error en rankings:', error);
      req.session.error = 'Error al cargar rankings.';
      res.redirect('/admin');
    }
  }
};

module.exports = rankingsController;
