import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.warn('VITE_API_URL is not set — API calls will fail.');
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export class ApiClientError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Normalizes any axios failure into ApiClientError so calling code (and
 * react-query's `error` objects) always has a consistent `.message` from
 * the backend's own { error, details } response shape, rather than
 * axios's generic "Request failed with status 400".
 */
export function toApiClientError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) return error;
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ error?: string; details?: unknown }>;
    const status = err.response?.status ?? 0;
    const message = err.response?.data?.error ?? err.message ?? 'Request failed';
    return new ApiClientError(status, message, err.response?.data?.details);
  }
  return new ApiClientError(0, error instanceof Error ? error.message : 'Request failed');
}

type GetTokenFn = () => Promise<string | null>;
let getTokenRef: GetTokenFn | null = null;

/**
 * Called once by <ClerkAuthSync> (mounted at the app root) with Clerk's
 * getToken function. Storing the *function* rather than a token value is
 * the important part: the request interceptor below calls it fresh on
 * every outgoing request, rather than trusting a cached token that could
 * have expired. This mirrors a real bug the mobile app hit — Clerk session
 * tokens are short-lived (~60s), and caching one across a slow operation
 * (a large video upload, for instance) meant it could expire before the
 * follow-up request went out, producing a confusing "Authentication
 * required" failure on a person who was, in fact, signed in the whole time.
 */
export function registerAuthTokenGetter(fn: GetTokenFn | null) {
  getTokenRef = fn;
}

apiClient.interceptors.request.use(async (config) => {
  if (getTokenRef) {
    const token = await getTokenRef();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});