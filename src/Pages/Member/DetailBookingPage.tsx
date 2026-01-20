/**
 * คำอธิบาย: Component สำหรับแสดงรายละเอียดการจอง (Booking)
 * - แสดงรายละเอียดการจอง
 * - รองรับการอนุมัติการจองผ่าน Modal
 * - รองรับการปฏิเสธการจองพร้อมระบุเหตุผล
 * Input: -
 * Output: หน้าแสดงรายละเอียดการจอง
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
 *  ใช้สำหรับแสดงรายละเอียดการจองของนักท่องเที่ยว
 *  รวมถึงข้อมูลแพ็กเกจทัวร์และผู้จอง
 *
 * Usage:
 *  - ใช้เป็น type ของ response จาก Booking API
 *  - ใช้ในหน้าแสดงรายละเอียด / ประวัติการจอง
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
 * คำอธิบาย: หน้ารายละเอียดการจองสำหรับผู้ดูแลชุมชน (Member)
 * Input: -
 * Output: Render รายละเอียดการจอง และควบคุม Modal สำหรับอนุมัติ/ปฏิเสธ
 */
export default function DetailBookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenApproveModal, setIsOpenApproveModal] = useState(false);
  const [isOpenRejectModal, setIsOpenRejectModal] = useState(false);

  const token = localStorage.getItem("token");

  /**
   * คำอธิบาย: ดึงข้อมูลรายละเอียดการจองจาก API ตาม bookingId
   * Input: -
   * Output: - (อัปเดต state booking, isLoading, errorMessage)
   */
  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.get(`${apiUrl}/member/booking-history/${bookingId}`, {
        withCredentials: true,
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      const payload = response.data;
      if (!payload || payload.error) {
        setErrorMessage(payload?.message || "ไม่สามารถโหลดข้อมูลได้");
        setBooking(null);
      } else {
        setBooking(payload.data);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setBooking(null);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, token]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  /**
   * คำอธิบาย: อนุมัติการจองแพ็กเกจทัวร์และอัปเดตสถานะการจองผ่าน API
   * Input: -
   * Output: - (อัปเดตสถานะ booking เป็น "BOOKED" และปิด Modal)
   */
  const confirmApprove = async () => {
    if (!booking || !bookingId) return;

    try {
      await axios.post(
        `${apiUrl}/member/bookings/${bookingId}/status`,
        { bookingId, status: "BOOKED" },
        {
          withCredentials: true,
        },
      );

      setBooking({ ...booking, status: "BOOKED" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsOpenApproveModal(false);
    }
  };

  /**
   * คำอธิบาย: ปฏิเสธการจองแพ็กเกจทัวร์ พร้อมระบุเหตุผล และอัปเดตสถานะการจองผ่าน API
   * Input: reason (เหตุผลในการปฏิเสธจาก Modal)
   * Output: - (อัปเดตสถานะ booking เป็น "REJECTED" และปิด Modal)
   */
  const confirmReject = async (reason: string) => {
    if (!booking || !bookingId) return;

    try {
      await axios.post(
        `${apiUrl}/member/bookings/${bookingId}/status`,
        { bookingId, status: "REJECTED", rejectReason: reason },
        {
          withCredentials: true,
        },
      );

      setBooking({ ...booking, status: "REJECTED", rejectReason: reason });
    } catch (error) {
      console.error(error);
    } finally {
      setIsOpenRejectModal(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-2">
      <div className="p-2">
        <Breadcrumb
          current={{
            label: "รายละเอียดการจอง",
            to: `/member/booking/${bookingId}`,
          }}
        />
      </div>

      <div className="w-full mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-semibold mb-4">ดูรายละเอียดการจอง</h3>

          {isLoading ? (
            <div className="text-center text-gray-600 py-20">กำลังโหลดข้อมูล...</div>
          ) : errorMessage ? (
            <div className="text-center text-red-500 py-20">{errorMessage}</div>
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
                  <Button type="cancel" onClick={() => setIsOpenRejectModal(true)}>
                    ปฏิเสธการจอง
                  </Button>
                </div>
                <div className="w-40">
                  <Button type="confirm-admin" onClick={() => setIsOpenApproveModal(true)}>
                    อนุมัติการจอง
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        open={isOpenApproveModal}
        title="อนุมัติการจองนี้หรือไม่?"
        text="คุณจะไม่สามารถแก้ไขได้ หลังจากยืนยันการอนุมัติการจองนี้"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={confirmApprove}
        onCancel={() => setIsOpenApproveModal(false)}
      />

      <ModalReject
        open={isOpenRejectModal}
        title="ปฎิเสธคำขอการจอง"
        text="กรุณากรอกเหตุผลการปฎิเสธ เพื่อส่งให้นักท่องเที่ยว"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        maxLength={100}
        onConfirm={confirmReject}
        onCancel={() => setIsOpenRejectModal(false)}
      />
    </div>
  );
}

/**
 * คำอธิบาย: แปลงวันที่จากรูปแบบ ISO string ให้เป็นวันที่และเวลาในรูปแบบภาษาไทย
 * Input: inputDate (ISO String ของวันที่)
 * Output: วันที่และเวลาในรูปแบบภาษาไทย หรือ "-" หากไม่มีข้อมูล
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
