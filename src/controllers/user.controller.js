import { raw } from "express";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import sequelize from "../db/connection.js";

const generate_AccessToken_RefreshToken = async function (userId) {
  try {
    // 1. obtain a single entry from the table, using the provided primay key
    const user = await User.findByPk(userId, {
      attributes: ["id", "email", "password"], // select needed fields
      // raw: true, // return the result as a plain js obj, cautions it can break association and return data unexpectedly
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
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

// user(admin, employee, guest) can login to the system. System should differentiate users based on their role and provide different access levels.
export const login = async function (req, res) {
  const { email, password } = req.body;
  const transaction = await sequelize.transaction();

  try {
    if ([email, password].some((field) => field.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } =
      await generate_AccessToken_RefreshToken(user.id);

    // set cookies and return
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      accessToken,
      // Don't send refreshToken in response body when using cookies
    });
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};
