const API_BASE_URL = ((import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:8080").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const buildUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const isFormData = (body: BodyInit | null | undefined): body is FormData =>
  typeof FormData !== "undefined" && body instanceof FormData;

const parseBody = async (response: Response) => {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const extractMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === "object") {
    const candidate = payload as Record<string, unknown>;
    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }
    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error;
    }
  }
  return fallback;
};

export const request = async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
  const url = buildUrl(path);
  const headers = { ...(options.headers || {}) } as Record<string, string>;
  const body = options.body;
  if (body != null && !isFormData(body) && headers["Content-Type"] == null) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { ...options, headers });
  const payload = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractMessage(payload, response.statusText || "Request failed"),
      payload
    );
  }

  return payload as T;
};

export const requestWithToken = async <T,>(
  token: string,
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  } as Record<string, string>;

  return request<T>(path, { ...options, headers });
};

export { API_BASE_URL };
