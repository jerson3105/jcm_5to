const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carrera = sequelize.define('Carrera', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  area_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  puntaje_minimo_admision: {
    type: DataTypes.DECIMAL(6, 4),
    defaultValue: 0.0000
  }
}, {
  tableName: 'carreras'
});

module.exports = Carrera;
