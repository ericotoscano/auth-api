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
router.post("/login", validateSchema(loginSchema, "body"), login);

router.post(
  "/verify",
  validateSchema(jwtSchema, "body"),
  validateToken("verification"),
  verifyUser
);
//vir daqui
router.post(
  "/verification/resend",
  validateSchema(userEmailSchema, "body"),
  resendVerificationEmail
);

router.post(
  "/password/forgot",
  validateSchema(userEmailSchema, "body"),
  sendResetPasswordEmail
);
router.post(
  "/password/reset",
  validateSchema(jwtSchema, "body"),
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
router.post(
  "/logout",
  validateSchema(authorizationSchema, "headers"),
  validateToken("refresh"),
  logout
);

export default router;
