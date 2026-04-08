import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import type { AppEnv } from "./config/env.js";
import { HttpError } from "./lib/http-error.js";
import { logger } from "./lib/logger.js";
import { createGeminiRouter } from "./routes/gemini.js";
import { GeminiService } from "./services/gemini-service.js";
import type { GeminiGenerateContentRequest } from "./types/gemini.js";

export type GeminiClient = {
  generateContent: (payload: GeminiGenerateContentRequest) => Promise<unknown>;
};

type CreateAppOptions = {
  env: AppEnv;
  geminiService?: GeminiClient;
};

export function createApp({ env, geminiService }: CreateAppOptions) {
  const app = express();
  const service =
    geminiService ??
    new GeminiService({
      apiKey: env.geminiApiKey,
      model: env.geminiModel,
    });

  app.use(
    cors({
      origin: env.corsOrigins,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      port: env.port,
      model: env.geminiModel,
      hasGeminiApiKey: Boolean(env.geminiApiKey),
    });
  });

  app.use("/api/gemini", createGeminiRouter(service));

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      logger.error(error.message, {
        statusCode: error.statusCode,
        details: error.details,
      });

      return res.status(error.statusCode).json({
        error: error.message,
        details: error.details,
      });
    }

    logger.error("Unexpected error while handling request.", {
      error: error instanceof Error ? error.message : String(error),
    });

    return res.status(500).json({
      error: "Unexpected server error.",
    });
  });

  return app;
}
