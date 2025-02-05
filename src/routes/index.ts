import express from "express"
import authRouter from "./auth";
import userRouter from "./user";
import candidateRouter from "./candidate";
import companyRouter from "./company";
import paymentRouter from "./checkout";
import { multerMiddleware, uploadHandler } from "../config/cloudinaryConfig";

import { webhook } from "../controllers/paymentController";
import jobRouter from "./jobs";


const router = express.Router();
router.post("/upload", multerMiddleware, uploadHandler)
router.use("/auth", authRouter)
router.use("/jobs", jobRouter)
router.use("/users", userRouter)
router.post("/webhooks/stripe", webhook);
router.use("/candidates", candidateRouter)
router.use("/companies", companyRouter)
router.use("/checkout", paymentRouter)


export default router;