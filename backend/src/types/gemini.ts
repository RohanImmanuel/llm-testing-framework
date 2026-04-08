export type GeminiPart = {
  text?: string;
  [key: string]: unknown;
};

export type GeminiContent = {
  role?: string;
  parts: GeminiPart[];
  [key: string]: unknown;
};

export type GeminiGenerateContentRequest = {
  contents: GeminiContent[];
  generationConfig?: Record<string, unknown>;
};
