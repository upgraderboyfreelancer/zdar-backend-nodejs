import express from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticate, authorize } from "../middlewares/auth"
import { ApplyJobSchema } from '../schemas/candidate';
import { getCandidates, getCandidate, getApplicantData, uploadResume } from '../controllers/candidateController';
import { UserRole } from '@prisma/client';
import { pdfUploadHandler, pdfUploadMiddleware } from "../config/universalCloudinaryConfig";
const candidateRouter = express.Router();


candidateRouter.get('/profile', getCandidates);

// candidateRouter.get("/applicant-profile", authenticate, authorize(UserRole.USER), getApplicantData);
// candidateRouter.put("/applicant-profile", authenticate, authorize(UserRole.USER), updateApplicantData);

// candidateRouter.post('/apply', authenticate, authorize(UserRole.USER), validateRequest(ApplyJobSchema), applyForJob);
// candidateRouter.delete('/withdraw/:jobId', authenticate, authorize(UserRole.USER), withdrawApplication);
candidateRouter.get('/:id', getCandidate);


export default candidateRouter;