import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Role = sequelize.define(
  "Role",
  {
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "roles",
    timestamps: false,
  }
);

// relationship
Role.associate = (models) => {
  // a role can have many users and a user can have many roles, so it is a many to many relationship
  Role.belongsToMany(models.User, {
    through: models.UserRole, // linking user table and role table through a junction table called userRole
    foreignKey: "role_id", // role_id will be stored in the role_id column to userRole table
    as: "users",
  });

  // a role can see many headers and a header can be seen by many roles, so it is a many to many relationship
  Role.belongsToMany(models.Header, {
    through: models.HeaderVisibility, // join table
    foreignKey: "role_id", // column in join table called headerVisibility
    as: "visible_headers",
  });
};

export default Role;
