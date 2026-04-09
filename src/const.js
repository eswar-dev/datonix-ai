/**
 * Central API base URL. Override via Vite env: VITE_API_BASE_URL
 * Example: VITE_API_BASE_URL=http://localhost:7003
 */
export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "http://3.253.0.188:7003";

// export const API_BASE_URL = "http://localhost:7003";

/**
 * Quick sign-in presets.
 * - Default: same as typing email/password — still calls POST /auth/login (needs a real Django user).
 * - `localBypass: true`: in Vite **dev** only (`npm run dev`), skips the API and creates a local session
 *   so you can open the app without that user in the DB. Real API calls may 401 until you use a real login.
 */
export const LOGIN_QUICK_ACCOUNTS = [
  {
    key: "superadmin",
    label: "Super admin",
    email: "superadmin@datonix.ai",
    password: "Test@123",
    localBypass: true,
    mockUser: {
      id: 1,
      username: "superadmin",
      role: "Super Admin",
    },
  },
];
