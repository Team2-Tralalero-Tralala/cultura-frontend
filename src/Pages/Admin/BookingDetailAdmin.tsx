/**
 * คำอธิบาย:
 *  Component สำหรับแสดงรายละเอียดการจองแพ็กเกจทัวร์
 *  ใช้โดยผู้ดูแลชุมชน (Admin) เพื่อพิจารณาอนุมัติหรือปฏิเสธการจอง
 *  และแสดงข้อมูลผู้จอง แพ็กเกจ และหลักฐานการโอนเงิน
 *
 * Input:
 *  - bookingId: string (รับจาก URL parameter)
 *
 * Output:
 *  - แสดงรายละเอียดการจอง
 *  - รองรับการอนุมัติหรือปฏิเสธการจอง
 */

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import ModalReject from "@/Components/Modal/ModalReject";

/**
 * Type: ApiBooking
 *
 * คำอธิบาย:
 *  โครงสร้างข้อมูลการจอง (Booking) ที่ได้จาก API
 *  ใช้สำหรับแสดงรายละเอียดการจองและจัดการสถานะการจอง
 *
 * Source:
 *  - API: GET /admin/booking-history/:bookingId
 *
 * Usage:
 *  - ใช้เป็น type สำหรับ state booking
 *  - ใช้สำหรับแสดงข้อมูลในหน้า Booking Detail
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
 * คำอธิบาย:
 *  กำหนดค่าคงที่ของสถานะการจอง
 *  ใช้สำหรับอ้างอิงสถานะจากระบบ Backend
 */
const BOOKING_STATUS = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PENDING: "PENDING",
} as const;

const apiUrl = import.meta.env.VITE_API_URL;

/**
 * คำอธิบาย:
 *  หน้ารายละเอียดการจองสำหรับผู้ดูแลชุมชน (Admin)
 *
 * Input:
 *  - bookingId: string (จาก useParams)
 *
 * Output:
 *  - Render รายละเอียดการจอง
 *  - ควบคุม Modal สำหรับอนุมัติและปฏิเสธการจอง
 */
export default function BookingDetailAdmin() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);

  const token = localStorage.getItem("token");

  const breadcrumbItems = [
    { label: "จัดการการจอง", to: "/admin/bookings" },
    { label: "รายละเอียดการจอง" },
  ];

  /**
   * คำอธิบาย:
   *  ดึงข้อมูลรายละเอียดการจองจาก API ตาม bookingId
   *
   * Input:
   *  - bookingId: string (จาก URL parameter)
   *
   * Output:
   *  - อัปเดต state:
   *    - booking
   *    - loading
   *    - error
   */
  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${apiUrl}/admin/booking/${bookingId}`, {
        withCredentials: true,
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
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

  /**
   * คำอธิบาย:
   *  - อนุมัติการจองแพ็กเกจทัวร์และอัปเดตสถานะการจองผ่าน API
   *  - เรียก API: POST /member/bookings/:bookingId/status
   *
   * Input:
   *  - bookingId: string
   *  - booking: ApiBooking
   *
   * Output:
   *  - อัปเดตสถานะ booking เป็น "BOOKED"
   *  - ปิด Modal การอนุมัติ
   */
  const confirmApprove = async () => {
    if (!booking || !bookingId) return;

    try {
      await axios.post(
        `${apiUrl}/admin/bookings/${bookingId}/status`,
        { bookingId, status: "BOOKED" },
        {
          withCredentials: true,
        }
      );

      setBooking({ ...booking, status: "BOOKED" });
    } catch (err) {
      console.error(err);
    } finally {
      setOpenApproveModal(false);
    }
  };

  /**
   * คำอธิบาย:
   *  - ปฏิเสธการจองแพ็กเกจทัวร์ พร้อมระบุเหตุผล และอัปเดตสถานะการจองผ่าน API
   *  - เรียก API: POST /member/bookings/:bookingId/status
   * 
   * Input:
   *  - reason: string (เหตุผลในการปฏิเสธจาก Modal)
   *  - bookingId: string
   *
   * Output:
   *  - อัปเดตสถานะ booking เป็น "REJECTED"
   *  - บันทึกเหตุผลการปฏิเสธ
   *  - ปิด Modal การปฏิเสธ
   */
  const confirmReject = async (reason: string) => {
    if (!booking || !bookingId) return;

    try {
      await axios.post(
        `${apiUrl}/admin/bookings/${bookingId}/status`,
        { bookingId, status: "REJECTED", rejectReason: reason },
        {
          withCredentials: true,
        }
      );

      setBooking({ ...booking, status: "REJECTED", rejectReason: reason });
    } catch (err) {
      console.error(err);
    } finally {
      setOpenRejectModal(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-2">
      {/* --------------------------------------------------------
           Breadcrumb นำทางหน้า
         -------------------------------------------------------- */}
      <div className="p-2">
        <Breadcrumb
          current={{
            label: "รายละเอียดการจอง",
            to: `/admin/booking/${bookingId}`,
          }}
        />
      </div>

      <div className="w-full mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-semibold mb-4">ดูรายละเอียดการจอง</h3>

          {loading ? (
            <div className="text-center text-gray-600 py-20">กำลังโหลดข้อมูล...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-20">{error}</div>
          ) : !booking ? (
            <div className="text-center text-gray-500 py-20">ไม่พบข้อมูลการจอง</div>
          ) : (
            <>
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-medium">ชื่อผู้จอง :</span> {booking.tourist.fname}{" "}
                  {booking.tourist.lname}
                </p>
                <p>
                  <span className="font-medium">ชื่อแพ็กเกจ :</span> {booking.package.name}
                </p>
                <p>
                  <span className="font-medium">วันที่เดินทาง :</span>{" "}
                  {formatDate(booking.package.startDate)}
                </p>
                <p>
                  <span className="font-medium">วันที่เดินทางกลับ :</span>{" "}
                  {formatDate(booking.package.dueDate)}
                </p>
                <p>
                  <span className="font-medium">จำนวนคนที่เดินทาง :</span>{" "}
                  {booking.totalParticipant} คน
                </p>
                <p>
                  <span className="font-medium">จำนวนผู้จอง :</span> {booking.totalParticipant} คน
                </p>
                <p>
                  <span className="font-medium">ราคาทั้งหมด :</span> THB{" "}
                  {(booking.package.price * booking.totalParticipant).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">เวลาที่จอง :</span> {formatDate(booking.bookingAt)}
                </p>
                <p>
                  <span className="font-medium">หลักฐานการโอน :</span> {booking.transferSlip || "-"}
                </p>
                <p>
                  <span className="font-medium">อีเมลผู้จอง :</span> {booking.tourist.email}
                </p>
                <p>
                  <span className="font-medium">เบอร์โทรผู้จอง :</span> {booking.tourist.phone}
                </p>
              </div>
              <div className="flex justify-end gap-4 pt-8">
                <div className="w-40">
                  <Button type="cancel" onClick={() => setOpenRejectModal(true)}>
                    ปฏิเสธการจอง
                  </Button>
                </div>
                <div className="w-40">
                  <Button type="confirm-admin" onClick={() => setOpenApproveModal(true)}>
                    อนุมัติการจอง
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        open={openApproveModal}
        title="อนุมัติการจองนี้หรือไม่?"
        text="คุณจะไม่สามารถแก้ไขได้ หลังจากยืนยันการอนุมัติการจองนี้"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={confirmApprove}
        onCancel={() => setOpenApproveModal(false)}
      />

      <ModalReject
        open={openRejectModal}
        title="ปฎิเสธคำขอการจอง"
        text="กรุณากรอกเหตุผลการปฎิเสธ เพื่อส่งให้นักท่องเที่ยว"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        maxLength={100}
        onConfirm={confirmReject}
        onCancel={() => setOpenRejectModal(false)}
      />
    </div>
  );
}

/**
 * ฟังก์ชัน: formatDate
 *
 * คำอธิบาย:
 *  แปลงวันที่จากรูปแบบ ISO string
 *  ให้เป็นวันที่และเวลาในรูปแบบภาษาไทย
 *
 * Input:
 *  - inputDate?: string | null
 *
 * Output:
 *  - string: วันที่และเวลาในรูปแบบภาษาไทย
 *  - "-" หากไม่มีข้อมูลหรือรูปแบบไม่ถูกต้อง
 */

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
