import { EmailPayload, EmailType } from "../types/auth/auth.mail.types.ts";
import { transporter } from "../config/mail.config.ts";
import { logger } from "../utils/logger.ts";
import { getEmailOptions } from "../utils/mail.utils.ts";

export const sendEmailService = async (
  type: EmailType,
  payload: EmailPayload
): Promise<boolean> => {
  try {
    const mailOptions = getEmailOptions(type, payload);

    await transporter.verify();

    await transporter.sendMail(mailOptions);

    return true;
  } catch (error: any) {
    logger.error(`Failed to send ${type} email`, {
      errorCode: "EMAIL_SEND_FAILED",
      details: { message: error.message },
      stack: error.stack,
    });

    return false;
  }
};
