import express from "express";
import { CREATEADMIN } from "../controllers/admin.controller.js";

const adminRouter = express.Router();

adminRouter.post("/create", CREATEADMIN);

export default adminRouter;
