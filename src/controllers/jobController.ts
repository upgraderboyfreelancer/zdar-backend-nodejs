import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { getUserAssociation } from "../lib/getUserIdAssociation";
import db from "../lib/prisma";
import { APPLICANT_STATUS } from "@prisma/client";


// 🎯 Create a New Job Offer
export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.user!; // Get userId from JWT

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Create the job offer
    const newJob = await db.job.create({
      data: {
        ...req.body,
        companyId: companyId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Job Post has been created!",
      data: newJob
    });
  } catch (error) {
    next(error);
  }
};



// 🎯 Create a New Job Offer
export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Create the job offer
    const jobs = await db.job.findMany();

    res.status(201).json({
      success: true,
      message: "List of all jobs!",
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};


// 🎯 Update Job Offer
export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.user!; // Get userId from JWT
    const { jobId } = req.params;

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Check if the job belongs to the company
    const job = await db.job.findFirst({
      where: { id: Number(jobId), companyId: companyId },
    });

    if (!job) throw createHttpError(404, "Job not found");

    // Update the job offer
    const updatedJob = await db.job.update({
      where: { id: Number(jobId) },
      data: req.body,
    });

    res.json(updatedJob);
  } catch (error) {
    next(error);
  }
};

// 🎯 Delete Job Offer
export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.user!; // Get userId from JWT
    const { jobId } = req.params;

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Check if the job belongs to the company
    const job = await db.job.findFirst({
      where: { id: Number(jobId), companyId: companyId },
    });

    if (!job) throw createHttpError(404, "Job not found");

    // Delete the job offer
    await db.job.delete({
      where: { id: Number(jobId) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// 🎯 Get All Applicants for a Job
export const getJobApplicants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.user!; // Get userId from JWT
    const { jobId } = req.params;

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Check if the job belongs to the company
    const job = await db.job.findFirst({
      where: { id: Number(jobId), companyId: companyId },
    });

    if (!job) throw createHttpError(404, "Job not found");

    // Get all applicants for the job
    const applicants = await db.appliedJobs.findMany({
      where: { jobId: Number(jobId) },
      include: { applicant: true },
    });

    res.json(applicants.map((app) => app.applicant));
  } catch (error) {
    next(error);
  }
};
// Update Applicant Status
export const updateApplicantStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.user!; // Get userId from JWT
    const { jobId, applicantId } = req.params; // jobId and applicantId from params
    const { status } = req.body; // New status to update (e.g., 'APPROVED' or 'REJECTED')

    // Validate the status value
    if (!Object.values(APPLICANT_STATUS).includes(status)) {
      throw createHttpError(400, "Invalid status");
    }

    // Get the associated companyId from the userId
    const companyId = await getUserAssociation(userId, "company");

    // Check if the job exists and belongs to the company
    const job = await db.job.findFirst({
      where: { id: Number(jobId), companyId },
    });

    if (!job) {
      throw createHttpError(404, "Job not found or you do not have permission to update this job");
    }

    // Check if the applicant has applied to the job
    const applicant = await db.appliedJobs.findFirst({
      where: { jobId: Number(jobId), applicantId: Number(applicantId) },
    });

    if (!applicant) {
      throw createHttpError(404, "Applicant not found for this job");
    }

    // Update the applicant's status
    const updatedApplicant = await db.appliedJobs.update({
      where: { id: applicant.id },
      data: { status }, // Set the new status
    });

    res.json(updatedApplicant);
  } catch (error) {
    next(error);
  }
};