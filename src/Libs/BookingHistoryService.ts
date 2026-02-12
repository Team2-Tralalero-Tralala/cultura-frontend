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

import type { BookingHistoryItem, TouristBookingHistory } from "../Types/BookingHistory";
import type { BookingAdminDtoFromApi, Pagination, BookingRow, PaginationMember, BookingMemberDtoFromApi} from "@/Types/Booking";
import axios from "axios";
import api from "@/Libs/Api";
const apiUrl = import.meta.env.VITE_API_URL;


/**
 * ดึงประวัติการจองตามสิทธิ์ของผู้ใช้
 * ใช้เรียก API `/booking/histories` โดยแนบ page และ limit เป็น query parameter
 * และส่ง cookie ไปพร้อมคำขอ เพื่อรักษา session ผู้ใช้งาน
 */
export async function fetchBookingHistoriesByRole(
  page = 1,
  limit = 10,
): Promise<{
  list: BookingHistoryItem[];
  page: number;
  limit: number;
  hasNext: boolean;
}> {
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const response = await fetch(
    `${baseURL}/admin/booking/histories/all?page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

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
 * อธิบาย : ฟังก์ชันดึงรายการการจองสำหรับแอดมินชุมชน พร้อมระบบค้นหาและกรองสถานะ
 * Input : page, limit, search, status
 * Output : ข้อมูลรายการการจอง (data) และข้อมูลการแบ่งหน้า (pagination)
 */
export async function fetchBookingsByAdmin(
  page = 1,
  limit = 10,
  search = "",
  status = "all"
): Promise<{
  data: BookingAdminDtoFromApi[];
  pagination: Pagination;
}> {
  const res = await axios.get(`${apiUrl}/admin/bookings/all`, {
    params: { page, limit, search, status },
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
  rejectReason?: string,
): Promise<void> {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // ถ้าเป็นสถานะที่ "ปฏิเสธ" ต้องมีเหตุผลด้วย
  const isRejectStatus = status === "REJECTED" || status === "REFUND_REJECTED";

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

  await axios.post(`${apiUrl}/admin/bookings/${bookingId}/status`, body, { withCredentials: true });
}

/*
 * อธิบาย : ฟังก์ชันดึงรายการประวัติการจองสำหรับสมาชิก (Member) พร้อมระบบค้นหาและกรองสถานะ
 * Input : page, limit, search, status
 * Output : ข้อมูลรายการการจอง (data) และข้อมูลการแบ่งหน้า (pagination)
 */
export async function fetchBookingsByMember(
  page = 1,
  limit = 10,
  search = "",
  status = "all"
): Promise<{
  data: BookingMemberDtoFromApi[];
  pagination: PaginationMember;
}> {
  const res = await axios.get(`${apiUrl}/member/booking-histories`, {
    params: { page, limit, search, status },
    withCredentials: true,
  });

  const payload = res.data?.data ?? {};
  return {
    data: (payload.data ?? []) as BookingMemberDtoFromApi[],
    pagination: (payload.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit,
    }) as PaginationMember,
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
  rejectReason?: string,
): Promise<void> {
  const isRejectStatus = status === "REJECTED" || status === "REFUND_REJECTED";

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

  await axios.post(`${apiUrl}/member/booking/${bookingId}/status`, body, { withCredentials: true });
}
/**
 * คำอธิบาย : ดึงข้อมูลประวัติการจองของนักท่องเที่ยว (Tourist)
 * input: page, limit, sort, filter
 * output: data, pagination
 */
export async function getTouristBookingHistory(
  page: number = 1,
  limit: number = 10,
  sort: "asc" | "desc" = "desc",
  filter?: {
    status?: string | string[];
    date?: {
      from: Date;
      to: Date;
    };
  },
): Promise<{
  data: TouristBookingHistory[];
  pagination: Pagination;
}> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  params.append("sort", sort);

  if (filter?.status) {
    if (filter.status !== "ALL") {
      const statusValue = Array.isArray(filter.status) ? filter.status.join(",") : filter.status;
      params.append("status", statusValue);
    }
  }

  if (filter?.date) {
    params.append("startDate", filter.date.from.toISOString());
    params.append("endDate", filter.date.to.toISOString());
  }

  const res = await axios.get(`${apiUrl}/tourist/booking-history/own`, {
    params,
    withCredentials: true,
  });

  const payload = res.data?.data ?? {};
  return {
    data: (payload.data ?? []) as TouristBookingHistory[],
    pagination: (payload.pagination ?? {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit,
    }) as Pagination,
  };
}

/*
 * อธิบาย : ดึงประวัติการจองของผู้ที่พัก
 * Input : page, limit, sort, status, period, search
 * Output : รายการประวัติการจอง
 */
export async function getBookingsByTourist(
  page = 1,
  limit = 10,
  sort = "newest",
  status?: string,
  period?: string,
  search?: string,
): Promise<{
  data: BookingRow[];
  pagination: Pagination;
}> {
  const sortMapped = sort === "oldest" ? "asc" : "desc";
  const params: any = { page, limit, sort: sortMapped, search };

  if (status && status !== "ALL") {
    params.status = status;
  }

  if (period && period !== "ALL") {
    const end = new Date();
    const start = new Date();

    if (period === "7_DAYS") {
      start.setDate(end.getDate() - 7);
    } else if (period === "1_MONTH") {
      start.setMonth(end.getMonth() - 1);
    } else if (period === "1_YEAR") {
      start.setFullYear(end.getFullYear() - 1);
    }

    params.startDate = start.toISOString();
    params.endDate = end.toISOString();
  }

  const res = await axios.get(`${apiUrl}/tourist/booking-histories`, {
    params,
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
