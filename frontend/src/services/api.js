
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "/api"
      : "http://localhost:5000/api"),
  withCredentials: true,
});

let csrfToken = null;

// Attach the CSRF token to requests that change data.
api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();

  if (
    ["post", "put", "patch", "delete"].includes(method) &&
    csrfToken
  ) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

// Remember a CSRF token returned by the backend.
api.interceptors.response.use((response) => {
  if (response.data?.csrfToken) {
    csrfToken = response.data.csrfToken;
  }

  return response;
});

export async function initializeCsrf() {
  const response = await api.get("/auth/csrf");
  csrfToken = response.data.csrfToken;
  return csrfToken;
}

export default api;
