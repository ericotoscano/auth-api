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
} from "./controller";
import { validateSchema } from "../middlewares/validation.middlewares";
import { loginSchema, resetPasswordSchema, signUpSchema } from "./schemas";
import { validateToken } from "./middlewares";
import { userEmailSchema } from "../users/schemas";

const router = Router();

router.post("/signup", validateSchema(signUpSchema, "body"), signup);
router.post("/login", validateSchema(loginSchema, "body"), login);

router.post("/verify", validateToken("verification"), verifyUser);
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

router.post("/token/refresh", validateToken("refresh"), refreshUserAccessToken);
router.post("/logout", validateToken("refresh"), logout);

export default router;
