import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from "express";
import db from "../lib/prisma";
import createHttpError from 'http-errors';
import { signJwt } from '../lib/jwt';
import { getVerificationTokenByEmail } from '../utils/verificationToken';
import asyncHandler from '../lib';
import { sendPasswordResetEmail } from '../lib/email';
import jwt from "jsonwebtoken";
import type { CustomJwtPayload } from '../schemas/auth';
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, userType, name, websiteUrl, logoUrl, firstName, lastName } = req.body;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    throw createHttpError(400, { message: 'Email already in use' })
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user with the associated role-specific fields
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      role: userType,
      [userType === "USER" ? "candidate" : "company"]: {
        create: {
          ...(userType === "USER"
            ? {
              firstName,
              lastName,
            }
            : {
              companyName: name,
              websiteLink: websiteUrl,
              logo: logoUrl,
            }),
        },
      },
    },
  });

  const verificationToken = signJwt(user.id, user.role, user.email);

  await db.verificationToken.create({
    data: {
      email: user.email,
      token: verificationToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });
  res.status(201).json({ message: 'Register Successfully!' });
})


export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction)=>{
  const { email, password } = req.body;
    console.log(email, password, req.headers.cookie)
    // console.log(email, password)
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      throw createHttpError(401, {message: "User doesn't exist"});
    }

    if (!user.emailVerified) {
      const existingToken = await getVerificationTokenByEmail(email);

      if (existingToken) {
        await db.verificationToken.delete({
          where: {
            id: existingToken.id
          }
        })
      }
      const verificationToken = signJwt(user.id, user.role, user.email);
      await db.verificationToken.create({
        data: {
          email: user.email,
          token: verificationToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
      throw createHttpError(401, {message: 'Please Check Your Email Verify Account!'});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, {message: 'Invalid credentials'});
    }

    const token = signJwt(user.id, user.role, user.email);
    // console.log(token)
    // Set token as an HTTP-only cookie
    // res.cookie('authToken', token, {
    //   httpOnly: true,        // Prevent JavaScript access
    //   secure: false,         // Disable for local development
    //   sameSite: 'lax',       // Adjust for your CORS requirements
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    //   path: '/',             // Set path to ensure it's sent to all routes
    // });
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    console.log(res)
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, profileCompleted: user.profileCompleted }, message: "Register Successfully!" });
})


export const verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      throw createHttpError(400, { message: 'Invalid or expired verification token' });
    }

    await db.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    });

    await db.verificationToken.delete({ where: { token } });

    res.json({ message: 'Email verified successfully' });
});


export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal that the user doesn't exist
      throw createHttpError(400, {message: "Account doesn't exist!"});
    }

    const resetToken = signJwt(user.id, user.role, user.email);

    await db.passwordResetToken.create({
      data: {
        email: user.email,
        token: resetToken,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: 'Password Reset Link Sent!' });
  } catch (error) {
    next(error);
  }
};
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
    const { newPassword } = req.body;

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      throw createHttpError(400, {message: 'Invalid or expired reset token'});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({ where: { token } });

    res.json({ message: 'Password reset successfully' });
});

export const logOut = async (req: Request, res: Response, next: NextFunction)=>{
  try {
    console.log("logout user")
    // Clear the authToken cookie
    res.clearCookie('authToken', {
      httpOnly: true,  // Ensures the cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production',  // Ensure it's only sent over HTTPS in production
      sameSite: 'strict',  // You can change it based on your requirements (Lax, Strict, or None)
      path: '/',  // Ensure it's cleared for the root path
    })
    res.json({
      message: "Logout Successful!"
    }).status(200)
  } catch (error) {
    console.log(error)
    next(error)
  }
}
// Endpoint to verify token
export const validateUser = (req: Request, res: Response) => {
  const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];
  console.log(token)
  if (!token) {
    throw createHttpError(400, { message: "Token not provided"})
  }

  try {
    // Verify the token
    // console.log(process.env.JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET! || "1234");
    // console.log(decoded)
    // Send user data (or success) if valid
    res.status(200).json({ valid: true, user: decoded });
  } catch (err) {
    // console.log(err)
    // Token invalid or expired
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
}

export const onBoarded = asyncHandler(async (req: Request, res: Response, next: NextFunction)=>{
  const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];
  console.log(token)
  if (!token) {
    throw createHttpError(400, { message: "Token not provided"})
  }

  try {
    // Verify the token
    console.log(process.env.JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET! || "1234") as CustomJwtPayload;;
    console.log(decoded)
    const user = await db.user.findUnique({
      where: {
        id: decoded.userId
      },
      select: {
        profileCompleted: true,
        role: true
      }
    })
    console.log(user)
    if(!user) return next(createHttpError(404, { message: "User Not Found!"}))
    // Send user data (or success) if valid
    res.status(200).json({ onBoarded: user.profileCompleted, role: user.role });
  } catch (err) {
    console.log(err)
    // Token invalid or expired
    res.status(401).json({ message: 'Invalid token' });
  }
})