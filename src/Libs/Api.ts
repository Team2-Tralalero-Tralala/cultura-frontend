// src/Libs/api.ts
import axios from "axios";

// สร้าง instance กลางของ axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // ถ้า backend ใช้ cookie
});

// interceptor: เพิ่ม token อัตโนมัติทุกครั้งก่อนยิง API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
