import z from "zod";
import {
  jwtSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "../schemas";
import { userEmailSchema } from "../../users/schemas";

export type SignUpRequestBody = z.infer<typeof signUpSchema>;

export type LoginRequestBody = z.infer<typeof loginSchema>;

export type ResetPasswordRequestBody = z.infer<typeof resetPasswordSchema>;

export type EmailRequestBody = z.infer<typeof userEmailSchema>;

export type VerifyRequestBody = z.infer<typeof jwtSchema>;
