import { ApiResponse } from "../utils/ApiResponse.utils";

export const MAKE_PAYMENT = async function (req, res) {
  const {
    payeeName,
    address,
    pinCode,
    state = "Assam",
    country = "India",
    panNo,
    aadharNo,
    amount,
    transactionType,
    bankRefNo,
    remark,
    transactionRemark,
  } = req.body;
  const { userId } = req.user;

  try {
    const data = await PaymentServices.makePayment({
      payeeName,
      address,
      pinCode,
      state,
      country,
      panNo,
      aadharNo,
      amount,
      transactionType,
      bankRefNo,
      remark,
      transactionRemark,
      userId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, data, "Payment made successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// is it really required if admin is already filtering the payments wrt to month
export const GET_ALL_PAYMENTS = async function (req, res) {};

// GET PAYMENTS SPECIFIC TO USER, to see user payment report
export const GET_USER_PAYMENTS = async function (req, res) {};
