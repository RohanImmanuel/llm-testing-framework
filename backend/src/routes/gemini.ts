import { Router } from "express";
import { z } from "zod";
import type { GeminiClient } from "../app.js";
import { HttpError } from "../lib/http-error.js";
import type { GeminiContent, GeminiGenerateContentRequest } from "../types/gemini.js";

const geminiPartSchema = z.object({
  text: z.string().optional(),
}).catchall(z.unknown());

const geminiContentSchema: z.ZodType<GeminiContent> = z
  .object({
    role: z.string().optional(),
    parts: z.array(geminiPartSchema).min(1),
  })
  .catchall(z.unknown());

const geminiRequestSchema = z
  .object({
    prompt: z.string().min(1).optional(),
    contents: z.array(geminiContentSchema).min(1).optional(),
    generationConfig: z.record(z.unknown()).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.prompt && !value.contents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either 'prompt' or 'contents' in the request body.",
      });
    }
  });

export function parseGeminiRequest(input: unknown) {
  const parsed = geminiRequestSchema.safeParse(input);

  if (!parsed.success) {
    throw new HttpError("Invalid Gemini request payload.", 400, parsed.error.flatten());
  }

  return parsed.data;
}

export function toGeminiPayload(
  input: z.infer<typeof geminiRequestSchema>
): GeminiGenerateContentRequest {
  return {
    contents:
      input.contents ??
      [
        {
          role: "user",
          parts: [{ text: input.prompt as string }],
        },
      ],
    ...(input.generationConfig ? { generationConfig: input.generationConfig } : {}),
  };
}

export function createGeminiRouter(geminiService: GeminiClient) {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const parsed = parseGeminiRequest(req.body);
      const data = await geminiService.generateContent(toGeminiPayload(parsed));
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
