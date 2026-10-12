/**
 * The only place that talks to the API. It unwraps the backend's response envelope
 * ({success, data, message, error}) so screens deal with data or a thrown ApiError, never with both.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

let locale = '';

/** The I18nProvider calls this, so the API answers (validation messages, the e-mails it sends) in the user's language. */
export function setApiLocale(next: string) {
  locale = next;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(message: string, status: number, code = '', details: unknown = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type Envelope<T> = {
  success: boolean;
  data: T | null;
  message?: string;
  error?: { message?: string; error_code?: string; details?: unknown } | null;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(locale ? { 'Accept-Language': locale } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch (cause) {
    throw new ApiError(String(cause), 0, 'network');
  }
  const text = await response.text();
  let body: Envelope<T> | null = null;
  try {
    body = text ? (JSON.parse(text) as Envelope<T>) : null;
  } catch {
    body = null;
  }
  if (!response.ok || !body?.success) {
    throw new ApiError(
      body?.error?.message ?? body?.message ?? `HTTP ${response.status}`,
      response.status,
      body?.error?.error_code ?? '',
      body?.error?.details ?? null,
    );
  }
  return body.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, payload: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(payload) }),
  patch: <T>(path: string, payload: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
