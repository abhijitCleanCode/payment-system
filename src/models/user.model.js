import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";
import bcrypt from "bcrypt";

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
  },
  {
    timestamps: true,
  }
);

//* naming local hooks is important as it helps in debugging as well as removal become easy

User.addHook("beforeCreate", "hashPassword", async (user) => {
  user.password = awaitbcrypt.hash(user.password, 10);
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

export default User;

//! caution: while defining hooks order matters as hooks are execute in given order

// potential update, you can take adv of define model via class.
