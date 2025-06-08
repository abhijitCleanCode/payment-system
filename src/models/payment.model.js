import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const Payment = sequelize.define(
  "Payment",
  {
    payeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      validate: {
        notNull: {
          msg: "Payee ID is required in payment record",
        },
      },
    },
    payeeName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Payee name is required in payment record",
        },
        notEmpty: {
          msg: "Payee name cannot be empty",
        },
      },
    },
    address: {
      type: DataTypes.TEXT,
    },
    pinCode: {
      type: DataTypes.STRING(10),
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Assam",
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "India",
    },
    panNo: {
      type: DataTypes.STRING(10),
    },
    aadharNo: {
      type: DataTypes.STRING(12),
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Payment amount is required in payment record",
        },
        min: {
          // minimum payment amount
          args: [1],
          msg: "Payment amount must be atleast 1",
        },
      },
    },
    transactionType: {
      type: DataTypes.ENUM("cash", "bank"),
      allowNull: false,
      validate: {
        isIn: [["cash", "bank"]],
      },
    },
    bankRefNo: {
      type: DataTypes.STRING(50),
    },
    remark: {
      type: DataTypes.TEXT,
    },
    transactionRemark: {
      type: DataTypes.TEXT,
    },
    receiptPhoto: {
      type: DataTypes.STRING, // file URL
      validate: {
        isUrl: true, // assuming urls
      },
    },
    payeePhoto: {
      type: DataTypes.STRING, // file URL
      validate: {
        isUrl: true,
      },
    },
    receiverPhoto: {
      type: DataTypes.STRING, // file URL
      validate: {
        isUrl: true,
      },
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      validate: {
        notNull: {
          msg: "Receiver id is required in payment record",
        },
      },
    },
    headerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "headers", key: "id" },
      validate: {
        notNull: {
          msg: "Header id is required in payment record",
        },
      },
    },
    headerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Header name is required in payment record",
        },
        notEmpty: {
          msg: "Header name cannot be empty",
        },
      },
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    indexes: [
      { fields: ["receiverId"] },
      { fields: ["payeeId"] },
      { fields: ["transactionType"] }, // transaction type filtering
      { fields: ["createdAt"] }, // date based queries
    ],
  }
);

// relationship
Payment.associate = (models) => {
  // payment can belong to only one user who receives the payment
  Payment.belongsTo(models.User, {
    foreignKey: "receiverId", // receiverId will be stored in the receiver_id column to payments table
    as: "receiver",
  });

  // payment can belong to only one user who made the payment (payee)
  Payment.belongsTo(models.User, {
    foreignKey: "payeeId",
    as: "payee",
  });

  // payment can belong to only one header
  Payment.belongsTo(models.Header, {
    foreignKey: "headerId",
    as: "header",
  });
};

// local hooks defination

Payment.addHook("beforeValidate", async (payment) => {
  // ensure bankRefNo is null for cash transaction
  if (payment.transactionType === "cash") {
    payment.bankRefNo = null;
  }
});

export default Payment;
