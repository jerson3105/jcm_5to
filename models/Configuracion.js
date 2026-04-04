const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Configuracion = sequelize.define('Configuracion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  clave: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  valor: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'configuracion',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

module.exports = Configuracion;
