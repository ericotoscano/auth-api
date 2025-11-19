import nodemailer from 'nodemailer';
import { ENV } from '../utils/env.utils';

export const transporter = nodemailer.createTransport({
  host: ENV.MAIL_HOST,
  port: Number(ENV.MAIL_PORT),
  secure: false,
  auth: {
    user: ENV.MAIL_USER,
    pass: ENV.MAIL_PASSWORD,
  },
});
