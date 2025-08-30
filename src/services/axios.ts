import axios, { AxiosError } from "axios";

const api_url = import.meta.env.VITE_API_URL ?? "http://localhost:8080/";

const PUBLIC_ROUTES = ["/user/register", "/authentication/authenticate"];

export const axiosInstace = axios.create({
  baseURL: api_url,
  withCredentials: true,
  headers: {
    "ngrok-skip-browser-warning": "any",
    "Content-Type": "application/json",
  }
});

axiosInstace.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("fertintelligenceToken");

  const isPublic = PUBLIC_ROUTES.some((route) => config.url?.includes(route));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstace.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error?.response?.status === 401) {
      if (sessionStorage.getItem("fertintelligenceToken")) {
        window.location.href = "/fertintelligence/";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstace;
