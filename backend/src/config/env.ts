import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  GEMINI_API_KEY: z.string().default(""),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  CORS_ORIGIN: z.string().default("*"),
});

export type AppEnv = {
  port: number;
  geminiApiKey: string;
  geminiModel: string;
  corsOrigins: true | string[];
};

export function loadEnv(): AppEnv {
  const parsedEnv = envSchema.parse(process.env);
  const corsOrigins =
    parsedEnv.CORS_ORIGIN === "*"
      ? true
      : parsedEnv.CORS_ORIGIN.split(",")
          .map((origin) => origin.trim())
          .filter(Boolean);

  return {
    port: parsedEnv.PORT,
    geminiApiKey: parsedEnv.GEMINI_API_KEY,
    geminiModel: parsedEnv.GEMINI_MODEL,
    corsOrigins,
  };
}
