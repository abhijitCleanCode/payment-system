import express from "express";
import {
  CREATE_HEADER_WITH_VISIBILITY,
  CREATE_USER_BY_ADMIN,
  CREATEADMIN,
} from "../controllers/admin.controller.js";

const adminRouter = express.Router();

// todo: restrict access by enforcing policy

adminRouter.post("/create-admin", CREATEADMIN);
adminRouter.post("/create-user", CREATE_USER_BY_ADMIN);
adminRouter.post("/create-header", CREATE_HEADER_WITH_VISIBILITY);

export default adminRouter;
