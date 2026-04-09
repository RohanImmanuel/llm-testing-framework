export type HealthResponse = {
  status: string;
  model: string;
  hasGeminiApiKey: boolean;
};

export type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  [key: string]: unknown;
};

export type ChatMessage = {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
};
