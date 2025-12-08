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
    credentials: "include",
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

/**
 * ฟังก์ชัน : updateBookingStatus
 * คำอธิบาย : อัปเดตสถานะของการจอง (ใช้โดย Admin)
 * Method : POST
 * Path : /admin/bookings/:id/status
 */
export async function updateBookingStatus(
  bookingId: number,
  status: "BOOKED" | "REJECTED" | "REFUNDED" | "REFUND_REJECTED",
  rejectReason?: string
): Promise<void> {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // ถ้าเป็นสถานะที่ "ปฏิเสธ" ต้องมีเหตุผลด้วย
  const isRejectStatus =
    status === "REJECTED" || status === "REFUND_REJECTED";

  if (isRejectStatus && (!rejectReason || !rejectReason.trim())) {
    // กัน FE ผิดเองก่อน ไม่ต้องรอให้ BE ด่า
    throw new Error("กรุณากรอกเหตุผลการปฏิเสธ");
  }

  const body: {
    status: string;
    rejectReason?: string;
  } = { status };

  if (isRejectStatus) {
    body.rejectReason = rejectReason!.trim();
  }

  await axios.post(
    `${apiUrl}/admin/bookings/${bookingId}/status`,
    body,
    { withCredentials: true }
  );
}

/*
 * ฟังก์ชัน : fetchBookingsByMember
 * คำอธิบาย : ดึงรายการการจองของแพ็กเกจที่ Member เป็นผู้ดูแล (overseerMember)
 * Method : GET
 * Path   : /member/booking-histories
 * Input :
 *   - page (number)   : หน้าที่ต้องการดึงข้อมูล (default 1)
 *   - limit (number)  : จำนวนรายการต่อหน้า (default 10)
 *   - status (string, optional) : ใช้กรองสถานะการจอง เช่น PENDING, REFUND_PENDING, BOOKED
 * Output :
 *   - data : รายการข้อมูลการจองของ Member
 *   - pagination : ข้อมูลการแบ่งหน้า (currentPage, totalPages, totalCount, limit)
 */
export async function fetchBookingsByMember(
  page = 1,
  limit = 10,
  status?: string
): Promise<{
  data: BookingAdminDtoFromApi[]; // ใช้โครงเดียวกับ admin ได้เลย
  pagination: Pagination;
}> {
  const res = await axios.get(`${apiUrl}/member/booking-histories`, {
    params: { page, limit, status },
    withCredentials: true,
  });

  const payload = res.data?.data ?? {};
  return {
    data: (payload.data ?? []) as BookingAdminDtoFromApi[],
    pagination: (payload.pagination ?? {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit,
    }) as Pagination,
  };
}

/**
 * ฟังก์ชัน : updateBookingStatusByMember
 * คำอธิบาย : อัปเดตสถานะของการจอง โดย Member ผู้ดูแลแพ็กเกจนั้น
 * Method : POST
 * Path   : /member/bookings/:id/status
 * Input :
 *   - bookingId (number) : รหัสการจองที่ต้องการอัปเดต
 *   - status (string) : สถานะที่ต้องการอัปเดต (BOOKED, REJECTED, REFUNDED, REFUND_REJECTED)
 *   - rejectReason (string, optional) : เหตุผลการปฏิเสธ (จำเป็นเมื่อ status เป็น REJECTED หรือ REFUND_REJECTED)
 * Output :
 *   - void : ไม่มีข้อมูลส่งกลับ หากอัปเดตสำเร็จ
 */
export async function updateBookingStatusByMember(
  bookingId: number,
  status: "BOOKED" | "REJECTED" | "REFUNDED" | "REFUND_REJECTED",
  rejectReason?: string
): Promise<void> {
  const isRejectStatus =
    status === "REJECTED" || status === "REFUND_REJECTED";

  // เตรียม reason ที่ trim แล้ว (ถ้าไม่มีจะเป็น undefined)
  const trimmedReason = rejectReason?.trim();

  // ถ้าเป็นสถานะปฏิเสธ แต่ไม่มีเหตุผล → error ทันที
  if (isRejectStatus && !trimmedReason) {
    throw new Error("กรุณากรอกเหตุผลการปฏิเสธ");
  }

  const body: {
    status: string;
    rejectReason?: string;
  } = { status };

  // เพิ่ม rejectReason เฉพาะตอนเป็นสถานะปฏิเสธ และมีค่าแน่นอนแล้ว
  if (isRejectStatus && trimmedReason) {
    body.rejectReason = trimmedReason;
  }

  await axios.post(
    `${apiUrl}/member/booking/${bookingId}/status`,
    body,
    { withCredentials: true }
  );
}
