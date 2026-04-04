const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resultado = sequelize.define('Resultado', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  estudiante_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  examen_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  correctas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  incorrectas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  en_blanco: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  puntaje_bruto: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 0.0000
  },
  nota_vigesimal: {
    type: DataTypes.DECIMAL(6, 4),
    allowNull: false,
    defaultValue: 0.0000
  }
}, {
  tableName: 'resultados',
  indexes: [
    {
      unique: true,
      fields: ['estudiante_id', 'examen_id']
    }
  ]
});

module.exports = Resultado;
