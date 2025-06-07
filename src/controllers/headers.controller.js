import HeaderServices from "../services/header.service.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

// for admin
export const GET_ALL_HEADERS = async function (req, res) {};

// fetch header wrt visibility according to user
export const GET_VISIBLE_HEADER = async function (req, res) {
  const { id: userId, accountType: userRole } = req.user;

  console.log("userRole: ", userRole);

  try {
    const data = await HeaderServices.getVisibleHeader({ userId, userRole });

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Header fetched successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};
