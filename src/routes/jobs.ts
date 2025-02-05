import express from "express";
import { authenticate } from "../middlewares/auth";
import { createJob } from "../controllers/jobController";
import { validateRequest } from "../middlewares/validateRequest";
import { jobSchema } from "../schemas/job";


const jobRouter = express.Router();

jobRouter.post("/", authenticate, validateRequest(jobSchema), createJob);
jobRouter.post("/jobs", authenticate, createJob);
export default jobRouter;