import createHttpError from "http-errors";
import db from "./prisma";

// Function to get the companyId or candidateId from the userId
export const getUserAssociation = async (userId: string, role: "company" | "candidate") => {
  try {
    let associatedId;

    if (role === "company") {
      const company = await db.company.findUnique({
        where: { userId },
      });

      if (!company) throw createHttpError(404, "Company not found");
      associatedId = company.id;
    } else if (role === "candidate") {
      const candidate = await db.candidate.findUnique({
        where: { userId },
      });

      if (!candidate) throw createHttpError(404, "Candidate not found");
      associatedId = candidate.id;
    }
    if(!associatedId) throw createHttpError(401, "UnAuthorized!")
    return associatedId;
  } catch (error) {
    throw error;
  }
};
