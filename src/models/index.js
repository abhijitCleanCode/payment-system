// load all the models and set up their associations

import sequelize from "../db/connection.js";

// models
import User from "./user.model.js";
import Role from "./role.model.js";
import UserRole from "./userRole.model.js";
import Header from "./header.model.js";
import HeaderVisibility from "./headerVisibility.model.js";
import Payment from "./payment.model.js";

const models = {
  User,
  Role,
  UserRole,
  Header,
  HeaderVisibility,
  Payment,
};

Object.keys(models).forEach((modelName) => {
  // applying associations if model has associate
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize, models };
