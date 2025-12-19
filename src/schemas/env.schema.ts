import { z } from "zod";

export const envSchema = z.object({
  APP_NAME: z.string({
    required_error: "APP_NAME is required",
    invalid_type_error: "APP_NAME must be a string",
  }),

  APP_ORIGIN: z.string({
    required_error: "APP_ORIGIN is required",
    invalid_type_error: "APP_ORIGIN must be a string",
  }),

  API_PORT: z
    .string({
      required_error: "API_PORT is required",
      invalid_type_error: "API_PORT must be a string",
    })
    .refine(
      (port) => {
        const n = parseInt(port);
        return n > 1000 && n < 65535;
      },
      {
        message: "API_PORT must be a number between 1001 and 65534",
      }
    ),

  FRONTEND_PORT: z
    .string({
      required_error: "FRONTEND_PORT is required",
      invalid_type_error: "FRONTEND_PORT must be a string",
    })
    .refine(
      (port) => {
        const n = parseInt(port);
        return n > 1000 && n < 65535;
      },
      {
        message: "FRONTEND_PORT must be a number between 1001 and 65534",
      }
    ),

  NODE_ENV: z.enum(["development", "test"], {
    required_error: "NODE_ENV is required",
    invalid_type_error: "NODE_ENV must be one of: development, test",
  }),

  LOG_LEVEL: z.enum(
    ["error", "warn", "info", "http", "verbose", "debug", "silly"],
    {
      required_error: "LOG_LEVEL is required",
      invalid_type_error:
        "LOG_LEVEL must be one of: error, warn, info, http, verbose, debug, silly",
    }
  ),

  DEV_DB_URI: z.string({
    required_error: "DEV_DB_URI is required",
    invalid_type_error: "DEV_DB_URI must be a string",
  }),

  TEST_DB_URI: z.string({
    required_error: "TEST_DB_URI is required",
    invalid_type_error: "TEST_DB_URI must be a string",
  }),

  MAIL_HOST: z.string({
    required_error: "MAIL_HOST is required",
    invalid_type_error: "MAIL_HOST must be a string",
  }),

  MAIL_PORT: z.string({
    required_error: "MAIL_PORT is required",
    invalid_type_error: "MAIL_PORT must be a string",
  }),

  MAIL_USER: z.string({
    required_error: "MAIL_USER is required",
    invalid_type_error: "MAIL_USER must be a string",
  }),

  MAIL_PASSWORD: z.string({
    required_error: "MAIL_PASSWORD is required",
    invalid_type_error: "MAIL_PASSWORD must be a string",
  }),

  VERIFICATION_TOKEN_SECRET_KEY: z.string({
    required_error: "VERIFICATION_TOKEN_SECRET_KEY is required",
    invalid_type_error: "VERIFICATION_TOKEN_SECRET_KEY must be a string",
  }),

  VERIFICATION_TOKEN_DURATION_MINUTES: z
    .string({
      required_error: "VERIFICATION_TOKEN_DURATION_MINUTES is required",
      invalid_type_error:
        "VERIFICATION_TOKEN_DURATION_MINUTES must be a string",
    })
    .refine((s) => parseInt(s) <= 15, {
      message: "VERIFICATION_TOKEN_DURATION_MINUTES must be <= 15",
    }),

  RESET_PASSWORD_TOKEN_SECRET_KEY: z.string({
    required_error: "RESET_PASSWORD_TOKEN_SECRET_KEY is required",
    invalid_type_error: "RESET_PASSWORD_TOKEN_SECRET_KEY must be a string",
  }),

  RESET_PASSWORD_TOKEN_DURATION_MINUTES: z
    .string({
      required_error: "RESET_PASSWORD_TOKEN_DURATION_MINUTES is required",
      invalid_type_error:
        "RESET_PASSWORD_TOKEN_DURATION_MINUTES must be a string",
    })
    .refine((s) => parseInt(s) <= 15, {
      message: "RESET_PASSWORD_TOKEN_DURATION_MINUTES must be <= 15",
    }),

  ACCESS_TOKEN_SECRET_KEY: z.string({
    required_error: "ACCESS_TOKEN_SECRET_KEY is required",
    invalid_type_error: "ACCESS_TOKEN_SECRET_KEY must be a string",
  }),

  ACCESS_TOKEN_DURATION_MINUTES: z
    .string({
      required_error: "ACCESS_TOKEN_DURATION_MINUTES is required",
      invalid_type_error: "ACCESS_TOKEN_DURATION_MINUTES must be a string",
    })
    .refine(
      (s) => {
        const n = parseInt(s);
        return n > 0 && n <= 30;
      },
      {
        message: "ACCESS_TOKEN_DURATION_MINUTES must be between 1 and 30",
      }
    ),

  REFRESH_TOKEN_SECRET_KEY: z.string({
    required_error: "REFRESH_TOKEN_SECRET_KEY is required",
    invalid_type_error: "REFRESH_TOKEN_SECRET_KEY must be a string",
  }),

  REFRESH_TOKEN_DURATION_MINUTES: z
    .string({
      required_error: "REFRESH_TOKEN_DURATION_MINUTES is required",
      invalid_type_error: "REFRESH_TOKEN_DURATION_MINUTES must be a string",
    })
    .refine(
      (s) => {
        const n = parseInt(s);
        return n >= 15 && n <= 60;
      },
      {
        message: "REFRESH_TOKEN_DURATION_MINUTES must be between 15 and 60",
      }
    ),

  REFRESH_TOKEN_COOKIE_NAME: z.string({
    required_error: "REFRESH_TOKEN_COOKIE_NAME is required",
    invalid_type_error: "REFRESH_TOKEN_COOKIE_NAME must be a string",
  }),
});
