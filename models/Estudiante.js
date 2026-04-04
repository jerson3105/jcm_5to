const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Estudiante = sequelize.define('Estudiante', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  dni: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  seccion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  area_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  carrera_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'estudiantes'
});

module.exports = Estudiante;
