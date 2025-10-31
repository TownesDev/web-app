export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export function log(
  level: LogLevel,
  message: string,
  meta: Record<string, unknown> = {}
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  }
  // Emit a single-line JSON structured log for easy ingestion by log collectors
  // Consumers can filter by correlationId, eventId, etc.
  try {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log({ ...entry, logError: String(e) })
  }
}

export function logInfo(message: string, meta: Record<string, unknown> = {}) {
  return log('info', message, meta)
}

export function logError(message: string, meta: Record<string, unknown> = {}) {
  return log('error', message, meta)
}
