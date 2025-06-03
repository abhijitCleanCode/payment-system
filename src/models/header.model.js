import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Header = sequelize.define(
  "Header",
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "headers",
    timestamps: true,
    updatedAt: false,
  }
);

// relationship
Header.associate = (models) => {
  // a header can be created by only one user
  Header.belongsTo(models.User, {
    foreignKey: "created_by", // add created_by column to headers table, referencing users.id
    as: "creator", // alias for created_by column in headers table
    onDelete: "SET NULL", // if the user is deleted, set the created_by column to null. OR "CASCADE" to delete headers
  });
  // a header can be visible to many roles and a role can be visible to many headers
  Header.belongsToMany(models.Role, {
    through: models.HeaderVisibility,
    foreignKey: "header_id",
    as: "visibility_rules",
  });
};

export default Header;
