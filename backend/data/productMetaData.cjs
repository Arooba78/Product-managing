const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('products', 'products', 'arooba777', {
  host: 'localhost',
  dialect: 'postgres',
});

const ProductMetadata = sequelize.define('ProductMetadata', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.STRING,
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'product_metadata',
  timestamps: false,
});

module.exports = { sequelize, ProductMetadata };
