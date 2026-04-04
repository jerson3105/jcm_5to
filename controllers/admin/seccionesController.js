const { Seccion, Estudiante } = require('../../models');

const seccionesController = {
  // Listar secciones
  async index(req, res) {
    try {
      const secciones = await Seccion.findAll({
        include: [{ association: 'estudiantes', attributes: ['id'] }],
        order: [['nombre', 'ASC']]
      });
      res.render('admin/secciones', {
        title: 'Secciones',
        layout: 'layouts/admin',
        currentPage: 'secciones',
        secciones
      });
    } catch (error) {
      console.error('Error al listar secciones:', error);
      req.session.error = 'Error al cargar secciones.';
      res.redirect('/admin');
    }
  },

  // Crear sección
  async store(req, res) {
    try {
      const { nombre } = req.body;
      if (!nombre || !nombre.trim()) {
        req.session.error = 'El nombre de la sección es obligatorio.';
        return res.redirect('/admin/secciones');
      }

      const existe = await Seccion.findOne({ where: { nombre: nombre.trim() } });
      if (existe) {
        req.session.error = 'Ya existe una sección con ese nombre.';
        return res.redirect('/admin/secciones');
      }

      await Seccion.create({ nombre: nombre.trim() });
      req.session.success = 'Sección creada correctamente.';
      res.redirect('/admin/secciones');
    } catch (error) {
      console.error('Error al crear sección:', error);
      req.session.error = 'Error al crear la sección.';
      res.redirect('/admin/secciones');
    }
  },

  // Actualizar sección
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      if (!nombre || !nombre.trim()) {
        req.session.error = 'El nombre es obligatorio.';
        return res.redirect('/admin/secciones');
      }

      const seccion = await Seccion.findByPk(id);
      if (!seccion) {
        req.session.error = 'Sección no encontrada.';
        return res.redirect('/admin/secciones');
      }

      const existe = await Seccion.findOne({ where: { nombre: nombre.trim() } });
      if (existe && existe.id !== parseInt(id)) {
        req.session.error = 'Ya existe otra sección con ese nombre.';
        return res.redirect('/admin/secciones');
      }

      await seccion.update({ nombre: nombre.trim() });
      req.session.success = 'Sección actualizada correctamente.';
      res.redirect('/admin/secciones');
    } catch (error) {
      console.error('Error al actualizar sección:', error);
      req.session.error = 'Error al actualizar la sección.';
      res.redirect('/admin/secciones');
    }
  },

  // Eliminar sección
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const seccion = await Seccion.findByPk(id, {
        include: [{ association: 'estudiantes', attributes: ['id'] }]
      });

      if (!seccion) {
        req.session.error = 'Sección no encontrada.';
        return res.redirect('/admin/secciones');
      }

      if (seccion.estudiantes && seccion.estudiantes.length > 0) {
        req.session.error = `No se puede eliminar: tiene ${seccion.estudiantes.length} estudiante(s) asignado(s).`;
        return res.redirect('/admin/secciones');
      }

      await seccion.destroy();
      req.session.success = 'Sección eliminada correctamente.';
      res.redirect('/admin/secciones');
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      req.session.error = 'Error al eliminar la sección.';
      res.redirect('/admin/secciones');
    }
  }
};

module.exports = seccionesController;
