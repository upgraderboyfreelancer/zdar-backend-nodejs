import express from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { CandidateProfileSchema } from "../schemas/user";
import { getProfile, getProfileState, isAuthenticated, updateProfile } from "../controllers/userController";
import { UserRole } from "@prisma/client";
import { pdfUploadMiddleware } from "../config/universalCloudinaryConfig";
// import { getResume, uploadResume } from "../controllers/candidateController";
const userRouter = express.Router();

// userRouter.put('/profile', authenticate, validateRequest(CandidateProfileSchema), updateProfile);
// userRouter.get('/profile', authenticate, getProfile);
// userRouter.post("/upload-pdf", authenticate, authorize(UserRole.USER), pdfUploadMiddleware, uploadResume);
// userRouter.get('/get-resume', authenticate, authorize(UserRole.USER), getResume);
export default userRouter;