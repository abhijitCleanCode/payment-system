import { ApiResponse } from "../utils/ApiResponse.utils.js";
import PaymentServices from "../services/payment.service.js";

export const CREATE_PAYMENT = async function (req, res) {
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
    receiverId,
    headerId,
    headerName,
  } = req.body;
  const { id: payeeId } = req.user;

  try {
    const data = await PaymentServices.makePayment({
      payeeId,
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
      receiverId,
      headerId,
      headerName,
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

export const FILTER_PAYMENTS = async function (req, res) {};
