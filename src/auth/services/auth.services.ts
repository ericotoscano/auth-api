import bcrypt from "bcryptjs";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors/custom-error";
import { createTokenService } from "./token.services";
import { UserType } from "../../shared/types/user.types";
import {
  createUserService,
  updateUserByIdService,
  findUserService,
  findUserDocumentService,
} from "../../users/services";
import { SignUpRequestBody } from "../types/request.types";
import {
  SignUpServiceReturn,
  UserAndTokenServiceReturn,
} from "../types/services.types";
import { sendEmailService } from "../../infra/mail/mail.service";
import { VerifiedEmailToken } from "../types/token.types";
import { UserDocument } from "../../users/model/user.document";
import { mongoose } from "../../infra/db/mongoose";

export const signUpService = async (
  signUpBody: SignUpRequestBody,
): Promise<SignUpServiceReturn> => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const createdUser = await createUserService(signUpBody, session);

    const verificationToken = createTokenService(
      { username: createdUser.username },
      "verification",
    );

    await updateUserByIdService(
      createdUser._id,
      {
        set: { verificationToken },
      },
      session,
    );

    await session.commitTransaction();
    session.endSession();

    const emailSent = await sendEmailService("verification", {
      email: createdUser.email,
      token: verificationToken,
    });

    return { createdUser, emailSent };
  } catch (error) {
    await session.abortTransaction();

    session.endSession();

    throw error;
  }
};

export const loginService = async (
  identifier: string,
  password: string,
): Promise<UserAndTokenServiceReturn> => {
  let userDoc: UserDocument;
  let updatedUser: UserType;

  const loginOption = /\S+@\S+\.\S+/.test(identifier)
    ? { email: identifier }
    : { username: identifier };

  try {
    userDoc = await findUserDocumentService(loginOption, {
      select: "+password",
    });
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

  if (!userDoc.isVerified) {
    throw new UnauthorizedError(
      "User Not Verified",
      "This account must be verified before signing in.",
      "AUTH_USER_NOT_VERIFIED",
    );
  }

  if (!userDoc.password) {
    throw new UnauthorizedError(
      "Invalid Credentials",
      "The provided email or password is incorrect.",
      "AUTH_INVALID_CREDENTIALS",
    );
  }

  const isPasswordValid = await bcrypt.compare(password, userDoc.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError(
      "Invalid Credentials",
      "The provided email or password is incorrect.",
      "AUTH_INVALID_CREDENTIALS",
    );
  }

  const accessToken = createTokenService(
    {
      id: userDoc._id.toString(),
      username: userDoc.username,
      email: userDoc.email,
    },
    "access",
  );
  const refreshToken = createTokenService(
    { id: userDoc._id.toString() },
    "refresh",
  );

  try {
    updatedUser = await updateUserByIdService(userDoc._id.toString(), {
      set: { refreshToken },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new InternalServerError(
        "User Update Failed",
        "An unexpected error occurred while updating the user session.",
        "SYSTEM_UNEXPECTED",
      );
    }

    throw error;
  }

  return { updatedUser, accessToken, refreshToken };
};

export const verifyUserService = async (
  tokenPayload: VerifiedEmailToken,
): Promise<UserType> => {
  let userDoc: UserDocument;

  try {
    userDoc = await findUserDocumentService(
      { username: tokenPayload.username },
      { select: "+verificationToken" },
    );
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

  if (!userDoc.verificationToken) {
    throw new UnauthorizedError(
      "Invalid Token",
      "The token is invalid.",
      "AUTH_INVALID_TOKEN",
      { type: "verification" },
    );
  }

  const isValidToken = await bcrypt.compare(
    tokenPayload.rawToken,
    userDoc.verificationToken,
  );

  if (!isValidToken) {
    throw new UnauthorizedError(
      "Invalid Token",
      "The token is invalid.",
      "AUTH_INVALID_TOKEN",
      { type: "verification" },
    );
  }

  if (userDoc.isVerified) {
    throw new ConflictError(
      "User Verification Conflict",
      "The user has already been verified. You can log in normally.",
      "USER_CONFLICT",
    );
  }

  try {
    const verifiedUser = await updateUserByIdService(userDoc._id.toString(), {
      set: { isVerified: true },
      unset: ["verificationToken"],
    });

    return verifiedUser;
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
      { isVerified: user.isVerified },
    );
  }

  const verificationToken = createTokenService(
    { username: user.username },
    "verification",
  );

  try {
    await updateUserByIdService(user._id, { set: { verificationToken } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new NotFoundError(
        "User Not Found",
        "The user could not be found during resend verification email.",
        "USER_NOT_FOUND",
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
      "EMAIL_SEND_FAILED",
    );
  }
};

export const resetPasswordService = async (
  tokenPayload: VerifiedEmailToken,
  newPassword: string,
): Promise<void> => {
  let userDoc: UserDocument;

  try {
    userDoc = await findUserDocumentService(
      { username: tokenPayload.username },
      { select: "+resetPasswordToken +password" },
    );
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

  if (!userDoc.resetPasswordToken) {
    throw new UnauthorizedError(
      "Invalid Token",
      "The token is invalid.",
      "AUTH_INVALID_TOKEN",
      { type: "resetPassword" },
    );
  }

  const isValidToken = await bcrypt.compare(
    tokenPayload.rawToken,
    userDoc.resetPasswordToken,
  );

  if (!isValidToken) {
    throw new UnauthorizedError(
      "Invalid Token",
      "The token is invalid.",
      "AUTH_INVALID_TOKEN",
      { type: "resetPassword" },
    );
  }

  if (!userDoc.isVerified) {
    throw new UnauthorizedError(
      "User Not Verified",
      "This account must be verified before resetting the password.",
      "AUTH_USER_NOT_VERIFIED",
    );
  }

  if (!userDoc.password) {
    throw new InternalServerError(
      "Password Reset Failed",
      "An unexpected error occurred while resetting the password.",
      "SYSTEM_UNEXPECTED",
    );
  }

  const isSamePassword = await bcrypt.compare(newPassword, userDoc.password);

  if (isSamePassword) {
    throw new BadRequestError(
      "Invalid Password",
      "The new password must be different from the current password.",
      "AUTH_PASSWORD_REUSE",
    );
  }

  try {
    await updateUserByIdService(userDoc._id.toString(), {
      set: { password: newPassword },
      unset: ["resetPasswordToken"],
    });
  } catch {
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
  let user: UserType;

  try {
    user = await findUserService({ email });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return;
    }

    throw error;
  }

  if (!user.isVerified) {
    return;
  }

  const resetPasswordToken = createTokenService(
    { username: user.username },
    "resetPassword",
  );

  try {
    await updateUserByIdService(user._id, { set: { resetPasswordToken } });
  } catch (error) {
    throw new InternalServerError(
      "User Update Failed",
      "An unexpected error occurred while preparing the password reset.",
      "SYSTEM_UNEXPECTED",
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
      "EMAIL_SEND_FAILED",
    );
  }
};

export const refreshUserAccessTokenService = async (
  user: UserType,
): Promise<UserAndTokenServiceReturn> => {
  let updatedUser: UserType;

  const accessToken = createTokenService(
    { id: user._id, username: user.username, email: user.email },
    "access",
  );
  const refreshToken = createTokenService({ id: user._id }, "refresh");

  try {
    updatedUser = await updateUserByIdService(user._id, {
      set: { refreshToken },
    });
  } catch (error) {
    throw new InternalServerError(
      "Access Token Refresh Failed",
      "An unexpected error occurred while refreshing the access token.",
      "SYSTEM_UNEXPECTED",
    );
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
      "SYSTEM_UNEXPECTED",
    );
  }
};
