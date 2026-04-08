type LogContext = Record<string, unknown>;

function log(level: "info" | "error", message: string, context?: LogContext) {
  const payload = {
    level,
    message,
    ...(context ? { context } : {}),
    timestamp: new Date().toISOString(),
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
};
