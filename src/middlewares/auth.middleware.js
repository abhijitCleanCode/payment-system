import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import Role from "../models/role.model.js";

import { ApiError } from "../utils/ApiError.utils.js";

export const VERIFY_TOKEN = async (req, resizeBy, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findOne({
      where: { id: decodedToken.userId },
      include: [
        {
          model: Role,
          attributes: ["name"],
        },
      ],
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid token: user not found");
    }

    console.log("auth.middleware :: verify token :: user: ", user);

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in VERIFY_TOKEN middleware:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return resizeBy.status(401).json({ message: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return resizeBy.status(401).json({ message: "Token expired" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
