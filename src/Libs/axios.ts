// src/Libs/axios.ts
import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000/api",
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