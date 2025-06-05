import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import UserRole from "../models/userRole.model.js";
import sequelize from "../db/connection.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

const generate_AccessToken_RefreshToken = async function (userId) {
  // 1. obtain a single entry from the table, using the provided primay key
  const user = await User.findByPk(userId, {
    attributes: ["id", "email", "accountType", "isActive"], // select needed fields
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 2. generate access token and refresh token
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // todo: store refresh token in the user table

  // 3. return access token and refresh token
  return { accessToken, refreshToken };
};

class AdminServices {
  // here goes all the utility functions
  static async createAdmin({ name, email, password, role }) {
    if ([name, email, password, role].some((field) => field.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, "User already exists");
    }

    // make operation atomic, that is, start transaction
    const transaction = await sequelize.transaction();

    try {
      const [userRole] = await Role.findOrCreate({
        where: { name: role.toLowerCase() },
        defaults: { name: role.toLowerCase() },
        transaction,
      });

      const user = await User.create(
        {
          name,
          email,
          password,
          accountType: role.toLowerCase(),
          isActive: true,
        },
        { transaction }
      );

      // assign role
      await UserRole.create(
        {
          user_id: user.id,
          role_id: userRole.id,
        },
        { transaction }
      );

      // generate token
      const { accessToken, refreshToken } =
        await generate_AccessToken_RefreshToken(user.id);

      await transaction.commit();

      return {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          accountType: user.accountType,
          isActive: user.isActive,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      await transaction.rollback();
      console.log("Admin creation failed: ", error);
      throw new ApiError(500, "Failed to create admin");
    }
  }
}

export default AdminServices;
