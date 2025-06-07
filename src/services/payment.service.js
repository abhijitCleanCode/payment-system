import Payment from "../models/payment.model.js";
import sequelize from "../db/connection.js";

import { ApiError } from "../utils/ApiError.utils.js";

class PaymentServices {
  static async makePayment(payment) {
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
      userId,
    } = payment;

    if (!payeeName || !amount || !transactionType) {
      throw new ApiError(
        400,
        "Payee name, amount and transaction type are required"
      );
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
      // upload images to cloud if provided

      // crete payment entry in db
      const paymentEntry = await Payment.create(
        {
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
          receiverId: userId, // a bit confused, is this a person who is receiving the payment or the header
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
      transaction.rollback();
      console.log(
        "src :: services :: paymentservices :: makePayment :: error: ",
        error
      );
      throw new ApiError(500, "Payment failed! Please try again.");
    }
  }
}

export default PaymentServices;
