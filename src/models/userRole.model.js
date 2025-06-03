// this is a join table that links users and roles, into a many to many relationship

import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const UserRole = sequelize.define(
  "UserRole",
  {},
  {
    tableName: "user_roles",
    timestamps: false,
    underscored: true, // convert camel case to snake case (userId -> user_id)
  }
);

// relationship
UserRole.associate = (models) => {
  // a user can have many roles and a role can have many users
  UserRole.belongsTo(models.User, {
    foreignKey: "userId", // each UserRole record belongs to exactly one User
    as: "user",
  });
  UserRole.belongsTo(models.Role, {
    foreignKey: "roleId", // each UserRole record belongs to exactly one Role
    as: "role",
  });
};

export default UserRole;
