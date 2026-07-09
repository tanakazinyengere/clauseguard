/**
 * Reusable fetch wrapper that aborts a request after a timeout.
 *
 * On mobile (Capacitor/native WebView), a flaky or dropped connection can
 * leave a plain `fetch()` pending indefinitely, so screens hang instead of
 * showing an error. This wraps `fetch` with an `AbortController` so callers
 * can catch a `FetchTimeoutError` and show a friendly retry UI.
 */

export class FetchTimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'FetchTimeoutError';
  }
}

export interface FetchWithTimeoutOptions extends RequestInit {
  /** Milliseconds to wait before aborting the request. Defaults to 9000. */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 9000;

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  { timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...init }: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Forward an externally-provided signal's abort into our own controller.
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new FetchTimeoutError(
        `Request to ${typeof input === 'string' ? input : String(input)} timed out after ${timeoutMs}ms`,
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
