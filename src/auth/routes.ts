import { Router } from "express";
import {
  login,
  logout,
  refreshAccessToken,
  resendVerificationEmail,
  resetPassword,
  sendResetPasswordEmail,
  signup,
  verify,
} from "./controller";
import { validateSchema } from "../infra/http/middlewares/validate-schema.middleware";
import { loginSchema, resetPasswordSchema, signUpSchema } from "./schemas";
import { validateToken } from "./middlewares";
import { userEmailSchema } from "../users/schemas";

const router = Router();

router.post("/signup", validateSchema(signUpSchema, "body"), signup);
router.post("/login", validateSchema(loginSchema, "body"), login);
router.post("/verify", validateToken("verification"), verify);
router.post(
  "/verification/resend",
  validateSchema(userEmailSchema, "body"),
  resendVerificationEmail,
);
router.post(
  "/password/reset",
  validateToken("resetPassword"),
  validateSchema(resetPasswordSchema, "body"),
  resetPassword,
);
router.post(
  "/password/forgot",
  validateSchema(userEmailSchema, "body"),
  sendResetPasswordEmail,
);
router.post("/token/refresh", validateToken("refresh"), refreshAccessToken);
router.post("/logout", validateToken("refresh"), logout);

export default router;
