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
import {
  LoginServiceReturn,
  RefreshUserAccessTokenServiceReturn,
} from "../types/auth/services.types";
import { UserType } from "../types/user/user.type";
import { ENV } from "../utils/env.utils";
import {
  ResetPasswordTokenPayload,
  VerificationTokenPayload,
} from "../types/token.types";
import { SignUpServiceReturn } from "../types/user/services.types";
import { SignUpRequestBody } from "../types/auth/request.types";
import { createToken } from "../utils/token.utils";

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
  tokenPayload: VerificationTokenPayload
): Promise<UserType> => {
  let user: UserType;
  let verifiedUser: UserType;

  try {
    user = await findUserService({ username: tokenPayload.username });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError(
        "Token Verification Failed",
        "The provided token is invalid or the associated user does not exist.",
        "TOKEN_VERIFICATION_ERROR",
        { type: "verification" }
      );
    }

    throw error;
  }

  if (user.isVerified) {
    throw new ConflictError(
      "User Verification Conflict",
      "The user has already been verified. You can log in normally.",
      "VERIFICATION_CONFLICT_ERROR",
      { isVerified: user.isVerified }
    );
  }

  try {
    verifiedUser = await updateUserByIdService(user._id, {
      set: { isVerified: true },
      unset: ["verificationToken"],
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundError(
        "User Not Found",
        "The user could not be found during verification.",
        "VERIFY_USER_ERROR",
        {}
      );
    }

    throw error;
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
      throw new NotFoundError(
        "User Not Found",
        "The provided email is incorrect or the user does not exist.",
        "USER_NOT_FOUND_ERROR",
        {}
      );
    }

    throw error;
  }

  if (user.isVerified) {
    throw new ConflictError(
      "User Verification Conflict",
      "The user has already been verified. You can log in normally.",
      "VERIFICATION_CONFLICT_ERROR",
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
        "USER_NOT_FOUND_ERROR",
        {}
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
      "RESEND_EMAIL_ERROR",
      {}
    );
  }
};

export const loginService = async (
  identifier: string,
  password: string
): Promise<LoginServiceReturn> => {
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
        "The provided email or password is incorrect or the user does not exist.",
        "CREDENTIALS_ERROR",
        {}
      );
    }

    throw error;
  }

  if (!user.isVerified) {
    throw new UnauthorizedError(
      "User Not Verified",
      "This account must be verified before signing in.",
      "USER_VERIFIED_ERROR",
      { isVerified: user.isVerified }
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError(
      "Invalid Credentials",
      "The provided email or password is incorrect or the user does not exist.",
      "CREDENTIALS_ERROR",
      {}
    );
  }

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
    { _id: user._id },
    {
      secret: ENV.REFRESH_TOKEN_SECRET_KEY,
      expiresInMinutes: Number(ENV.REFRESH_TOKEN_DURATION_MINUTES),
      audience: "urn:jwt:type:refresh",
      issuer: "urn:system:token-issuer:type:refresh",
    }
  );
  //continuar daqui revendo os erros etc
  try {
    updatedUser = await updateUserByIdService(user._id, {
      set: { refreshToken, lastLogin: new Date().toISOString() },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundError(
        "User Not Found",
        "The user could not be found during login.",
        "LOGIN_USER_NOT_FOUND",
        {}
      );
    }

    throw error;
  }

  const loggedInUser = { accessToken, ...updatedUser };

  return { loggedInUser, refreshToken };
};

export const logoutService = async (user: UserType): Promise<void> => {
  const { _id } = user;
  let updatedUser: UserType;

  try {
    updatedUser = await updateUserByIdService(_id, { unset: ["refreshToken"] });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundError(
        "User Not Found",
        "The user could not be found during logout.",
        "LOGOUT_USER_NOT_FOUND",
        {}
      );
    }

    throw error;
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
      throw new NotFoundError(
        "User Not Found",
        "The provided email is incorrect or the user does not exist.",
        "SEND_RESET_PASSWORD_USER_NOT_FOUND",
        {}
      );
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
    if (error instanceof NotFoundError) {
      throw new NotFoundError(
        "User Not Found",
        "The user could not be found during send reset password email.",
        "SEND_RESET_PASSWORD_USER_NOT_FOUND",
        {}
      );
    }

    throw error;
  }

  const emailSent = await sendEmailService("resetPassword", {
    email: user.email,
    token: resetPasswordToken,
  });

  if (!emailSent) {
    throw new InternalServerError(
      "Email Not Sent",
      "Failed to send the reset password email. Please try again later.",
      "SEND_RESET_PASSWORD_EMAIL_FAILED",
      {}
    );
  }
};

export const resetPasswordService = async (
  tokenPayload: ResetPasswordTokenPayload,
  password: string
): Promise<void> => {
  let user: UserType;

  try {
    user = await findUserService({ username: tokenPayload.username });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError(
        "Invalid Token",
        "The provided reset password token is invalid or the user does not exist.",
        "RESET_PASSWORD_TOKEN_INVALID",
        {}
      );
    }

    throw error;
  }

  if (!user.isVerified) {
    throw new UnauthorizedError(
      "User Not Verified",
      "This account must be verified before requesting a password reset.",
      "RESET_PASSWORD_USER_UNVERIFIED",
      {}
    );
  }

  try {
    await updateUserByIdService(user._id, {
      set: { password },
      unset: ["resetPasswordToken"],
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundError(
        "User Not Found",
        "The user could not be found during reset password.",
        "RESET_PASSWORD_USER_NOT_FOUND",
        {}
      );
    }

    throw error;
  }
};

export const refreshUserAccessTokenService = async (
  user: UserType
): Promise<RefreshUserAccessTokenServiceReturn> => {
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
    { _id: user._id },
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
    if (error instanceof NotFoundError) {
      throw new NotFoundError(
        "User Not Found",
        "The user could not be found during refresh access token.",
        "REFRESH_ACCESS_TOKEN_USER_NOT_FOUND",
        {}
      );
    }

    throw error;
  }

  const refreshedUserAccessToken = { ...updatedUser, accessToken };

  return { refreshedUserAccessToken, refreshToken };
};
