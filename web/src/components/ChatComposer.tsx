import type { FormEvent } from "react";

type ChatComposerProps = {
  draftMessage: string;
  isSubmitting: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  requestError: string;
};

export function ChatComposer({
  draftMessage,
  isSubmitting,
  onDraftChange,
  onSubmit,
  requestError,
}: ChatComposerProps) {
  return (
    <footer className="composer-wrap" data-testid="composer-wrap">
      {requestError ? (
        <p className="error-banner" data-testid="error-banner" role="alert">
          {requestError}
        </p>
      ) : null}

      <form className="composer" onSubmit={onSubmit} data-testid="composer-form">
        <label className="sr-only" htmlFor="chat-message-input">
          Message input
        </label>
        <textarea
          id="chat-message-input"
          value={draftMessage}
          onChange={(event) => onDraftChange(event.target.value)}
          rows={1}
          placeholder="Type a message"
          data-testid="message-input"
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={isSubmitting || !draftMessage.trim()}
          data-testid="send-button"
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </footer>
  );
}
