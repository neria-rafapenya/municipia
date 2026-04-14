import { UploadResponse } from "./types";

export const uploadMedia = async (
  apiFetch: <T,>(path: string, options?: RequestInit) => Promise<T>,
  file: File,
  folder?: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) {
    formData.append("folder", folder);
  }

  return apiFetch<UploadResponse>("/api/uploads", {
    method: "POST",
    body: formData,
  });
};
