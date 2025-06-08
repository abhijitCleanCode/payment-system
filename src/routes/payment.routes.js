import { Router } from "express";

import { CREATE_PAYMENT } from "../controllers/payment.controller.js";
import { VERIFY_TOKEN } from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

paymentRouter.post("/create-payment", VERIFY_TOKEN, CREATE_PAYMENT);

export default paymentRouter;
