/**
 * Central API base URL. Override via Vite env: VITE_API_BASE_URL
 * Example: VITE_API_BASE_URL=http://localhost:7005
 */
export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "http://108.130.248.255:7005";
