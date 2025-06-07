// junction table that connects header and role, track visibility and who updated it (which admin)
import { DataTypes } from "sequelize";
import sequelize from "../db/connection.js";

const HeaderVisibility = sequelize.define(
  "HeaderVisibility",
  {
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // following principle of least privilege
    },
    // adding foreign key columns explicitly
    headerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "header_visibility",
    timestamps: true,
    createdAt: false,
  }
);

// relationship
HeaderVisibility.associate = (models) => {
  // a header can be visible to many roles and a role can be visible to many headers
  HeaderVisibility.belongsTo(models.Header, {
    foreignKey: "headerId",
    as: "header",
  });

  HeaderVisibility.belongsTo(models.Role, {
    foreignKey: "roleId",
    as: "role",
  });

  HeaderVisibility.belongsTo(models.User, {
    foreignKey: "updated_by",
    as: "updated_by_user",
  });
};

export default HeaderVisibility;
