/*
 * คำอธิบาย : Page Component สำหรับหน้ายืนยันการจอง (ขั้นตอนที่ 3)
 * แสดงข้อความสำเร็จและปุ่ม "ดูประวัติ" และ "กลับสู่หน้าหลัก"
 */

import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import Button from "@/Components/Button";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/Navbar/NavbarTourist";
import { Icon } from "@iconify/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/*
 * คำอธิบาย : Component สำหรับหน้ายืนยันการจอง
 * Input : ไม่มี
 * Output : React Component ที่แสดงหน้ายืนยันการจอง
 */
export default function BookingConfirmedPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state;

  /*
   * คำอธิบาย : จัดการเมื่อคลิกปุ่มดูประวัติ
   * Input : ไม่มี
   * Output : นำทางไปยังหน้าประวัติการจอง
   */
  const handleViewHistory = () => {
    navigate("/tourist/booking-histories");
  };

  /*
   * คำอธิบาย : จัดการเมื่อคลิกปุ่มกลับสู่หน้าหลัก
   * Input : ไม่มี
   * Output : นำทางไปยังหน้าหลัก
   */
  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarTourist />

      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNavigation
          current={{
            label: "การจอง",
            to: window.location.pathname,
          }}
        />

        <h1 className="text-3xl font-bold text-black mb-6">การจอง</h1>

        {/* Progress Indicator */}
        <div className="flex items-start justify-center gap-6 mb-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg border-2 border-green-600">
              1
            </div>
            <span className="text-base font-medium text-gray-600">ข้อมูล</span>
          </div>
          <div className="flex-1 h-2 bg-green-600 rounded-full max-w-[120px] mt-6"></div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg border-2 border-green-600">
              2
            </div>
            <span className="text-base font-medium text-gray-600">จ่ายเงิน</span>
          </div>
          <div className="flex-1 h-2 bg-green-600 rounded-full max-w-[120px] mt-6"></div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-green-600 border-2 border-green-600 text-white flex items-center justify-center font-bold text-lg">
              3
            </div>
            <span className="text-base font-medium text-green-600 border-2 border-green-600 rounded-full px-6 py-0.5">
              ยืนยันการจอง
            </span>
          </div>
        </div>

        {/* Success Message */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg border-2 border-light-green p-8 px-64 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-48 h-48 rounded-full flex items-center justify-center">
                <Icon icon="bxs:badge-check" className="w-48 h-48 text-light-green" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">การจองสำเร็จ</h2>
            <p className="text-gray-600 mb-8">ขอขอบคุณที่ท่านเข้ามาใช้บริการของเรา</p>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end mt-8">
          <div className="flex gap-4">
            <button
              onClick={handleViewHistory}
              className="break-keep text-nowrap px-6 py-3 border-2 border-black rounded-lg text-black font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              ดูประวัติ
            </button>
            <Button
              type="confirm-tourist"
              className="px-6 py-3 rounded-lg cursor-pointer"
              onClick={handleBackToHome}
            >
              กลับสู่หน้าหลัก
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
