export function ChatEmptyState() {
  return (
    <section className="messages" data-testid="messages-panel" aria-label="Message history">
      <div className="empty-state" data-testid="empty-state">
        <div className="empty-state-mark" aria-hidden="true">
          Start
        </div>
        <h2 data-testid="empty-state-title">Start of chat</h2>
        <p data-testid="empty-state-body">
          Send the first message to begin the conversation. This empty view gives you a clean
          baseline for UI and end-to-end tests.
        </p>
      </div>
    </section>
  );
}
