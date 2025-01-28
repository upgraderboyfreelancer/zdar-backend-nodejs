import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  await resend.emails.send({
    from: 'auth@service.upgraderboy.tech',
    to,
    subject: 'Verify your email',
    html: `
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `,
  });
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await resend.emails.send({
    from: 'auth@service.upgraderboy.tech',
    to,
    subject: 'Reset your password',
    html: `
      <p>Please click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });
};
