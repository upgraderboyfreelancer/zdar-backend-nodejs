import express from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema } from "../schemas/auth";
import { forgotPassword, login, register, resetPassword, validateUser, verifyEmail, logOut, getUser } from "../controllers/authController";
import { multerMiddleware } from "../config/cloudinaryConfig";
import { authenticate } from "../middlewares/auth";

const authRouter = express.Router();


authRouter.post("/register", validateRequest(RegisterSchema), register)
authRouter.post("/login", validateRequest(LoginSchema), login)
authRouter.get("/log-out", logOut)
authRouter.post("/verify-email/:token", verifyEmail)
authRouter.post("/forgot-password", validateRequest(ForgotPasswordSchema), forgotPassword)
authRouter.post("/reset-password/:token", validateRequest(ResetPasswordSchema), resetPassword)
authRouter.get("/validate", validateUser)
authRouter.get("/profile", authenticate, getUser)
// authRouter.get("/onboarded", onBoarded)
export default authRouter;