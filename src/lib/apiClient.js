// Talks to the real MongoDB/Express backend. Replaces the old Supabase client.
// Set VITE_API_BASE_URL in .env to point at your backend, e.g.
// VITE_API_BASE_URL=http://localhost:3000/api

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const TOKEN_KEY = "loyalty_app_token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Makes a request to the backend API.
 * - Automatically attaches the JWT (if present) as a Bearer token.
 * - For JSON requests, pass `body` as a plain object.
 * - For file uploads, pass `isFormData: true` and `body` as a FormData instance.
 * Throws an Error with the backend's `message` on any non-success response.
 */
export async function apiRequest(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // some responses (rare) may have no body
  }

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }

  return json;
}

// Builds a full URL for a file path the backend returned (e.g. an avatar),
// since the backend returns a relative path like "/uploads/avatars/xyz.jpg".
export function resolveBackendFileUrl(relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith("http")) return relativePath;
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${origin}${relativePath}`;
}
