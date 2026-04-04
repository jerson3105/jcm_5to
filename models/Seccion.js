const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Seccion = sequelize.define('Seccion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'secciones'
});

module.exports = Seccion;
