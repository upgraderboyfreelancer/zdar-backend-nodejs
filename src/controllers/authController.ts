import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from "express";
import db from "../lib/prisma";
import createHttpError from 'http-errors';
import { signJwt } from '../lib/jwt';
import { getVerificationTokenByEmail } from '../utils/verificationToken';
import asyncHandler from '../lib';
import { sendPasswordResetEmail } from '../lib/email';
import jwt from "jsonwebtoken";
import { UserRole } from '@prisma/client';

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, logoUrl, userType, name, websiteUrl, firstName, lastName } = req.body;
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
              logo: logoUrl
            }
            : {
              companyName: name,
              websiteLink: websiteUrl,
              logo: logoUrl
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
  res.status(201).json({ success: true, message: 'Register Successfully!', sendToEmail: email });
})


export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction)=>{
  const { email, password } = req.body;
    // console.log(email, password, req.headers.cookie)
    // console.log(email, password)
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return next(createHttpError(401, {message: "User doesn't exist"}));
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
      return next(createHttpError(401, {message: 'Please Check Your Email Verify Account!'}));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createHttpError(401, {message: 'Invalid credentials'}));
    }

    const token = signJwt(user.id, user.role, user.email);
    // console.log(token)
    res.cookie("authToken", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, profileCompleted: user.profileCompleted }, success: true, message: "Login Successfully!" });
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

    await db.verificationToken.delete({ where: {
      id: verificationToken?.id
     }});

    res.json({ success: true, message: 'Email verified successfully', data: {
      success: true
    } });
});


export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
    res.json({ success: true, message: 'Password Reset Link Sent!' });
});

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
    res.json({ success: true, message: 'Password reset successfully' });
});

export const logOut = asyncHandler(async (req: Request, res: Response, next: NextFunction)=>{
  res.clearCookie('authToken')
    res.json({
      success: true,
      message: "Logout Successful!"
    }).status(200)
})

export const validateUser = asyncHandler((req: Request, res: Response) => {
  const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];
  console.log(token)
  if (!token) {
    throw createHttpError(200)
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET! || "YOUR_SECRET");
  console.log(decoded)
  res.status(200).json({ success: true, valid: true, data: decoded });
})



export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("5728734")
    const { userId, role } = req.user!;
    // console.log(userId)
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        candidate: role === UserRole.USER ? {
          include: {
            appliedJobs: true,
          }
        } : false,
        company: role === UserRole.COMPANY ? {
          include: {
            subscription: true
          }
        } : false,
        email: true,
        role: true
      },
    });

    if (!user) {
      throw createHttpError(404, {message: 'User not found'});
    }
    const data = role === UserRole.USER ? user.candidate : user.company;
    console.log(user)
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    // console.log(error)
    next(error);
  }
};