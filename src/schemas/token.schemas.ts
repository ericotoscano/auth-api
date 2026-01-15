import { z } from "zod";

const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

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
