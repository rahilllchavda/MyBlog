import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

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
export const getCamps = (params) => api.get("/camps", { params });
export const getCampById = (id) => api.get(`/camps/${id}`);
export const createCamp = (data) => api.post("/camps", data);
export const updateCamp = (id, data) => api.put(`/camps/${id}`, data);
export const deleteCamp = (id) => api.delete(`/camps/${id}`);

// ── Bookings ──────────────────────────────────────────────
export const createBooking = (data) => api.post("/bookings", data);
export const getBooking = (ref) => api.get(`/bookings/${ref}`);
export const cancelBooking = (ref) => api.put(`/bookings/${ref}/cancel`);
export const validateCoupon = (data) =>
  api.post("/bookings/validate-coupon", data);

// ── Ratings ───────────────────────────────────────────────
export const addRating = (data) => api.post("/ratings", data);
export const updateRating = (data) => api.put("/ratings", data);

export default api;
