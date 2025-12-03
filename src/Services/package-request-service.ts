/*
 * คำอธิบาย : Service เรียกข้อมูล "คำขอแพ็กเกจ" จาก Backend (เวอร์ชันเรียบง่ายสุด)
 * หมายเหตุ:
 *  - ใช้ฐาน URL จาก .env: VITE_API_URL (fallback localhost)
 *  - ใช้ axios โดยแนบ credentials
 *  - ไม่ดัก error / ไม่ใช้ helper ใด ๆ (เพื่อความเรียบง่ายสูงสุด)
 */

import type { PackageRequestDetail } from "@/Types/package-request";
import axios from "axios";

const apiUrl =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

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

/**
 * ฟังก์ชัน : fetchPackageRequests
 * คำอธิบาย : ดึงรายการคำขอแพ็กเกจทั้งหมด (สำหรับ Super User) พร้อมระบบ pagination และการกรอง
 * Input : page: number (default 1) - หมายเลขหน้าที่ต้องการ
 * Input : limit: number (default 10) - จำนวนรายการต่อหน้า
 * Input : search?: string (optional) - คำค้นหาสำหรับชื่อแพ็กเกจ
 * Input : statusApprove?: string (optional) - สถานะการอนุมัติที่ต้องการกรอง
 * Output: Promise<AxiosResponse> (Axios response ที่มีข้อมูลรายการคำขอแพ็กเกจ)
 */
export async function fetchPackageRequests(
    page = 1,
    limit = 10,
    search?: string,
    statusApprove?: string
) {
    return axios.get(`${apiUrl}/super/package-requests`, {
        withCredentials: true,
        params: { page, limit, search, statusApprove },
    });
}

/**
 * ฟังก์ชัน : approvePackageRequest
 * คำอธิบาย : อนุมัติคำขอแพ็กเกจ (สำหรับ Super User)
 * Input : packageId: number - รหัสของแพ็กเกจที่ต้องการอนุมัติ
 * Output: Promise<AxiosResponse> (Axios response ยืนยันผลการอนุมัติ)
 */
export async function approvePackageRequest(packageId: number) {
    return axios.patch(
        `${apiUrl}/super/package-requests/${packageId}/approve`,
        {},
        { withCredentials: true }
    );
}

/**
 * ฟังก์ชัน : rejectPackageRequest
 * คำอธิบาย : ปฏิเสธคำขอแพ็กเกจ (สำหรับ Super User) พร้อมระบุเหตุผล
 * Input : packageId: number - รหัสของแพ็กเกจที่ต้องการปฏิเสธ
 * Input : reason: string - เหตุผลในการปฏิเสธ
 * Output: Promise<AxiosResponse> (Axios response ยืนยันผลการปฏิเสธ)
 */
export async function rejectPackageRequest(packageId: number, reason: string) {
    return axios.patch(
        `${apiUrl}/super/package-requests/${packageId}/reject`,
        { reason },
        { withCredentials: true }
    );
}

/**
 * ฟังก์ชัน : approvePackageRequestForAdmin
 * คำอธิบาย : อนุมัติคำขอแพ็กเกจ (สำหรับ Admin)
 * Input : packageId: number - รหัสของแพ็กเกจที่ต้องการอนุมัติ
 * Output: Promise<AxiosResponse> (Axios response ยืนยันผลการอนุมัติ)
 */
export async function approvePackageRequestForAdmin(packageId: number) {
    return axios.patch(
        `${apiUrl}/admin/package-requests/${packageId}/approve`,
        {},
        { withCredentials: true }
    );
}

/**
 * ฟังก์ชัน : rejectPackageRequestForAdmin
 * คำอธิบาย : ปฏิเสธคำขอแพ็กเกจ (สำหรับ Admin) พร้อมระบุเหตุผล
 * Input : packageId: number - รหัสของแพ็กเกจที่ต้องการปฏิเสธ
 * Input : reason: string - เหตุผลในการปฏิเสธ
 * Output: Promise<AxiosResponse> (Axios response ยืนยันผลการปฏิเสธ)
 */
export async function rejectPackageRequestForAdmin(packageId: number, reason: string) {
    return axios.patch(
        `${apiUrl}/admin/package-requests/${packageId}/reject`,
        { reason },
        { withCredentials: true }
    );
}
