import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../Components/Button";
import axios from "axios";

/*
 * คำอธิบาย : แสดงรายละเอียดการจองสำหรับผู้ดูแลระบบ (Admin)
 * ใช้สำหรับแสดงรายละเอียดการจองและอนุมัติ/ปฏิเสธการจอง
 */

type Booking = {
  id: number;
  name: string;
  packageName: string;
  startDate: string;
  endDate: string;
  price: number;
  totalPeople: number;
  paymentSlip: string;
  email: string;
  phone: string;
  status: string;
  bh_status: string;
};

const apiUrl = import.meta.env.VITE_API_URL;

export default function BookingDetailAdmin() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);

    axios
      .get(`${apiUrl}/booking-histories/${bookingId}`)
      .then((res) => {
        const data: Booking = res.data;
        const isPending =
          data.status === "PENDING" || data.bh_status === "PENDING";

        if (!isPending) {
          setBooking(null);
          setError("ไม่พบข้อมูลการจองที่รออนุมัติ");
        } else {
          setBooking(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  /*
   * ฟังก์ชัน : handleApprove
   * คำอธิบาย : ใช้สำหรับอนุมัติรายการจองที่เลือก
   * Input : ไม่มี (ใช้ state booking)
   * Output : เปลี่ยนสถานะ booking เป็น APPROVED
   */

  const handleApprove = async () => {
    if (!booking) return;
    try {
      await axios.patch(`${apiUrl}/booking-histories/${booking.id}`, {
        status: "APPROVED",
      });
      alert("อนุมัติเรียบร้อย");
      setBooking({ ...booking, status: "APPROVED" });
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอนุมัติ");
    }
  };

  /*
   * ฟังก์ชัน : handleReject
   * คำอธิบาย : ใช้สำหรับปฏิเสธรายการจองที่เลือก
   * Input : ไม่มี (ใช้ state booking)
   * Output : เปลี่ยนสถานะ booking เป็น REJECTED
   */

  const handleReject = async () => {
    if (!booking) return;
    try {
      await axios.patch(`${apiUrl}/booking-histories/${booking.id}`, {
        status: "REJECTED",
      });
      alert("ปฏิเสธเรียบร้อย");
      setBooking({ ...booking, status: "REJECTED" });
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการปฏิเสธ");
    }
  };

  return (
    <div
      style={{
        background: "#f4f5f7",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        padding: "100px 20px",
        overflow: "hidden",
      }}>

      <div
        style={{
          background: "#fff",
          width: "100%",
          height: "50vh",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <h3
          style={{
            fontSize: "22px",
            fontWeight: 600,
            marginBottom: "16px",
            textAlign: "left",
          }}>ดูรายละเอียดการจอง
        </h3>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 18,
              color: "#666",
            }}
          >
            กำลังโหลดข้อมูล
          </div>
        ) : error || !booking ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#999",
              fontSize: "18px",
              textAlign: "center",
            }}
          >
            {error || "ไม่พบข้อมูลการจอง"}
          </div>
        ) : (
          <>
            <div
              style={{
                flex: 1,
                display: "grid",
                gap: "15px",
              }}>
              <p>
                <strong>ชื่อผู้จอง :</strong> {booking.name}{" "}
              </p>
              <p>
                <strong>ชื่อแพ็กเกจ :</strong> {booking.packageName}
              </p>
              <p>
                <strong>วันที่เดินทาง :</strong> {formatDate(booking.startDate)}{" "} → {formatDate(booking.endDate)}
              </p>
              <p>
                <strong>ราคา :</strong> THB {booking.price.toLocaleString()}
              </p>
              <p>
                <strong>จำนวนคน :</strong> {booking.totalPeople} คน
              </p>
              <p>
                <strong>หลักฐานการจอง :</strong> {booking.paymentSlip || "-"}
              </p>
              <p>
                <strong>อีเมล :</strong> {booking.email}
              </p>
              <p>
                <strong>เบอร์โทร :</strong> {booking.phone}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "20px",
              }}>
            <div style={{ width: 150 }}>
                <Button type="cancel" onClick={handleReject}>ปฏิเสธการจอง</Button>
            </div>
              <div style={{ width: 150 }}>
                <Button type="confirm-admin" onClick={handleApprove}>อนุมัติการจอง</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
