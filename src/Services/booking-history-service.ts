/*
 * คำอธิบาย : Service ฝั่ง Client สำหรับดึงประวัติการจองตามสิทธิ์ของผู้ใช้ (Role)
 * วัตถุประสงค์ : ใช้ในการเรียก API เพื่อดึงข้อมูลประวัติการจอง โดยจัดการแบ่งหน้า (Pagination)
 * Input :
 *   - page (number) : หมายเลขหน้าปัจจุบัน (ค่าเริ่มต้น 1)
 *   - limit (number) : จำนวนรายการต่อหน้า (ค่าเริ่มต้น 10)
 * Output :
 *   - list (BookingHistoryItem[]) : รายการประวัติการจอง
 *   - page (number) : หมายเลขหน้าปัจจุบัน
 *   - limit (number) : จำนวนรายการต่อหน้า
 *   - hasNext (boolean) : ระบุว่ามีหน้าถัดไปหรือไม่
 */

import type { BookingHistoryItem } from "../Types/BookingHistory";

/**
 * ดึงประวัติการจองตามสิทธิ์ของผู้ใช้
 * ใช้เรียก API `/booking/histories` โดยแนบ page และ limit เป็น query parameter
 * และส่ง cookie ไปพร้อมคำขอ เพื่อรักษา session ผู้ใช้งาน
 */
export async function fetchBookingHistoriesByRole(page = 1, limit = 10): Promise<{
  list: BookingHistoryItem[];
  page: number;
  limit: number;
  hasNext: boolean;
}> {
  const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
  const response = await fetch(`${baseURL}/admin/booking/histories/all?page=${page}&limit=${limit}`, {
    method: "GET",
    credentials: "include", // ส่ง cookie ไป
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  const list: BookingHistoryItem[] = data?.data ?? [];

  return {
    list,
    page,
    limit,
    hasNext: Array.isArray(list) && list.length === limit,
  };
}
/*
 * คำอธิบาย : Service สำหรับดึงข้อมูลรายการการจองทั้งหมดของแอดมิน
 * Mapping: GET /admin/bookings/all
 */

import axios from "axios";
import type { BookingAdminDtoFromApi, Pagination } from "@/Types/BookingAdmin";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function fetchBookingsByAdmin(page = 1, limit = 10): Promise<{
  data: BookingAdminDtoFromApi[];
  pagination: Pagination;
}> {
  const res = await axios.get(`${apiUrl}/admin/bookings/all`, {
    params: { page, limit },
    withCredentials: true,
  });

  const payload = res.data?.data ?? {};
  return {
    data: payload.data ?? [],
    pagination: payload.pagination ?? {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit,
    },
  };
}
