import express from "express";
import { authenticate } from "../middlewares/auth";
import { getCompanyProfile, updateCompanyProfile, getCompanyJobs } from "../controllers/companyController";
import { validateRequest } from "../middlewares/validateRequest";
import { CompanyProfileSchema } from "../schemas/company";

const companyRouter = express.Router();

// Company Profile
companyRouter.get("/profile", authenticate, getCompanyProfile);
companyRouter.put("/profile", authenticate, validateRequest(CompanyProfileSchema), updateCompanyProfile);
companyRouter.get("/my-jobs", authenticate, getCompanyJobs);
// Job Management (Create, Update, Delete)
// companyRouter.post("/jobs", authenticate, createJob);
// companyRouter.put("/jobs/:jobId", authenticate, updateJob);
// companyRouter.delete("/jobs/:jobId", authenticate, deleteJob);

// Applicants Management
// companyRouter.get("/jobs/:jobId/applicants", authenticate, getJobApplicants);
// companyRouter.put("/applicants/:applicantId/status", authenticate, updateApplicantStatus);

export default companyRouter;