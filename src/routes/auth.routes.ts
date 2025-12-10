import { Router } from "express";
import {
  login,
  logout,
  refreshUserAccessToken,
  resendVerificationEmail,
  resetPassword,
  sendResetPasswordEmail,
  signup,
  verifyUser,
} from "../controllers/auth.controller";
import { validateSchema } from "../middlewares/validation.middlewares";
import {
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "../schemas/auth.schemas";
import { validateToken } from "../middlewares/auth.middlewares";
import {
  jwtSchema,
  authorizationSchema,
  refreshTokenSchema,
} from "../schemas/token.schemas";
import { userEmailSchema } from "../schemas/user.schemas";

const router = Router();

router.post("/signup", validateSchema(signUpSchema, "body"), signup);

router.get(
  "/verify/:token",
  validateSchema(jwtSchema, "params"),
  validateToken("verification"),
  verifyUser
);
router.post(
  "/verify/resend",
  validateSchema(userEmailSchema, "body"),
  resendVerificationEmail
);
//continuar arrumando os logs daqui
router.post("/login", validateSchema(loginSchema, "body"), login);

router.delete(
  "/logout",
  validateSchema(authorizationSchema, "headers"),
  validateToken("refresh"),
  logout
);

router.post(
  "/password/request",
  validateSchema(userEmailSchema, "body"),
  sendResetPasswordEmail
);
router.post(
  "/password/reset/:token",
  validateSchema(jwtSchema, "params"),
  validateToken("resetPassword"),
  validateSchema(resetPasswordSchema, "body"),
  resetPassword
);

router.post(
  "/token/refresh",
  validateSchema(refreshTokenSchema, "cookies"),
  validateToken("refresh"),
  refreshUserAccessToken
);

export default router;
