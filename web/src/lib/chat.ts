import type { GeminiResponse } from "../types";

const apiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export function getEndpoint(path: string) {
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}

export function extractText(response: GeminiResponse | null) {
  if (!response?.candidates?.length) {
    return "";
  }

  return response.candidates
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text?.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function formatTime() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}
