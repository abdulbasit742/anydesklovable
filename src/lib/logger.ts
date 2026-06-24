export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  service?: string;
  event?: string;
  requestId?: string;
  teamId?: string;
  deviceId?: string;
  sessionId?: string;
  status?: string;
  durationMs?: number;
  [key: string]: unknown;
}

const sensitiveKeyPattern = /(password|secret|token|key|authorization|cookie|credential|signature|private|serviceRole|storagePath)/i;
const sensitiveValuePattern = /(Bearer\s+[A-Za-z0-9._~+\/-]{12,}|-----BEGIN .*PRIVATE KEY-----|SUPABASE_SERVICE_ROLE_KEY\s*=|postgres(?:ql)?:\/\/[^\s]+)/i;

export function redactLogValue(value: unknown): unknown {
  if (typeof value === 'string') {
    if (sensitiveValuePattern.test(value)) return '[REDACTED]';
    return value.length > 2000 ? `${value.slice(0, 2000)}...[TRUNCATED]` : value;
  }

  if (Array.isArray(value)) return value.map(redactLogValue);
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      output[key] = sensitiveKeyPattern.test(key) ? '[REDACTED]' : redactLogValue(nested);
    }
    return output;
  }

  return value;
}

export function writeLog(level: LogLevel, message: string, context: LogContext = {}) {
  const payload = {
    level,
    message,
    service: context.service ?? 'remotedesk-dashboard',
    timestamp: new Date().toISOString(),
    ...(redactLogValue(context) as Record<string, unknown>)
  };

  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, context?: LogContext) => writeLog('debug', message, context),
  info: (message: string, context?: LogContext) => writeLog('info', message, context),
  warn: (message: string, context?: LogContext) => writeLog('warn', message, context),
  error: (message: string, context?: LogContext) => writeLog('error', message, context)
};
