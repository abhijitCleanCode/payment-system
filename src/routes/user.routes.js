import { Router } from "express";
import {
  CHANGE_CURRENT_PASSWORD,
  LOG_OUT,
  LOGIN,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/login", LOGIN);
userRouter.post("/logout", LOG_OUT);
userRouter.post("/update-password", CHANGE_CURRENT_PASSWORD);

export default userRouter;
