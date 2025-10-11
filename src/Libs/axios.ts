import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token?: string) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

// โหลด token จาก localStorage ตอนเริ่ม
const saved = localStorage.getItem("accessToken");
if (saved) setAuthToken(saved);

// (แนะนำ) จัดการ 401 -> กลับไปหน้า login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && !location.pathname.startsWith("/guest")) {
      localStorage.removeItem("accessToken");
      setAuthToken(undefined);
      location.href = "/guest/partner/login";
    }
    return Promise.reject(err);
  }

  
);
