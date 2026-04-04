const { Examen, Resultado } = require('../../models');

const examenesController = {
  // Listar exámenes
  async index(req, res) {
    try {
      const examenes = await Examen.findAll({
        include: [{ association: 'resultados', attributes: ['id'] }],
        order: [['fecha', 'DESC']]
      });
      res.render('admin/examenes', {
        title: 'Exámenes',
        layout: 'layouts/admin',
        currentPage: 'examenes',
        examenes
      });
    } catch (error) {
      console.error('Error al listar exámenes:', error);
      req.session.error = 'Error al cargar exámenes.';
      res.redirect('/admin');
    }
  },

  // Crear examen
  async store(req, res) {
    try {
      const { tipo, fecha, total_preguntas, descripcion } = req.body;

      if (!tipo || !fecha || !total_preguntas) {
        req.session.error = 'Tipo, fecha y total de preguntas son obligatorios.';
        return res.redirect('/admin/examenes');
      }

      await Examen.create({
        tipo,
        fecha,
        total_preguntas: parseInt(total_preguntas),
        descripcion: (descripcion || '').trim()
      });

      req.session.success = 'Examen creado correctamente.';
      res.redirect('/admin/examenes');
    } catch (error) {
      console.error('Error al crear examen:', error);
      req.session.error = 'Error al crear el examen.';
      res.redirect('/admin/examenes');
    }
  },

  // Actualizar examen
  async update(req, res) {
    try {
      const { id } = req.params;
      const { tipo, fecha, total_preguntas, descripcion } = req.body;

      const examen = await Examen.findByPk(id);
      if (!examen) {
        req.session.error = 'Examen no encontrado.';
        return res.redirect('/admin/examenes');
      }

      await examen.update({
        tipo: tipo || examen.tipo,
        fecha: fecha || examen.fecha,
        total_preguntas: total_preguntas ? parseInt(total_preguntas) : examen.total_preguntas,
        descripcion: descripcion !== undefined ? descripcion.trim() : examen.descripcion
      });

      req.session.success = 'Examen actualizado correctamente.';
      res.redirect('/admin/examenes');
    } catch (error) {
      console.error('Error al actualizar examen:', error);
      req.session.error = 'Error al actualizar el examen.';
      res.redirect('/admin/examenes');
    }
  },

  // Eliminar examen
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const examen = await Examen.findByPk(id, {
        include: [{ association: 'resultados', attributes: ['id'] }]
      });

      if (!examen) {
        req.session.error = 'Examen no encontrado.';
        return res.redirect('/admin/examenes');
      }

      if (examen.resultados && examen.resultados.length > 0) {
        req.session.error = `No se puede eliminar: tiene ${examen.resultados.length} resultado(s) asociado(s).`;
        return res.redirect('/admin/examenes');
      }

      await examen.destroy();
      req.session.success = 'Examen eliminado correctamente.';
      res.redirect('/admin/examenes');
    } catch (error) {
      console.error('Error al eliminar examen:', error);
      req.session.error = 'Error al eliminar el examen.';
      res.redirect('/admin/examenes');
    }
  }
};

module.exports = examenesController;
