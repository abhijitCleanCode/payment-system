import Payment from "../models/payment.model.js";
import Header from "../models/header.model.js";
import User from "../models/user.model.js";
import sequelize from "../db/connection.js";

import { ApiError } from "../utils/ApiError.utils.js";

class PaymentServices {
  static async makePayment(payment) {
    const {
      payeeId,
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
    } = payment;

    if (
      !payeeId ||
      !payeeName ||
      !amount ||
      !transactionType ||
      !receiverId ||
      !headerId ||
      !headerName
    ) {
      throw new ApiError(400, "Please fill in the required details");
    }

    if (Number(amount) <= 0) {
      throw new ApiError(400, "Amount must be greater than 0");
    }

    if (transactionType === "cash" && bankRefNo) {
      throw new ApiError(
        400,
        "Bank reference number is not required for cash transaction"
      );
    }

    const transaction = await sequelize.transaction();

    try {
      // verify headerId
      const header = await Header.findByPk(headerId, { transaction });
      if (!header) {
        throw new ApiError(404, "Header not found");
      }

      // verify receiverId
      const user = await User.findByPk(receiverId, { transaction });
      if (!user) {
        throw new ApiError(404, "Receiver not found");
      }

      // todo: upload images to cloud if provided

      // crete payment entry in db
      const paymentEntry = await Payment.create(
        {
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
          bankRefNo: transactionType === "cash" ? null : bankRefNo,
          remark,
          transactionRemark,
          receiverId, //this a person who is receiving the payment
          headerId,
          headerName,
        },
        { transaction }
      );
      // ensure db write was successful
      const createdPayment = await Payment.findByPk(paymentEntry.id, {
        transaction,
      });
      if (!createdPayment) {
        throw new ApiError(500, "Payment failed! Please try again.");
      }

      await transaction.commit();

      return createdPayment;
    } catch (error) {
      await transaction.rollback();
      console.log(
        "src :: services :: paymentservices :: makePayment :: error: ",
        error
      );
      throw new ApiError(500, "Payment failed! Please try again.");
    }
  }
}

export default PaymentServices;
