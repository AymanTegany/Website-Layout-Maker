import axios from "axios";

const BASE_URL = "/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Error]", error.message, error.response?.data);
    return Promise.reject(error);
  }
);

export const roomsApi = {
  getAll: () => apiClient.get("/rooms").then((r) => r.data),
  getById: (id: number) => apiClient.get(`/rooms/${id}`).then((r) => r.data),
};

export const analyticsApi = {
  getSummary: () => apiClient.get("/analytics/summary").then((r) => r.data),
  getOccupancy: () => apiClient.get("/analytics/occupancy").then((r) => r.data),
  getEnergyTrend: () => apiClient.get("/analytics/energy").then((r) => r.data),
  getTemperature: () => apiClient.get("/analytics/temperature").then((r) => r.data),
  getAlerts: () => apiClient.get("/analytics/alerts").then((r) => r.data),
};

export const hallsApi = {
  getAll: () => apiClient.get("/campus/halls").then((r) => r.data),
};
