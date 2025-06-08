import Header from "../models/header.model.js";
import HeaderVisibility from "../models/headerVisibility.model.js";
import Role from "../models/role.model.js";

import { ApiError } from "../utils/ApiError.utils.js";

class HeaderServices {
  static async getVisibleHeader({ userId, userRole }) {
    // for admin user, get all headers
    if (userRole === "admin") {
      const headers = await Header.findAll({
        attributes: ["id", "name", "description", "createdAt"],
        include: [
          {
            model: Role,
            as: "visibilityRules",
            through: { attributes: [] },
            // attributes: ["id", "name"],
          },
        ],
      });

      return headers;
    }

    // for other users, get headers that are visible to them
    const headers = await Header.findAll({
      include: [
        {
          model: Role,
          as: "visibilityRules",
          where: { name: userRole.toLowerCase() },
          through: { where: { is_visible: true }, attributes: [] },
          required: true, // using inner join
          attributes: [],
        },
      ],
      attributes: ["id", "name", "description", "createdAt"],
    });

    return headers;
  }
}

export default HeaderServices;
