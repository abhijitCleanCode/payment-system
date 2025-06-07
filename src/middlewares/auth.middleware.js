import jwt from "jsonwebtoken";

import { models } from "../models/index.js";
const { User, Role } = models;

import { ApiError } from "../utils/ApiError.utils.js";

export const VERIFY_TOKEN = async (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findOne({
      where: { id: decodedToken.id },
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid token: user not found");
    }

    console.log(
      "src :: middleware :: auth.middleware :: verify token :: user: ",
      user
    );

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
