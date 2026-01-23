import { Resend } from "resend";
import { RESEND_API_KEY, FRONTEND_URL } from "../config/env.js";

const resend = new Resend(RESEND_API_KEY);

export async function sendResetEmail(email, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "PopLog <onboarding@resend.dev>",
    to: email,
    subject: "Reset your PopLog password",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 30 minutes.</p>
    `,
  });
}
