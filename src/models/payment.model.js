import { DataTypes } from "sequelize";
import sequelize from "../db/connection";

const Payment = sequelize.define(
  "Payment",
  {
    payeeName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Payee name is required in payment",
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
          msg: "Payment amount is required",
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
      validate: {
        notNull: {
          msg: "Receiver id is required while creating a row in payment table",
        },
      },
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    indexes: [
      { fields: ["receiverId"] },
      { fields: ["transactionType"] }, // transaction type filtering
      { fields: ["createdAt"] }, // date based queries
    ],
  }
);

// relationship
Payment.associate = (models) => {
  // a payment can be made by only one user and a user can make many payments so it is a one to many relationship
  Payment.belongsTo(models.User, {
    foreignKey: "receiverId", // receiverId will be stored in the receiver_id column to payments table
    as: "receiver",
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
