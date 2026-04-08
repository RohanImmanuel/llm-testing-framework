import { describe, expect, it } from "vitest";
import { HttpError } from "../src/lib/http-error.js";
import { parseGeminiRequest, toGeminiPayload } from "../src/routes/gemini.js";

describe("Gemini request parsing", () => {
  it("accepts a simple prompt and maps it to Gemini contents", () => {
    const parsed = parseGeminiRequest({ prompt: "Say hello" });

    expect(toGeminiPayload(parsed)).toEqual({
      contents: [
        {
          role: "user",
          parts: [{ text: "Say hello" }],
        },
      ],
    });
  });

  it("accepts a full Gemini contents payload", () => {
    const parsed = parseGeminiRequest({
      contents: [
        {
          role: "user",
          parts: [{ text: "Explain smoke tests" }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    });

    expect(toGeminiPayload(parsed)).toEqual({
      contents: [
        {
          role: "user",
          parts: [{ text: "Explain smoke tests" }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    });
  });

  it("rejects payloads with neither prompt nor contents", () => {
    expect(() => parseGeminiRequest({})).toThrowError(HttpError);
  });
});
