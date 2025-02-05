import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { getUserAssociation } from "../lib/getUserIdAssociation";
import db from "../lib/prisma";
import { APPLICANT_STATUS } from "@prisma/client";

// 🎯 Get Company Profile
export const getCompanyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.user!; // Get userId from JWT

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Get the Company profile using the companyId
    const company = await db.company.findUnique({
      where: { id: companyId },
    });

    if (!company) throw createHttpError(404, "Company not found");
    res.json(company);
  } catch (error) {
    next(error);
  }
};

// 🎯 Update Company Profile
export const updateCompanyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.user!; // Get userId from JWT

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Update the company profile
    const updatedCompany = await db.company.update({
      where: { id: companyId },
      data: req.body,
    });
    if(!updatedCompany) throw createHttpError(400, {
      message: "Something went wrong!"
    })
    res.json({
      success: true,
      message: "Profile has been updated!",
      data: updatedCompany
    });
  } catch (error) {
    next(error);
  }
};

// 🎯 Get All Jobs Posted by the Company
export const getCompanyJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.user!; // Get userId from JWT

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Get the Company's jobs using companyId
    const company = await db.company.findUnique({
      where: { id: companyId },
      include: { jobs: true },
    });

    if (!company) throw createHttpError(404, "Company not found");
    console.log(company)
    res.json({
      success: true,
      message: "List of company jobs",
      data: company.jobs
    });
  } catch (error) {
    next(error);
  }
};