import nodemailer from "nodemailer";
import { ENV } from "../env/env";

export const transporter = nodemailer.createTransport({
  host: ENV.MAIL_HOST,
  port: Number(ENV.MAIL_PORT),
  secure: false,
  auth: {
    user: ENV.MAIL_USER,
    pass: ENV.MAIL_PASSWORD,
  },
});
