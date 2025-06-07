import { Router } from "express";
import {
  CHANGE_CURRENT_PASSWORD,
  LOG_OUT,
  LOGIN,
} from "../controllers/user.controller.js";
import { VERIFY_TOKEN } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/login", LOGIN);
userRouter.post("/logout", LOG_OUT);
userRouter.put("/update-password", VERIFY_TOKEN, CHANGE_CURRENT_PASSWORD);

export default userRouter;
