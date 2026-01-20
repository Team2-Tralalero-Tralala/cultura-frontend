/**
 * Component: BookingDetailMember
 *
 * คำอธิบาย:
 *  Component สำหรับแสดงรายละเอียดการจอง (Booking)
 *  ใช้สำหรับการพิจารณาอนุมัติหรือปฏิเสธการจอง
 *  พร้อมแสดงข้อมูลนักท่องเที่ยว แพ็กเกจทัวร์ และหลักฐานการโอนเงิน
 *
 * Input:
 *  - bookingId: string (รับจาก URL parameter)
 *
 * Output:
 *  - แสดงรายละเอียดการจอง
 *  - รองรับการอนุมัติการจองผ่าน Modal
 *  - รองรับการปฏิเสธการจองพร้อมระบุเหตุผล
 *
 * API Endpoint:
 *  - GET    /member/booking-history/:bookingId
 */
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import ModalReject from "@/Components/Modal/ModalReject";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import { ArrowLeft } from "lucide-react";

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
  PENDING: "PENDING",
  BOOKED: "BOOKED",
  REJECTED: "REJECTED",
  REFUND_PENDING: "REFUND_PENDING",
  REFUNDED: "REFUNDED",
  REFUND_REJECTED: "REFUND_REJECTED",
} as const;

const apiUrl = import.meta.env.VITE_API_URL;

/**
 * คำอธิบาย:
 *  หน้ารายละเอียดการจองสำหรับ Member
 *  ใช้สำหรับจัดการการจองและคำขอคืนเงินของแพ็กเกจที่ตนดูแล
 *
 * Input:
 *  - bookingId: string (จาก useParams)
 *
 * Output:
 *  - Render รายละเอียดการจอง
 *  - ควบคุม Modal สำหรับอนุมัติและปฏิเสธการจอง
 */
export default function BookingDetailMember() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openRejectConfirmModal, setOpenRejectConfirmModal] = useState(false);

  const [rejectReason, setRejectReason] = useState("");

  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

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
      const res = await axios.get(`${apiUrl}/member/booking-history/${bookingId}`, {
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

    const nextStatus =
      booking.status === BOOKING_STATUS.REFUND_PENDING
        ? BOOKING_STATUS.REFUNDED
        : BOOKING_STATUS.BOOKED;

    try {
      await axios.post(
        `${apiUrl}/member/bookings/${bookingId}/status`,
        { bookingId, status: nextStatus },
        {
          withCredentials: true,
        },
      );

      setBooking({ ...booking, status: nextStatus });
      setAlertType("success");
      setAlertTitle("บันทึกข้อมูลสำเร็จ");
      setAlertMessage("");
      setOpenAlert(true);
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

    const nextStatus =
      booking.status === BOOKING_STATUS.REFUND_PENDING
        ? BOOKING_STATUS.REFUND_REJECTED
        : BOOKING_STATUS.REJECTED;

    try {
      await axios.post(
        `${apiUrl}/member/bookings/${bookingId}/status`,
        { bookingId, status: nextStatus, rejectReason: reason },
        {
          withCredentials: true,
        },
      );

      setBooking({ ...booking, status: nextStatus, rejectReason: reason });
      setAlertType("success");
      setAlertTitle("บันทึกข้อมูลสำเร็จ");
      setOpenAlert(true);
    } catch (err) {
      console.error(err);
    } finally {
      setOpenRejectModal(false);
    }
      setOpenRejectConfirmModal(false);
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
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/member/bookings/pending")}
              className="p-1 rounded-md hover:bg-gray-100"
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
            <>
              <div className="grid grid-cols-[240px_1fr] gap-y-3 text-black">
                <div className="font-bold">ชื่อผู้จอง :</div>
                <div>
                  {booking.tourist.fname} {booking.tourist.lname}
                </div>

                <div className="font-bold">ชื่อแพ็กเกจ :</div>
                <div>{booking.package.name}</div>

                <div className="font-bold">วันที่เริ่ม :</div>
                <div>{formatDate(booking.package.startDate)}</div>

                <div className="font-bold">วันที่สิ้นสุด :</div>
                <div>{formatDate(booking.package.dueDate)}</div>

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

                {booking.status === BOOKING_STATUS.REFUND_PENDING && (
                  <>
                    <div className="font-bold">เหตุผลคำขอคืนเงิน :</div>
                    <div>{booking.rejectReason || "-"}</div>
                  </>
                )}
              </div>

              {(booking.status === BOOKING_STATUS.PENDING ||
                booking.status === BOOKING_STATUS.REFUND_PENDING) && (
                <ActionButtons
                  rejectText={
                    booking.status === BOOKING_STATUS.REFUND_PENDING
                      ? "ปฏิเสธคำขอคืนเงิน"
                      : "ปฏิเสธการจอง"
                  }
                  approveText={
                    booking.status === BOOKING_STATUS.REFUND_PENDING
                      ? "อนุมัติคำขอคืนเงิน"
                      : "อนุมัติการจอง"
                  }
                  onReject={() => setOpenRejectModal(true)}
                  onApprove={() => setOpenApproveModal(true)}
                />
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={openApproveModal}
        title="ยืนยันการดำเนินการ"
        text="คุณจะไม่สามารถแก้ไขได้ หลังจากยืนยัน"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={confirmApprove}
        onCancel={() => setOpenApproveModal(false)}
      />

      <Modal
        open={openRejectConfirmModal}
        title="ยืนยันการปฏิเสธ"
        text="คุณจะไม่สามารถแก้ไขได้ หลังจากยืนยัน"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => confirmReject(rejectReason)}
        onCancel={() => setOpenRejectConfirmModal(false)}
      />

      <ModalReject
        open={openRejectModal}
        title="ปฏิเสธรายการ"
        text="กรุณากรอกเหตุผล"
        confirmText="ถัดไป"
        cancelText="ยกเลิก"
        maxLength={100}
        onConfirm={(reason: string) => {
          setRejectReason(reason);
          setOpenRejectModal(false);
          setOpenRejectConfirmModal(true);
        }}
        onCancel={() => setOpenRejectModal(false)}
      />

      <ModalAlert
        open={openAlert}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => navigate("/member/bookings/pending")}
      />
    </div>
  );
  }

 /**
 * Component: ActionButtons
 *
 * คำอธิบาย:
 *  แสดงปุ่มสำหรับการอนุมัติและปฏิเสธการจอง
 *  ใช้ร่วมกันทั้งกรณีการจองและคำขอคืนเงิน
 *
 * Props:
 *  - rejectText: string
 *  - approveText: string
 *  - onReject: () => void
 *  - onApprove: () => void
 */
function ActionButtons({
  rejectText,
  approveText,
  onReject,
  onApprove,
}: {
  rejectText: string;
  approveText: string;
  onReject: () => void;
  onApprove: () => void;
}) {
  return (
    <div className="flex justify-end gap-4 pt-8">
      <div className="w-40">
        <Button type="cancel" onClick={onReject}>
          {rejectText}
        </Button>
      </div>
      <div className="w-40">
        <Button type="confirm-admin" onClick={onApprove}>
          {approveText}
        </Button>
      </div>
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

