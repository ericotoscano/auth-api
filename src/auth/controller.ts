import { NextFunction, Request } from "express";
import {
  signUpService,
  loginService,
  resendVerificationEmailService,
  resetPasswordService,
  sendResetPasswordEmailService,
  refreshUserAccessTokenService,
  logoutService,
  verifyService,
} from "./services/auth.services";
import { ApiResponse } from "../shared/types/response.types";
import {
  EmailInputRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignUpRequest,
  TokenVerificationRequest,
} from "./types/request.types";
import { ENV } from "../infra/env/env";
import { EmailTokenVerified } from "./types/token.types";
import {
  AccessTokenRefreshedDTO,
  UserSessionDTO,
  UserSignedUpDTO,
  UserVerifiedDTO,
} from "./types/dto.types";
import {
  AccessTokenRefreshedDTOMapper,
  UserSessionDTOMapper,
  UserSignedUpDTOMapper,
  UserVerifiedDTOMapper,
} from "./dto";
import { UserForAccess } from "./types/services.types";

export const signup = async (
  req: Request<{}, {}, SignUpRequest>,
  res: ApiResponse<UserSignedUpDTO>,
  next: NextFunction,
) => {
  try {
    const signUpBody = req.validated!.body as SignUpRequest;

    const { userCreated, emailSent } = await signUpService(signUpBody);

    res.status(201).json({
      success: true,
      message: emailSent
        ? "User created successfully. Please access the provided email to verify your user account."
        : "User created successfully, but there was an issue sending the verification email. Request a new verification email.",
      data: UserSignedUpDTOMapper.toJSON(userCreated),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: ApiResponse<UserSessionDTO>,
  next: NextFunction,
) => {
  const { identifier, password } = req.validated!.body as LoginRequest;

  try {
    const { user, accessToken, refreshToken } = await loginService(
      identifier,
      password,
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
        data: UserSessionDTOMapper.toJSON(user, accessToken),
      });
  } catch (error) {
    next(error);
  }
};

export const verify = async (
  req: Request<{}, {}, TokenVerificationRequest>,
  res: ApiResponse<UserVerifiedDTO>,
  next: NextFunction,
) => {
  const tokenPayload = req.validated!.token as EmailTokenVerified;

  try {
    const userVerified = await verifyService(tokenPayload);

    res.status(200).json({
      success: true,
      message: "User verified successfully.",
      data: UserVerifiedDTOMapper.toJSON(userVerified),
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (
  req: Request<{}, {}, EmailInputRequest>,
  res: ApiResponse<{}>,
  next: NextFunction,
) => {
  const { email } = req.validated!.body as EmailInputRequest;

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
  req: Request<{}, {}, ResetPasswordRequest>,
  res: ApiResponse<{}>,
  next: NextFunction,
) => {
  const tokenPayload = req.validated!.token as EmailTokenVerified;
  const { password } = req.validated!.body as ResetPasswordRequest;

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
  req: Request<{}, {}, EmailInputRequest>,
  res: ApiResponse<{}>,
  next: NextFunction,
) => {
  const { email } = req.validated!.body as EmailInputRequest;

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

export const refreshAccessToken = async (
  req: Request,
  res: ApiResponse<AccessTokenRefreshedDTO>,
  next: NextFunction,
) => {
  const userForAccess = req.validated!.user as UserForAccess;

  try {
    const { user, accessToken, refreshToken } =
      await refreshUserAccessTokenService(userForAccess);

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
        data: AccessTokenRefreshedDTOMapper.toJSON(user, accessToken),
      });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: ApiResponse<{}>,
  next: NextFunction,
) => {
  const userForAccess = req.validated!.user! as UserForAccess;

  try {
    await logoutService(userForAccess);

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
