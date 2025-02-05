import { z } from "zod";

export const RegisterSchema = z.object({
  body: z.preprocess(
    (rawData) => {
      if (typeof rawData === "object" && rawData !== null) {
        const data = rawData as {
          logoUrl?: string
          name?: string
          firstName?: string
          lastName?: string
          websiteUrl?: string
          email?: string
          password?: string
          userType?: "USER" | "COMPANY"
        }

        if (data.userType === "USER") {
          delete data.name
          delete data.websiteUrl
        } else if (data.userType === "COMPANY") {
          delete data.firstName
          delete data.lastName
        }
        return data
      }
      return rawData
    },
    z
      .object({
        logoUrl: z.string().optional(),
        name: z.string({ message: "Company name is required!" }).min(1, { message: "Company name is required!" }).optional(),
        firstName: z.string({ message: "First Name is required!" }).min(1, { message: "First name is required!" }).optional(),
        lastName: z.string({ message: "Last Name is required!" }).min(1, { message: "Last name is required!" }).optional(),
        websiteUrl: z.string({ message: "Website URL is required!" }).url({ message: "Please enter a valid website URL." }).optional(),
        email: z
          .string({ message: "Email is required!" })
          .min(1, { message: "Enter a valid email!" })
          .email({ message: "Please provide a valid email address." }),
        password: z
          .string({ message: "Password is required!" })
          .min(8, { message: "Password must be at least 8 characters." })
          .max(12, { message: "Password must not exceed 12 characters." }),
        userType: z.enum(["USER", "COMPANY"], {
          errorMap: () => ({ message: "Please select a user type." }),
        }),
      })
      .refine(
        (data) => {
          if (data.userType === "COMPANY" && data.websiteUrl && data.email) {
            try {
              const domain = new URL(data.websiteUrl).hostname;
              return data.email.endsWith(`@${domain}`);
            } catch {
              return false;
            }
          }
          return true;
        },
        {
          message: "Company email must match the domain of the website URL.",
          path: ["email"],
        },
      )
      .refine(
        (data) => {
          if (data.userType === "USER") {
            return !!data.firstName && !!data.lastName;
          }
          if (data.userType === "COMPANY") {
            return !!data.name && !!data.websiteUrl;
          }
          return true;
        },
        {
          message: "Please fill in all required fields.",
          path: ["userType"],
        },
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