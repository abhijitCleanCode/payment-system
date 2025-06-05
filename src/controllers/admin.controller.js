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
