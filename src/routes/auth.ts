import express from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema } from "../schemas/auth";
import { forgotPassword, login, onBoarded, register, resetPassword, validateUser, verifyEmail } from "../controllers/authController";

const authRouter = express.Router();


authRouter.post("/register", validateRequest(RegisterSchema), register)
authRouter.post("/login", validateRequest(LoginSchema), login)
authRouter.post("/verify-email/:token", verifyEmail)
authRouter.post("/forgot-password", validateRequest(ForgotPasswordSchema), forgotPassword)
authRouter.post("/reset-password/:token", validateRequest(ResetPasswordSchema), resetPassword)
authRouter.get("/validate", validateUser)
authRouter.get("/onboarded", onBoarded)
export default authRouter;