import { Router } from "express";
import { GET_VISIBLE_HEADER } from "../controllers/headers.controller.js";
import { VERIFY_TOKEN } from "../middlewares/auth.middleware.js";

const headerRouter = Router();

headerRouter.get("/get-visible-headers", VERIFY_TOKEN, GET_VISIBLE_HEADER);

export default headerRouter;
