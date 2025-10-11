/*
 * คำอธิบาย : Service ฝั่ง Client สำหรับดึงประวัติการจองตามสิทธิ์ของผู้ใช้ (Role)
 * Input  : page (number), limit (number)
 * Output : { list, page, limit, hasNext }
 */

import { api } from "../Libs/axios";
import type { BookingHistoryItem } from "../Types/BookingHistory";

/**
 * ดึงประวัติการจองตามสิทธิ์ของผู้ใช้
 * @param page หมายเลขหน้าปัจจุบัน (ค่าเริ่มต้น 1)
 * @param limit จำนวนรายการต่อหน้า (ค่าเริ่มต้น 10)
 * @returns Promise<{ list, page, limit, hasNext }>
 */
export async function fetchBookingHistoriesByRole(page = 1, limit = 10): Promise<{
  list: BookingHistoryItem[];
  page: number;
  limit: number;
  hasNext: boolean;
}> {
  const response = await api.get("/booking-histories/role", {
    params: { page, limit },
  });

  const list: BookingHistoryItem[] = response?.data?.data ?? [];

  return {
    list,
    page,
    limit,
    hasNext: Array.isArray(list) && list.length === limit,
  };
}
