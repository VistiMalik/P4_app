import axios from "axios";
import Constants from "expo-constants";
import { getAccessToken } from "@lib/storage/tokenStorage";

const baseURL =
  Constants.expoConfig?.extra?.apiUrl ||
  Constants.manifest2?.extra?.expoClient?.apiUrl ||
  "https://example.com/api";

export const apiClient = axios.create({
  baseURL
});

console.log("API Base URL:", baseURL);

apiClient.interceptors.request.use(async (config) => {
  // Interceptor garante que os tokens seguros acompanhem cada requisição autenticada.
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn("Erro na API simulada:", error);
    return Promise.reject(error);
  }
);
