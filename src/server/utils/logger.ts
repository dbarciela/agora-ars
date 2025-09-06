// Simple structured logger utility for the server
type Meta = Record<string, unknown> | undefined;

function formatMeta(meta: Meta) {
  if (!meta) return '';
  try {
    return JSON.stringify(meta);
  } catch {
    return String(meta);
  }
}

function timeStamp() {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, meta?: Meta) {
    // keep it compact but structured
    console.log(`[${timeStamp()}] [INFO] ${message}`, formatMeta(meta));
  },
  error(message: string, meta?: Meta) {
    console.error(`[${timeStamp()}] [ERROR] ${message}`, formatMeta(meta));
  },
  debug(message: string, meta?: Meta) {
    // debug uses console.debug when available
    if ((console as any).debug)
      (console as any).debug(
        `[${timeStamp()}] [DEBUG] ${message}`,
        formatMeta(meta)
      );
    else console.log(`[${timeStamp()}] [DEBUG] ${message}`, formatMeta(meta));
  },
};
