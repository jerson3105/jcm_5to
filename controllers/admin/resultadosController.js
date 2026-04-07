const { Resultado, Examen, Estudiante, Usuario, Seccion } = require('../../models');
const calculoService = require('../../services/calculoService');
const importService = require('../../services/importService');
const { Op } = require('sequelize');
const fs = require('fs');
const XLSX = require('xlsx');

const resultadosController = {
  // Página principal: seleccionar examen y ver sus resultados
  async index(req, res) {
    try {
      const examenes = await Examen.findAll({ order: [['fecha', 'DESC']] });
      const examenId = req.query.examen_id;

      let resultados = [];
      let examenActual = null;

      if (examenId) {
        examenActual = await Examen.findByPk(examenId);
        if (examenActual) {
          resultados = await Resultado.findAll({
            where: { examen_id: examenId },
            include: [
              {
                association: 'estudiante',
                include: [
                  { association: 'usuario', attributes: ['nombre'] },
                  { association: 'seccion', attributes: ['nombre'] }
                ]
              }
            ],
            order: [['nota_vigesimal', 'DESC']]
          });
        }
      }

      // Estudiantes para carga individual
      const estudiantes = await Estudiante.findAll({
        include: [
          { association: 'usuario', attributes: ['nombre'] },
          { association: 'seccion', attributes: ['nombre'] }
        ],
        order: [[{ model: Usuario, as: 'usuario' }, 'nombre', 'ASC']]
      });

      // Secciones para plantilla de resultados
      const secciones = await Seccion.findAll({ order: [['nombre', 'ASC']] });

      res.render('admin/resultados', {
        title: 'Resultados',
        layout: 'layouts/admin',
        currentPage: 'resultados',
        examenes,
        examenActual,
        resultados,
        estudiantes,
        secciones
      });
    } catch (error) {
      console.error('Error al cargar resultados:', error);
      req.session.error = 'Error al cargar resultados.';
      res.redirect('/admin');
    }
  },

  // Carga individual de resultado
  async store(req, res) {
    const { examen_id, estudiante_id, correctas, incorrectas, en_blanco } = req.body;
    try {
      const examen = await Examen.findByPk(examen_id);
      if (!examen) {
        req.session.error = 'Examen no encontrado.';
        return res.redirect('/admin/resultados');
      }

      // Verificar duplicado
      const existe = await Resultado.findOne({
        where: { examen_id, estudiante_id }
      });
      if (existe) {
        req.session.error = 'Ya existe un resultado de este estudiante para este examen.';
        return res.redirect(`/admin/resultados?examen_id=${examen_id}`);
      }

      // Validar
      const validacion = calculoService.validarFila(correctas, incorrectas, en_blanco, examen.total_preguntas);
      if (!validacion.ok) {
        req.session.error = validacion.error;
        return res.redirect(`/admin/resultados?examen_id=${examen_id}`);
      }

      // Calcular
      const { puntaje_bruto, nota_vigesimal } = calculoService.calcular(
        correctas, incorrectas, en_blanco, examen.total_preguntas
      );

      await Resultado.create({
        examen_id: parseInt(examen_id),
        estudiante_id: parseInt(estudiante_id),
        correctas: parseInt(correctas),
        incorrectas: parseInt(incorrectas),
        en_blanco: parseInt(en_blanco),
        puntaje_bruto,
        nota_vigesimal
      });

      req.session.success = `Resultado registrado. Nota: ${nota_vigesimal.toFixed(4)}`;
      res.redirect(`/admin/resultados?examen_id=${examen_id}`);
    } catch (error) {
      console.error('Error al crear resultado:', error);
      req.session.error = 'Error al registrar resultado.';
      res.redirect(`/admin/resultados?examen_id=${examen_id || ''}`);
    }
  },

  // Carga masiva desde Excel/CSV
  async importar(req, res) {
    const { examen_id } = req.body;
    try {
      if (!req.file) {
        req.session.error = 'Debes seleccionar un archivo.';
        return res.redirect(`/admin/resultados?examen_id=${examen_id || ''}`);
      }

      const examen = await Examen.findByPk(examen_id);
      if (!examen) {
        req.session.error = 'Examen no encontrado.';
        return res.redirect('/admin/resultados');
      }

      // Parsear archivo
      const filas = importService.parsearArchivo(req.file.path);

      // Obtener mapa DNI → estudiante_id
      const estudiantes = await Estudiante.findAll({ attributes: ['id', 'dni'] });
      const dniMap = new Map(estudiantes.map(e => [e.dni, e.id]));

      // Procesar
      const { exitosos, errores } = importService.procesarFilas(filas, examen.total_preguntas, dniMap);

      // Verificar duplicados en BD
      const existentes = await Resultado.findAll({
        where: {
          examen_id,
          estudiante_id: { [Op.in]: exitosos.map(e => e.estudiante_id) }
        },
        attributes: ['estudiante_id']
      });
      const existentesSet = new Set(existentes.map(e => e.estudiante_id));

      const nuevos = [];
      const actualizados = [];

      for (const fila of exitosos) {
        if (existentesSet.has(fila.estudiante_id)) {
          // Actualizar resultado existente
          await Resultado.update(
            {
              correctas: fila.correctas,
              incorrectas: fila.incorrectas,
              en_blanco: fila.en_blanco,
              puntaje_bruto: fila.puntaje_bruto,
              nota_vigesimal: fila.nota_vigesimal
            },
            { where: { examen_id, estudiante_id: fila.estudiante_id } }
          );
          actualizados.push(fila);
        } else {
          nuevos.push({ ...fila, examen_id: parseInt(examen_id) });
        }
      }

      // Insertar nuevos en bulk
      if (nuevos.length > 0) {
        await Resultado.bulkCreate(nuevos);
      }

      // Eliminar archivo temporal
      fs.unlink(req.file.path, () => {});

      // Mensaje de resumen
      const partes = [];
      if (nuevos.length > 0) partes.push(`${nuevos.length} nuevo(s)`);
      if (actualizados.length > 0) partes.push(`${actualizados.length} actualizado(s)`);
      if (errores.length > 0) partes.push(`${errores.length} error(es)`);

      req.session.success = `Importación completada: ${partes.join(', ')}.`;

      if (errores.length > 0) {
        req.session.importErrors = errores;
      }

      res.redirect(`/admin/resultados?examen_id=${examen_id}`);
    } catch (error) {
      console.error('Error en importación:', error);
      if (req.file) fs.unlink(req.file.path, () => {});
      req.session.error = `Error en importación: ${error.message}`;
      res.redirect(`/admin/resultados?examen_id=${examen_id || ''}`);
    }
  },

  // Actualizar un resultado individual
  async update(req, res) {
    const { id } = req.params;
    const { correctas, incorrectas, en_blanco } = req.body;
    try {
      const resultado = await Resultado.findByPk(id, {
        include: [{ association: 'examen' }]
      });

      if (!resultado) {
        req.session.error = 'Resultado no encontrado.';
        return res.redirect('/admin/resultados');
      }

      const validacion = calculoService.validarFila(correctas, incorrectas, en_blanco, resultado.examen.total_preguntas);
      if (!validacion.ok) {
        req.session.error = validacion.error;
        return res.redirect(`/admin/resultados?examen_id=${resultado.examen_id}`);
      }

      const { puntaje_bruto, nota_vigesimal } = calculoService.calcular(
        correctas, incorrectas, en_blanco, resultado.examen.total_preguntas
      );

      await resultado.update({
        correctas: parseInt(correctas),
        incorrectas: parseInt(incorrectas),
        en_blanco: parseInt(en_blanco),
        puntaje_bruto,
        nota_vigesimal
      });

      req.session.success = `Resultado actualizado. Nueva nota: ${nota_vigesimal.toFixed(4)}`;
      res.redirect(`/admin/resultados?examen_id=${resultado.examen_id}`);
    } catch (error) {
      console.error('Error al actualizar resultado:', error);
      req.session.error = 'Error al actualizar resultado.';
      res.redirect('/admin/resultados');
    }
  },

  // Descargar plantilla de resultados por sección
  async plantilla(req, res) {
    try {
      const seccionId = req.query.seccion_id;
      if (!seccionId) {
        req.session.error = 'Debes seleccionar una sección.';
        return res.redirect('/admin/resultados');
      }

      const seccion = await Seccion.findByPk(seccionId);
      if (!seccion) {
        req.session.error = 'Sección no encontrada.';
        return res.redirect('/admin/resultados');
      }

      // Obtener estudiantes de esa sección ordenados por nombre
      const estudiantes = await Estudiante.findAll({
        where: { seccion_id: seccionId },
        include: [{ association: 'usuario', attributes: ['nombre'] }],
        order: [[{ model: Usuario, as: 'usuario' }, 'nombre', 'ASC']]
      });

      if (estudiantes.length === 0) {
        req.session.error = `No hay estudiantes en la sección ${seccion.nombre}.`;
        return res.redirect('/admin/resultados');
      }

      const wb = XLSX.utils.book_new();

      // Encabezados + datos de estudiantes
      const datos = [['dni', 'nombre', 'correctas', 'incorrectas', 'en_blanco']];
      estudiantes.forEach(est => {
        datos.push([est.dni, est.usuario.nombre, '', '', '']);
      });

      const ws = XLSX.utils.aoa_to_sheet(datos);
      ws['!cols'] = [
        { wch: 15 },  // dni
        { wch: 35 },  // nombre
        { wch: 12 },  // correctas
        { wch: 12 },  // incorrectas
        { wch: 12 }   // en_blanco
      ];
      XLSX.utils.book_append_sheet(wb, ws, seccion.nombre);

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      const filename = `plantilla_resultados_${seccion.nombre.replace(/\s+/g, '_')}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Error al generar plantilla de resultados:', error);
      req.session.error = 'Error al generar la plantilla.';
      res.redirect('/admin/resultados');
    }
  },

  // Eliminar resultado
  async destroy(req, res) {
    const { id } = req.params;
    try {
      const resultado = await Resultado.findByPk(id);
      if (!resultado) {
        req.session.error = 'Resultado no encontrado.';
        return res.redirect('/admin/resultados');
      }
      const examenId = resultado.examen_id;
      await resultado.destroy();
      req.session.success = 'Resultado eliminado.';
      res.redirect(`/admin/resultados?examen_id=${examenId}`);
    } catch (error) {
      console.error('Error al eliminar resultado:', error);
      req.session.error = 'Error al eliminar resultado.';
      res.redirect('/admin/resultados');
    }
  }
};

module.exports = resultadosController;
