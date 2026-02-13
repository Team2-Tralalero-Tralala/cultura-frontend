/*
 * คำอธิบาย : Page Component สำหรับหน้าสรุปการยกเลิกการจอง/สถานะการคืนเงิน
 * แสดงสถานะ (Stepper), ข้อมูลแพ็กเกจ, รายละเอียดราคา, และเหตุผล (ถ้ามี)
 */

import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/Navbar/NavbarTourist";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTouristBookingById } from "@/Libs/BookingHistoryService";
import type { TouristBookingHistory } from "@/Types/BookingHistory";
import { Icon } from "@iconify/react";
import api from "@/Libs/Api";

interface PackageData {
  id: number;
  name: string;
  price: number | null;
  startDate: string | null;
  dueDate: string | null;
  location: {
    subDistrict: string;
    district: string;
    province: string;
  };
  packageFiles: Array<{
    id: number;
    filePath: string;
    type: "COVER" | "GALLERY" | "VIDEO";
  }>;
}

/*
 * คำอธิบาย : Component สำหรับหน้าสรุปการยกเลิกการจอง
 * Input : ไม่มี (รับ params: bookingId)
 * Output : React Component
 */
export default function CancelBookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<TouristBookingHistory | null>(null);
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /*
   * คำอธิบาย : ดึงข้อมูลการจองและแพ็กเกจจาก API
   * Input : bookingId (รหัสการจอง)
   * Output : void (อัปเดต state: bookingData, packageData, isLoading, errorMessage)
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!bookingId) {
        setErrorMessage("ไม่พบรหัสการจอง");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const id = parseInt(bookingId, 10);
        if (isNaN(id)) throw new Error("รหัสการจองไม่ถูกต้อง");

        const bookingData = await getTouristBookingById(id);
        setBookingData(bookingData);

        if (bookingData && bookingData.packageId) {
          const res = await api.get(`/tourist/package/${bookingData.packageId}`);
          setPackageData(res.data.data);
        } else {
          console.warn("ไม่พบข้อมูลแพ็กเกจ");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  /*
   * คำอธิบาย : แปลงวันที่เป็นรูปแบบภาษาไทย
   * Input : dateString (วันที่ในรูปแบบ string)
   * Output : formattedDate (วันที่ในรูปแบบภาษาไทย)
   */
  const formatDateToThai = (dateString: string | undefined | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear() + 543;
    const month = date.toLocaleDateString("th-TH", { month: "long" });
    const day = date.getDate();
    const weekday = date.toLocaleDateString("th-TH", { weekday: "long" });
    const time = date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    return `${weekday}ที่ ${day} ${month} ${year} | เวลา ${time} น.`;
  };

  /*
   * คำอธิบาย : สร้าง URL รูปภาพ
   * Input : filePath (URL ของรูปภาพ)
   * Output : imageUrl (URL ของรูปภาพ)
   */
  const generateImageUrl = (filePath: string | undefined): string => {
    if (!filePath) return "https://placehold.co/800x450?text=No+Image";
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const backendBaseUrl = apiUrl.replace("/api", "") || "http://localhost:3000";
    const imagePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return `${backendBaseUrl}/${imagePath}`;
  };

  /*
   * คำอธิบาย : คำนวณจำนวนวัน
   * Input : startDate (วันที่เริ่มกิจกรรม), dueDate (วันที่จบกิจกรรม)
   * Output : days (จำนวนวัน)
   */
  const calculateDays = (
    startDate: string | undefined | null,
    dueDate: string | undefined | null,
  ): number => {
    if (!startDate || !dueDate) return 0;
    const start = new Date(startDate);
    const end = new Date(dueDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-light-green font-medium">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (errorMessage || !bookingData || !packageData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-xl font-bold text-black mb-2">ไม่พบข้อมูล</h2>
        <p className="text-black mb-4">{errorMessage || "ไม่พบข้อมูลการจองหรือแพ็กเกจ"}</p>
        <button onClick={() => navigate("/")} className="text-light-green hover:underline">
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  const { status, totalParticipant, bookingAt, touristRejectReason, rejectReason } = bookingData;
  const { name: pkgName, price, startDate, dueDate, packageFiles, location } = packageData;

  const coverImage = packageFiles?.find((f) => f.type === "COVER") || packageFiles?.[0];
  const imageUrl = generateImageUrl(coverImage?.filePath);
  const totalPrice = (price || 0) * totalParticipant;
  const days = calculateDays(startDate, dueDate);

  const isRefunded = status === "REFUNDED";
  const isRefundRejected = status === "REFUND_REJECTED" || status === "REJECTED";
  const isPending = !isRefunded && !isRefundRejected;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarTourist />

      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNavigation
          current={{
            label: "ยกเลิกการจอง",
            to: window.location.pathname,
          }}
        />

        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <Icon icon="mdi:arrow-left" className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-black">ยกเลิกการจอง</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-12 w-full max-w-3xl mx-auto">
          {/* Step 1: ตรวจสอบคำขอยกเลิก */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 
                    ${isPending ? "bg-light-green text-white border-light-green" : "bg-light-green text-white border-light-green"}`}
            >
              1
            </div>
            <span
              className={`text-sm font-medium px-4 py-1 rounded-full border 
                    ${isPending ? "text-light-green border-light-green" : "text-light-green border-light-green"}`}
            >
              ตรวจสอบคำขอยกเลิก
            </span>
          </div>

          {/* Connector Line 1-2*/}
          <div
            className={`flex-1 h-1.5 rounded-full -mt-8 ${isRefunded || isRefundRejected ? "bg-light-green" : "bg-gray-200"}`}
          ></div>

          {/* Step 2: คืนเงิน */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 
                    ${
                      isRefunded
                        ? "bg-light-green text-white border-light-green"
                        : isRefundRejected
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-white text-gray-400 border-gray-300"
                    }`}
            >
              2
            </div>
            <span
              className={`text-sm font-medium 
                    ${isRefunded ? "text-light-green" : isRefundRejected ? "text-red-500" : "text-gray-400"}`}
            >
              คืนเงิน
            </span>
          </div>
        </div>

        {/* Status Alerts */}
        {isRefunded && (
          <div className="bg-white border-2 border-light-green rounded-xl p-6 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-light-green flex items-center justify-center text-light-green">
              <Icon icon="mdi:check" className="w-8 h-8 font-bold" />
            </div>
            <div>
              <h3 className="font-bold text-lg">การคืนเงินสำเร็จแล้ว</h3>
              <p className="text-gray-600">
                ได้ทำการคืนเงินจำนวน {totalPrice.toLocaleString()} บาท
              </p>
            </div>
          </div>
        )}

        {isRefundRejected && (
          <div className="bg-white border-2 border-red-100 rounded-xl p-6 mb-8 flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center text-red-500 shrink-0">
              <Icon icon="mdi:close" className="w-8 h-8 font-bold" />
            </div>
            <div>
              <h3 className="font-bold text-lg">ปฏิเสธคำขอคืนเงิน</h3>
              <p className="text-gray-600">
                <span className="font-medium text-black">เหตุผลปฏิเสธคำขอคืนเงิน : </span>
                {rejectReason || "-"}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Package Info */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <img src={imageUrl} alt={pkgName} className="w-full h-64 object-cover" />
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold">{pkgName}</h2>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-medium text-black mr-2">ชื่อแพ็กเกจ :</span> {pkgName}
                </p>
                <p>
                  <span className="font-medium text-black mr-2">ที่ตั้ง :</span>{" "}
                  {location
                    ? `${location.subDistrict}, ${location.district}, ${location.province}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Details */}
          <div className="space-y-6">
            {/* Dates Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row justify-between gap-6">
              <div>
                <p className="font-bold text-black mb-1">เริ่มกิจกรรม</p>
                <p className="text-gray-600 text-sm">{formatDateToThai(startDate)}</p>
              </div>
              <div>
                <p className="font-bold text-black mb-1">จบกิจกรรม</p>
                <p className="text-gray-600 text-sm">{formatDateToThai(dueDate)}</p>
                {days > 0 && <span className="text-xs text-gray-400 block mt-1">{days} วัน</span>}
              </div>
            </div>

            {/* Price Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center text-gray-600">
                <span>ราคาแพ็กเกจต่อคน</span>
                <span className="font-medium text-black">
                  {(price || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>จำนวนคน</span>
                <span className="font-medium text-black">{totalParticipant} คน</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>ราคารวม</span>
                <span className="font-medium text-black">
                  {totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>จำนวนเงินคืน</span>
                <span className="font-medium text-black">
                  {totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
              <div className="flex justify-between items-start text-gray-600">
                <span className="shrink-0">ยื่นคำขอเมื่อ</span>
                <span className="font-medium text-black text-right">
                  {formatDateToThai(bookingAt)}
                </span>
              </div>
              <div className="flex justify-between items-start text-gray-600">
                <span className="shrink-0">เหตุผล</span>
                <span className="font-medium text-black text-right">
                  {touristRejectReason || "-"}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 font-medium bg-white"
              >
                ย้อนกลับ
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
