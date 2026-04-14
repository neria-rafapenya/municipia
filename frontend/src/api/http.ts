import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
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

const parseBody = async (response: Response) => {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const request = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = buildUrl(path);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(options.headers || {}),
  } as Record<string, string>;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { ...options, headers });
  const payload = await parseBody(response);

  if (!response.ok) {
    const message =
      (payload as any)?.message ||
      (payload as any)?.error ||
      response.statusText ||
      "Request failed";
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
};

export const requestAuth = async <T>(
  token: string,
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  return request<T>(path, { ...options, headers });
};

export const requestAuthStream = async (
  token: string,
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildUrl(path);
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  } as Record<string, string>;

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, { ...options, headers });
};
