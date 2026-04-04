const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const fs = require('fs');
const { Usuario, Estudiante, Seccion, Area, Carrera } = require('../../models');
const { Op } = require('sequelize');

const estudiantesController = {
  // Listar estudiantes
  async index(req, res) {
    try {
      const [estudiantes, secciones, areas, carreras] = await Promise.all([
        Estudiante.findAll({
          include: [
            { association: 'usuario', attributes: ['id', 'nombre', 'email', 'activo'] },
            { association: 'seccion', attributes: ['id', 'nombre'] },
            { association: 'area', attributes: ['id', 'nombre'] },
            { association: 'carrera', attributes: ['id', 'nombre'] }
          ],
          order: [[{ model: Usuario, as: 'usuario' }, 'nombre', 'ASC']]
        }),
        Seccion.findAll({ order: [['nombre', 'ASC']] }),
        Area.findAll({ order: [['nombre', 'ASC']] }),
        Carrera.findAll({
          include: [{ association: 'area', attributes: ['id', 'nombre'] }],
          order: [['nombre', 'ASC']]
        })
      ]);

      res.render('admin/estudiantes', {
        title: 'Estudiantes',
        layout: 'layouts/admin',
        currentPage: 'estudiantes',
        estudiantes,
        secciones,
        areas,
        carreras
      });
    } catch (error) {
      console.error('Error al listar estudiantes:', error);
      req.session.error = 'Error al cargar estudiantes.';
      res.redirect('/admin');
    }
  },

  // Crear estudiante
  async store(req, res) {
    try {
      const { nombre, email, dni, seccion_id, area_id, carrera_id, password } = req.body;

      if (!nombre || !email || !dni || !seccion_id) {
        req.session.error = 'Nombre, email, DNI y sección son obligatorios.';
        return res.redirect('/admin/estudiantes');
      }

      // Verificar email duplicado
      const emailExiste = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });
      if (emailExiste) {
        req.session.error = 'Ya existe un usuario con ese email.';
        return res.redirect('/admin/estudiantes');
      }

      // Verificar DNI duplicado
      const dniExiste = await Estudiante.findOne({ where: { dni: dni.trim() } });
      if (dniExiste) {
        req.session.error = 'Ya existe un estudiante con ese DNI.';
        return res.redirect('/admin/estudiantes');
      }

      // Password: usar DNI como contraseña por defecto si no se proporciona
      const rawPassword = password && password.trim() ? password.trim() : dni.trim();
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      // Crear usuario
      const usuario = await Usuario.create({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        rol: 'estudiante',
        activo: true
      });

      // Crear estudiante
      await Estudiante.create({
        usuario_id: usuario.id,
        dni: dni.trim(),
        seccion_id: parseInt(seccion_id),
        area_id: area_id ? parseInt(area_id) : null,
        carrera_id: carrera_id ? parseInt(carrera_id) : null
      });

      req.session.success = `Estudiante "${nombre.trim()}" creado. Contraseña: ${rawPassword}`;
      res.redirect('/admin/estudiantes');
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      req.session.error = 'Error al crear el estudiante.';
      res.redirect('/admin/estudiantes');
    }
  },

  // Actualizar estudiante
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, dni, seccion_id, area_id, carrera_id, activo } = req.body;

      const estudiante = await Estudiante.findByPk(id, {
        include: [{ association: 'usuario' }]
      });

      if (!estudiante) {
        req.session.error = 'Estudiante no encontrado.';
        return res.redirect('/admin/estudiantes');
      }

      // Verificar email duplicado
      if (email && email.trim().toLowerCase() !== estudiante.usuario.email) {
        const emailExiste = await Usuario.findOne({
          where: { email: email.trim().toLowerCase(), id: { [Op.ne]: estudiante.usuario_id } }
        });
        if (emailExiste) {
          req.session.error = 'Ya existe otro usuario con ese email.';
          return res.redirect('/admin/estudiantes');
        }
      }

      // Verificar DNI duplicado
      if (dni && dni.trim() !== estudiante.dni) {
        const dniExiste = await Estudiante.findOne({
          where: { dni: dni.trim(), id: { [Op.ne]: parseInt(id) } }
        });
        if (dniExiste) {
          req.session.error = 'Ya existe otro estudiante con ese DNI.';
          return res.redirect('/admin/estudiantes');
        }
      }

      // Actualizar usuario
      await estudiante.usuario.update({
        nombre: (nombre || estudiante.usuario.nombre).trim(),
        email: email ? email.trim().toLowerCase() : estudiante.usuario.email,
        activo: activo === 'on' || activo === '1' || activo === true
      });

      // Actualizar estudiante
      await estudiante.update({
        dni: (dni || estudiante.dni).trim(),
        seccion_id: seccion_id ? parseInt(seccion_id) : estudiante.seccion_id,
        area_id: area_id ? parseInt(area_id) : null,
        carrera_id: carrera_id ? parseInt(carrera_id) : null
      });

      req.session.success = 'Estudiante actualizado correctamente.';
      res.redirect('/admin/estudiantes');
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      req.session.error = 'Error al actualizar el estudiante.';
      res.redirect('/admin/estudiantes');
    }
  },

  // Reset contraseña (a DNI)
  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const estudiante = await Estudiante.findByPk(id, {
        include: [{ association: 'usuario' }]
      });

      if (!estudiante) {
        req.session.error = 'Estudiante no encontrado.';
        return res.redirect('/admin/estudiantes');
      }

      const newPassword = estudiante.dni;
      const hashed = await bcrypt.hash(newPassword, 10);
      await estudiante.usuario.update({ password: hashed });

      req.session.success = `Contraseña restablecida a: ${newPassword}`;
      res.redirect('/admin/estudiantes');
    } catch (error) {
      console.error('Error al resetear contraseña:', error);
      req.session.error = 'Error al restablecer la contraseña.';
      res.redirect('/admin/estudiantes');
    }
  },

  // Eliminar estudiante
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const estudiante = await Estudiante.findByPk(id, {
        include: [{ association: 'usuario' }]
      });

      if (!estudiante) {
        req.session.error = 'Estudiante no encontrado.';
        return res.redirect('/admin/estudiantes');
      }

      const nombre = estudiante.usuario.nombre;
      // Eliminar usuario (cascadea a estudiante)
      await estudiante.usuario.destroy();

      req.session.success = `Estudiante "${nombre}" eliminado.`;
      res.redirect('/admin/estudiantes');
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      req.session.error = 'Error al eliminar el estudiante.';
      res.redirect('/admin/estudiantes');
    }
  },

  // Descargar plantilla Excel
  async plantilla(req, res) {
    try {
      // Obtener áreas y carreras para incluir como referencia
      const [areas, carreras] = await Promise.all([
        Area.findAll({ order: [['nombre', 'ASC']] }),
        Carrera.findAll({
          include: [{ association: 'area', attributes: ['nombre'] }],
          order: [['nombre', 'ASC']]
        })
      ]);

      const wb = XLSX.utils.book_new();

      // Hoja principal con encabezados y fila de ejemplo (sin sección)
      const datosEjemplo = [
        ['nombre', 'email', 'dni', 'area', 'carrera'],
        ['Juan Pérez García', 'juan.perez@email.com', '72345678', areas[0]?.nombre || 'Área A', carreras[0]?.nombre || 'Ing. Civil']
      ];
      const wsEstudiantes = XLSX.utils.aoa_to_sheet(datosEjemplo);
      wsEstudiantes['!cols'] = [
        { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 25 }
      ];
      XLSX.utils.book_append_sheet(wb, wsEstudiantes, 'Estudiantes');

      // Hoja de referencia: áreas disponibles
      const refAreas = [['Áreas disponibles']];
      areas.forEach(a => refAreas.push([a.nombre]));
      const wsAreas = XLSX.utils.aoa_to_sheet(refAreas);
      wsAreas['!cols'] = [{ wch: 25 }];
      XLSX.utils.book_append_sheet(wb, wsAreas, 'Áreas');

      // Hoja de referencia: carreras disponibles
      const refCarreras = [['Carrera', 'Área']];
      carreras.forEach(c => refCarreras.push([c.nombre, c.area ? c.area.nombre : '']));
      const wsCarr = XLSX.utils.aoa_to_sheet(refCarreras);
      wsCarr['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsCarr, 'Carreras');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename=plantilla_estudiantes.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Error al generar plantilla:', error);
      req.session.error = 'Error al generar la plantilla.';
      res.redirect('/admin/estudiantes');
    }
  },

  // Importar estudiantes desde Excel/CSV
  async importar(req, res) {
    try {
      if (!req.file) {
        req.session.error = 'Debes seleccionar un archivo.';
        return res.redirect('/admin/estudiantes');
      }

      // La sección se selecciona en el formulario, no viene en el Excel
      const seccionId = req.body.seccion_id;
      if (!seccionId) {
        req.session.error = 'Debes seleccionar una sección.';
        fs.unlink(req.file.path, () => {});
        return res.redirect('/admin/estudiantes');
      }

      // Verificar que la sección existe
      const seccion = await Seccion.findByPk(seccionId);
      if (!seccion) {
        req.session.error = 'La sección seleccionada no existe.';
        fs.unlink(req.file.path, () => {});
        return res.redirect('/admin/estudiantes');
      }

      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (rows.length === 0) {
        req.session.error = 'El archivo está vacío.';
        fs.unlink(req.file.path, () => {});
        return res.redirect('/admin/estudiantes');
      }

      // Cargar áreas y carreras como mapas nombre → id
      const [areas, carreras] = await Promise.all([
        Area.findAll(),
        Carrera.findAll()
      ]);
      const areaMap = new Map(areas.map(a => [a.nombre.toLowerCase().trim(), a.id]));
      const carreraMap = new Map(carreras.map(c => [c.nombre.toLowerCase().trim(), c.id]));

      // Cargar DNIs y emails existentes
      const [estudiantesExist, usuariosExist] = await Promise.all([
        Estudiante.findAll({ attributes: ['dni'] }),
        Usuario.findAll({ attributes: ['email'] })
      ]);
      const dnisExistentes = new Set(estudiantesExist.map(e => e.dni));
      const emailsExistentes = new Set(usuariosExist.map(u => u.email));

      const exitosos = [];
      const errores = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const fila = i + 2; // fila en Excel (1=header)

        // Normalizar nombres de columnas
        const keys = Object.keys(row);
        const find = (names) => {
          for (const name of names) {
            const key = keys.find(k => k.trim().toLowerCase().replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u') === name);
            if (key !== undefined) return row[key];
          }
          return undefined;
        };

        const nombre = find(['nombre', 'nombres', 'nombre_completo', 'alumno']);
        const email = find(['email', 'correo', 'correo_electronico']);
        const dni = find(['dni', 'codigo', 'cod', 'documento']);
        const area = find(['area', 'área']);
        const carrera = find(['carrera', 'carrera_referencial']);

        // Validaciones
        if (!nombre || !String(nombre).trim()) {
          errores.push({ fila, error: 'Nombre vacío' });
          continue;
        }
        if (!email || !String(email).trim()) {
          errores.push({ fila, error: 'Email vacío' });
          continue;
        }
        if (!dni || !String(dni).trim()) {
          errores.push({ fila, error: 'DNI vacío' });
          continue;
        }

        const emailNorm = String(email).trim().toLowerCase();
        const dniNorm = String(dni).trim();

        // Verificar duplicados
        if (dnisExistentes.has(dniNorm)) {
          errores.push({ fila, error: `DNI "${dniNorm}" ya existe` });
          continue;
        }
        if (emailsExistentes.has(emailNorm)) {
          errores.push({ fila, error: `Email "${emailNorm}" ya existe` });
          continue;
        }

        // Buscar área (opcional)
        let areaId = null;
        if (area && String(area).trim()) {
          const areaNorm = String(area).trim().toLowerCase();
          areaId = areaMap.get(areaNorm) || null;
          if (!areaId) {
            errores.push({ fila, error: `Área "${area}" no encontrada` });
            continue;
          }
        }

        // Buscar carrera (opcional)
        let carreraId = null;
        if (carrera && String(carrera).trim()) {
          carreraId = carreraMap.get(String(carrera).trim().toLowerCase()) || null;
        }

        // Crear usuario + estudiante
        const rawPassword = dniNorm;
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const usuario = await Usuario.create({
          nombre: String(nombre).trim(),
          email: emailNorm,
          password: hashedPassword,
          rol: 'estudiante',
          activo: true
        });

        await Estudiante.create({
          usuario_id: usuario.id,
          dni: dniNorm,
          seccion_id: seccionId,
          area_id: areaId,
          carrera_id: carreraId
        });

        // Marcar como existentes para filas siguientes del mismo archivo
        dnisExistentes.add(dniNorm);
        emailsExistentes.add(emailNorm);
        exitosos.push(dniNorm);
      }

      // Eliminar archivo temporal
      fs.unlink(req.file.path, () => {});

      const partes = [];
      if (exitosos.length > 0) partes.push(`${exitosos.length} creado(s)`);
      if (errores.length > 0) partes.push(`${errores.length} error(es)`);
      req.session.success = `Importación completada: ${partes.join(', ')}. Contraseña = DNI.`;

      if (errores.length > 0) {
        req.session.importErrors = errores;
      }

      res.redirect('/admin/estudiantes');
    } catch (error) {
      console.error('Error en importación de estudiantes:', error);
      if (req.file) fs.unlink(req.file.path, () => {});
      req.session.error = `Error en importación: ${error.message}`;
      res.redirect('/admin/estudiantes');
    }
  }
};

module.exports = estudiantesController;
