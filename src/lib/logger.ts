type LogMeta = Record<string, unknown>;

function write(level: "info" | "warn" | "error", message: string, meta?: LogMeta) {
  const payload = {
    level,
    message,
    meta,
    time: new Date().toISOString()
  };

  console[level === "error" ? "error" : "log"](JSON.stringify(payload));
}

export const logger = {
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, meta?: LogMeta) => write("error", message, meta)
};
