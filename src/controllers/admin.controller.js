import AdminServices from "../services/admin.service.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

export const CREATEADMIN = async function (req, res) {
  const { name, email, password, role = "admin" } = req.body;

  try {
    const data = await AdminServices.createAdmin({
      name,
      email,
      password,
      role,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, data, "Admin created successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const CREATE_USER_BY_ADMIN = async function (req, res) {
  // getting the data from the frontend
  const { name, email, password, role = "guest" } = req.body;

  try {
    const data = await AdminServices.createUserByAdmin({
      name,
      email,
      password,
      role,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, data, "User created successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const CREATE_HEADER_WITH_VISIBILITY = async function (req, res) {
  // 1. getting the header's data from the frontend
  const { name, description, visibilityRules } = req.body;
  const { userId: adminUserId } = req.user;

  try {
    const data = await AdminServices.createHeaderWithVisibility({
      name,
      description,
      visibilityRules,
      adminUserId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, data, "Header created successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};
