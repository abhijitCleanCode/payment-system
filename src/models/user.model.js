import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountType: {
      type: DataTypes.ENUM("admin", "employee", "guest"),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    // when a model is queried from the database exclude password unless it is explicitly requested
    defaultScope: {
      attributes: {
        exclude: ["password"],
      },
    },
    // include password in the withPassword scope
    scopes: {
      withPassword: {
        attributes: {
          include: ["password"],
        },
      },
    },
  }
);

// relationship
User.associate = (models) => {
  // a user can have many roles and a role can have many users, so it is a many to many relationship
  User.belongsToMany(models.Role, {
    through: models.UserRole, // linking user table and role table through a junction table called userRole
    foreignKey: "user_id",
    as: "roles",
  });

  // a user can create many headers and a header can be created by only one user, so it is a one to many relationship
  User.hasMany(models.Header, {
    foreignKey: "created_by", // user who created the header, its users.id will be stored in the created_by column to headers table
    as: "created_headers",
  });

  // a user can update many headers and a header can be updated by only one user, so it is a one to many relationship
  User.hasMany(models.HeaderVisibility, {
    foreignKey: "updated_by", // user who updated the header, its users.id will be stored in the updated_by column to headerVisibility table
    as: "visibility_updates",
  });
};

//* naming local hooks is important as it helps in debugging as well as removal become easy

User.addHook("beforeCreate", "hashPassword", async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.addHook("beforeUpdate", "hashPasswordIfChanges", async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

//* defining custom instance methods

User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

User.prototype.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this.id,
      role: this.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export default User;

//! caution: while defining hooks order matters as hooks are execute in given order

// potential update, you can take adv of define model via class.
