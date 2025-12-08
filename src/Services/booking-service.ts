/*
 * คำอธิบาย : Service สำหรับเชื่อมต่อ API ของคำขอคืนเงิน (Refund Requests)
 * ใช้สำหรับผู้ดูแลชุมชน (Admin) เพื่อดึง อนุมัติ และปฏิเสธคำขอคืนเงิน
 *
 * Base URL: ${VITE_API_URL}/admin/booking/refunds
 */

import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/*
 * คำอธิบาย : ฟังก์ชันดึงรายการคำขอคืนเงินทั้งหมด
 * Mapping : GET /admin/booking/refunds/all?page=&limit=
 * Output : PaginationResponse<Refund>
 */
export async function fetchRefundRequests(page = 1, limit = 10) {
  return api.get(`/admin/booking/refunds/all`, { params: { page, limit } });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับอนุมัติคำขอคืนเงิน
 * Mapping : PATCH /admin/booking/refunds/:id/approve
 */
export async function approveRefund(id: number) {
  return api.patch(`/admin/booking/refunds/${id}/approve`);
}

/*
 * ฟังก์ชัน : rejectRefund
 * อธิบาย : ปฏิเสธคำขอคืนเงิน พร้อมเหตุผล
 * Mapping : PATCH /admin/refunds/:id/reject
 * Input : reason (string)
 */
export async function rejectRefund(id: number, reason: string) {
  return api.patch(`/admin/booking/refunds/${id}/reject`, { reason });
}


/*
 * คำอธิบาย : ฟังก์ชันดึงรายการคำขอคืนเงินทั้งหมด
 * Mapping : GET /member/booking-history/refunds
 * Output : PaginationResponse<Refund>
 */
export async function fetchRefundRequestsMember(page = 1, limit = 10) {
  return api.get(`/member/booking-history`, { params: { page, limit } });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับอนุมัติคำขอคืนเงิน
 * Mapping : PATCH /member/booking-history/:id/approve-refund
 */
export async function approveRefundMember(id: number) {
  return api.patch(`/member/booking-history/${id}/approve-refund`);
}

/*
 * ฟังก์ชัน : rejectRefund
 * อธิบาย : ปฏิเสธคำขอคืนเงิน พร้อมเหตุผล
 * Mapping : PATCH /member/booking-history/:id/reject-refund
 * Input : reason (string)
 */
export async function rejectRefundMember(id: number, reason: string) {
  return api.patch(`/member/booking-history/${id}/reject-refund`, { reason });
}