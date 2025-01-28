import express from "express";
import { authenticate } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { CandidateProfileSchema, CompanyProfileSchema } from "../schemas/user";
import { getProfile, getProfileState, isAuthenticated, updateProfile } from "../controllers/userController";
const userRouter = express.Router();

userRouter.put('/profile', authenticate, validateRequest(CandidateProfileSchema, { "COMPANY": CompanyProfileSchema}), updateProfile);
userRouter.get('/profile', authenticate, getProfile);
userRouter.get('/profileCompleted', authenticate, getProfileState);
userRouter.get('/isAuthenticated', authenticate, isAuthenticated);
export default userRouter;