import express from "express";
import { authenticate } from "../middlewares/auth";
import { createJob, getJobs, getJob, updateJob, deleteJob, setActiveJob, setSuspendJob, updateFavoriteJobs, getJobApplicants, updateApplicantionStatus } from "../controllers/jobController";
import { validateRequest } from "../middlewares/validateRequest";
import { jobSchema } from "../schemas/job";


const jobRouter = express.Router();

jobRouter.post("/", authenticate, validateRequest(jobSchema), createJob);
// jobRouter.post("/jobs", authenticate, createJob);
jobRouter.get("/", getJobs);
jobRouter.post("/favorites/:jobId", authenticate, updateFavoriteJobs)
jobRouter.get("/:id", getJob);
jobRouter.put("/:jobId", authenticate, updateJob);
jobRouter.delete("/:jobId", authenticate, deleteJob);
jobRouter.post("/:jobId/active", authenticate, setActiveJob);
jobRouter.post("/:jobId/suspend", authenticate, setSuspendJob);
jobRouter.get("/:jobId/applicants", authenticate, getJobApplicants);
// Candidate can apply or withdraw their applicantion from job offer
jobRouter.post("/:jobId/apply", authenticate, updateApplicantionStatus)
// Company Remove Applicant from Applicant List
jobRouter.delete("/:jobId/applicants/:candidateId", authenticate)

export default jobRouter;