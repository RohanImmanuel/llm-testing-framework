import type { RefObject } from "react";
import type { ChatMessage } from "../types";

function getMessageLabel(role: ChatMessage["role"]) {
  return role === "user" ? "User" : "Assistant";
}

type MessageListProps = {
  isSubmitting: boolean;
  messages: ChatMessage[];
  panelRef: RefObject<HTMLElement | null>;
};

export function MessageList({ isSubmitting, messages, panelRef }: MessageListProps) {
  return (
    <section
      ref={panelRef}
      className="messages"
      data-testid="messages-panel"
      aria-label="Message history"
    >
      {messages.map((message, index) => (
        <article
          key={message.id}
          className={`message-row ${message.role === "user" ? "is-user" : "is-model"}`}
          data-testid={`message-row-${index}`}
          data-message-role={message.role}
          aria-label={`${getMessageLabel(message.role)} message`}
        >
          <div
            className="bubble"
            data-testid={`message-bubble-${index}`}
            data-role={message.role}
          >
            <p data-testid={`message-text-${index}`}>{message.text}</p>
            <span data-testid={`message-timestamp-${index}`}>{message.timestamp}</span>
          </div>
        </article>
      ))}

      {isSubmitting ? (
        <article
          className="message-row is-model"
          data-testid="message-row-pending"
          aria-label="Assistant is typing"
        >
          <div className="bubble bubble-pending" data-testid="message-bubble-pending">
            <p data-testid="message-text-pending">Thinking...</p>
          </div>
        </article>
      ) : null}
    </section>
  );
}
