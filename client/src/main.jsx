import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import { MantineProvider } from "@mantine/core";
import axios from "axios";

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
axios.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || "";
    const isAuthRoute = typeof error?.config?.url === "string" && error.config.url.includes("/api/auth/");

    if (status === 401 && !isAuthRoute) {
      const authMessage = message || error?.response?.data?.error || "Your session is no longer valid. Please login again.";
      alert(authMessage.includes("expired") ? authMessage : "Your session has expired. Please login again.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <App />
    </MantineProvider>
  </StrictMode>
);
