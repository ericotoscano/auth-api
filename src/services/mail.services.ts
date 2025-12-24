import { MailOptions } from "nodemailer/lib/json-transport/index.js";
import { ENV } from "../utils/env.utils.ts";
import { EmailPayload, EmailType } from "../types/mail.types.ts";
import { transporter } from "../config/mail.config.ts";
import { logger } from "../utils/logger.ts";

export const sendEmailService = async (
  type: EmailType,
  payload: EmailPayload
): Promise<boolean> => {
  try {
    const mailOptions = getEmailOptions(type, payload);

    await transporter.verify();

    const info = await transporter.sendMail(mailOptions);

    return true;
  } catch (error: any) {
    logger.error(`Failed to send ${type} email`, {
      errorCode: error.code,
      details: { message: error.message },
      stack: error.stack,
    });

    return false;
  }
};

const getEmailOptions = (
  type: EmailType,
  payload: EmailPayload
): MailOptions => {
  const { email, token } = payload;

  switch (type) {
    case "verification":
      const verificationUrl: string = `${ENV.APP_ORIGIN}:${ENV.API_PORT}/api/v1/auth/verify/${token}`;
      return {
        from: "noreply@authapi.com",
        to: email,
        subject: "User Account Verification",
        html: `
          <h1>Verify Your Account</h1>
          <p>Hello,</p>
          <p>Thank you for signing up for <strong>Auth Api</strong>!</p>
          <p>To verify your account, please click the link below or paste it into your browser:</p>
          <p><a href="${verificationUrl}">Click here to verify your account</a></p>
          <p><strong>Note:</strong> This token will expire in ${ENV.VERIFICATION_TOKEN_DURATION_MINUTES} minutes for security reasons.</p>
          <p><em>If you did not create an account with us, you can safely ignore this email.</em></p>
          <p><strong>This is an automated message. Please do not reply.</strong></p>
          <p>Best regards,<br>ETOSolutions</p>
        `,
      };
    case "resetPassword":
      return {
        from: "noreply@authapi.com",
        to: email,
        subject: "Reset Your Password",
        html: `
            <h1>Password Reset Request</h1>
            <p>Hello,</p>
            <p>You requested to reset your password for <strong>Auth Api</strong>.</p>
            <p>Please use the following token to continue the password reset process:</p>
            <p style="font-size: 1.5rem; font-weight: bold; letter-spacing: 0.1em;">${token}</p>
            <p><strong>Note:</strong> This token will expire in ${ENV.RESET_PASSWORD_TOKEN_DURATION_MINUTES} minutes for security reasons.</p>
            <p><em>If you did not request a password reset, you can safely ignore this email.</em></p>
            <p><strong>This is an automated message. Please do not reply.</strong></p>
            <p>Best regards,<br>ETOSolutions</p>
          `,
      };
  }
};
