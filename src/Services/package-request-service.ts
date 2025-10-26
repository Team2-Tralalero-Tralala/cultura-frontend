// File: package-request-service.ts
/*
 * คำอธิบาย : Service เรียกข้อมูล "คำขอแพ็กเกจ" จาก Backend
 * แนวทางมาตรฐาน:
 *  - ใช้ค่าฐาน URL จาก .env (VITE_API_BASE) และ fallback เป็น localhost
 *  - แยก helper สร้าง URL เพื่อลดการประกอบสตริงซ้ำ
 *  - JSDoc ครบถ้วน: อธิบาย Input/Output/ข้อผิดพลาด
 *  - ตั้งชื่อชัดเจน: fetchPackageRequestDetail (กริยา + สิ่งที่ทำ)
 */

import type { PackageRequestDetail } from "@/Types/package-request"; // แนะนำใช้ path alias ให้สม่ำเสมอ

/** ค่าฐาน URL ของ API (ควรลงท้ายโดยไม่มี /) */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

/**
 * สร้าง URL สำหรับเรียก API โดยต่อท้าย endpoint ให้ถูกต้อง
 * @param endpoint เส้นทางเช่น `/package-requests/123`
 * @returns URL สมบูรณ์ เช่น `https://api.example.com/api/package-requests/123`
 */
function buildApiUrl(endpoint: string): string {
  const base = API_BASE_URL.replace(/\/+$/, ""); // ตัด / ท้าย
  const path = endpoint.replace(/^\/+/, ""); // ตัด / หน้า
  return `${base}/${path}`;
}

/**
 * ดึงรายละเอียดคำขอแพ็กเกจตาม requestId
 * @param requestId รหัสคำขอแพ็กเกจ
 * @returns ข้อมูลรายละเอียดคำขอแพ็กเกจแบบ Type-safe
 * @throws Error เมื่อการเรียก API ล้มเหลว หรือสถานะไม่ใช่ 2xx
 */
export async function fetchPackageRequestDetail(
  requestId: string
): Promise<PackageRequestDetail> {
  const url = buildApiUrl(`/package-requests/${requestId}`);

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  // รูปแบบที่รองรับ: { data: PackageRequestDetail } หรือ PackageRequestDetail ตรง ๆ
  const body = await res.json();
  const payload = (body?.data ?? body) as PackageRequestDetail;

  return payload;
}

/**
 * ดึงรายละเอียดคำขอแพ็กเกจตาม requestId
 * @param requestId รหัสคำขอแพ็กเกจ
 * @returns ข้อมูลรายละเอียดคำขอแพ็กเกจแบบ Type-safe
 * @throws Error เมื่อการเรียก API ล้มเหลว หรือสถานะไม่ใช่ 2xx
 */
export async function fetchPackageRequestDetailForAdmin(
  requestId: string
): Promise<PackageRequestDetail> {
  const url = buildApiUrl(`/admin/package-requests/${requestId}`);

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  // รูปแบบที่รองรับ: { data: PackageRequestDetail } หรือ PackageRequestDetail ตรง ๆ
  const body = await res.json();
  const payload = (body?.data ?? body) as PackageRequestDetail;

  return payload;
}
