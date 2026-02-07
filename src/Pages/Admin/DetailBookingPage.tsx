/**
 * คำอธิบาย: Component สำหรับแสดงรายละเอียดการจองแพ็กเกจทัวร์ (สำหรับ Admin)
 * หน้าที่:
 * - แสดงข้อมูลรายละเอียดการจอง
 * - แสดงข้อมูลผู้จอง แพ็กเกจ และหลักฐานการโอนเงิน
 * - พิจารณาอนุมัติหรือปฏิเสธการจอง
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
 * คำอธิบาย: โครงสร้างข้อมูลการจอง (Booking) ที่ได้จาก API
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

const apiUrl = import.meta.env.VITE_API_URL;

/**
 * คำอธิบาย: Component สำหรับหน้ารายละเอียดการจองของผู้ดูแลชุมชน (Admin)
 */
export default function DetailBookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  /**
   * คำอธิบาย: ดึงข้อมูลรายละเอียดการจองจาก API ตาม bookingId
   * Input: - (ใช้ bookingId จาก URL parameter)
   * Output: - (อัปเดต state booking, isLoading, error)
   */
  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    setIsLoading(true);
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
        `${apiUrl}/admin/bookings/${bookingId}/status`,
        { bookingId, status: "BOOKED" },
        {
          withCredentials: true,
        },
      );

      setBooking({ ...booking, status: "BOOKED" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproveModalOpen(false);
    }
  };

  /**
   * คำอธิบาย: ปฏิเสธการจองแพ็กเกจทัวร์ พร้อมระบุเหตุผล และอัปเดตสถานะการจองผ่าน API
   * Input: reason (เหตุผลในการปฏิเสธ)
   * Output: - (อัปเดตสถานะ booking เป็น "REJECTED" และปิด Modal)
   */
  const confirmReject = async (reason: string) => {
    if (!booking || !bookingId) return;

    try {
      await axios.post(
        `${apiUrl}/admin/bookings/${bookingId}/status`,
        { bookingId, status: "REJECTED", rejectReason: reason },
        {
          withCredentials: true,
        },
      );

      setBooking({ ...booking, status: "REJECTED", rejectReason: reason });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRejectModalOpen(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-2">
      {/* Breadcrumb นำทางหน้า */}
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

          {isLoading ? (
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
                  <Button type="cancel" onClick={() => setIsRejectModalOpen(true)}>
                    ปฏิเสธการจอง
                  </Button>
                </div>
                <div className="w-40">
                  <Button type="confirm-admin" onClick={() => setIsApproveModalOpen(true)}>
                    อนุมัติการจอง
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={isApproveModalOpen}
        title="อนุมัติการจองนี้หรือไม่?"
        text="คุณจะไม่สามารถแก้ไขได้ หลังจากยืนยันการอนุมัติการจองนี้"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={confirmApprove}
        onCancel={() => setIsApproveModalOpen(false)}
      />

      <ModalReject
        isOpen={isRejectModalOpen}
        title="ปฎิเสธคำขอการจอง"
        text="กรุณากรอกเหตุผลการปฎิเสธ เพื่อส่งให้นักท่องเที่ยว"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        maxLength={100}
        onConfirm={confirmReject}
        onCancel={() => setIsRejectModalOpen(false)}
      />
    </div>
  );
}

/**
 * คำอธิบาย: แปลงวันที่จากรูปแบบ ISO string ให้เป็นวันที่และเวลาในรูปแบบภาษาไทย
 * Input: inputDate (วันที่ในรูปแบบ ISO string)
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
