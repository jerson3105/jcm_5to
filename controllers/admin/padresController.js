const bcrypt = require('bcryptjs');
const { Usuario, Padre, Estudiante, Seccion } = require('../../models');
const { Op } = require('sequelize');

const padresController = {
  // Listar padres
  async index(req, res) {
    try {
      const [padres, estudiantesList] = await Promise.all([
        Padre.findAll({
          include: [
            { association: 'usuario', attributes: ['id', 'nombre', 'email', 'activo'] },
            {
              association: 'estudiantes',
              include: [
                { association: 'usuario', attributes: ['nombre'] },
                { association: 'seccion', attributes: ['nombre'] }
              ]
            }
          ],
          order: [[{ model: Usuario, as: 'usuario' }, 'nombre', 'ASC']]
        }),
        Estudiante.findAll({
          include: [
            { association: 'usuario', attributes: ['nombre'] },
            { association: 'seccion', attributes: ['nombre'] }
          ],
          order: [[{ model: Usuario, as: 'usuario' }, 'nombre', 'ASC']]
        })
      ]);

      res.render('admin/padres', {
        title: 'Padres de Familia',
        layout: 'layouts/admin',
        currentPage: 'padres',
        padres,
        estudiantesList
      });
    } catch (error) {
      console.error('Error al listar padres:', error);
      req.session.error = 'Error al cargar padres.';
      res.redirect('/admin');
    }
  },

  // Crear padre
  async store(req, res) {
    try {
      const { nombre, email, password, estudiantes_ids } = req.body;

      if (!nombre || !email) {
        req.session.error = 'Nombre y email son obligatorios.';
        return res.redirect('/admin/padres');
      }

      const emailExiste = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });
      if (emailExiste) {
        req.session.error = 'Ya existe un usuario con ese email.';
        return res.redirect('/admin/padres');
      }

      const rawPassword = password && password.trim() ? password.trim() : 'padre123';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      const usuario = await Usuario.create({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        rol: 'padre',
        activo: true
      });

      const padre = await Padre.create({ usuario_id: usuario.id });

      // Vincular estudiantes
      if (estudiantes_ids) {
        const ids = Array.isArray(estudiantes_ids) ? estudiantes_ids : [estudiantes_ids];
        await padre.setEstudiantes(ids.map(id => parseInt(id)));
      }

      req.session.success = `Padre "${nombre.trim()}" creado. Contraseña: ${rawPassword}`;
      res.redirect('/admin/padres');
    } catch (error) {
      console.error('Error al crear padre:', error);
      req.session.error = 'Error al crear el padre.';
      res.redirect('/admin/padres');
    }
  },

  // Actualizar padre
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, estudiantes_ids, activo } = req.body;

      const padre = await Padre.findByPk(id, {
        include: [{ association: 'usuario' }]
      });

      if (!padre) {
        req.session.error = 'Padre no encontrado.';
        return res.redirect('/admin/padres');
      }

      if (email && email.trim().toLowerCase() !== padre.usuario.email) {
        const emailExiste = await Usuario.findOne({
          where: { email: email.trim().toLowerCase(), id: { [Op.ne]: padre.usuario_id } }
        });
        if (emailExiste) {
          req.session.error = 'Ya existe otro usuario con ese email.';
          return res.redirect('/admin/padres');
        }
      }

      await padre.usuario.update({
        nombre: (nombre || padre.usuario.nombre).trim(),
        email: email ? email.trim().toLowerCase() : padre.usuario.email,
        activo: activo === 'on' || activo === '1' || activo === true
      });

      // Actualizar vínculos
      if (estudiantes_ids !== undefined) {
        const ids = Array.isArray(estudiantes_ids) ? estudiantes_ids : (estudiantes_ids ? [estudiantes_ids] : []);
        await padre.setEstudiantes(ids.map(id => parseInt(id)));
      }

      req.session.success = 'Padre actualizado correctamente.';
      res.redirect('/admin/padres');
    } catch (error) {
      console.error('Error al actualizar padre:', error);
      req.session.error = 'Error al actualizar el padre.';
      res.redirect('/admin/padres');
    }
  },

  // Eliminar padre
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const padre = await Padre.findByPk(id, {
        include: [{ association: 'usuario' }]
      });

      if (!padre) {
        req.session.error = 'Padre no encontrado.';
        return res.redirect('/admin/padres');
      }

      const nombre = padre.usuario.nombre;
      await padre.usuario.destroy();

      req.session.success = `Padre "${nombre}" eliminado.`;
      res.redirect('/admin/padres');
    } catch (error) {
      console.error('Error al eliminar padre:', error);
      req.session.error = 'Error al eliminar el padre.';
      res.redirect('/admin/padres');
    }
  }
};

module.exports = padresController;
