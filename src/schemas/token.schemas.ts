import { z } from "zod";
import { ENV } from "../utils/env.utils";

const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
const bearerJWTRegex =
  /^Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;

export const jwtSchema = z.object({
  token: z
    .string({
      required_error: "JWT token is required.",
      invalid_type_error: "JWT token must be a string.",
    })
    .trim()
    .regex(jwtRegex, {
      message: "Invalid token format: must be a valid JWT.",
    }),
});

export const refreshTokenSchema = z.object({
  [ENV.REFRESH_TOKEN_COOKIE_NAME]: z
    .string({
      required_error: "Refresh token cookie is required.",
      invalid_type_error: "Refresh token cookie must be a string.",
    })
    .trim()
    .regex(jwtRegex, {
      message: "Invalid token format: must be a valid JWT.",
    }),
});

export const authorizationSchema = z.object({
  authorization: z
    .string({
      required_error: "Authorization is required.",
      invalid_type_error: "Authorization must be a string.",
    })
    .trim()
    .startsWith("Bearer ", {
      message: 'Authorization must start with "Bearer".',
    })
    .regex(bearerJWTRegex, {
      message: "Invalid token format: must be a valid Bearer JWT.",
    }),
});
