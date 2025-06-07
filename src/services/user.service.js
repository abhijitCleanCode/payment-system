import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import sequelize from "../db/connection.js";

import { ApiError } from "../utils/ApiError.utils.js";

const generate_AccessToken_RefreshToken = async function (userId) {
  try {
    // 1. obtain a single entry from the table, using the provided primay key
    const user = await User.findByPk(userId);

    console.log(
      "user services :: generate_AccessToken_RefreshToken :: user: ",
      user
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // 2. generate access token and refresh token
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // todo: store refresh token in the user table

    // 3. return access token and refresh token
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

class UserServices {
  static async login({ email, password }) {
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    try {
      const user = await User.scope("withPassword").findOne({
        where: { email },
        include: [
          {
            model: Role,
            as: "roles",
            attributes: ["name"],
            // exclude the join table attributes (userRole)
            through: { attributes: [] },
          },
        ],
      });

      console.log("user services :: login :: user: ", user);

      if (!user) {
        throw new ApiError(404, "User does not exist");
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new ApiError(401, "Email or Password does not match");
      }

      console.log(
        "user services :: login :: isPasswordValid: ",
        isPasswordValid
      );

      console.log("user services :: login :: user id: ", user.id);

      const { accessToken, refreshToken } =
        await generate_AccessToken_RefreshToken(user.id);

      return {
        data: user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log("user services :: login :: error: ", error);
      throw new ApiError(500, "User login failed");
    }
  }

  static async changeCurrentPassword({ currentPassword, newPassword, userId }) {
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Current password and new password are required");
    }

    if (currentPassword === newPassword) {
      throw new ApiError(400, "Please enter a different password");
    }

    const user = await User.scope("withPassword").findByPk(userId);
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, "Current password does not match");
    }

    const transaction = await sequelize.transaction();

    try {
      // beforeUpdate hook handle hashing
      await user.update({ password: newPassword }, { transaction });

      await transaction.commit();

      // todo: send email

      return { message: "Password updated successfully" };
    } catch (error) {
      await transaction.rollback();
      console.log("user services :: changeCurrentPassword :: error: ", error);
      throw new ApiError(500, "Failed to update password");
    }
  }
}

export default UserServices;
