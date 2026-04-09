import { FormEvent, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ChatComposer } from "./components/ChatComposer";
import { ChatEmptyState } from "./components/ChatEmptyState";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { extractText, formatTime, getEndpoint } from "./lib/chat";
import type { ChatMessage, GeminiResponse, HealthResponse } from "./types";

const MESSAGE_SEND_ERROR = "Message failed to send.";

type ChatState = {
  draftMessage: string;
  messages: ChatMessage[];
  requestError: string;
  isSubmitting: boolean;
};

type ChatAction =
  | { type: "draft/changed"; payload: string }
  | { type: "send/started"; payload: ChatMessage }
  | { type: "send/succeeded"; payload: ChatMessage }
  | {
      type: "send/failed";
      payload: { draft: string; error: string; previousMessages: ChatMessage[] };
    };

const initialChatState: ChatState = {
  draftMessage: "",
  messages: [],
  requestError: "",
  isSubmitting: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "draft/changed":
      return {
        ...state,
        draftMessage: action.payload,
      };
    case "send/started":
      return {
        ...state,
        draftMessage: "",
        requestError: "",
        isSubmitting: true,
        messages: [...state.messages, action.payload],
      };
    case "send/succeeded":
      return {
        ...state,
        isSubmitting: false,
        messages: [...state.messages, action.payload],
      };
    case "send/failed":
      return {
        ...state,
        draftMessage: action.payload.draft,
        requestError: action.payload.error,
        isSubmitting: false,
        messages: action.payload.previousMessages,
      };
    default:
      return state;
  }
}

function useHealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  const [healthError, setHealthError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadHealth() {
      setIsCheckingHealth(true);
      setHealthError("");

      try {
        const res = await fetch(getEndpoint("/health"), {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Health check failed with ${res.status}`);
        }

        const data = (await res.json()) as HealthResponse;
        setHealth(data);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setHealthError(error instanceof Error ? error.message : "Unable to reach backend.");
      } finally {
        if (!controller.signal.aborted) {
          setIsCheckingHealth(false);
        }
      }
    }

    void loadHealth();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    health,
    isCheckingHealth,
    healthError,
  };
}

export default function App() {
  const [{ draftMessage, messages, requestError, isSubmitting }, dispatch] = useReducer(
    chatReducer,
    initialChatState
  );
  const { health, isCheckingHealth, healthError } = useHealthStatus();
  const messagesRef = useRef<HTMLElement | null>(null);

  const isOnline = health?.status === "ok" && !healthError;
  const headerStatus = useMemo(() => {
    if (isCheckingHealth) {
      return "Checking connection";
    }

    if (healthError) {
      return "Offline";
    }

    return health?.hasGeminiApiKey ? `${health.model} online` : "Backend online";
  }, [health, healthError, isCheckingHealth]);

  useEffect(() => {
    const panel = messagesRef.current;
    if (!panel) {
      return;
    }

    panel.scrollTo({
      top: panel.scrollHeight,
      behavior: "smooth",
    });
  }, [isSubmitting, messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDraft = draftMessage.trim();

    if (!trimmedDraft) {
      return;
    }

    const previousMessages = messages;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedDraft,
      timestamp: formatTime(),
    };

    const nextMessages = [...previousMessages, userMessage];

    dispatch({
      type: "send/started",
      payload: userMessage,
    });

    try {
      const res = await fetch(getEndpoint("/api/gemini"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: nextMessages.map((message) => ({
            role: message.role,
            parts: [{ text: message.text }],
          })),
        }),
      });

      const data = (await res.json()) as GeminiResponse & { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed with ${res.status}`);
      }

      dispatch({
        type: "send/succeeded",
        payload: {
          id: `model-${Date.now()}`,
          role: "model",
          text: extractText(data) || "I didn't get anything useful back from the model.",
          timestamp: formatTime(),
        },
      });
    } catch (error) {
      dispatch({
        type: "send/failed",
        payload: {
          draft: trimmedDraft,
          error: error instanceof Error ? error.message : MESSAGE_SEND_ERROR,
          previousMessages,
        },
      });
    }
  }

  return (
    <main className="app" data-testid="app-root">
      <section className="chat-shell" data-testid="chat-shell" aria-label="Chat application">
        <ChatHeader headerStatus={headerStatus} isOnline={isOnline} />

        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <MessageList
            isSubmitting={isSubmitting}
            messages={messages}
            panelRef={messagesRef}
          />
        )}

        <ChatComposer
          draftMessage={draftMessage}
          isSubmitting={isSubmitting}
          onDraftChange={(value) => dispatch({ type: "draft/changed", payload: value })}
          onSubmit={handleSubmit}
          requestError={requestError}
        />
      </section>
    </main>
  );
}
