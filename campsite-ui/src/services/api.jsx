import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")}/api`
  : import.meta.env.PROD
    ? "https://campsite-api-aph2bsd4f4h8hjd4.canadacentral-01.azurewebsites.net/api"
    : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const toUtcDateParam = (value) => {
  if (!value || typeof value !== "string") return value;

  const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!dateOnlyMatch) return value;

  return `${value}T00:00:00.000Z`;
};

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("campsite_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("campsite_token");
      localStorage.removeItem("campsite_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────────
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);

// ── Camps ─────────────────────────────────────────────────
export const getCamps = (params) =>
  api.get("/camps", {
    params: {
      ...params,
      checkIn: toUtcDateParam(params?.checkIn),
      checkOut: toUtcDateParam(params?.checkOut),
    },
  });
export const getAdminCamps = () => api.get("/camps/admin/all");
export const getCampById = (id) => api.get(`/camps/${id}`);
export const createCamp = (data) => api.post("/camps", data);
export const updateCamp = (id, data) => api.put(`/camps/${id}`, data);
export const deleteCamp = (id) => api.delete(`/camps/${id}`);

// ── Bookings ──────────────────────────────────────────────
export const createBooking = (data) => api.post("/bookings", data);

// ✅ Get booking by either reference number or guest email
export const getBooking = (query) => {
  const value = query?.trim();
  if (!value) throw new Error("Reference number or email is required.");

  const isEmail = /\S+@\S+\.\S+/.test(value);

  if (isEmail) {
    return api.get("/bookings/", {
      params: { guestEmail: value.toLowerCase() },
    });
  }

  const normalizedReference = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return api.get(`/bookings/by-reference/${normalizedReference}`);
};

export const cancelBooking = (ref, guestEmail) =>
  api.put(`/bookings/${ref}/cancel`, { guestEmail });

export const validateCoupon = (data) =>
  api.post("/bookings/validate-coupon", data);

// ── Ratings ───────────────────────────────────────────────
export const addRating = (data) => api.post("/ratings", data);
export const updateRating = (data) => api.put("/ratings", data);

export default api;
