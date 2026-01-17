import "dotenv/config";
import { envSchema } from "./env.schema";
import { Env } from "./env.types";

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  process.exit(1);
}

export const ENV: Env = parsed.data;
