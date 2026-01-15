import { NextFunction, Request } from "express";
import {
  loginService,
  logoutService,
  refreshUserAccessTokenService,
  resendVerificationEmailService,
  resetPasswordService,
  sendResetPasswordEmailService,
  signUpService,
  verifyUserService,
} from "../services/auth.services";
import { ENV } from "../utils/env.utils";
import { EmailTokenPayload } from "../types/auth/auth.token.types";
import { TypedResponse } from "../types/response.types";
import {
  SignedUpUserDTO,
  VerifiedUserDTO,
  LoggedInUserDTO,
  RefreshedUserAccessTokenDTO,
} from "../dtos/auth.dto";
import {
  SignedUpUserDTOType,
  VerifiedUserDTOType,
  LoggedInUserDTOType,
  RefreshedUserAccessTokenDTOType,
} from "../types/users/users.dto.types";
import {
  SignUpRequestBody,
  VerifyRequestBody,
  ResetPasswordRequestBody,
  EmailRequestBody,
  LoginRequestBody,
} from "../types/auth/auth.request.types";
import { UserType } from "../types/users/users.types";

export const signup = async (
  req: Request<{}, {}, SignUpRequestBody>,
  res: TypedResponse<SignedUpUserDTOType>,
  next: NextFunction
) => {
  try {
    const signUpBody = req.validated!.body as SignUpRequestBody;

    const { createdUser, emailSent } = await signUpService(signUpBody);

    res.status(201).json({
      success: true,
      message: emailSent
        ? "User created successfully. Please access the provided email to verify your user account."
        : "User created successfully, but there was an issue sending the verification email. Request a new verification email.",
      data: SignedUpUserDTO.toJSON(createdUser),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: TypedResponse<LoggedInUserDTOType>,
  next: NextFunction
) => {
  const { identifier, password } = req.validated!.body as LoginRequestBody;

  try {
    const { updatedUser, accessToken, refreshToken } = await loginService(
      identifier,
      password
    );

    res
      .status(200)
      .cookie(ENV.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(ENV.REFRESH_TOKEN_DURATION_MINUTES) * 60 * 1000,
      })
      .json({
        success: true,
        message: "User logged in successfully.",
        data: LoggedInUserDTO.toJSON(updatedUser, accessToken),
      });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (
  req: Request<{}, {}, VerifyRequestBody>,
  res: TypedResponse<VerifiedUserDTOType>,
  next: NextFunction
) => {
  const tokenPayload = req.validated!.tokenPayload as EmailTokenPayload;

  try {
    const verifiedUser = await verifyUserService(tokenPayload);

    res.status(200).json({
      success: true,
      message: "User verified successfully.",
      data: VerifiedUserDTO.toJSON(verifiedUser),
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (
  req: Request<{}, {}, EmailRequestBody>,
  res: TypedResponse<{}>,
  next: NextFunction
) => {
  const { email } = req.validated!.body as EmailRequestBody;

  try {
    await resendVerificationEmailService(email);

    res.status(200).json({
      success: true,
      message:
        "A verification email has been resent to the registered email address.",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request<{}, {}, ResetPasswordRequestBody>,
  res: TypedResponse<{}>,
  next: NextFunction
) => {
  const tokenPayload = req.validated!.tokenPayload as EmailTokenPayload;
  const { password } = req.validated!.body as ResetPasswordRequestBody;

  try {
    await resetPasswordService(tokenPayload, password);

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const sendResetPasswordEmail = async (
  req: Request<{}, {}, EmailRequestBody>,
  res: TypedResponse<{}>,
  next: NextFunction
) => {
  const { email } = req.validated!.body as EmailRequestBody;

  try {
    await sendResetPasswordEmailService(email);

    res.status(200).json({
      success: true,
      message:
        "A reset password email has been sent to your registered email address.",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const refreshUserAccessToken = async (
  req: Request,
  res: TypedResponse<RefreshedUserAccessTokenDTOType>,
  next: NextFunction
) => {
  const user = req.validated!.user as UserType;

  try {
    const { updatedUser, accessToken, refreshToken } =
      await refreshUserAccessTokenService(user);

    res
      .status(200)
      .cookie(ENV.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(ENV.REFRESH_TOKEN_DURATION_MINUTES) * 60 * 1000,
      })
      .json({
        success: true,
        message: "Access token refreshed successfully.",
        data: RefreshedUserAccessTokenDTO.toJSON(updatedUser, accessToken),
      });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: TypedResponse<{}>,
  next: NextFunction
) => {
  const user = req.validated!.user!;

  try {
    await logoutService(user);

    res
      .status(204)
      .clearCookie(ENV.REFRESH_TOKEN_COOKIE_NAME, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
      })
      .end();
  } catch (error) {
    next(error);
  }
};
