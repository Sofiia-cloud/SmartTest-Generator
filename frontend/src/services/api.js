import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

export const documents = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getAll: () => api.get("/documents"),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const quizzes = {
  generate: (data) => api.post("/quizzes/generate", data),
  getAll: () => api.get("/quizzes"),
  getById: (id) => api.get(`/quizzes/${id}`),
  publish: (id) => api.put(`/quizzes/${id}/publish`),
  submit: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
  getAttempts: () => api.get("/quizzes/attempts"),
};

export default api;
