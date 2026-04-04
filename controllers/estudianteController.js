const { Estudiante, Usuario, Resultado, Examen, Seccion, Area, Carrera, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const estudianteController = {
  // Dashboard principal
  async dashboard(req, res) {
    try {
      const estudiante = await Estudiante.findOne({
        where: { usuario_id: req.session.user.id },
        include: [
          { association: 'seccion', attributes: ['id', 'nombre'] },
          { association: 'area', attributes: ['id', 'nombre'] },
          { association: 'carrera', attributes: ['id', 'nombre'] }
        ]
      });

      if (!estudiante) {
        req.session.error = 'No se encontró tu perfil de estudiante.';
        return res.redirect('/login');
      }

      // Obtener resultados con datos del examen
      const resultados = await Resultado.findAll({
        where: { estudiante_id: estudiante.id },
        include: [{ association: 'examen' }],
        order: [[{ model: Examen, as: 'examen' }, 'fecha', 'DESC']]
      });

      const totalExamenes = resultados.length;

      // Último examen
      const ultimoResultado = resultados.length > 0 ? resultados[0] : null;

      // Promedio general
      let promedioGeneral = 0;
      if (totalExamenes > 0) {
        const suma = resultados.reduce((acc, r) => acc + parseFloat(r.nota_vigesimal), 0);
        promedioGeneral = (suma / totalExamenes).toFixed(2);
      }

      // Ranking general: posición del estudiante entre todos por promedio
      let miRanking = '--';
      if (totalExamenes > 0) {
        const promedios = await Resultado.findAll({
          attributes: [
            'estudiante_id',
            [fn('AVG', col('nota_vigesimal')), 'promedio']
          ],
          group: ['estudiante_id'],
          order: [[literal('promedio'), 'DESC']],
          raw: true
        });

        const posicion = promedios.findIndex(p => p.estudiante_id === estudiante.id);
        if (posicion !== -1) {
          miRanking = `${posicion + 1}°`;
        }
      }

      // Últimos 5 resultados para tabla resumen
      const ultimos5 = resultados.slice(0, 5);

      // Nota más alta y más baja
      let notaMaxima = 0, notaMinima = 0;
      if (totalExamenes > 0) {
        const notas = resultados.map(r => parseFloat(r.nota_vigesimal));
        notaMaxima = Math.max(...notas).toFixed(2);
        notaMinima = Math.min(...notas).toFixed(2);
      }

      res.render('estudiante/dashboard', {
        title: 'Mi Dashboard',
        layout: 'layouts/estudiante',
        currentPage: 'dashboard',
        estudiante,
        ultimoResultado,
        promedioGeneral,
        miRanking,
        totalExamenes,
        ultimos5,
        notaMaxima,
        notaMinima
      });
    } catch (error) {
      console.error('Error en dashboard estudiante:', error);
      req.session.error = 'Error al cargar tu dashboard.';
      res.redirect('/login');
    }
  },

  // Mis Exámenes - historial completo
  async examenes(req, res) {
    try {
      const estudiante = await Estudiante.findOne({
        where: { usuario_id: req.session.user.id }
      });

      if (!estudiante) {
        req.session.error = 'No se encontró tu perfil de estudiante.';
        return res.redirect('/login');
      }

      const resultados = await Resultado.findAll({
        where: { estudiante_id: estudiante.id },
        include: [{ association: 'examen' }],
        order: [[{ model: Examen, as: 'examen' }, 'fecha', 'DESC']]
      });

      // Rankings por examen: para cada resultado, calcular su posición
      const rankingsPorExamen = {};
      for (const resultado of resultados) {
        const todosResultados = await Resultado.findAll({
          where: { examen_id: resultado.examen_id },
          attributes: ['estudiante_id', 'nota_vigesimal'],
          order: [['nota_vigesimal', 'DESC']],
          raw: true
        });
        const posicion = todosResultados.findIndex(r => r.estudiante_id === estudiante.id);
        rankingsPorExamen[resultado.examen_id] = {
          posicion: posicion + 1,
          total: todosResultados.length
        };
      }

      res.render('estudiante/examenes', {
        title: 'Mis Exámenes',
        layout: 'layouts/estudiante',
        currentPage: 'examenes',
        resultados,
        rankingsPorExamen
      });
    } catch (error) {
      console.error('Error al listar exámenes del estudiante:', error);
      req.session.error = 'Error al cargar tus exámenes.';
      res.redirect('/estudiante');
    }
  },

  // Evolución - gráfico de progreso
  async evolucion(req, res) {
    try {
      const estudiante = await Estudiante.findOne({
        where: { usuario_id: req.session.user.id },
        include: [{ association: 'seccion', attributes: ['id', 'nombre'] }]
      });

      if (!estudiante) {
        req.session.error = 'No se encontró tu perfil de estudiante.';
        return res.redirect('/login');
      }

      // Resultados ordenados cronológicamente
      const resultados = await Resultado.findAll({
        where: { estudiante_id: estudiante.id },
        include: [{ association: 'examen' }],
        order: [[{ model: Examen, as: 'examen' }, 'fecha', 'ASC']]
      });

      // Promedios generales por examen (para comparar)
      const promediosGenerales = [];
      for (const r of resultados) {
        const prom = await Resultado.findOne({
          where: { examen_id: r.examen_id },
          attributes: [[fn('AVG', col('nota_vigesimal')), 'promedio']],
          raw: true
        });
        promediosGenerales.push(parseFloat(prom.promedio).toFixed(2));
      }

      // Promedios de sección por examen
      const promediosSeccion = [];
      const estudiantesSeccion = await Estudiante.findAll({
        where: { seccion_id: estudiante.seccion_id },
        attributes: ['id'],
        raw: true
      });
      const idsSeccion = estudiantesSeccion.map(e => e.id);

      for (const r of resultados) {
        const prom = await Resultado.findOne({
          where: { examen_id: r.examen_id, estudiante_id: { [Op.in]: idsSeccion } },
          attributes: [[fn('AVG', col('nota_vigesimal')), 'promedio']],
          raw: true
        });
        promediosSeccion.push(parseFloat(prom.promedio || 0).toFixed(2));
      }

      res.render('estudiante/evolucion', {
        title: 'Mi Evolución',
        layout: 'layouts/estudiante',
        currentPage: 'evolucion',
        estudiante,
        resultados: JSON.stringify(resultados.map(r => ({
          examen: r.examen.descripcion || `${r.examen.tipo} - ${r.examen.fecha}`,
          fecha: r.examen.fecha,
          nota: parseFloat(r.nota_vigesimal),
          correctas: r.correctas,
          incorrectas: r.incorrectas,
          en_blanco: r.en_blanco,
          puntaje_bruto: parseFloat(r.puntaje_bruto)
        }))),
        promediosGenerales: JSON.stringify(promediosGenerales),
        promediosSeccion: JSON.stringify(promediosSeccion),
        totalResultados: resultados.length
      });
    } catch (error) {
      console.error('Error en evolución:', error);
      req.session.error = 'Error al cargar tu evolución.';
      res.redirect('/estudiante');
    }
  },

  // Elegir carrera (primera vez)
  async elegirCarrera(req, res) {
    try {
      // Si ya eligió, redirigir al dashboard
      if (!req.session.user.necesita_elegir_carrera) {
        return res.redirect('/estudiante');
      }

      const areas = await Area.findAll({
        include: [{ association: 'carreras' }],
        order: [['nombre', 'ASC'], [{ model: Carrera, as: 'carreras' }, 'nombre', 'ASC']]
      });

      res.render('estudiante/elegir-carrera', {
        title: 'Elegir Área y Carrera',
        layout: false,
        areas,
        nombre: req.session.user.nombre
      });
    } catch (error) {
      console.error('Error al mostrar selección de carrera:', error);
      req.session.error = 'Error al cargar las opciones.';
      res.redirect('/login');
    }
  },

  // Guardar carrera elegida
  async guardarCarrera(req, res) {
    try {
      const { area_id, carrera_id } = req.body;

      if (!area_id) {
        req.session.error = 'Debes seleccionar un área.';
        return res.redirect('/estudiante/elegir-carrera');
      }

      // Verificar que el área existe
      const area = await Area.findByPk(area_id);
      if (!area) {
        req.session.error = 'Área no válida.';
        return res.redirect('/estudiante/elegir-carrera');
      }

      // Verificar carrera si se proporcionó
      if (carrera_id) {
        const carrera = await Carrera.findOne({ where: { id: carrera_id, area_id: area_id } });
        if (!carrera) {
          req.session.error = 'La carrera seleccionada no pertenece al área elegida.';
          return res.redirect('/estudiante/elegir-carrera');
        }
      }

      const estudiante = await Estudiante.findOne({ where: { usuario_id: req.session.user.id } });
      if (!estudiante) {
        req.session.error = 'No se encontró tu perfil.';
        return res.redirect('/login');
      }

      await estudiante.update({
        area_id: parseInt(area_id),
        carrera_id: carrera_id ? parseInt(carrera_id) : null
      });

      // Actualizar sesión
      req.session.user.necesita_elegir_carrera = false;

      req.session.success = '¡Área y carrera registradas correctamente!';
      res.redirect('/estudiante');
    } catch (error) {
      console.error('Error al guardar carrera:', error);
      req.session.error = 'Error al guardar tu selección.';
      res.redirect('/estudiante/elegir-carrera');
    }
  },

  // Rankings
  async rankings(req, res) {
    try {
      const estudiante = await Estudiante.findOne({
        where: { usuario_id: req.session.user.id },
        include: [
          { association: 'seccion', attributes: ['id', 'nombre'] },
          { association: 'area', attributes: ['id', 'nombre'] },
          { association: 'carrera', attributes: ['id', 'nombre'] }
        ]
      });

      if (!estudiante) {
        req.session.error = 'No se encontró tu perfil de estudiante.';
        return res.redirect('/login');
      }

      const examenId = req.query.examen_id || null;

      // Cargar exámenes para el filtro
      const examenes = await Examen.findAll({ order: [['fecha', 'DESC']] });

      let rankingData = [];
      let tipoRanking = 'general';

      if (examenId) {
        tipoRanking = 'examen';
        const resultados = await Resultado.findAll({
          where: { examen_id: examenId },
          include: [
            {
              association: 'estudiante',
              include: [
                { association: 'usuario', attributes: ['nombre'] },
                { association: 'seccion', attributes: ['id', 'nombre'] },
                { association: 'area', attributes: ['id', 'nombre'] },
                { association: 'carrera', attributes: ['id', 'nombre'] }
              ]
            }
          ],
          order: [['nota_vigesimal', 'DESC']]
        });

        let pos = 0;
        let lastNota = null;
        rankingData = resultados.map((r, idx) => {
          const nota = parseFloat(r.nota_vigesimal);
          if (nota !== lastNota) {
            pos = idx + 1;
            lastNota = nota;
          }
          return {
            posicion: pos,
            estudiante_id: r.estudiante.id,
            nombre: r.estudiante.usuario.nombre,
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
        // Ranking general por promedio
        const promedios = await Resultado.findAll({
          attributes: [
            'estudiante_id',
            [fn('AVG', col('nota_vigesimal')), 'promedio'],
            [fn('COUNT', col('Resultado.id')), 'total_examenes']
          ],
          include: [{
            association: 'estudiante',
            attributes: []
          }],
          group: ['estudiante_id'],
          order: [[literal('promedio'), 'DESC']],
          raw: true
        });

        const estudianteIds = promedios.map(p => p.estudiante_id);
        const estudiantes = await Estudiante.findAll({
          where: { id: { [Op.in]: estudianteIds } },
          include: [
            { association: 'usuario', attributes: ['nombre'] },
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
            estudiante_id: p.estudiante_id,
            nombre: est ? est.usuario.nombre : 'Desconocido',
            seccion: est && est.seccion ? est.seccion.nombre : '',
            area: est && est.area ? est.area.nombre : '',
            carrera: est && est.carrera ? est.carrera.nombre : '',
            total_examenes: parseInt(p.total_examenes),
            nota_vigesimal: prom
          };
        });
      }

      // Encontrar posición del estudiante actual
      const miPosicion = rankingData.find(r => r.estudiante_id === estudiante.id);

      // Estadísticas
      const totalEstudiantes = rankingData.length;
      const promedioGlobal = totalEstudiantes > 0
        ? (rankingData.reduce((s, r) => s + r.nota_vigesimal, 0) / totalEstudiantes).toFixed(2)
        : '0.00';

      res.render('estudiante/rankings', {
        title: 'Rankings',
        layout: 'layouts/estudiante',
        currentPage: 'rankings',
        estudiante,
        rankingData,
        tipoRanking,
        examenes,
        filtros: { examen_id: examenId },
        miPosicion,
        stats: { totalEstudiantes, promedioGlobal }
      });
    } catch (error) {
      console.error('Error en rankings estudiante:', error);
      req.session.error = 'Error al cargar los rankings.';
      res.redirect('/estudiante');
    }
  },

  // Simulación de Admisión
  async simulacion(req, res) {
    try {
      const estudiante = await Estudiante.findOne({
        where: { usuario_id: req.session.user.id },
        include: [
          { association: 'seccion', attributes: ['id', 'nombre'] },
          { association: 'area', attributes: ['id', 'nombre'] },
          { association: 'carrera', attributes: ['id', 'nombre', 'puntaje_minimo_admision'] }
        ]
      });

      if (!estudiante) {
        req.session.error = 'No se encontró tu perfil de estudiante.';
        return res.redirect('/login');
      }

      // Resultados del estudiante
      const resultados = await Resultado.findAll({
        where: { estudiante_id: estudiante.id },
        include: [{ association: 'examen' }],
        order: [[{ model: Examen, as: 'examen' }, 'fecha', 'DESC']]
      });

      // Calcular promedio general del estudiante
      let promedioGeneral = 0;
      if (resultados.length > 0) {
        const suma = resultados.reduce((acc, r) => acc + parseFloat(r.nota_vigesimal), 0);
        promedioGeneral = suma / resultados.length;
      }

      // Puntaje bruto promedio
      let puntajePromedioFinal = 0;
      if (resultados.length > 0) {
        const sumaPuntaje = resultados.reduce((acc, r) => acc + parseFloat(r.puntaje_bruto), 0);
        puntajePromedioFinal = sumaPuntaje / resultados.length;
      }

      // Obtener todas las carreras del área del estudiante para comparar
      let carrerasArea = [];
      if (estudiante.area_id) {
        carrerasArea = await Carrera.findAll({
          where: { area_id: estudiante.area_id },
          order: [['nombre', 'ASC']]
        });
      }

      // Simulación: comparar con todas las carreras del área
      const simulaciones = carrerasArea.map(c => {
        const puntajeMinimo = parseFloat(c.puntaje_minimo_admision) || 0;
        const diferencia = puntajePromedioFinal - puntajeMinimo;
        let estado = 'aprobado';
        if (puntajeMinimo === 0) {
          estado = 'sin_datos';
        } else if (diferencia < 0) {
          estado = 'desaprobado';
        } else if (diferencia < puntajeMinimo * 0.1) {
          estado = 'riesgo';
        }
        return {
          id: c.id,
          nombre: c.nombre,
          puntaje_minimo: puntajeMinimo,
          mi_puntaje: puntajePromedioFinal,
          diferencia,
          estado,
          es_mi_carrera: estudiante.carrera_id === c.id
        };
      });

      // Último resultado (más reciente)
      const ultimoResultado = resultados.length > 0 ? resultados[0] : null;

      res.render('estudiante/simulacion', {
        title: 'Simulación de Admisión',
        layout: 'layouts/estudiante',
        currentPage: 'simulacion',
        estudiante,
        promedioGeneral: promedioGeneral.toFixed(2),
        puntajePromedio: puntajePromedioFinal.toFixed(2),
        simulaciones,
        ultimoResultado,
        totalExamenes: resultados.length
      });
    } catch (error) {
      console.error('Error en simulación:', error);
      req.session.error = 'Error al cargar la simulación.';
      res.redirect('/estudiante');
    }
  },

  // Promedios
  async promedios(req, res) {
    try {
      const estudiante = await Estudiante.findOne({
        where: { usuario_id: req.session.user.id },
        include: [
          { association: 'seccion', attributes: ['id', 'nombre'] },
          { association: 'area', attributes: ['id', 'nombre'] }
        ]
      });

      if (!estudiante) {
        req.session.error = 'No se encontró tu perfil de estudiante.';
        return res.redirect('/login');
      }

      // Todos mis resultados con examen
      const resultados = await Resultado.findAll({
        where: { estudiante_id: estudiante.id },
        include: [{ association: 'examen' }],
        order: [[{ model: Examen, as: 'examen' }, 'fecha', 'ASC']]
      });

      // Separar por tipo de examen
      const resultadosAptitud = resultados.filter(r => r.examen.tipo === 'aptitud');
      const resultadosConocimientos = resultados.filter(r => r.examen.tipo === 'conocimientos');

      const calcularProm = (arr) => arr.length > 0
        ? (arr.reduce((s, r) => s + parseFloat(r.nota_vigesimal), 0) / arr.length).toFixed(2)
        : '0.00';

      const promedioAptitud = calcularProm(resultadosAptitud);
      const promedioConocimientos = calcularProm(resultadosConocimientos);
      const promedioGeneral = calcularProm(resultados);

      // Promedios de la sección
      const estudiantesSeccion = await Estudiante.findAll({
        where: { seccion_id: estudiante.seccion_id },
        attributes: ['id'],
        raw: true
      });
      const idsSeccion = estudiantesSeccion.map(e => e.id);

      // Promedio sección por tipo
      const promSeccionApt = await Resultado.findOne({
        attributes: [[fn('AVG', col('nota_vigesimal')), 'promedio']],
        where: { estudiante_id: { [Op.in]: idsSeccion } },
        include: [{ association: 'examen', attributes: [], where: { tipo: 'aptitud' } }],
        raw: true
      });
      const promSeccionCon = await Resultado.findOne({
        attributes: [[fn('AVG', col('nota_vigesimal')), 'promedio']],
        where: { estudiante_id: { [Op.in]: idsSeccion } },
        include: [{ association: 'examen', attributes: [], where: { tipo: 'conocimientos' } }],
        raw: true
      });
      const promSeccionGen = await Resultado.findOne({
        attributes: [[fn('AVG', col('nota_vigesimal')), 'promedio']],
        where: { estudiante_id: { [Op.in]: idsSeccion } },
        raw: true
      });

      // Promedio general (todos los estudiantes)
      const promGeneralApt = await Resultado.findOne({
        attributes: [[fn('AVG', col('nota_vigesimal')), 'promedio']],
        include: [{ association: 'examen', attributes: [], where: { tipo: 'aptitud' } }],
        raw: true
      });
      const promGeneralCon = await Resultado.findOne({
        attributes: [[fn('AVG', col('nota_vigesimal')), 'promedio']],
        include: [{ association: 'examen', attributes: [], where: { tipo: 'conocimientos' } }],
        raw: true
      });
      const promGeneralTodos = await Resultado.findOne({
        attributes: [[fn('AVG', col('nota_vigesimal')), 'promedio']],
        raw: true
      });

      // Datos por examen para la tabla
      const detalleExamenes = resultados.map(r => ({
        examen: r.examen.descripcion || r.examen.tipo,
        tipo: r.examen.tipo,
        fecha: r.examen.fecha,
        nota: parseFloat(r.nota_vigesimal),
        correctas: r.correctas,
        incorrectas: r.incorrectas,
        en_blanco: r.en_blanco,
        puntaje_bruto: parseFloat(r.puntaje_bruto)
      }));

      res.render('estudiante/promedios', {
        title: 'Promedios',
        layout: 'layouts/estudiante',
        currentPage: 'promedios',
        estudiante,
        promedioGeneral,
        promedioAptitud,
        promedioConocimientos,
        totalExamenes: resultados.length,
        totalAptitud: resultadosAptitud.length,
        totalConocimientos: resultadosConocimientos.length,
        promediosSeccion: {
          general: parseFloat(promSeccionGen?.promedio || 0).toFixed(2),
          aptitud: parseFloat(promSeccionApt?.promedio || 0).toFixed(2),
          conocimientos: parseFloat(promSeccionCon?.promedio || 0).toFixed(2)
        },
        promediosGlobal: {
          general: parseFloat(promGeneralTodos?.promedio || 0).toFixed(2),
          aptitud: parseFloat(promGeneralApt?.promedio || 0).toFixed(2),
          conocimientos: parseFloat(promGeneralCon?.promedio || 0).toFixed(2)
        },
        detalleExamenes: JSON.stringify(detalleExamenes)
      });
    } catch (error) {
      console.error('Error en promedios:', error);
      req.session.error = 'Error al cargar tus promedios.';
      res.redirect('/estudiante');
    }
  },

  // Cambiar Área y Carrera (GET)
  async cambiarCarrera(req, res) {
    try {
      const estudiante = await Estudiante.findOne({
        where: { usuario_id: req.session.user.id },
        include: [
          { association: 'area', attributes: ['id', 'nombre'] },
          { association: 'carrera', attributes: ['id', 'nombre'] }
        ]
      });

      if (!estudiante) {
        req.session.error = 'No se encontró tu perfil de estudiante.';
        return res.redirect('/login');
      }

      const areas = await Area.findAll({
        include: [{ association: 'carreras' }],
        order: [['nombre', 'ASC'], [{ model: Carrera, as: 'carreras' }, 'nombre', 'ASC']]
      });

      res.render('estudiante/cambiar-carrera', {
        title: 'Cambiar Área y Carrera',
        layout: 'layouts/estudiante',
        currentPage: 'cambiar-carrera',
        estudiante,
        areas
      });
    } catch (error) {
      console.error('Error al mostrar cambio de carrera:', error);
      req.session.error = 'Error al cargar las opciones.';
      res.redirect('/estudiante');
    }
  },

  // Guardar cambio de Área y Carrera (POST)
  async guardarCambioCarrera(req, res) {
    try {
      const { area_id, carrera_id } = req.body;

      if (!area_id) {
        req.session.error = 'Debes seleccionar un área.';
        return res.redirect('/estudiante/cambiar-carrera');
      }

      const area = await Area.findByPk(area_id);
      if (!area) {
        req.session.error = 'Área no válida.';
        return res.redirect('/estudiante/cambiar-carrera');
      }

      if (carrera_id) {
        const carrera = await Carrera.findOne({ where: { id: carrera_id, area_id: area_id } });
        if (!carrera) {
          req.session.error = 'La carrera seleccionada no pertenece al área elegida.';
          return res.redirect('/estudiante/cambiar-carrera');
        }
      }

      const estudiante = await Estudiante.findOne({ where: { usuario_id: req.session.user.id } });
      if (!estudiante) {
        req.session.error = 'No se encontró tu perfil.';
        return res.redirect('/login');
      }

      await estudiante.update({
        area_id: parseInt(area_id),
        carrera_id: carrera_id ? parseInt(carrera_id) : null
      });

      req.session.success = '¡Área y carrera actualizadas correctamente!';
      res.redirect('/estudiante/cambiar-carrera');
    } catch (error) {
      console.error('Error al cambiar carrera:', error);
      req.session.error = 'Error al actualizar tu selección.';
      res.redirect('/estudiante/cambiar-carrera');
    }
  }
};

module.exports = estudianteController;
