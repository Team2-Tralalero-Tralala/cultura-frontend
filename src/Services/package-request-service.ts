// File: package-request-service.ts
/*
 * คำอธิบาย : Service เรียกข้อมูล "คำขอแพ็กเกจ" จาก Backend (เวอร์ชันเรียบง่ายสุด)
 * หมายเหตุ:
 *  - ใช้ฐาน URL จาก .env: VITE_API_URL (fallback localhost)
 *  - ใช้ axios โดยแนบ credentials
 *  - ไม่ดัก error / ไม่ใช้ helper ใด ๆ (เพื่อความเรียบง่ายสูงสุด)
 */

import axios from "axios";
import type { PackageRequestDetail } from "@/Types/package-request"; // ใช้ path alias ให้สม่ำเสมอ


const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * ฟังก์ชัน : fetchPackageRequestDetail
 * คำอธิบาย : ดึงรายละเอียดคำขอแพ็กเกจ (ผู้ใช้ทั่วไปหรือสิทธิ์ตามที่ backend อนุญาต)
 * Input : requestId: string (รหัสคำขอแพ็กเกจ)
 * Output: Promise<PackageRequestDetail> (ข้อมูลรายละเอียดคำขอแพ็กเกจ)
 */
export async function fetchPackageRequestDetail(
  requestId: string
): Promise<PackageRequestDetail> {
  const res = await axios.get(`${apiUrl}/super/package-requests/${requestId}`, {
    withCredentials: true,
  });
  return (res.data?.data ?? res.data) as PackageRequestDetail;
}

/**
 * ฟังก์ชัน : fetchPackageRequestDetailForAdmin
 * คำอธิบาย : ดึงรายละเอียดคำขอแพ็กเกจ (เส้นทางสำหรับแอดมิน)
 * Input : requestId: string (รหัสคำขอแพ็กเกจ)
 * Output: Promise<PackageRequestDetail> (ข้อมูลรายละเอียดคำขอแพ็กเกจ)
 */
export async function fetchPackageRequestDetailForAdmin(
  requestId: string
): Promise<PackageRequestDetail> {
  const res = await axios.get(`${apiUrl}/admin/package-requests/${requestId}`, {
    withCredentials: true,
  });
  return (res.data?.data ?? res.data) as PackageRequestDetail;
}
