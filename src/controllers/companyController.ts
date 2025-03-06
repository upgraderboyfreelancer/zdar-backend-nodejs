import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { getUserAssociation } from "../lib/getUserIdAssociation";
import db from "../lib/prisma";
import { APPLICANT_STATUS } from "@prisma/client";
import asyncHandler from "../lib";



// 🎯 Get All Companies
export const getCompanies = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const companies = await db.company.findMany({
    where: {
      user: {
        profileCompleted: true
      }
    }
  });

    res.status(200).json({
      success: true,
      data: companies
    });
});
// 🎯 Get All Companies
export const getCompany = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if(!id) throw createHttpError(400, {
    message: "Company doesnt exist!"
  });
  const company = await db.company.findUnique({
    where: {
      id
    },
    include: {
      jobs: {
        select: {
          positionName: true,
          description: true,
          status: true,
          id: true
        }
      },
      user: {
        select: {
          id: true
        }
      }
    }
  });
  if(!company) throw createHttpError(400, { message: "Company doesnt exist!" })
  res.status(200).json({
    success: true,
    data: company
  });
});
// 🎯 Get Company Profile
export const getCompanyProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = req.user!; // Get userId from JWT
    console.log(`userId => ${userId}`)
    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");
    console.log(`companyId => ${companyId}`)
    // Get the Company profile using the companyId
    const company = await db.company.findUnique({
      where: {
        id: companyId
    },
    });

    if (!company) throw createHttpError(404, "Company not found");
    res.json({
      success: true,
      data: company
    });
});

// 🎯 Update Company Profile
export const updateCompanyProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.user!; // Get userId from JWT

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Update the company profile
    const updatedCompany = await db.company.update({
      where: { id: companyId },
      data: req.body
    });
    const user = await db.user.update({
      where: {
        id: userId
      },
      data: {
        profileCompleted: true
      }
    });
    if(!updatedCompany) throw createHttpError(400, {
      message: "Something went wrong!"
    })
    res.json({
      success: true,
      message: "Profile has been updated!",
      data: updatedCompany
    });
});

// 🎯 Get All Jobs Posted by the Company
export const getCompanyJobs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = req.user!; // Get userId from JWT

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Get the Company's jobs using companyId
    const company = await db.company.findUnique({
      where: { id: companyId },
      include: { jobs: true },
    });

    if (!company) throw createHttpError(404, "Company not found");
    // console.log(company)
    res.json({
      success: true,
      message: "List of company jobs",
      data: company.jobs
    });
});




