import { z } from "zod";
import { envSchema } from "../schemas/env.schema";

export type Env = z.infer<typeof envSchema>;
