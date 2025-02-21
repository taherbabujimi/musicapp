"use strict";

const { Model } = require("sequelize");
const { PERMISSION } = require("../services/constants");
const PERMISSIONS = Object.values(PERMISSION);

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      this.belongsToMany(models.Role, {
        through: "permissions_roles",
        foreignKey: "permission_id",
        otherKey: "role_id",
      });
    }
  }

  Permission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      permission_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      permission: {
        type: DataTypes.ENUM(PERMISSIONS),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Permission",
      tableName: "permissions",
      timestamps: true,
    }
  );

  return Permission;
};
