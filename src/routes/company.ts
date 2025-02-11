import express from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { getCompanyProfile, updateCompanyProfile, getCompanyJobs, getCompanies, getCompany } from "../controllers/companyController";
import { validateRequest } from "../middlewares/validateRequest";
import { CompanyProfileSchema } from "../schemas/company";
import { UserRole } from "@prisma/client";

const companyRouter = express.Router();

// Company Profile
companyRouter.get("/", getCompanies);
companyRouter.get("/profile", authenticate, authorize(UserRole.COMPANY), getCompanyProfile);
companyRouter.put("/profile", authenticate, validateRequest(CompanyProfileSchema), updateCompanyProfile);
companyRouter.get("/my-jobs", authenticate, getCompanyJobs);
companyRouter.get("/favourites", authenticate, getCompanyJobs);
companyRouter.get("/:id", getCompany);
// Job Management (Create, Update, Delete)
// companyRouter.post("/jobs", authenticate, createJob);
// companyRouter.put("/jobs/:jobId", authenticate, updateJob);
// companyRouter.delete("/jobs/:jobId", authenticate, deleteJob);

// Applicants Management
// companyRouter.get("/jobs/:jobId/applicants", authenticate, getJobApplicants);
// companyRouter.put("/applicants/:applicantId/status", authenticate, updateApplicantStatus);

export default companyRouter;