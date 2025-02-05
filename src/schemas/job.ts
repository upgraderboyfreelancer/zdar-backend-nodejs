import * as z from "zod";


export const jobSchema = z.object({
  body: z.object({
    positionName: z.string().min(1, "Name position is required"),
    description: z.string().min(1, "Last info is required"),
    contractType: z.string().min(1, "Service contract type is required"),
    genderPref: z.string().min(1, "Gender preference is required"),
    disable: z.string().min(1, "Disability status is required"),
    ageLimit: z.array(z.string()),
    experience: z.string().min(1, "Experience is required"),
    annualSalary: z.string().min(1, "Annual salary is required"),
    hardSkills: z.array(z.string()),
    softSkills: z.array(z.string())
  })
})


