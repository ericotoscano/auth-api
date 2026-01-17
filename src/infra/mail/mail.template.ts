import { EmailTemplateParams } from "./mail.types";

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
