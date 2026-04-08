import { HttpError } from "../lib/http-error.js";
import type { GeminiGenerateContentRequest } from "../types/gemini.js";

type GeminiServiceOptions = {
  apiKey: string;
  model: string;
  fetchImpl?: typeof fetch;
};

export class GeminiService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly fetchImpl: typeof fetch;

  constructor({ apiKey, model, fetchImpl = fetch }: GeminiServiceOptions) {
    this.apiKey = apiKey;
    this.model = model;
    this.fetchImpl = fetchImpl;
  }

  async generateContent(
    payload: GeminiGenerateContentRequest
  ): Promise<unknown> {
    if (!this.apiKey) {
      throw new HttpError("GEMINI_API_KEY is not configured.", 500);
    }

    const response = await this.fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        this.model
      )}:generateContent?key=${encodeURIComponent(this.apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = (await response.json()) as unknown;

    if (!response.ok) {
      throw new HttpError("Gemini request failed.", response.status, data);
    }

    return data;
  }
}
