/*
 * คำอธิบาย : Page Component สำหรับหน้าชำระเงิน (ขั้นตอนที่ 2)
 * แสดงวิธีการชำระเงิน ข้อมูลการจอง และปุ่มอัปโหลดหลักฐานการชำระเงิน
 * มีปุ่ม "ยกเลิก" และ "ยืนยันการจอง" เพื่อไปยังหน้ายืนยันการจอง
 */

import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import Button from "@/Components/Button";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/Navbar/NavbarTourist";
import { createBooking, uploadPaymentProof } from "@/Libs/BookingService";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/*
 * Interface สำหรับข้อมูลแพ็กเกจ
 */
interface PackageData {
  id: number;
  name: string;
  price: number | null;
  startDate: string | null;
  dueDate: string | null;
}

/*
 * Interface สำหรับข้อมูลการจอง
 */
interface BookingInfo {
  bookingId: number | null;
  numberOfPeople: number;
  totalPrice: number;
}

/*
 * คำอธิบาย : Component สำหรับหน้าชำระเงิน
 * Input : ไม่มี
 * Output : React Component ที่แสดงหน้าชำระเงิน
 */
export default function BookingPaymentPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [packageData, setPackageData] = useState<PackageData | null>(
    location.state?.packageData || null,
  );
  const [bookingInfo, setBookingInfo] = useState<BookingInfo>({
    bookingId: null,
    numberOfPeople: location.state?.numberOfPeople || 2,
    totalPrice: 0,
  });
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /*
   * คำอธิบาย : ดึงข้อมูลแพ็กเกจหรือใช้ข้อมูลจาก state
   * Input : ไม่มี
   * Output : อัพเดท state ของ packageData
   */
  useEffect(() => {
    const initializeData = async () => {
      if (!packageId) {
        setErrorMessage("ไม่พบรหัสแพ็กเกจ");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        // ถ้ามีข้อมูลจาก state ให้ใช้เลย ไม่ต้อง fetch
        if (location.state?.packageData) {
          const packageData = location.state.packageData;
          setPackageData(packageData);
          const numberOfPeople = location.state.numberOfPeople || 2;
          const totalPrice = (packageData.price || 0) * numberOfPeople;
          setBookingInfo({
            bookingId: null,
            numberOfPeople,
            totalPrice,
          });
          setIsLoading(false);
          return;
        }

        // ถ้าไม่มีข้อมูลจาก state ให้ fetch ใหม่
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const packageResponse = await axios.get(`${apiUrl}/tourist/package/${packageId}`);
        const packageData = packageResponse.data.data;
        setPackageData(packageData);

        // คำนวณราคารวม
        const numberOfPeople = location.state?.numberOfPeople || 2;
        const totalPrice = (packageData.price || 0) * numberOfPeople;
        setBookingInfo({
          bookingId: null,
          numberOfPeople,
          totalPrice,
        });
      } catch (error) {
        console.error("Error fetching package data:", error);
        setErrorMessage("ไม่สามารถโหลดข้อมูลแพ็กเกจได้");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [packageId, location.state]);

  /*
   * คำอธิบาย : จัดการเมื่อเลือกไฟล์หลักฐานการชำระเงิน
   * Input : changeEvent (React.ChangeEvent<HTMLInputElement>)
   * Output : อัพเดท state ของ paymentProof
   */
  const handleFileChange = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const file = changeEvent.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("ขนาดไฟล์เกิน 5MB กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 5MB");
        changeEvent.target.value = "";
        setPaymentProof(null);
        return;
      }
      setErrorMessage(null);
      setPaymentProof(file);
    }
  };

  /*
   * คำอธิบาย : จัดการเมื่อคลิกปุ่มยืนยันการจอง
   * Input : ไม่มี
   * Output : อัปโหลดหลักฐานการชำระเงิน สร้างการจอง แล้วนำทางไปยังหน้ายืนยัน
   */
  const handleConfirm = async () => {
    if (!packageId) {
      setErrorMessage("ไม่พบรหัสแพ็กเกจ");
      return;
    }

    if (!paymentProof) {
      setErrorMessage("กรุณาแนบหลักฐานการชำระเงิน");
      return;
    }

    if (!packageData) {
      setErrorMessage("ไม่พบข้อมูลแพ็กเกจ");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // อัปโหลดหลักฐานการชำระเงินก่อน
      const transferSlipPath = await uploadPaymentProof(paymentProof);

      // สร้างการจอง (ใช้ packageId เป็น bookingId reference หรือ generate ID)
      // ตาม API doc, bookingId ใน path เป็น reference ID
      const bookingIdReference = Date.now(); // ใช้ timestamp เป็น reference ID
      const bookingResponse = await createBooking(bookingIdReference, {
        packageId: parseInt(packageId),
        totalParticipant: bookingInfo.numberOfPeople,
        transferSlip: transferSlipPath,
      });

      // นำทางไปยังหน้ายืนยัน พร้อมส่งข้อมูลการจอง
      navigate(`/tourist/booking/package/${packageId}/confirmed`, {
        state: {
          bookingId: bookingResponse.data.id,
          packageData: packageData,
          numberOfPeople: bookingInfo.numberOfPeople,
          totalPrice: bookingInfo.totalPrice,
        },
      });
    } catch (error: any) {
      console.error("Error confirming booking:", error);
      const errorMessage =
        error.response?.data?.message || "ไม่สามารถยืนยันการจองได้ กรุณาลองใหม่อีกครั้ง";
      setErrorMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * คำอธิบาย : จัดการเมื่อคลิกปุ่มยกเลิก
   * Input : ไม่มี
   * Output : นำทางกลับไปยังหน้ารายละเอียดแพ็กเกจ
   */
  const handleCancel = () => {
    if (packageId) {
      navigate(`/tourist/package/${packageId}`);
    }
  };

  /*
   * คำอธิบาย : แปลงวันที่เป็นรูปแบบภาษาไทย
   * Input : dateString (string | null) - วันที่ในรูปแบบ ISO
   * Output : string - วันที่ในรูปแบบภาษาไทย
   */
  const formatDateToThai = (dateString: string | null): string => {
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
   * คำอธิบาย : คำนวณจำนวนวันระหว่างวันที่เริ่มและสิ้นสุด
   * Input : startDate (string | null), endDate (string | null)
   * Output : number - จำนวนวัน
   */
  const calculateDays = (startDate: string | null, endDate: string | null): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-green-600 font-medium">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (errorMessage && !packageData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-xl font-bold text-black mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-black mb-4">{errorMessage}</p>
        <button onClick={() => navigate("/")} className="text-green-600 hover:underline">
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  if (!packageData) return null;

  const days = calculateDays(packageData.startDate, packageData.dueDate);

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
            <div className="w-14 h-14 rounded-full bg-green-600 border-2 border-green-600 text-white flex items-center justify-center font-bold text-lg">
              2
            </div>
            <span className="text-base font-medium text-green-600 border-2 border-green-600 rounded-full px-6 py-0.5">
              จ่ายเงิน
            </span>
          </div>
          <div className="flex-1 h-2 bg-gray-300 rounded-full max-w-[120px] mt-6"></div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg border-2 border-green-600">
              3
            </div>
            <span className="text-base font-medium text-gray-600">ยืนยันการจอง</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Information */}
          <div className="flex flex-col rounded-lg border-2 bg-gray-300">
            <div className="bg-white rounded-t-lg p-6">
              <p className="text-sm text-gray-700 mb-4 text-center">
                วิธีการชำระเงินค่าแพ็กเกจ สามารถชำระเงินโดยการโอนผ่าน
                <br />
                ธนาคารกสิกรไทย สาขาพังงา ชื่อบัญชี นางสาวสิริกร นโพธิ์อรุณ
                <br />
                บัญชีเลขที่ 123-456-7890
              </p>
            </div>
            <div className="bg-gray-300 rounded-b-lg p-6 flex flex-col items-center justify-center">
              <div>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="payment-proof"
                  />
                  <button
                    onClick={() => document.getElementById("payment-proof")?.click()}
                    className="flex items-center justify-center gap-2 px-6 py-2 border-2 bg-white border-gray-400 rounded-lg text-black font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Icon icon="mdi:download" className="w-8 h-8" />
                    แนบหลักฐานการชำระเงิน
                  </button>
                </label>

                {paymentProof ? (
                  <p className="mt-1 text-sm text-green-600">✓ ไฟล์ที่เลือก: {paymentProof.name}</p>
                ) : (
                  <p className="mt-1 text-sm text-black">*กรุณาแนบไฟล์</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between align-top bg-white rounded-lg border-2 border-gray-200 p-4 pb-8">
              <div>
                <p className="text-base font-medium text-black">เริ่มกิจกรรม</p>
                <p className="text-sm text-gray-600">{formatDateToThai(packageData.startDate)}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-black">จบกิจกรรม</p>
                  <p className="text-sm text-gray-600">{formatDateToThai(packageData.dueDate)}</p>
                </div>
              </div>

              {days > 0 && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{days} วัน</p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg border-2 border-gray-200  flex-1 flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex flex-row justify-between items-center">
                  <p className="text-lg text-black">ราคาแพ็กเกจต่อคน</p>
                  <div className="flex items-center gap-4">
                    <p className="text-lg text-black">
                      {packageData.price?.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-lg text-black">บาท</p>
                  </div>
                </div>

                <div className="flex flex-row justify-between items-center">
                  <p className="text-lg text-black">จำนวนคน</p>
                  <div className="flex items-center gap-4">
                    <p className="text-lg text-black">{bookingInfo.numberOfPeople}</p>
                    <p className="text-lg text-black">คน</p>
                  </div>
                </div>
              </div>

              <div className="bg-light-green text-white p-4 rounded-b-lg flex justify-between items-center">
                <span className="font-bold">ราคารวม</span>
                <span className="font-bold text-lg">
                  {bookingInfo.totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons Section */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end mt-8">
          <div className="flex gap-4 sm:flex-none min-w-[200px] sm:min-w-0">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border-2 border-black rounded-lg text-black font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <Button
              type="confirm-tourist"
              className="px-6 py-3 rounded-lg cursor-pointer"
              onClick={handleConfirm}
            >
              {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการจอง"}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
