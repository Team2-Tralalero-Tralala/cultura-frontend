// File: package-request-service.ts
/*
 * คำอธิบาย : Service เรียกข้อมูล "คำขอแพ็กเกจ" จาก Backend
 * แนวทางมาตรฐาน:
 *  - ใช้ค่าฐาน URL จาก .env (VITE_API_BASE) และ fallback เป็น localhost
 *  - แยก helper สร้าง URL เพื่อลดการประกอบสตริงซ้ำ
 *  - แยก helper เรียก API แบบ GET (รวมการตรวจสอบ error)
 *  - JSDoc + บล็อกคอมเมนต์มาตรฐาน (ฟังก์ชัน/คำอธิบาย/Input/Output)
 *  - ตั้งชื่อชัดเจน: fetchPackageRequestDetail*, buildApiUrl, apiGet
 */

import type { PackageRequestDetail } from "@/Types/package-request"; // (ใช้ path alias ให้สม่ำเสมอ)

/** ค่าฐาน URL ของ API (ควรลงท้ายโดยไม่มี /) */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

/**
 * ฟังก์ชัน : buildApiUrl
 * คำอธิบาย : สร้าง URL สำหรับเรียก API โดยประกอบจาก API_BASE_URL และ endpoint ให้ถูกต้อง
 * Input : endpoint: string (เช่น "/package-requests/123")
 * Output: string (URL สมบูรณ์ เช่น "https://api.example.com/api/package-requests/123")
 */
function buildApiUrl(endpoint: string): string {
  const base = API_BASE_URL.replace(/\/+$/, ""); // ตัด / ท้าย
  const path = endpoint.replace(/^\/+/, ""); // ตัด / หน้า
  return `${base}/${path}`;
}

/**
 * ฟังก์ชัน : apiGet
 * คำอธิบาย : helper เรียก API แบบ GET ด้วย fetch จัดการ header, credentials และ error มาตรฐาน
 * Input : url: string
 * Output: Promise<T> (ค่าที่ parse จาก JSON; รองรับรูปแบบ { data: T } หรือ T ตรง ๆ)
 */
async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  // ตรวจสอบสถานะ HTTP
  if (!response.ok) {
    // พยายามอ่านข้อความผิดพลาดจาก body ถ้ามี
    const errorText = await response.text().catch(() => "");
    const message = errorText || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  // แปลง JSON (รองรับทั้ง { data: T } และ T)
  const raw = await response.json().catch(() => ({})); 
  const payload = (raw?.data ?? raw) as T;
  return payload;
}

/**
 * ฟังก์ชัน : fetchPackageRequestDetail
 * คำอธิบาย : ดึงรายละเอียดคำขอแพ็กเกจตาม requestId (สิทธิ์ผู้ใช้ทั่วไป/ตามที่ backend อนุญาต)
 * Input : requestId: string (รหัสคำขอแพ็กเกจ)
 * Output: Promise<PackageRequestDetail> (ข้อมูลรายละเอียดคำขอแพ็กเกจแบบ type-safe)
 */
export async function fetchPackageRequestDetail(
  requestId: string
): Promise<PackageRequestDetail> {
  const url = buildApiUrl(`/package-requests/${requestId}`);
  return apiGet<PackageRequestDetail>(url);
}

/**
 * ฟังก์ชัน : fetchPackageRequestDetailForAdmin
 * คำอธิบาย : ดึงรายละเอียดคำขอแพ็กเกจตาม requestId (สิทธิ์ผู้ดูแลระบบ/เส้นทางแยกสำหรับ Admin)
 * Input : requestId: string (รหัสคำขอแพ็กเกจ)
 * Output: Promise<PackageRequestDetail> (ข้อมูลรายละเอียดคำขอแพ็กเกจแบบ type-safe)
 */
export async function fetchPackageRequestDetailForAdmin(
  requestId: string
): Promise<PackageRequestDetail> {
  const url = buildApiUrl(`/admin/package-requests/${requestId}`);
  return apiGet<PackageRequestDetail>(url);
}
