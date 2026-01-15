import { MailOptions } from "nodemailer/lib/sendmail-transport";
import {
  EmailType,
  EmailPayload,
  EmailTemplateParams,
} from "../types/auth/auth.mail.types";
import { ENV } from "./env.utils";

export const buildEmailTemplate = ({
  title,
  intro,
  actionText,
  actionUrl,
  expiresInMinutes,
  footerNote,
}: EmailTemplateParams): string => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
      <h2>${title}</h2>

      <p>Hello,</p>

      <p>${intro}</p>

      <p style="margin: 24px 0;">
        <a
          href="${actionUrl}"
          style="
            background-color: #4f46e5;
            color: #ffffff;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          "
        >
          ${actionText}
        </a>
      </p>

      ${
        expiresInMinutes
          ? `<p><strong>Note:</strong> This link will expire in ${expiresInMinutes} minutes.</p>`
          : ""
      }

      ${footerNote ? `<p style="color: #666;">${footerNote}</p>` : ""}

      <hr style="margin: 24px 0;" />

      <p style="font-size: 0.9rem; color: #666;">
        This is an automated message. Please do not reply.
      </p>

      <p>
        Best regards,<br />
        <strong>ETOSolutions</strong>
      </p>
    </div>
  `;
};

export const getEmailOptions = (
  type: EmailType,
  payload: EmailPayload
): MailOptions => {
  const { email, token } = payload;

  switch (type) {
    case "verification": {
      const verificationUrl = `${ENV.APP_ORIGIN}${ENV.API_PORT}/verify.html?token=${token}`;

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
      const resetPasswordUrl = `${ENV.APP_ORIGIN}${ENV.API_PORT}/reset-password.html?token=${token}`;

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
