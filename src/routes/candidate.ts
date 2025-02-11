import express from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticate, authorize } from "../middlewares/auth"
import { ApplyJobSchema, CandidateProfileSchema } from '../schemas/candidate';
import { getCandidates, getCandidate, updateCandidateProfile, getCandidateProfile, addFavoriteCandidates, removeFavoriteCandidates, updateFavoriteCandidates } from '../controllers/candidateController';
import { UserRole } from '@prisma/client';
import { pdfUploadHandler, pdfUploadMiddleware } from "../config/universalCloudinaryConfig";

const candidateRouter = express.Router();
candidateRouter.get('/', getCandidates);
candidateRouter.get('/profile', authenticate, authorize(UserRole.USER), getCandidateProfile);
candidateRouter.put("/profile", authenticate, validateRequest(CandidateProfileSchema), updateCandidateProfile);
candidateRouter.get('/:id', getCandidate);
candidateRouter.post("/favorites/:candidateId", authenticate, updateFavoriteCandidates);
// candidateRouter.get("/applicant-profile", authenticate, authorize(UserRole.USER), getApplicantData);
// candidateRouter.put("/applicant-profile", authenticate, authorize(UserRole.USER), updateApplicantData);

// candidateRouter.post('/apply', authenticate, authorize(UserRole.USER), validateRequest(ApplyJobSchema), applyForJob);
// candidateRouter.delete('/withdraw/:jobId', authenticate, authorize(UserRole.USER), withdrawApplication);


export default candidateRouter;