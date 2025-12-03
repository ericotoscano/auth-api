import "dotenv/config";
import { envSchema } from "../schemas/env.schema";
import { Env } from "../types/env.types";
import { logger } from "./logger";

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => ({
    field: i.path.join("."),
    message: i.message,
  }));

  logger.error("ENV validation failed", {
    errorCode: "ENV_ERROR",
    details: { issues },
  });

  process.exit(1);
}

export const ENV: Env = parsed.data;
