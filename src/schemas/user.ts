import { z } from 'zod';

export const CandidateProfileSchema = z.object({
  body: z.object({
    logo: z.string({ message: "Pic is required!" }),
    linkedIn: z.string({ message: "LinkedIn Link is required!" }).url({ message: "Please enter a valid LinkedIn URL" }),
    countryName: z.string({ message: "countryName is required!" }).min(1, { message: "Country is required" }),
    cityName: z.string({ message: "cityName is required!" }).min(1, { message: "City is required" }),
    address: z.string({ message: "Address is required!" }).min(1, { message: "Address is required" }),
    phone: z.string({ message: "Phone is required!" }).min(1, { message: "Phone number is required" }),
    email: z.string({ message: "Email is required!" }).email({ message: "Please enter a valid email address" }),
    gender: z.string({ message: "Gender is required!" }).min(1, { message: "Title is required" }),
    firstName: z.string({ message: "firstName is required!" }).min(1, { message: "First name is required" }),
    lastName: z.string({ message: "lastNam is required!" }).min(1, { message: "Last name is required" }),
    presentation: z.string({ message: "Presentation is required!" }).min(10, { message: "Presentation must be at least 10 characters" }),
    contractType: z.string({ message: "ContractType is required!" }).min(1, { message: "Contract type is required" }),
    sectorPref: z.string({ message: "sectorPref is required!" }).min(1, { message: "Sector preference is required" }),
    positionName: z.string({ message: "positionName is required!" }).min(1, { message: "Position is required" }),
    disability: z.string({ message: "disability is required!" }).min(1, { message: "This field is required" }),
    age: z.string({ message: "Age is required!" }).min(1, { message: "Age is required" }),
    experience: z.string({ message: "Experience is required!" }).min(1, { message: "Experience is required" }),
    salaryExpectation: z.string({ message: "Salary Expectation is required!" }).min(1, { message: "Salary expectation is required" }),
  })
})

