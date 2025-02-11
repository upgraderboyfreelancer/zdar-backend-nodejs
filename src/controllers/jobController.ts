import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { getUserAssociation } from "../lib/getUserIdAssociation";
import db from "../lib/prisma";
import { APPLICANT_STATUS, Status } from "@prisma/client";
import asyncHandler from "../lib";


// 🎯 Create a New Job Offer
export const createJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = req.user!; // Get userId from JWT
    const { annualSalary, positionName, description, contractType, genderPref, disable, ageLimit, experience, hardSkills, softSkills } = req.body;
    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Create the job offer
    const newJob = await db.job.create({
      data: {
        positionName, description, contractType, genderPref, disable, ageLimit, experience, hardSkills, softSkills,
        annualSalary: annualSalary,
        companyId: companyId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Job Post has been created!",
      data: newJob
    });
});

// 🎯 Create a New Job Offer
export const getJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const data = await db.job.findUnique({
    where: {
      id
    },
    include: {
      company: {
        select: {
          userId: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data
  });
});

// 🎯 Create a New Job Offer
export const getJobs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const jobs = await db.job.findMany({
    where: {
      status: "ACTIVE"
    }
  });

  res.status(201).json({
    success: true,
    data: jobs
  });
});


// 🎯 Update Job Offer
export const updateJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = req.user!; // Get userId from JWT
    const { jobId } = req.params;
    const { annualSalary, positionName, description, contractType, genderPref, disable, ageLimit, experience, hardSkills, softSkills } = req.body;
    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Check if the job belongs to the company
    const job = await db.job.findFirst({
      where: { id: jobId, companyId: companyId },
    });

    if (!job) throw createHttpError(404, "Job not found");

    // Update the job offer
    const updatedJob = await db.job.update({
      where: { id: jobId },
      data: {
        positionName, description, contractType, genderPref, disable, ageLimit, experience, hardSkills, softSkills,
        annualSalary: annualSalary,
        companyId: companyId,
      },
    });

    res.json({
      success: true,
      message: "Job Offer has been updated!",
      data: updatedJob,
    });
});

export const getFavJobIds = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = req.user!;
    const candidateId = await getUserAssociation(userId, "candidate");
    const favIds = await db.candidate.findUnique({
      where: {
        id: candidateId
      },
      select: {
        favorites: true
      }
    })
    const data = favIds?.favorites;
    res.json({
      success: true,
      data: favIds
    });
})
// export const addFavoriteJobs = async (req: Request, res: Response)=>{
//   try {
//     const { userId, role } = req.user!; // Get userId from JWT
//     const { id } = req.params;

//     // Get the associated companyId
//     const candidateId = await getUserAssociation(userId, "candidate");
//     if(!id || typeof id !== "string")
//       throw createHttpError(400, { message: "Invalid Id!" });
//     const candidate = await db.candidate.findUnique({
//       where: {
//         id: candidateId
//       },
//       select: {
//         favorites: true
//       }
//     })
//     let favoriteIds = [ ...(candidate?.favorites || [])];
//     favoriteIds.push(id);
//     const user = await db.candidate.update({
//       where: {
//         id: candidateId
//       },
//       data: {
//         favorites: favoriteIds
//       }
//     })
//     res.status(200).json({
//       success: true,
//       data: favoriteIds
//     })
//   } catch (error) {
//     console.log(error);
//   }
// }
// export const removeFavoriteJobs = async (req: Request, res: Response)=>{
//   try {
//     const { userId, role } = req.user!; // Get userId from JWT
//     const { id } = req.params;

//     // Get the associated companyId
//     const candidateId = await getUserAssociation(userId, "candidate");
//     if(!id || typeof id !== "string")
//       throw createHttpError(400, { message: "Invalid Id!" });
//     const candidate = await db.candidate.findUnique({
//       where: {
//         id: candidateId
//       },
//       select: {
//         favorites: true
//       }
//     })
//     let favoriteIds = [ ...(candidate?.favorites || [])];
//     favoriteIds = favoriteIds.filter((favId)=> favId !== id)
//     const user = await db.candidate.update({
//       where: {
//         id: candidateId
//       },
//       data: {
//         favorites: favoriteIds
//       }
//     })
//     res.status(200).json({
//       success: true,
//       data: favoriteIds
//     })
//   } catch (error) {
//     console.log(error);
//   }
// }
export const updateFavoriteJobs = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = req.user!; // Get userId from JWT
    const { jobId } = req.params;

    // Get the associated companyId
    const candidateId = await getUserAssociation(userId, "candidate");
    if (!jobId || typeof jobId !== "string")
      throw createHttpError(400, { message: "Invalid Id!" });
    const candidate = await db.candidate.findUnique({
      where: {
        id: candidateId
      },
      select: {
        favorites: true
      }
    })
    if (!candidate) return;
    const isFav = candidate?.favorites.includes(jobId);
    const updatedFavorites = isFav ? candidate?.favorites.filter((id) => id !== jobId) : [...candidate.favorites, jobId];


    const user = await db.candidate.update({
      where: {
        id: candidateId
      },
      data: {
        favorites: updatedFavorites
      }
    })
    res.status(200).json({
      success: true,
      data: updatedFavorites
    })
})
// 🎯 Delete Job Offer
export const deleteJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = req.user!; // Get userId from JWT
    const { jobId } = req.params;

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Check if the job belongs to the company
    const job = await db.job.findFirst({
      where: { id: jobId, companyId: companyId },
    });

    if (!job) throw createHttpError(404, "Job not found");

    // Delete the job offer
    await db.job.delete({
      where: { id: jobId },
    });

    res.status(204).send({
      success: true,
      message: "Job deleted successfully!",
      data: null
    });
});


// 🎯 Activate Job Offer
export const setActiveJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = req.user!; // Get userId from JWT
    const { jobId } = req.params;

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Check if the job belongs to the company
    const job = await db.job.findFirst({
      where: { id: jobId, companyId: companyId },
    });

    if (!job) throw createHttpError(404, "Job not found");

    // Activate the job offer
    await db.job.update({
      where: { id: jobId },
      data: {
        status: Status.ACTIVE
      }
    });

    res.status(200).send({
      success: true,
      message: "Job Activated!",
      data: null
    });
});

// 🎯 Suspend Job Offer
export const setSuspendJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = req.user!; // Get userId from JWT
    const { jobId } = req.params;

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Check if the job belongs to the company
    const job = await db.job.findFirst({
      where: { id: jobId, companyId: companyId },
    });

    if (!job) throw createHttpError(404, "Job not found");

    // Suspend the job offer
    await db.job.update({
      where: { id: jobId },
      data: {
        status: Status.SUSPENDED
      }
    });

    res.status(200).send({
      success: true,
      message: "Job Deactivated!",
      data: null
    });
});
// 🎯 Get All Applicants for a Job
export const getJobApplicants = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.user!; // Get userId from JWT
    const { jobId } = req.params;

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");

    // Check if the job belongs to the company
    const job = await db.job.findFirst({
      where: { id: jobId, companyId: companyId },
    });

    if (!job) throw createHttpError(404, "Job not found");

    // Get all applicants for the job
    const applicants = await db.appliedJobs.findMany({
      where: {
        jobId: jobId
      },
      include: {
        candidate: {
          select: {
            id: true,
            age: true,
            positionName: true,
            countryName: true,
            phone: true,
            email: true,
            linkedIn: true,
            firstName: true,
            lastName: true,
            gender: true,
          }
        }
      },
    });

    res.json({
      success: true,
      data: applicants
    });
});
// Update Applicant Status
export const updateApplicantStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
      where: { id: jobId, companyId },
    });

    if (!job) {
      throw createHttpError(404, "Job not found or you do not have permission to update this job");
    }

    // Check if the applicant has applied to the job
    const applicant = await db.appliedJobs.findFirst({
      where: { jobId: jobId, candidateId: applicantId },
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
});



// Candidate update their application status
export const updateApplicantionStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!; // Get userId from JWT
    const { jobId } = req.params;

    // Get the associated companyId
    const candidateId = await getUserAssociation(userId, "candidate");
    if (!jobId || typeof jobId !== "string")
      throw createHttpError(400, { message: "Invalid Id!" });
    const candidate = await db.candidate.findUnique({
      where: {
        id: candidateId
      },
      select: {
        appliedJobs: true
      }
    })
    if (!candidate) return;
    const isApplied = candidate.appliedJobs.some((job)=> job.jobId === jobId && job.candidateId === candidateId)
    if(!isApplied) {
      const data = await db.appliedJobs.create({
        data: {
          candidateId,
          jobId
        }
      })
      res.status(200).json({
        success: true,
        data
      });
      return;
    } else {
      const data = await db.appliedJobs.delete({
        where: {
          candidateId_jobId: {
            candidateId,
            jobId
          }
        }
      })
      res.status(200).json({
        success: true,
        data
      })
      return;
    }
})
