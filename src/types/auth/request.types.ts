import z from "zod";
import {
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "../../schemas/auth.schemas";
import { userEmailSchema } from "../../schemas/user.schemas";
import { jwtSchema } from "../../schemas/token.schemas";

export type SignUpRequestBody = z.infer<typeof signUpSchema>;

export type LoginRequestBody = z.infer<typeof loginSchema>;

export type ResetPasswordRequestBody = z.infer<typeof resetPasswordSchema>;

export type EmailRequestBody = z.infer<typeof userEmailSchema>;

export type JWTRequestBody = z.infer<typeof jwtSchema>;
