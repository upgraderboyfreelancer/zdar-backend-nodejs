import * as z from "zod";

export const ApplyJobSchema = z.object({
  jobId: z.number(),
});
const ProfessionalExperienceSchema = z.object({
  positionName: z.string(),
  companyName: z.string(),
  startDate: z.coerce.string(),
  endDate: z.coerce.string(),
  description: z.string(),
});

const AcademicBackgroundSchema = z.object({
  instituteName: z.string(),
  speciality: z.string(),
  startDate: z.coerce.string(),
  endDate: z.coerce.string(),
});

export const CandidateProfileSchema = z.object({
  body: z.object({
  logo: z.string(),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  countryName: z.string().min(1, { message: "Country is required" }),
  cityName: z.string().min(1, { message: "City is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  age: z.string().min(1, { message: "Age is required" }),
  gender: z.string().min(1, { message: "Title is required" }),
  linkedIn: z.string().url({ message: "Please enter a valid LinkedIn URL" }).optional(),
  websiteLink: z.string().url({ message: "Please enter a valid website URL" }).optional(),
  disability: z.string().min(1, { message: "This field is required" }),
  positionName: z.string().min(1, { message: "Position is required" }),
  // profileType: z.string(),
  contractType: z.string().min(1, { message: "Contract type is required" }),
  salaryExpectation: z.string().min(1, { message: "Salary expectation is required" }),
  hardSkills: z.array(z.string()),
  softSkills: z.array(z.string()),
  presentation: z.string().min(10, { message: "Presentation must be at least 10 characters" }),
  professionalExperience: z.array(ProfessionalExperienceSchema),
  academicBackground: z.array(AcademicBackgroundSchema),
  sectorPref: z.string().min(1, { message: "Sector preference is required" }),
  experience: z.string().min(1, { message: "Experience is required" }),
  hobbies: z.array(z.string())
  })
})