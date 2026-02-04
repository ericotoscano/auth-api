import bcrypt from "bcryptjs";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors/custom-error";
import { createTokenService } from "./token.services";
import {
  createUserService,
  updateUserByIdService,
  findUserService,
  findUserDocumentService,
} from "../../users/services";
import { SignUpRequest } from "../types/request.types";
import { sendEmailService } from "../../infra/mail/mail.service";
import { EmailTokenVerified } from "../types/token.types";
import { mongoose } from "../../infra/db/mongoose";
import { UserMapper } from "../../users/mappers";
import {
  UserSignedUp,
  UserSession,
  UserVerified,
  UserForLogin,
  UserForVerification,
  UserForSendEmail,
  UserForResetPassword,
  UserForAccess,
} from "../types/services.types";

export const signUpService = async (
  signUpBody: SignUpRequest,
): Promise<UserSignedUp> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userCreated = await createUserService(signUpBody, session);
    const { _id, username, email } = userCreated;

    const verificationToken = createTokenService({ username }, "verification");

    await updateUserByIdService(
      _id,
      {
        set: { verificationToken },
      },
      session,
    );

    await session.commitTransaction();

    const emailSent = await sendEmailService("verification", {
      email,
      token: verificationToken,
    });

    return { userCreated, emailSent };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    session.endSession();
  }
};

export const loginService = async (
  identifier: string,
  password: string,
): Promise<UserSession> => {
  const loginOption = /\S+@\S+\.\S+/.test(identifier)
    ? { email: identifier }
    : { username: identifier };

  const userForLogin = await authenticateUser(loginOption, password);

  const { _id, username, email } = userForLogin;
  const id = _id.toString();

  try {
    const accessToken = createTokenService(
      {
        id,
        username,
        email,
      },
      "access",
    );
    const refreshToken = createTokenService({ id }, "refresh");

    const updatedUserDoc = await updateUserByIdService(_id, {
      set: { refreshToken },
    });

    const userLoggedIn = UserMapper.toLoggedIn(updatedUserDoc);

    return { user: userLoggedIn, accessToken, refreshToken };
  } catch (error) {
    throw new InternalServerError(
      "Login Failed",
      "An unexpected error occurred while completing the login process.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export const verifyService = async (
  tokenPayload: EmailTokenVerified,
): Promise<UserVerified> => {
  const userForVerification = await verifyUserForVerification(tokenPayload);
  const { _id } = userForVerification;

  try {
    const updatedUserDoc = await updateUserByIdService(_id, {
      set: { isVerified: true },
      unset: ["verificationToken"],
    });

    const userVerified = UserMapper.toVerified(updatedUserDoc);

    return userVerified;
  } catch {
    throw new InternalServerError(
      "User Verification Failed",
      "An unexpected error occurred while verifying the user.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export const resendVerificationEmailService = async (
  email: string,
): Promise<void> => {
  const userForVerificationEmail = await verifyUserForVerificationEmail(email);
  const { _id, username } = userForVerificationEmail;

  try {
    const verificationToken = createTokenService({ username }, "verification");

    await updateUserByIdService(_id, {
      set: { verificationToken },
    });

    const emailSent = await sendEmailService("verification", {
      email,
      token: verificationToken,
    });

    if (!emailSent) {
      throw new InternalServerError(
        "Email Not Sent",
        "Failed to resend the verification email. Please try again later.",
        "EMAIL_SEND_FAILED",
      );
    }
  } catch (error) {
    if (error instanceof InternalServerError) {
      throw error;
    }

    throw new InternalServerError(
      "Resend Verification Failed",
      "An unexpected error occurred while resending the verification email.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export const resetPasswordService = async (
  tokenPayload: EmailTokenVerified,
  newPassword: string,
): Promise<void> => {
  const userForResetPassword = await verifyUserForResetPassword(tokenPayload);
  const { _id, password } = userForResetPassword;

  const isSamePassword = await bcrypt.compare(newPassword, password);

  if (isSamePassword) {
    throw new BadRequestError(
      "Invalid Password",
      "The new password must be different from the current password.",
      "AUTH_PASSWORD_REUSE",
    );
  }

  try {
    await updateUserByIdService(_id, {
      set: { password: newPassword },
      unset: ["resetPasswordToken"],
    });
  } catch (error) {
    throw new InternalServerError(
      "Password Reset Failed",
      "An unexpected error occurred while resetting the password.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export const sendResetPasswordEmailService = async (
  email: string,
): Promise<void> => {
  const userForResetPasswordEmail =
    await verifyUserForResetPasswordEmail(email);
  const { _id, username, isVerified } = userForResetPasswordEmail;

  if (!isVerified) {
    return;
  }

  try {
    const resetPasswordToken = createTokenService(
      { username },
      "resetPassword",
    );

    await updateUserByIdService(_id, { set: { resetPasswordToken } });

    const emailSent = await sendEmailService("resetPassword", {
      email,
      token: resetPasswordToken,
    });
    if (!emailSent) {
      throw new InternalServerError(
        "Email Not Sent",
        "Failed to send the reset password email. Please try again later.",
        "EMAIL_SEND_FAILED",
      );
    }
  } catch (error) {
    if (error instanceof InternalServerError) {
      throw error;
    }

    throw new InternalServerError(
      "User Update Failed",
      "An unexpected error occurred while preparing the password reset.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export const refreshUserAccessTokenService = async (
  userForAccess: UserForAccess,
): Promise<UserSession> => {
  const { _id, username, email } = userForAccess;
  const id = _id.toString();

  try {
    const accessToken = createTokenService({ id, username, email }, "access");
    const refreshToken = createTokenService({ id }, "refresh");

    const updatedUserDoc = await updateUserByIdService(_id, {
      set: { refreshToken },
    });

    const userLoggedIn = UserMapper.toLoggedIn(updatedUserDoc);

    return { user: userLoggedIn, accessToken, refreshToken };
  } catch (error) {
    throw new InternalServerError(
      "Access Token Refresh Failed",
      "An unexpected error occurred while refreshing the access token.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export const logoutService = async (
  userForAccess: UserForAccess,
): Promise<void> => {
  const { _id } = userForAccess;

  try {
    await updateUserByIdService(_id, { unset: ["refreshToken"] });
  } catch (error) {
    throw new InternalServerError(
      "Logout Failed",
      "An unexpected error occurred while ending the user session.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

const authenticateUser = async (
  loginOption: { email?: string; username?: string },
  password: string,
): Promise<UserForLogin> => {
  try {
    const userDoc = await findUserDocumentService(loginOption, {
      select: "+password",
    });

    const userAuthenticated = UserMapper.toForLogin(userDoc);

    if (!userAuthenticated.isVerified) {
      throw new UnauthorizedError(
        "User Not Verified",
        "This account must be verified before signing in.",
        "AUTH_USER_NOT_VERIFIED",
      );
    }

    if (!userAuthenticated.password) {
      throw new UnauthorizedError(
        "Invalid Credentials",
        "The provided email or password is incorrect.",
        "AUTH_INVALID_CREDENTIALS",
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userAuthenticated.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError(
        "Invalid Credentials",
        "The provided email or password is incorrect.",
        "AUTH_INVALID_CREDENTIALS",
      );
    }

    return userAuthenticated;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError(
        "Invalid Credentials",
        "The provided email or password is incorrect.",
        "AUTH_INVALID_CREDENTIALS",
      );
    }

    throw error;
  }
};

const verifyUserForVerification = async (
  tokenPayload: EmailTokenVerified,
): Promise<UserForVerification> => {
  try {
    const { username, rawToken } = tokenPayload;

    const userDoc = await findUserDocumentService(
      { username },
      { select: "+verificationToken" },
    );

    const userForVerification = UserMapper.toForVerification(userDoc);

    if (userForVerification.isVerified) {
      throw new ConflictError(
        "User Verification Conflict",
        "The user has already been verified. You can log in normally.",
        "USER_CONFLICT",
      );
    }

    if (!userForVerification.verificationToken) {
      throw new UnauthorizedError(
        "Invalid Token",
        "The token is invalid.",
        "AUTH_INVALID_TOKEN",
        { type: "verification" },
      );
    }

    const isTokenValid = await bcrypt.compare(
      rawToken,
      userForVerification.verificationToken,
    );

    if (!isTokenValid) {
      throw new UnauthorizedError(
        "Invalid Token",
        "The token is invalid.",
        "AUTH_INVALID_TOKEN",
        { type: "verification" },
      );
    }

    return userForVerification;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError(
        "Invalid Token",
        "The token is invalid.",
        "AUTH_INVALID_TOKEN",
        { type: "verification" },
      );
    }
    throw error;
  }
};

const verifyUserForVerificationEmail = async (
  email: string,
): Promise<UserForSendEmail> => {
  try {
    const userDoc = await findUserDocumentService({ email });

    const userForSendEmail = UserMapper.toForSendEmail(userDoc);

    if (userForSendEmail.isVerified) {
      throw new ConflictError(
        "User Verification Conflict",
        "The user has already been verified. You can log in normally.",
        "USER_CONFLICT",
      );
    }

    return userForSendEmail;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError(
        "Unauthorized",
        "Unable to resend verification email.",
        "AUTH_UNAUTHORIZED",
      );
    }
    throw error;
  }
};

const verifyUserForResetPassword = async (
  tokenPayload: EmailTokenVerified,
): Promise<UserForResetPassword> => {
  try {
    const userDoc = await findUserDocumentService(
      { username: tokenPayload.username },
      { select: "+resetPasswordToken +password" },
    );

    const userForResetPassword = UserMapper.toForResetPassword(userDoc);

    if (!userForResetPassword.resetPasswordToken) {
      throw new UnauthorizedError(
        "Invalid Token",
        "The token is invalid.",
        "AUTH_INVALID_TOKEN",
        { type: "resetPassword" },
      );
    }

    const isValidToken = await bcrypt.compare(
      tokenPayload.rawToken,
      userForResetPassword.resetPasswordToken,
    );

    if (!isValidToken) {
      throw new UnauthorizedError(
        "Invalid Token",
        "The token is invalid.",
        "AUTH_INVALID_TOKEN",
        { type: "resetPassword" },
      );
    }

    if (!userForResetPassword.isVerified) {
      throw new UnauthorizedError(
        "User Not Verified",
        "This account must be verified before resetting the password.",
        "AUTH_USER_NOT_VERIFIED",
      );
    }

    if (!userForResetPassword.password) {
      throw new InternalServerError(
        "Password Reset Failed",
        "An unexpected error occurred while resetting the password.",
        "SYSTEM_UNEXPECTED",
      );
    }

    return userForResetPassword;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError(
        "Invalid Token",
        "The token is invalid.",
        "AUTH_INVALID_TOKEN",
        { type: "resetPassword" },
      );
    }
    throw error;
  }
};

const verifyUserForResetPasswordEmail = async (
  email: string,
): Promise<UserForSendEmail> => {
  try {
    const userDoc = await findUserDocumentService({ email });

    const userForSendEmail = UserMapper.toForSendEmail(userDoc);

    return userForSendEmail;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError(
        "Unauthorized",
        "Unable to send reset password email.",
        "AUTH_UNAUTHORIZED",
      );
    }
    throw error;
  }
};
