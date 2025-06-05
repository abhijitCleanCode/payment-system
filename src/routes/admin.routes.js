import express from "express";
import {
  CREATE_HEADER_WITH_VISIBILITY,
  CREATE_USER_BY_ADMIN,
  CREATEADMIN,
} from "../controllers/admin.controller.js";
import { VERIFY_TOKEN } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const adminRouter = express.Router();

adminRouter.post("/create-admin", CREATEADMIN);
adminRouter.post(
  "/create-user",
  VERIFY_TOKEN,
  authorize(["admin"]),
  CREATE_USER_BY_ADMIN
);
adminRouter.post(
  "/create-header",
  VERIFY_TOKEN,
  authorize(["admin"]),
  CREATE_HEADER_WITH_VISIBILITY
);

export default adminRouter;
