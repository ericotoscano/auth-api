import bcrypt from "bcryptjs";
import {
  createUserService,
  findUserService,
  updateUserByIdService,
} from "./user.services";
import { sendEmailService } from "./mail.services";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../config/CustomError";
import { UserAndTokenServiceReturn } from "../types/auth/services.types";
import { UserType } from "../types/user/user.type";
import { ENV } from "../utils/env.utils";
import { EmailTokenPayload } from "../types/token.types";
import { SignUpRequestBody } from "../types/auth/request.types";
import { createToken, throwInvalidTokenError } from "../utils/token.utils";
import { SignUpServiceReturn } from "../types/user/services.types";

export const signUpService = async (
  signUpBody: SignUpRequestBody
): Promise<SignUpServiceReturn> => {
  const createdUser = await createUserService(signUpBody);

  const emailSent = await sendEmailService("verification", {
    email: createdUser.email,
    token: createdUser.verificationToken,
  });

  return { createdUser, emailSent };
};

export const verifyUserService = async (
  tokenPayload: EmailTokenPayload
): Promise<UserType> => {
  let user: UserType;
  let verifiedUser: UserType;

  try {
    user = await findUserService({ username: tokenPayload.username });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throwInvalidTokenError("verification");
    }

    throw error;
  }

  if (user.isVerified) {
    throw new ConflictError(
      "User Verification Conflict",
      "The user has already been verified. You can log in normally.",
      "USER_CONFLICT"
    );
  }

  try {
    verifiedUser = await updateUserByIdService(user._id, {
      set: { isVerified: true },
      unset: ["verificationToken"],
    });
  } catch (error) {
    throw new InternalServerError(
      "User Verification Failed",
      "An unexpected error occurred while verifying the user.",
      "USER_UPDATE_FAILED"
    );
  }

  return verifiedUser;
};

export const resendVerificationEmailService = async (
  email: string
): Promise<void> => {
  let user: UserType;

  try {
    user = await findUserService({ email });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return;
    }

    throw error;
  }

  if (user.isVerified) {
    throw new ConflictError(
      "User Verification Conflict",
      "The user has already been verified. You can log in normally.",
      "USER_CONFLICT",
      { isVerified: user.isVerified }
    );
  }

  const verificationToken = createToken(
    { username: user.username },
    {
      secret: ENV.VERIFICATION_TOKEN_SECRET_KEY,
      expiresInMinutes: Number(ENV.RESET_PASSWORD_TOKEN_DURATION_MINUTES),
      audience: "urn:jwt:type:verification",
      issuer: "urn:system:token-issuer:type:verification",
    }
  );

  try {
    await updateUserByIdService(user._id, { set: { verificationToken } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundError(
        "User Not Found",
        "The user could not be found during resend verification email.",
        "USER_NOT_FOUND"
      );
    }

    throw error;
  }

  const emailSent = await sendEmailService("verification", {
    email: user.email,
    token: verificationToken,
  });

  if (!emailSent) {
    throw new InternalServerError(
      "Email Not Sent",
      "Failed to resend the verification email. Please try again later.",
      "EMAIL_SEND_FAILED"
    );
  }
};

export const loginService = async (
  identifier: string,
  password: string
): Promise<UserAndTokenServiceReturn> => {
  let user: UserType;
  let updatedUser: UserType;

  const loginOption = /\S+@\S+\.\S+/.test(identifier)
    ? { email: identifier }
    : { username: identifier };

  try {
    user = await findUserService(loginOption, "+password");
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError(
        "Invalid Credentials",
        "The provided email or password is incorrect.",
        "AUTH_INVALID_CREDENTIALS"
      );
    }

    throw error;
  }

  if (!user.isVerified) {
    throw new UnauthorizedError(
      "User Not Verified",
      "This account must be verified before signing in.",
      "AUTH_USER_NOT_VERIFIED"
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError(
      "Invalid Credentials",
      "The provided email or password is incorrect.",
      "AUTH_INVALID_CREDENTIALS"
    );
  }

  const accessToken = createToken(
    { id: user._id, username: user.username, email: user.email },
    {
      secret: ENV.ACCESS_TOKEN_SECRET_KEY,
      expiresInMinutes: Number(ENV.ACCESS_TOKEN_DURATION_MINUTES),
      audience: "urn:jwt:type:access",
      issuer: "urn:system:token-issuer:type:access",
    }
  );

  const refreshToken = createToken(
    { id: user._id },
    {
      secret: ENV.REFRESH_TOKEN_SECRET_KEY,
      expiresInMinutes: Number(ENV.REFRESH_TOKEN_DURATION_MINUTES),
      audience: "urn:jwt:type:refresh",
      issuer: "urn:system:token-issuer:type:refresh",
    }
  );

  try {
    updatedUser = await updateUserByIdService(user._id, {
      set: { refreshToken, lastLogin: new Date().toISOString() },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new InternalServerError(
        "User Update Failed",
        "An unexpected error occurred while updating the user session.",
        "USER_UPDATE_FAILED"
      );
    }

    throw error;
  }

  return { updatedUser, accessToken, refreshToken };
};

export const logoutService = async (user: UserType): Promise<void> => {
  const { _id } = user;

  try {
    await updateUserByIdService(_id, { unset: ["refreshToken"] });
  } catch (error) {
    throw new InternalServerError(
      "User Update Failed",
      "An unexpected error occurred while updating the user session.",
      "USER_UPDATE_FAILED"
    );
  }
};

export const sendResetPasswordEmailService = async (
  email: string
): Promise<void> => {
  let user: UserType;

  try {
    user = await findUserService({ email });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return;
    }

    throw error;
  }

  const resetPasswordToken = createToken(
    { username: user.username },
    {
      secret: ENV.RESET_PASSWORD_TOKEN_SECRET_KEY,
      expiresInMinutes: Number(ENV.RESET_PASSWORD_TOKEN_DURATION_MINUTES),
      audience: "urn:jwt:type:reset-password",
      issuer: "urn:system:token-issuer:type:reset-password",
    }
  );

  try {
    await updateUserByIdService(user._id, { set: { resetPasswordToken } });
  } catch (error) {
    throw new InternalServerError(
      "User Update Failed",
      "An unexpected error occurred while preparing the password reset.",
      "USER_UPDATE_FAILED"
    );
  }

  const emailSent = await sendEmailService("resetPassword", {
    email: user.email,
    token: resetPasswordToken,
  });

  if (!emailSent) {
    throw new InternalServerError(
      "Email Not Sent",
      "Failed to send the reset password email. Please try again later.",
      "EMAIL_SEND_FAILED"
    );
  }
};

export const resetPasswordService = async (
  tokenPayload: EmailTokenPayload,
  password: string
): Promise<void> => {
  let user: UserType;

  try {
    user = await findUserService({ username: tokenPayload.username });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError(
        "Invalid Reset Token",
        "The reset password token is invalid or has expired.",
        "AUTH_INVALID_TOKEN"
      );
    }

    throw error;
  }

  if (!user.isVerified) {
    throw new UnauthorizedError(
      "User Not Verified",
      "This account must be verified before resetting the password.",
      "AUTH_USER_NOT_VERIFIED"
    );
  }

  try {
    await updateUserByIdService(user._id, {
      set: { password },
      unset: ["resetPasswordToken"],
    });
  } catch (error) {
    throw new InternalServerError(
      "Password Reset Failed",
      "An unexpected error occurred while resetting the password.",
      "USER_UPDATE_FAILED"
    );
  }
};

export const refreshUserAccessTokenService = async (
  user: UserType
): Promise<UserAndTokenServiceReturn> => {
  let updatedUser: UserType;

  const accessToken = createToken(
    { _id: user._id, username: user.username, email: user.email },
    {
      secret: ENV.ACCESS_TOKEN_SECRET_KEY,
      expiresInMinutes: Number(ENV.ACCESS_TOKEN_DURATION_MINUTES),
      audience: "urn:jwt:type:access",
      issuer: "urn:system:token-issuer:type:access",
    }
  );
  const refreshToken = createToken(
    { id: user._id },
    {
      secret: ENV.REFRESH_TOKEN_SECRET_KEY,
      expiresInMinutes: Number(ENV.REFRESH_TOKEN_DURATION_MINUTES),
      audience: "urn:jwt:type:refresh",
      issuer: "urn:system:token-issuer:type:refresh",
    }
  );

  try {
    updatedUser = await updateUserByIdService(user._id, {
      set: { refreshToken },
    });
  } catch (error) {
    throw new InternalServerError(
      "Token Refresh Failed",
      "An unexpected error occurred while refreshing the access token.",
      "USER_UPDATE_FAILED"
    );
  }

  return { updatedUser, accessToken, refreshToken };
};
