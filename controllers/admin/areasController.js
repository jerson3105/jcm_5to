const { Area, Carrera, Estudiante } = require('../../models');

const areasController = {
  // Listar áreas con sus carreras
  async index(req, res) {
    try {
      const areas = await Area.findAll({
        include: [
          { association: 'carreras', order: [['nombre', 'ASC']] },
          { association: 'estudiantes', attributes: ['id'] }
        ],
        order: [['nombre', 'ASC']]
      });
      res.render('admin/areas', {
        title: 'Áreas y Carreras',
        layout: 'layouts/admin',
        currentPage: 'areas',
        areas
      });
    } catch (error) {
      console.error('Error al listar áreas:', error);
      req.session.error = 'Error al cargar áreas.';
      res.redirect('/admin');
    }
  },

  // Crear área
  async storeArea(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      if (!nombre || !nombre.trim()) {
        req.session.error = 'El nombre del área es obligatorio.';
        return res.redirect('/admin/areas');
      }

      const existe = await Area.findOne({ where: { nombre: nombre.trim() } });
      if (existe) {
        req.session.error = 'Ya existe un área con ese nombre.';
        return res.redirect('/admin/areas');
      }

      await Area.create({ nombre: nombre.trim(), descripcion: (descripcion || '').trim() });
      req.session.success = 'Área creada correctamente.';
      res.redirect('/admin/areas');
    } catch (error) {
      console.error('Error al crear área:', error);
      req.session.error = 'Error al crear el área.';
      res.redirect('/admin/areas');
    }
  },

  // Actualizar área
  async updateArea(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;

      const area = await Area.findByPk(id);
      if (!area) {
        req.session.error = 'Área no encontrada.';
        return res.redirect('/admin/areas');
      }

      if (!nombre || !nombre.trim()) {
        req.session.error = 'El nombre es obligatorio.';
        return res.redirect('/admin/areas');
      }

      const existe = await Area.findOne({ where: { nombre: nombre.trim() } });
      if (existe && existe.id !== parseInt(id)) {
        req.session.error = 'Ya existe otra área con ese nombre.';
        return res.redirect('/admin/areas');
      }

      await area.update({ nombre: nombre.trim(), descripcion: (descripcion || '').trim() });
      req.session.success = 'Área actualizada correctamente.';
      res.redirect('/admin/areas');
    } catch (error) {
      console.error('Error al actualizar área:', error);
      req.session.error = 'Error al actualizar el área.';
      res.redirect('/admin/areas');
    }
  },

  // Eliminar área
  async destroyArea(req, res) {
    try {
      const { id } = req.params;
      const area = await Area.findByPk(id, {
        include: [
          { association: 'carreras', attributes: ['id'] },
          { association: 'estudiantes', attributes: ['id'] }
        ]
      });

      if (!area) {
        req.session.error = 'Área no encontrada.';
        return res.redirect('/admin/areas');
      }

      if (area.estudiantes && area.estudiantes.length > 0) {
        req.session.error = `No se puede eliminar: tiene ${area.estudiantes.length} estudiante(s) asignado(s).`;
        return res.redirect('/admin/areas');
      }

      await area.destroy();
      req.session.success = 'Área eliminada correctamente (y sus carreras).';
      res.redirect('/admin/areas');
    } catch (error) {
      console.error('Error al eliminar área:', error);
      req.session.error = 'Error al eliminar el área.';
      res.redirect('/admin/areas');
    }
  },

  // Crear carrera dentro de un área
  async storeCarrera(req, res) {
    try {
      const { nombre, area_id, puntaje_minimo_admision } = req.body;

      if (!nombre || !nombre.trim() || !area_id) {
        req.session.error = 'Nombre y área son obligatorios.';
        return res.redirect('/admin/areas');
      }

      const area = await Area.findByPk(area_id);
      if (!area) {
        req.session.error = 'Área no encontrada.';
        return res.redirect('/admin/areas');
      }

      await Carrera.create({
        nombre: nombre.trim(),
        area_id: parseInt(area_id),
        puntaje_minimo_admision: parseFloat(puntaje_minimo_admision) || 0
      });
      req.session.success = 'Carrera creada correctamente.';
      res.redirect('/admin/areas');
    } catch (error) {
      console.error('Error al crear carrera:', error);
      req.session.error = 'Error al crear la carrera.';
      res.redirect('/admin/areas');
    }
  },

  // Actualizar carrera
  async updateCarrera(req, res) {
    try {
      const { id } = req.params;
      const { nombre, puntaje_minimo_admision } = req.body;

      const carrera = await Carrera.findByPk(id);
      if (!carrera) {
        req.session.error = 'Carrera no encontrada.';
        return res.redirect('/admin/areas');
      }

      await carrera.update({
        nombre: (nombre || carrera.nombre).trim(),
        puntaje_minimo_admision: parseFloat(puntaje_minimo_admision) || carrera.puntaje_minimo_admision
      });
      req.session.success = 'Carrera actualizada correctamente.';
      res.redirect('/admin/areas');
    } catch (error) {
      console.error('Error al actualizar carrera:', error);
      req.session.error = 'Error al actualizar la carrera.';
      res.redirect('/admin/areas');
    }
  },

  // Eliminar carrera
  async destroyCarrera(req, res) {
    try {
      const { id } = req.params;
      const carrera = await Carrera.findByPk(id, {
        include: [{ association: 'estudiantes', attributes: ['id'] }]
      });

      if (!carrera) {
        req.session.error = 'Carrera no encontrada.';
        return res.redirect('/admin/areas');
      }

      if (carrera.estudiantes && carrera.estudiantes.length > 0) {
        req.session.error = `No se puede eliminar: tiene ${carrera.estudiantes.length} estudiante(s).`;
        return res.redirect('/admin/areas');
      }

      await carrera.destroy();
      req.session.success = 'Carrera eliminada correctamente.';
      res.redirect('/admin/areas');
    } catch (error) {
      console.error('Error al eliminar carrera:', error);
      req.session.error = 'Error al eliminar la carrera.';
      res.redirect('/admin/areas');
    }
  }
};

module.exports = areasController;
