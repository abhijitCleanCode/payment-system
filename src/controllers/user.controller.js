import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import sequelize from "../db/connection.js";
import UserServices from "../services/user.service.js";

// user(admin, employee, guest) can login to the system. System should differentiate users based on their role and provide different access levels.
export const LOGIN = async function (req, res) {
  const { email, password } = req.body;

  try {
    const { data, accessToken, refreshToken } = await UserServices.login({
      email,
      password,
    });

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { data, accessToken, refreshToken },
          "Login successful"
        )
      );
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const LOG_OUT = async function (req, res) {
  const { userid } = req.user;

  // todo: make a db call to remove refresh token from a specific record in user table

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User log out successfully"));
};

export const CHANGE_CURRENT_PASSWORD = async function (req, res) {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    await UserServices.changeCurrentPassword({
      currentPassword,
      newPassword,
      userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password updated successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// fetch the current logined in user details from user table and return it
export const GET_CURRENT_USER = async function (req, res) {};
