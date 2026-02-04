import z from "zod";
import {
  jwtSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "../schemas";
import { userEmailSchema } from "../../users/schemas";

export type SignUpRequest = z.infer<typeof signUpSchema>;

export type LoginRequest = z.infer<typeof loginSchema>;

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;

export type EmailInputRequest = z.infer<typeof userEmailSchema>;

export type TokenVerificationRequest = z.infer<typeof jwtSchema>;
