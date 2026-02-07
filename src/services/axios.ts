import axios, { AxiosError } from "axios";

const api_url = import.meta.env.VITE_API_URL ?? "http://localhost:8080/";

const PUBLIC_ROUTES = ["/user/register", "/authentication/authenticate"];

export const api = axios.create({
  baseURL: api_url,
  withCredentials: true,
  headers: {
    "ngrok-skip-browser-warning": "any",
    "Content-Type": "application/json",
  }
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("fertintelligenceToken");

  const isPublic = PUBLIC_ROUTES.some((route) => config.url?.includes(route));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
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

const image_manager_url = "http://localhost:8081"

export const axiosImageManager = axios.create({
  baseURL: image_manager_url,
  headers: {
    "Content-Type": "application/json"
  }
})

axiosImageManager.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default api;
