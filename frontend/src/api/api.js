import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("Erreur API:", error.response?.data, error.response?.status);
    return Promise.reject(error);
  }
);

export default api;
