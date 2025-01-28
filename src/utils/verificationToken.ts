import db from "../lib/prisma";

export const getVerificationTokenByEmail = async (email: string)=>{
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: {
        email
      }
    })
    return verificationToken;
  } catch (error) {
    // console.log(error)
    return null;
  }
}
