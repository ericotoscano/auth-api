import "dotenv/config";
import { envSchema } from "../schemas/env.schema";
import { Env } from "../types/env.types";

export const ENV: Env = envSchema.parse(process.env);
