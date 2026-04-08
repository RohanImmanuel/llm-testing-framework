import { describe, expect, it, vi } from "vitest";
import { GeminiService } from "../src/services/gemini-service.js";

describe("GeminiService", () => {
  it("forwards payloads to the Gemini API", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "Hello from Gemini" }] } }],
      }),
    });

    const service = new GeminiService({
      apiKey: "test-key",
      model: "gemini-2.5-flash",
      fetchImpl: fetchImpl as typeof fetch,
    });

    const response = await service.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: "Say hello" }],
        },
      ],
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0]?.[0]).toContain("gemini-2.5-flash");
    expect(response).toEqual({
      candidates: [{ content: { parts: [{ text: "Hello from Gemini" }] } }],
    });
  });

  it("throws a 500 error when the API key is missing", async () => {
    const service = new GeminiService({
      apiKey: "",
      model: "gemini-2.5-flash",
    });

    await expect(
      service.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: "Say hello" }],
          },
        ],
      })
    ).rejects.toMatchObject({
      message: "GEMINI_API_KEY is not configured.",
      statusCode: 500,
    });
  });
});
