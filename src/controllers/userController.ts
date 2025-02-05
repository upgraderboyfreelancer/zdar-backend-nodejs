import type { Request, Response, NextFunction } from 'express';


import { UserRole } from '@prisma/client';
import db from '../lib/prisma';
import createHttpError from 'http-errors';


export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role, email } = req.user!;
    const profileData = req.body;
    // console.log(profileData)

    if (!userId) {
      throw createHttpError(404, {message: 'Profile not found'});
    }
    const user = await db.user.findUnique({
      where: {
        id: userId
      }
    })
    // console.log(user)
    let updatedUser;

    if (role === UserRole.USER) {
      updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          candidate: {
            update: {
              data: profileData,
            },
          },
          profileCompleted: true,
        },
        include: { candidate: true },
      });
    } else if (role === UserRole.COMPANY) {
      updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          company: {
            update: {
              data: profileData,
            },
          },
          profileCompleted: true,
        },
        include: { company: true },
      });
    } else {
      throw createHttpError(400, {message: 'Invalid user role'});
    }

    res.json({
      profileCompleted: updatedUser?.profileCompleted,
      success: true,
      message: "Updated Successfully!",
      data: updatedUser
    });
  } catch (error) {
    // console.log(error)
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("5728734")
    const { userId, role } = req.user!;
    // console.log(userId)
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        candidate: role === UserRole.USER,
        company: role === UserRole.COMPANY,
        email: true,
        role: true
      }
    });

    if (!user) {
      throw createHttpError(404, {message: 'User not found'});
    }
    const data = role === UserRole.USER ? user.candidate : user.company;
    console.log(user)
    res.status(200).json({
      success: true,
      message: "User fetched!",
      data: user
    });
  } catch (error) {
    // console.log(error)
    next(error);
  }
};


export const getProfileState = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // console.log('dklhdlkfhlsdhfl')
    const { userId, role } = req.user!;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        candidate: role === UserRole.USER,
        company: role === UserRole.COMPANY,
      },
    });

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    res.json({profileCompleted: user.profileCompleted});
  } catch (error) {
    // console.log(error)
    next(error);
  }
};

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {

    res.json({isAuth: true, role: req?.user?.role});
  } catch (error) {
    // console.log(error)
    next(error);
  }
};

