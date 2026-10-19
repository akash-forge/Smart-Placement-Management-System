import apiClient from "../api/client";

/**
 * Turns a stored file path (e.g. "/uploads/resumes/resume-u7-ab12.pdf") into
 * a full URL on the API server. Absolute http(s) links pass through as-is.
 * Uses the API client's base URL so there's a single source of truth for
 * where the backend lives (no hardcoded localhost).
 */
export const fileUrl = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${apiClient.defaults.baseURL ?? ""}${path}`;
