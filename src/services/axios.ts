import { useUserStore } from "../stores/user/user.store";
import axios, { AxiosError } from "axios";

const api_url = import.meta.env.VITE_API_URL ??  "http://localhost:8080/" // "https://fertintelligence/fertintelligence-backend/api/"; //

export const axiosInstace = axios.create({
  baseURL: api_url,
  withCredentials: true,
  headers: {
    "ngrok-skip-browser-warning": "any",
    "Content-Type": "application/json",
  }
});

axiosInstace.interceptors.request.use((config) => {
  let token = sessionStorage.getItem("fertintelligenceToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstace.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error?.response?.status === 401) {
      window.location.href = "/fertintelligence/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstace;
