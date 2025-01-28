import { z } from 'zod';



// Define the schema
export const RegisterSchema = z.object({
  body: z.preprocess(
    (rawData) => {
      if (typeof rawData === "object" && rawData !== null) {
        const data = rawData as {
          logoUrl?: string;
          name?: string;
          firstName?: string;
          lastName?: string;
          websiteUrl?: string;
          email?: string;
          password?: string;
          userType?: "USER" | "COMPANY";
        };

        // Adjust fields based on `userType`
        if (data.userType === "USER") {
          delete data.name; // Exclude `name` for USER
        } else if (data.userType === "COMPANY") {
          delete data.firstName; // Exclude `firstName` for COMPANY
          delete data.lastName; // Exclude `lastName` for COMPANY
        }
        return data; // Return adjusted data
      }
      return rawData;
    },
    z
      .object({
        logoUrl: z.string().optional(),
        name: z
          .string({ message: "Name is required!" })
          .min(1, { message: "Name is required!" })
          .optional(), // Conditionally validated
        firstName: z
          .string({ message: "First name is required!" })
          .min(1, { message: "First name is required!" })
          .optional(), // Conditionally validated
        lastName: z
          .string({ message: "Last name is required!" })
          .min(1, { message: "Last name is required!" })
          .optional(), // Conditionally validated
        websiteUrl: z
          .string()
          .url({ message: "Please enter a valid website URL." })
          .optional(), // Conditionally required
        email: z
          .string({ message: "Email is required!" })
          .min(1, { message: "Email is required!" })
          .email({ message: "Please provide a valid email address." }),
        password: z
          .string({ message: "Password is required!" })
          .min(8, { message: "Password must be at least 8 characters." })
          .max(12, { message: "Password must not exceed 12 characters." }),
        userType: z.enum(["USER", "COMPANY"], {
          errorMap: () => ({
            message: "User type must be either 'USER' or 'COMPANY'.",
          }),
        }),
      })
      .refine(
        (data) => {
          if (data.userType === "COMPANY" && data.websiteUrl) {
            try {
              const domain = new URL(data.websiteUrl).hostname;
              return data.email.endsWith(`@${domain}`);
            } catch {
              return false; // Invalid URL
            }
          }
          return true;
        },
        {
          message: "As a COMPANY, your email must match the domain of the website URL.",
          path: ["email"],
        }
      )
      .refine(
        (data) => {
          if (data.userType === "USER") {
            return !!data.firstName && !!data.lastName; // USER requires firstName and lastName
          }
          if (data.userType === "COMPANY") {
            return !!data.name && !!data.websiteUrl; // COMPANY requires name and website
          }
          return true;
        },
        {
          message:
            "Invalid input: For USER, 'firstName' and 'lastName' are required. For COMPANY, 'name' and 'websiteUrl' are required.",
          path: ["userType"],
        }
      ),
  ),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is Required!"}).email(),
    password: z.string({ message: "Password is Required!"}),
  })
});

export const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  })
});

export const ResetPasswordSchema = z.object({
  params: z.object({
    token: z.string()
  }),
  body: z.object({
    newPassword: z.string().min(8)
  })
});


export interface CustomJwtPayload {
  userId: string;
  role: string;
  onboardingComplete: boolean;
}