import "dotenv/config";
import { envSchema } from "../schemas/env.schema";
import { Env } from "../types/env.types";

const parsed = envSchema.safeParse(process.env);

export const ENV: Env = parsed.data;

//tratar os erros de validacao do env aqui
