import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import UserRole from "../models/userRole.model.js";
import Header from "../models/header.model.js";
import HeaderVisibility from "../models/headerVisibility.model.js";
import sequelize from "../db/connection.js";

import { ApiError } from "../utils/ApiError.utils.js";

const generate_AccessToken_RefreshToken = async function (userId, transaction) {
  // 1. obtain a single entry from the table, using the provided primay key
  const user = await User.findByPk(userId, {
    attributes: ["id", "email", "accountType", "isActive"],
    transaction,
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

      console.log("adminservices :: create admin :: userRole: ", userRole);

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

      console.log("adminservices :: create admin :: user: ", user);

      const createdUser = await User.findByPk(user.id, {
        attributes: { exclude: ["password"] },
        transaction,
      }); // include in the scope of current transaction, so that the query can see the changes made in the db by the current transaction
      if (!createdUser) {
        throw new ApiError(404, "User not found");
      }

      console.log(
        "adminservices :: create admin :: createdUser: ",
        createdUser
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
        await generate_AccessToken_RefreshToken(user.id, transaction);

      await transaction.commit();

      return {
        user: createdUser,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      await transaction.rollback();
      console.log(
        "src :: services :: admin services :: create admin :: error: ",
        error
      );
      throw new ApiError(500, "Failed to create admin");
    }
  }

  // admin has the priviledge to assign password to any user which can be changes later by the user
  static async createUserByAdmin({ name, email, password, role }) {
    if ([name, email, password, role].some((field) => field.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    if (!["employee", "guest"].includes(role.toLowerCase())) {
      throw new ApiError(
        400,
        "Invalid role Only 'employee' or 'guest' allowed."
      );
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, "User already exists");
    }

    // start the transaction
    const transaction = await sequelize.transaction();

    try {
      const [userRole, created] = await Role.findOrCreate({
        where: { name: role.toLowerCase() }, // find
        defaults: { name: role.toLowerCase() }, // create if not found
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

      // ensure that db write was successful
      const createdUser = await User.findByPk(user.id, {
        attributes: { exclude: ["password"] },
        transaction,
      });
      if (!createdUser) {
        throw new ApiError(
          500,
          "Admin failed to create user, user verification failed"
        );
      }

      // asign role
      await UserRole.create(
        {
          user_id: user.id,
          role_id: userRole.id,
        },
        { transaction }
      );

      await transaction.commit();

      return {
        data: createdUser,
      };
    } catch (error) {
      await transaction.rollback();
      console.log(
        "src :: services :: admin services :: createUserByAdmin :: error: ",
        error
      );
      throw new ApiError(500, "Admin failed to create user");
    }
  }

  static async createHeaderWithVisibility({
    name,
    description,
    visibilityRules = [],
    adminUserId,
  }) {
    if (!name) {
      throw new ApiError(400, "Please fill the required details");
    }

    if (!Array.isArray(visibilityRules) || visibilityRules.length === 0) {
      throw new ApiError(400, "Please fill the visibility details");
    }

    // start transaction
    const transaction = await sequelize.transaction();

    try {
      // 2. create a new header model and calls save on it
      const header = await Header.create(
        {
          name,
          description,
          created_by: adminUserId,
        },
        { transaction }
      );

      console.log(
        "src :: services :: admin services :: createHeaderWithVisibility :: header: ",
        header
      );

      // ensure db write was successful
      const createdHeader = await Header.findByPk(header.id, {
        transaction,
      });
      if (!createdHeader) {
        throw new ApiError(
          500,
          "Admin failed to create header, header verification failed"
        );
      }

      console.log(
        "src :: services :: admin services :: createHeaderWithVisibility :: createdHeader: ",
        createdHeader
      );

      const visibilityRecords = [];

      // decide visibility wrt user role
      await Promise.all(
        visibilityRules.map(async (rule) => {
          const [role] = await Role.findOrCreate({
            where: { name: rule.roleName.toLowerCase() },
            defaults: { name: rule.roleName.toLowerCase() },
            transaction,
          });

          if (!role) {
            throw new ApiError(
              500,
              `Role ${rule.roleName} could not found or created`
            );
          }

          await HeaderVisibility.create(
            {
              headerId: header.id,
              roleId: role.id,
              is_visible: rule.isVisible,
              updated_by: adminUserId,
            },
            { transaction }
          );

          visibilityRecords.push({
            roleName: role.name,
            isVisible: rule.isVisible,
          });
        })
      );

      await transaction.commit();

      return {
        data: createdHeader,
        visibilityRules: visibilityRecords,
      };
    } catch (error) {
      await transaction.rollback();
      console.error(
        // Use console.error for actual errors
        "src :: services :: admin services :: createHeaderWithVisibility :: error: ",
        error // Log the actual error object
      );
      throw new ApiError(500, "Admin failed to create header");
    }
  }

  // admin can filter out from all payment in db wrt to month

  // admin can make payment on behalf of any user

  // admin can get all time payment data of any user in db to see payment report
}

export default AdminServices;
