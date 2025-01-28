import express from "express"
import authRouter from "./auth";
import userRouter from "./user";
import candidateRouter from "./candidate";
import companyRouter from "./company";
import paymentRouter from "./checkout";


const router = express.Router();

router.use("/auth", authRouter)
router.use("/users", userRouter)
router.use("/candidates", candidateRouter)
router.use("/companies", companyRouter)
router.use("/checkout", paymentRouter)
export default router;