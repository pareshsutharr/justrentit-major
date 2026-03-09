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
    if (status === 401 && (message.includes("expired") || message.includes("Session expired"))) {
      // Show alert and redirect
      alert('Your session has expired. Please login again.');
      localStorage.removeItem('token');
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
