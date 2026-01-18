/*
 * คำอธิบาย : Page Component สำหรับหน้าสรุปการจอง (ขั้นตอนที่ 1)
 * แสดงข้อมูลแพ็กเกจ วันที่เริ่ม-จบกิจกรรม ราคา จำนวนคน และราคารวม
 * มีปุ่ม "ยกเลิก" และ "ถัดไป" เพื่อไปยังหน้าชำระเงิน
 */

import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import Button from "@/Components/Button";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/NavbarTourist";
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
 * คำอธิบาย : Component สำหรับหน้าสรุปการจอง
 * Input : ไม่มี
 * Output : React Component ที่แสดงหน้าสรุปการจอง
 */
export default function BookingSummaryPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(location.state?.numberOfPeople || 2);

  /*
   * คำอธิบาย : ดึงข้อมูลแพ็กเกจจาก API
   * Input : ไม่มี
   * Output : อัพเดท state ของ packageData
   */
  useEffect(() => {
    const fetchPackageData = async () => {
      if (!packageId) {
        setErrorMessage("ไม่พบรหัสแพ็กเกจ");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const response = await axios.get(`${apiUrl}/tourist/package/${packageId}`);
        setPackageData(response.data.data);
      } catch (error) {
        console.error("Error fetching package data:", error);
        setErrorMessage("ไม่สามารถโหลดข้อมูลแพ็กเกจได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageData();
  }, [packageId]);

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

  /*
   * คำอธิบาย : สร้าง URL รูปภาพ
   * Input : filePath (string | undefined)
   * Output : string - URL รูปภาพ
   */
  const generateImageUrl = (filePath: string | undefined): string => {
    if (!filePath) return "https://placehold.co/800x450?text=No+Image";
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const backendBaseUrl = apiUrl.replace("/api", "") || "http://localhost:3000";
    const imagePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return `${backendBaseUrl}/${imagePath}`;
  };

  /*
   * คำอธิบาย : จัดการเมื่อคลิกปุ่มถัดไป
   * Input : ไม่มี
   * Output : นำทางไปยังหน้าชำระเงิน พร้อมส่งข้อมูลแพ็กเกจและจำนวนคน
   */
  const handleNext = () => {
    if (packageId && packageData) {
      navigate(`/tourist/booking/package/${packageId}/payment`, {
        state: {
          numberOfPeople,
          packageData: {
            id: packageData.id,
            name: packageData.name,
            price: packageData.price,
            startDate: packageData.startDate,
            dueDate: packageData.dueDate,
            location: packageData.location,
            packageFiles: packageData.packageFiles,
          },
        },
      });
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
   * คำอธิบาย : เพิ่มจำนวนคน
   * Input : ไม่มี
   * Output : อัพเดท numberOfPeople
   */
  const handleIncreasePeople = () => {
    setNumberOfPeople((prev) => prev + 1);
  };

  /*
   * คำอธิบาย : ลดจำนวนคน
   * Input : ไม่มี
   * Output : อัพเดท numberOfPeople
   */
  const handleDecreasePeople = () => {
    setNumberOfPeople((prev) => Math.max(1, prev - 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-light-green font-medium">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (errorMessage || !packageData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-xl font-bold text-black mb-2">ไม่พบข้อมูลแพ็กเกจ</h2>
        <p className="text-black mb-4">{errorMessage}</p>
        <button onClick={() => navigate("/")} className="text-light-green hover:underline">
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  const coverImage =
    packageData.packageFiles.find((file) => file.type === "COVER") || packageData.packageFiles[0];
  const imageUrl = generateImageUrl(coverImage?.filePath);
  const totalPrice = (packageData.price || 0) * numberOfPeople;
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
            <div className="w-14 h-14 rounded-full bg-light-green border-2 border-light-green text-white flex items-center justify-center font-bold text-lg">
              1
            </div>
            <span className="text-base font-medium text-light-green border-2 border-light-green rounded-full px-6 py-0.5">
              ข้อมูล
            </span>
          </div>
          <div className="flex-1 h-2 bg-light-green rounded-full max-w-[120px] mt-6 "></div>
          <div className="flex flex-col items-center gap-3 ">
            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg border-2 border-light-green">
              2
            </div>
            <span className="text-base font-medium text-gray-600">จ่ายเงิน</span>
          </div>
          <div className="flex-1 h-2 bg-gray-300 rounded-full max-w-[120px] mt-6"></div>
          <div className="flex flex-col items-center gap-3 ">
            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg border-2 border-light-green">
              3
            </div>
            <span className="text-base font-medium text-gray-600">ยืนยันการจอง</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Package Image */}
          <div className="bg-white rounded-lg border-2 border-gray-200">
            <img
              src={imageUrl}
              alt={packageData.name}
              className="w-full h-auto rounded-t-lg object-cover"
            />
            <div className="space-y-2 rounded-b-lg  p-4">
              <p className="text-gray-600">
                <span className="font-medium">ชื่อแพ็กเกจ :</span> {packageData.name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">ที่ตั้ง :</span>{" "}
                {`${packageData.location.subDistrict}, ${packageData.location.district}, ${packageData.location.province}`}
              </p>
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
                    <p className="text-lg text-black">{numberOfPeople}</p>
                    <p className="text-lg text-black">คน</p>
                  </div>
                </div>
              </div>

              <div className="bg-light-green text-white p-4 rounded-b-lg flex justify-between items-center">
                <span className="font-bold">ราคารวม</span>
                <span className="font-bold text-lg">
                  {totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
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
              className="px-6 py-3 border-2 border-black rounded-lg text-black font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <Button type="confirm-tourist" className="px-6 py-3 rounded-lg cursor-pointer" onClick={handleNext}>
              ถัดไป
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
