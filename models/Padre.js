const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Padre = sequelize.define('Padre', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'padres'
});

module.exports = Padre;
