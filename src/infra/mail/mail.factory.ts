import { MailOptions } from "nodemailer/lib/sendmail-transport";
import { EmailType, EmailPayload } from "./mail.types";
import { ENV } from "../env/env";
import { buildEmailTemplate } from "./mail.template";

export const getEmailOptions = (
  type: EmailType,
  payload: EmailPayload,
): MailOptions => {
  const { email, token } = payload;

  switch (type) {
    case "verification": {
      const verificationUrl = `${ENV.APP_ORIGIN}/verify.html?token=${token}`;

      return {
        from: "noreply@authapi.com",
        to: email,
        subject: "Verify your account",
        html: buildEmailTemplate({
          title: "Verify your account",
          intro:
            "Thank you for signing up for Auth API. Please confirm your email address by clicking the button below.",
          actionText: "Verify Account",
          actionUrl: verificationUrl,
          expiresInMinutes: Number(ENV.VERIFICATION_TOKEN_DURATION_MINUTES),
          footerNote:
            "If you did not create an account, you can safely ignore this email.",
        }),
      };
    }

    case "resetPassword": {
      const resetPasswordUrl = `${ENV.APP_ORIGIN}/reset-password.html?token=${token}`;

      return {
        from: "noreply@authapi.com",
        to: email,
        subject: "Reset your password",
        html: buildEmailTemplate({
          title: "Reset your password",
          intro:
            "We received a request to reset the password for your Auth API account.",
          actionText: "Reset Password",
          actionUrl: resetPasswordUrl,
          expiresInMinutes: Number(ENV.RESET_PASSWORD_TOKEN_DURATION_MINUTES),
          footerNote:
            "If you did not request a password reset, you can safely ignore this email.",
        }),
      };
    }
  }
};
