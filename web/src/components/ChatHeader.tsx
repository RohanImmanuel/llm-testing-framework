const APP_NAME = "Test Assistant";

type ChatHeaderProps = {
  headerStatus: string;
  isOnline: boolean;
};

export function ChatHeader({ headerStatus, isOnline }: ChatHeaderProps) {
  return (
    <header className="chat-header" data-testid="chat-header">
      <div className="chat-header-copy">
        <p className="chat-kicker">{APP_NAME}</p>
        <h1 data-testid="chat-title">{APP_NAME}</h1>
      </div>

      <div
        className="header-status"
        data-testid="connection-status"
        role="status"
        aria-live="polite"
      >
        <span className={`status-dot ${isOnline ? "is-online" : ""}`} />
        <span data-testid="connection-status-text">{headerStatus}</span>
      </div>
    </header>
  );
}
