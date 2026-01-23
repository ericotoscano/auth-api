import { logger } from "../logger/logger.ts";
import { transporter } from "./mail.config.ts";
import { getEmailOptions } from "./mail.factory.ts";
import { EmailType, EmailPayload } from "./mail.types.ts";

export const sendEmailService = async (
  type: EmailType,
  payload: EmailPayload,
): Promise<boolean> => {
  try {
    const mailOptions = getEmailOptions(type, payload);

    await transporter.verify();

    await transporter.sendMail(mailOptions);

    return true;
  } catch (error: any) {
    logger.warn(`Failed to send ${type} email`, {
      errorCode: "EMAIL_SEND_FAILED",
      details: { message: error.message },
    });

    return false;
  }
};
