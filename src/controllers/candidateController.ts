import type { Request, Response, NextFunction } from 'express';
import db from '../lib/prisma';
import createHttpError from 'http-errors';
import { uploadToCloudinary } from '../config/universalCloudinaryConfig';
import { UserRole } from '@prisma/client';
import asyncHandler from '../lib';
import { getUserAssociation } from '../lib/getUserIdAssociation';
import type { z } from 'zod';

export const updateCandidateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = req.user!;
  const { professionalExperience, academicBackground, age, ...data } = req.body;
  const candidateId = await getUserAssociation(userId, "candidate");

  const updatedCandidate = await db.candidate.update({
    where: { id: candidateId },
    data: {
      ...data,
      age: new Date(age),
      professionalExperience: {
        deleteMany: {},
        create: professionalExperience?.map((exp: z.infer<typeof professionalExperience>) => ({
          ...exp,
          startDate: exp.startDate ? new Date(exp.startDate) : undefined,
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
        })),
      },
      academicBackground: {
        deleteMany: {},
        create: academicBackground?.map((exp: z.infer<typeof academicBackground>) => ({
          ...exp,
          startDate: exp.startDate ? new Date(exp.startDate) : undefined,
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
        })),
      }
    }
  });
  const user = await db.user.update({
    where: {
      id: userId
    },
    data: {
      profileCompleted: true
    }
  });
  if (!updatedCandidate) throw createHttpError(400, {
    message: "Something went wrong!"
  })
  res.json({
    success: true,
    message: "Profile has been updated!",
    data: updatedCandidate
  });
});


export const getCandidates = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const candidates = await db.candidate.findMany({
    where: {
      user: {
        profileCompleted: true
      },
    },
    include: {
      professionalExperience: true
    }
  });
  res.json({
    success: true,
    data: candidates
  });
});

export const getCandidate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const candidateId = await getUserAssociation(id, "candidate");
  const candidate = await db.candidate.findUnique({
    where: {
      id: candidateId
    },
    include: {
      academicBackground: true,
      professionalExperience: true,
    }
  });
  if (!candidate) {
    throw createHttpError(404, { message: 'Candidate not found' });
  }

  res.json({
    success: true,
    data: candidate
  });
});

export const getCandidateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.user!;
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      candidate: {
        include: {
          academicBackground: true,
          professionalExperience: true,
        }
      }
    }
  });

  if (!user) {
    throw createHttpError(404, { message: 'User not found' });
  }
  const data = user.candidate
  console.log(user)
  res.status(200).json({
    success: true,
    data: user
  });
});



export const updateFavoriteCandidates = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user!; // Get userId from JWT
    const { candidateId } = req.params;

    // Get the associated companyId
    const companyId = await getUserAssociation(userId, "company");
    if (!candidateId || typeof candidateId !== "string")
      throw createHttpError(400, { message: "Invalid Id!" });
    const company = await db.company.findUnique({
      where: {
        id: companyId
      },
      select: {
        favorites: true
      }
    })
    if (!company) return;
    const isFav = company?.favorites.includes(candidateId);
    const updatedFavorites = isFav ? company?.favorites.filter((id) => id !== candidateId) : [...company.favorites, candidateId];


    const user = await db.company.update({
      where: {
        id: companyId
      },
      data: {
        favorites: updatedFavorites
      }
    })
    res.status(200).json({
      success: true,
      data: updatedFavorites
    })
  } catch (error) {
    console.log(error);
  }
}


export const addFavoriteCandidates = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = req.user!; // Get userId from JWT
  const { id } = req.params;
  const companyId = await getUserAssociation(userId, "company");
  if (!id || typeof id !== "string")
    throw createHttpError(400, {
      message: "Invalid Id!"
    });
  const company = await db.company.findUnique({
    where: {
      id: companyId
    },
    select: {
      favorites: true
    }
  })
  let favoriteIds = [...(company?.favorites || [])];
  favoriteIds.push(id);
  const user = await db.company.update({
    where: {
      id: companyId
    },
    data: {
      favorites: favoriteIds
    }
  })
  res.status(200).json({
    success: true,
    data: favoriteIds
  })
})
export const removeFavoriteCandidates = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = req.user!;
    const { id } = req.params;
    const companyId = await getUserAssociation(userId, "company");
    if (!id || typeof id !== "string")
      throw createHttpError(400, { message: "Invalid Id!" });
    const company = await db.company.findUnique({
      where: {
        id: companyId
      },
      select: {
        favorites: true
      }
    })
    let favoriteIds = [...(company?.favorites || [])];
    favoriteIds = favoriteIds.filter((favId) => favId !== id)
    const user = await db.company.update({
      where: {
        id: companyId
      },
      data: {
        favorites: favoriteIds
      }
    })
    res.status(200).json({
      success: true,
      data: favoriteIds
    })
})

























// export const uploadResume = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { userId, role, email } = req.user!;

//     if (!userId) {
//       throw createHttpError(404, { message: 'Profile not found' });
//     }
//     // console.log(userId);

//     if (!req.file) {
//       return res.status(400).json({ error: "No PDF file uploaded" });
//     }

//     const candidateId = await getUserAssociation(userId, 'candidate'); // Get the candidateId
//     console.log(candidateId);

//     if (!candidateId) {
//       return res.status(404).json({ message: 'Candidate profile not found.' });
//     }

//     const file = req.file;
//     const filePath = file.path;  // Local path of the uploaded file

//     // Upload to Cloudinary
//     const cloudinaryResult = await uploadToCloudinary(filePath, 'pdf');
//     console.log(`Resume uploaded to Cloudinary => ${cloudinaryResult.secure_url}`);

//     // Find the candidate with the associated applicant
//     const candidate = await db.candidate.findUnique({
//       where: { id: candidateId }, // Use the candidateId to find the candidate
//       include: { applicants: true }, // Include the associated applicants
//     });

//     if (!candidate) {
//       return res.status(404).json({ error: "Candidate not found" });
//     }

//     // If applicant does not exist, create a new applicant
//     let applicant = candidate.applicants;

//     if (!applicant) {
//       // Create a new applicant if one doesn't exist
//       applicant = await db.applicant.create({
//         data: {
//           candidateId: candidate.id, // Associate with the candidate
//           resume: cloudinaryResult.secure_url, // Set the resume URL initially
//         },
//       });
//       console.log(`New applicant created => ${applicant}`);
//     } else {
//       // If applicant exists, update the resume field
//       applicant = await db.applicant.update({
//         where: { id: applicant.id },
//         data: {
//           resume: cloudinaryResult.secure_url, // Update the resume field
//         },
//       });
//       console.log(`Updated applicant => ${applicant}`);
//     }

//     // Send success response
//     res.status(200).json({
//       success: true,
//       resumeLink: applicant.resume,
//       message: "Resume updated successfully!"
//     });

//   } catch (error) {
//     next(error); // Pass the error to the next middleware
//   }
// };
// export const getResume = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { userId, role, email } = req.user!;
//     if (!userId) {
//       throw createHttpError(404, { message: 'Profile not found' });
//     }

//     const candidate = await db.candidate.findUnique({
//       where: { userId },
//       include: { applicants: true },
//     });

//     if (!candidate?.applicants?.resume) {
//       throw createHttpError(404, { message: 'Resume not found' });
//     }
//     const resumeLink = candidate?.applicants?.resume;
//     console.log(`resume => ${resumeLink}`)
//     res.json({
//       success: true,
//       resumeLink,
//       message: "Resume Loaded!"
//     }).status(200);
//   } catch (error) {
//     next(error);
//   }
// };
// export const getApplicantData = async (req: Request, res: Response, next: NextFunction) => {
//   try {

//     // console.log(req.user)
//     const { userId, role } = req.user!;
//     // console.log(userId)
//     const user = await db.user.findUnique({
//       where: { id: userId },
//       select: {
//         candidate: {
//           select: {
//             id: true,
//             applicants: true // Includes applicants with all fields
//           }
//         }
//       }
//     });

//     if (!user) {
//       throw createHttpError(404, { message: 'User not found' });
//     }
//     const data = user?.candidate;
//     // console.log(data)
//     res.status(200).json({
//       success: true,
//       message: "User fetched!",
//       data
//     });
//   } catch (error) {
//     // console.log(error)
//     next(error);
//   }
// };


// export const updateApplicantData = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { professionalExperiences, academicBackgrounds, hardSkills, softSkills, hobbies } = req.body;
//     const { firstName, lastName, presentation, contractType, sectorPref, positionName, disability, age, experience, salaryExpectation, portfolioLink } = req.body;

//     console.log("conjusted fields => ", professionalExperiences, academicBackgrounds, hardSkills, softSkills, hobbies)
//     console.log(req.body)
//     const { userId, role, email } = req.user!;
//     console.log(`userId => ${userId}, role => ${role}, email => ${email}`)
//     const applicantData = req.body;
//     // console.log(profileData)
//     console.log(`userId => ${userId}`)
//     if (!userId) {
//       throw createHttpError(404, { message: 'Profile not found' });
//     }
//     const user = await db.user.findUnique({
//       where: {
//         id: userId
//       }
//     })
//     // console.log(user)
//     let updatedUser;

//     if (role === UserRole.USER) {
//       const user = await db.user.findUnique({
//         where: {
//           id: userId
//         },
//         data: {
//           firstName, lastName, presentation, contractType, sectorPref, positionName, disability, age, experience, salaryExpectation, portfolioLink, // Spread all candidate fields dynamically
//           applicants: {
//             create: {
//               hardSkills: hardSkills.filter(Boolean), // Remove empty values
//               softSkills: softSkills.filter(Boolean),
//               hobbies: hobbies.filter(Boolean),
//               professionalExperience: {
//                 create: professionalExperiences.map(exp => ({
//                   ...exp
//                 }))
//               },
//               academicBackground: {
//                 create: academicBackgrounds.map(edu => ({
//                   ...edu
//                 }))
//               }
//             }
//           }
//         },
//       });
//     } else {
//       throw createHttpError(400, { message: 'Invalid user role' });
//     }

//     res.json({
//       profileCompleted: updatedUser?.profileCompleted,
//       success: true,
//       message: "Updated Successfully!",
//       data: updatedUser
//     });
//   } catch (error) {
//     // console.log(error)
//     next(error);
//   }
// };
// export const applyForJob = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { userId } = req.user!;
//     const { jobId } = req.body;

//     if (!userId) {
//       throw createHttpError(404, { message: 'Candidate profile not found' });
//     }

//     const job = await db.job.findUnique({
//       where: { id: jobId },
//     });

//     if (!job) {
//       throw createHttpError(404, { message: 'Job not found' });
//     }
//     // 🔹 Find the Candidate linked to the User
//     const candidate = await db.candidate.findUnique({
//       where: { userId },
//     });
//     const existingApplication = await db.applicant.findFirst({
//       where: {
//         candidateId: candidate?.id,
//         jobId,
//       },
//     });

//     if (existingApplication) {
//       throw createHttpError(400, { message: 'You have already applied for this job' });
//     }

//     const application = await db.applicant.create({
//       data: {
//         candidate: { connect: { id: userId } },
//         job: { connect: { id: jobId } },
//       },
//     });

//     res.status(201).json(application);
//   } catch (error) {
//     next(error);
//   }
// };

// export const withdrawApplication = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { userId } = req.user!;
//     const { jobId } = req.params;

//     if (!userId) {
//       throw createHttpError(404, { message: 'Candidate profile not found' });
//     }

//     const application = await db.applicant.findFirst({
//       where: {
//         candidateId: userId,
//         jobId: parseInt(jobId),
//       },
//     });

//     if (!application) {
//       throw createHttpError(404, { message: 'Application not found' });
//     }

//     await db.applicant.delete({
//       where: { id: application.id },
//     });

//     res.json({ message: 'Application withdrawn successfully' });
//   } catch (error) {
//     next(error);
//   }
// };

