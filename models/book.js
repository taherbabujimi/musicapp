"use strict";
const {
  Model
} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // define association here
      Book.belongsTo(models.Author, {
        source_key: "id",
        foreignKey: "author_id",
      });
    }
  }
  Book.init({
    name: {
      type: DataTypes.STRING
    },
    pages: {
        type: DataTypes.INTEGER
    },
    author_id: {
        type: DataTypes.INTEGER,
    }
  }, {
    sequelize,
    modelName: "Book",
    tableName: "book"
  });
  return Book;
};
