/**
 * Component: BookingDetailMember
 *
 * คำอธิบาย:
 *  Page Component สำหรับแสดงรายละเอียดการจองในมุมมองของ Member
 *  ใช้สำหรับดูประวัติการจองย้อนหลัง
 *  ไม่สามารถแก้ไขหรือเปลี่ยนสถานะการจองได้
 *
 * Route:
 *  - /member/bookings-histories/:bookingId
 *
 * API Endpoint:
 *  - GET /member/booking-history/:bookingId
 */

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { ArrowLeft } from "lucide-react";

/**
 * Type: ApiBooking
 *
 * คำอธิบาย:
 *  โครงสร้างข้อมูลการจอง (Booking) ที่ได้จาก Backend API
 *  ใช้สำหรับแสดงรายละเอียดการจองของ Member
 *  รวมข้อมูลแพ็กเกจทัวร์ และข้อมูลผู้จอง
 */
type ApiBooking = {
  id: number;
  touristId: number;
  packageId: number;
  touristBankId: number | null;
  bookingAt: string;
  cancelAt: string | null;
  refundAt: string | null;
  status: string;
  totalParticipant: number;
  rejectReason: string | null;
  transferSlip: string | null;
  package: {
    name: string;
    startDate: string;
    dueDate: string;
    price: number;
    capacity: number;
  };
  tourist: {
    fname: string;
    lname: string;
    email: string;
    phone: string;
  };
};

/**
 * Constant: BOOKING_STATUS
 *
 * คำอธิบาย:
 *  ค่าคงที่ของสถานะการจอง
 *  ใช้สำหรับควบคุมการแสดงผล UI ตามสถานะจาก Backend
 */
const BOOKING_STATUS = {
  PENDING: "PENDING",
  BOOKED: "BOOKED",
  REJECTED: "REJECTED",
  REFUND_PENDING: "REFUND_PENDING",
  REFUNDED: "REFUNDED",
  REFUND_REJECTED: "REFUND_REJECTED",
} as const;

const apiUrl = import.meta.env.VITE_API_URL;

/**
 * Function: BookingDetailStatusMember
 *
 * คำอธิบาย:
 *  ดึงและแสดงรายละเอียดการจองตาม bookingId
 *  สำหรับ Member ใช้ดูประวัติการจองย้อนหลัง
 *
 * Input:
 *  - bookingId: string (จาก URL parameter)
 *
 * Output:
 *  - Render รายละเอียดการจอง
 *  - แสดงสถานะ Loading / Error / Empty
 */
export default function BookingDetailStatusMember() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  /**
   * Function: fetchBooking
   *
   * คำอธิบาย:
   *  ดึงข้อมูลรายละเอียดการจองจาก Backend API
   *  โดยใช้ bookingId จาก URL
   *
   * Side Effects:
   *  - อัปเดต state: booking, loading, error
   */
  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${apiUrl}/member/booking-history/${bookingId}`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const payload = res.data;

      if (!payload || payload.error) {
        setError(payload?.message || "ไม่สามารถโหลดข้อมูลได้");
        setBooking(null);
      } else {
        setBooking(payload.data);
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId, token]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  return (
    <div className="w-full mx-auto space-y-2">
      {/* Breadcrumb */}
      <div className="p-2">
        <Breadcrumb
          current={{
            label: "รายละเอียดการจอง",
            to: `/member/bookings-histories/${bookingId}`,
          }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/member/bookings-histories")}
            className="p-1 rounded-md hover:bg-gray-100 transition"
            aria-label="ย้อนกลับ"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-xl font-bold">ดูรายละเอียดการจอง</h3>
        </div>

        {loading ? (
          <div className="text-center py-20">กำลังโหลดข้อมูล...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-20">{error}</div>
        ) : !booking ? (
          <div className="text-center py-20">ไม่พบข้อมูลการจอง</div>
        ) : (
          <div className="grid grid-cols-[240px_1fr] gap-y-3 text-black text-x">
            <div className="font-bold">ชื่อผู้จอง :</div>
            <div>
              {booking.tourist.fname} {booking.tourist.lname}
            </div>

            <div className="font-bold">ชื่อแพ็กเกจ :</div>
            <div>{booking.package.name}</div>

            <div className="font-bold">วันที่แพ็กเกจเริ่ม :</div>
            <div>{formatDate(booking.package.startDate)}</div>

            <div className="font-bold">วันที่แพ็กเกจสิ้นสุด :</div>
            <div>{formatDate(booking.package.dueDate)}</div>

            <div className="font-bold">จำนวนคนที่เปิดรับ :</div>
            <div>{booking.package.capacity} คน</div>

            <div className="font-bold">จำนวนที่จอง :</div>
            <div>{booking.totalParticipant} คน</div>

            <div className="font-bold">ราคาสุทธิ :</div>
            <div>THB {(booking.package.price * booking.totalParticipant).toLocaleString()}</div>

            <div className="font-bold">เวลาที่จอง :</div>
            <div>{formatDate(booking.bookingAt)}</div>

            <div className="font-bold">หลักฐานการโอน :</div>
            <div>{booking.transferSlip || "-"}</div>

            <div className="font-bold">อีเมล :</div>
            <div>{booking.tourist.email}</div>

            <div className="font-bold">เบอร์โทร :</div>
            <div>{booking.tourist.phone}</div>

            {booking.status === BOOKING_STATUS.REJECTED && (
              <>
                <div className="font-bold">เหตุผลปฏิเสธการจอง :</div>
                <div>{booking.rejectReason || "-"}</div>
              </>
            )}

            {booking.status === BOOKING_STATUS.REFUNDED && (
              <>
                <div className="font-bold">เหตุผลคำขอคืนเงิน :</div>
                <div>{booking.rejectReason || "-"}</div>
              </>
            )}

            {booking.status === BOOKING_STATUS.REFUND_REJECTED && (
              <>
                <div className="font-bold">เหตุผลคำขอคืนเงิน :</div>
                <div>{booking.rejectReason || "-"}</div>

                <div className="font-bold">เหตุผลปฏิเสธคำขอคืนเงิน :</div>
                <div>{booking.rejectReason || "-"}</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(inputDate?: string | null) {
  if (!inputDate) return "-";
  const parsedDate = new Date(inputDate);
  if (isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
