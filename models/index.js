const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Seccion = require('./Seccion');
const Area = require('./Area');
const Carrera = require('./Carrera');
const Estudiante = require('./Estudiante');
const Padre = require('./Padre');
const Examen = require('./Examen');
const Resultado = require('./Resultado');
const Configuracion = require('./Configuracion');

// =============================================
// Asociaciones
// =============================================

// Usuario <-> Estudiante (1:1)
Usuario.hasOne(Estudiante, { foreignKey: 'usuario_id', as: 'estudiante' });
Estudiante.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Usuario <-> Padre (1:1)
Usuario.hasOne(Padre, { foreignKey: 'usuario_id', as: 'padre' });
Padre.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Seccion <-> Estudiante (1:N)
Seccion.hasMany(Estudiante, { foreignKey: 'seccion_id', as: 'estudiantes' });
Estudiante.belongsTo(Seccion, { foreignKey: 'seccion_id', as: 'seccion' });

// Area <-> Carrera (1:N)
Area.hasMany(Carrera, { foreignKey: 'area_id', as: 'carreras' });
Carrera.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

// Area <-> Estudiante (1:N)
Area.hasMany(Estudiante, { foreignKey: 'area_id', as: 'estudiantes' });
Estudiante.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

// Carrera <-> Estudiante (1:N)
Carrera.hasMany(Estudiante, { foreignKey: 'carrera_id', as: 'estudiantes' });
Estudiante.belongsTo(Carrera, { foreignKey: 'carrera_id', as: 'carrera' });

// Padre <-> Estudiante (M:N) mediante tabla pivote
Padre.belongsToMany(Estudiante, {
  through: 'padre_estudiante',
  foreignKey: 'padre_id',
  otherKey: 'estudiante_id',
  as: 'estudiantes',
  timestamps: false
});
Estudiante.belongsToMany(Padre, {
  through: 'padre_estudiante',
  foreignKey: 'estudiante_id',
  otherKey: 'padre_id',
  as: 'padres',
  timestamps: false
});

// Estudiante <-> Resultado (1:N)
Estudiante.hasMany(Resultado, { foreignKey: 'estudiante_id', as: 'resultados' });
Resultado.belongsTo(Estudiante, { foreignKey: 'estudiante_id', as: 'estudiante' });

// Examen <-> Resultado (1:N)
Examen.hasMany(Resultado, { foreignKey: 'examen_id', as: 'resultados' });
Resultado.belongsTo(Examen, { foreignKey: 'examen_id', as: 'examen' });

module.exports = {
  sequelize,
  Usuario,
  Seccion,
  Area,
  Carrera,
  Estudiante,
  Padre,
  Examen,
  Resultado,
  Configuracion
};
