import React from "react";
import { useParams } from "react-router-dom";
import { getPackageFeedbacksByPackageId } from "@/Services/package-feedbacks-service";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";

/**
 * ฟังก์ชัน : - (ค่าคงที่ BACKEND_BASE_URL)
 * คำอธิบาย : Base URL สำหรับประกอบลิงก์รูปภาพที่เสิร์ฟจาก Backend
 * Input : -
 * Output: string (URL ฐานของ Backend)
 */
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BACKEND_BASE_URL = apiUrl.replace("/api", "") || "http://localhost:3000";

/**
 * ฟังก์ชัน : getImageUrl
 * คำอธิบาย : แปลงชื่อไฟล์/พาธจาก Backend ให้เป็น URL ที่พร้อมนำไปใช้ใน <img>
 * Input : fileName?: string - ชื่อไฟล์หรือพาธ (อาจขึ้นต้นด้วย uploads/)
 * Output: string | undefined - URL สำหรับรูปภาพ หรือ undefined ถ้าไม่มีชื่อไฟล์
 */
function getImageUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const cleanPath = fileName.replace(/^\/?uploads\//, "");
  return `${BACKEND_BASE_URL}/uploads/${cleanPath}`;
}

// ----------------------------- Types -----------------------------

type FeedbackImage = { image: string };
type Tourist = { fname: string; lname: string };
type PackageInfo = { name: string };
type BookingHistory = { tourist: Tourist; package: PackageInfo };
type Feedback = {
  createdAt: string;
  rating: number;
  message: string;
  feedbackImages: FeedbackImage[];
  bookingHistory: BookingHistory;
};

/**
 * ฟังก์ชัน : formatTimeAgo
 * คำอธิบาย : แปลงวันที่/เวลา createdAt ให้เป็นข้อความบอกเวลาแบบคร่าว ๆ (เช่น 3 นาที, 2 ชั่วโมง, 1 วัน)
 * Input : createdAt: string - วันที่/เวลาที่สร้าง Feedback (รูปแบบที่ new Date() รองรับ)
 * Output: string - ข้อความบอกระยะเวลาที่ผ่านไปเป็นภาษาไทย
 */
function formatTimeAgo(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diff = now.getTime() - created.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาที`;
  if (hours < 24) return `${hours} ชั่วโมง`;
  if (days < 30) return `${days} วัน`;
  if (months < 12) return `${months} เดือน`;
  return `${years} ปี`;
}

/**
 * ฟังก์ชัน : formatFullName
 * คำอธิบาย : แปลงชื่อ-นามสกุลนักท่องเที่ยวให้เป็นรูปแบบที่ถูก mask (แสดงเฉพาะตัวแรก ที่เหลือเป็น *)
 * Input : tourist: Tourist - ข้อมูลนักท่องเที่ยว (fname, lname)
 * Output: string - ชื่อ-นามสกุลหลัง mask แล้ว (เช่น "ส** น***")
 */
function formatFullName(tourist: Tourist): string {
  const mask = (text: string) =>
    text ? text[0] + "*".repeat(Math.max(1, text.length - 1)) : "";
  return `${mask(tourist.fname)} ${mask(tourist.lname)}`.trim();
}

/**
 * ฟังก์ชัน : renderStars
 * คำอธิบาย : แปลงคะแนน rating (1-5) ให้เป็นสตริงรูปดาว ★/☆ รวม 5 ดวง
 * Input : rating: number - คะแนนรีวิว
 * Output: string - ข้อความดาว 5 ตัว (เช่น "★★★☆☆")
 */
function renderStars(rating: number): string {
  return Array.from({ length: 5 })
    .map((_, index) => (index < rating ? "★" : "☆"))
    .join("");
}

/**
 * ฟังก์ชัน : PackageFeedbacksPage
 * คำอธิบาย : หน้าแสดงรายการ Feedback ของแพ็กเกจ (สำหรับแอดมิน)
 *   - ดึงข้อมูล Feedback จาก API ตาม packageId ใน URL
 *   - แสดงจำนวน Feedback ทั้งหมด
 *   - ให้เลือกเรียงลำดับตาม "ล่าสุด" หรือ "เก่าสุด" ผ่าน FilterDropdown
 *   - แสดงรายละเอียดผู้รีวิว ข้อความ คะแนนดาว และรูปภาพแนบ (ถ้ามี)
 * Input : - (รับค่า packageId ผ่าน useParams ภายใน)
 * Output: JSX.Element - ส่วน UI ของหน้าจอแสดง Feedback
 */
export default function PackageFeedbacksPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // state สำหรับเก็บลำดับการเรียง: ล่าสุด / เก่าสุด
  const [sortOrder, setSortOrder] = React.useState<"latest" | "oldest">("latest");

  const packageIdNumber = Number(packageId);

  /**
   * ฟังก์ชัน : useEffect(loadFeedbacks)
   * คำอธิบาย : โหลดรายการ Feedback เมื่อได้ packageIdNumber ที่ถูกต้อง
   * Input : - (อิงค่า packageIdNumber)
   * Output: - (อัปเดต state feedbacks, isLoading)
   */
  React.useEffect(() => {
    if (!packageIdNumber) return;
    setIsLoading(true);
    getPackageFeedbacksByPackageId(packageIdNumber).then((response) => {
      const list = (response as any)?.data ?? response ?? [];
      setFeedbacks(list);
      setIsLoading(false);
    });
  }, [packageIdNumber]);

  /**
   * ฟังก์ชัน : sortedFeedbacks (useMemo)
   * คำอธิบาย : คืนลิสต์ Feedback ที่ถูกเรียงตาม sortOrder (ล่าสุด/เก่าสุด)
   * Input : - (อิง state feedbacks, sortOrder)
   * Output: Feedback[] - ลิสต์ที่ถูกเรียงใหม่แล้ว
   */
  const sortedFeedbacks = React.useMemo(() => {
    const list = [...feedbacks];
    if (sortOrder === "latest") {
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [feedbacks, sortOrder]);

  /**
   * ฟังก์ชัน : packageName
   * คำอธิบาย : ชื่อแพ็กเกจจาก Feedback แรก หากไม่มีข้อมูลจะใช้คำว่า "ชื่อแพ็กเกจ" แทน
   * Input : -
   * Output: string
   */
  const packageName = feedbacks[0]?.bookingHistory?.package?.name ?? "ชื่อแพ็กเกจ";

  /**
   * ฟังก์ชัน : filterOptions
   * คำอธิบาย : ตัวเลือกสำหรับ dropdown การเรียงลำดับ Feedback
   * Input : -
   * Output: { label: string; value: string }[]
   */
  const filterOptions = [
    { label: "ล่าสุด", value: "latest" },
    { label: "เก่าสุด", value: "oldest" },
  ];

  return (
    <section className="relative bg-white rounded-2xl shadow-sm border border-gray-200 w-full min-h-[500px] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">
          ทั้งหมด : {feedbacks.length} รายการ
        </p>

        {/* ตัวกรองการเรียงลำดับ (ล่าสุด / เก่าสุด) */}
        <FilterDropdown
          options={filterOptions}
          selected={sortOrder}
          onChange={(value) => setSortOrder(value as "latest" | "oldest")}
        />
      </div>

      <div className="w-full rounded-2xl overflow-hidden bg-[#EDEDED]">
        <div className="bg-[#4E8374] px-6 py-3">
          <h2 className="text-white text-lg font-semibold">{packageName}</h2>
        </div>

        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="text-gray-500 text-sm">กำลังโหลด...</div>
          )}

          {sortedFeedbacks.map((feedback, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-semibold">
                      {feedback.bookingHistory.tourist.fname?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  {/* ชื่อ-นามสกุล*/}
                  <span className="font-semibold text-gray-800">
                    {formatFullName(feedback.bookingHistory.tourist)}
                  </span>
                </div>
                <div className="text-right">

                  {/* คะแนนรีวิวเป็นดาว */}
                  <div className="text-sm text-black">
                    {renderStars(feedback.rating)}
                  </div>

                  {/* เวลารีวิว */}
                  <div className="text-xs text-gray-500">
                    {formatTimeAgo(feedback.createdAt)}
                  </div>
                </div>
              </div>

              {/* ข้อความรีวิว */}
              <p className="text-gray-800 text-sm leading-relaxed">
                {feedback.message}
              </p>

              {/* รูปภาพ */} 
              {feedback.feedbackImages?.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {feedback.feedbackImages.map((image, i) => {
                    const imageUrl = getImageUrl(image.image);
                    if (!imageUrl) return null;
                    return (
                      <div
                        key={i}
                        className="w-32 h-24 bg-gray-100 rounded-md overflow-hidden"
                      >
                        <img
                          src={imageUrl}
                          alt={`feedback-${index}-${i}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>

              )}
              {/* ช่องตอบกลับ */}
              <div className="pt-2">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 text-sm">
                  <input
                    type="text"
                    placeholder="ตอบกลับ"
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    className="ml-3 w-8 h-8 bg-[#4E8374] rounded-full flex items-center justify-center hover:bg-[#3b6d60] transition"
                  >
                    {/* ไอคอนเครื่องบินกระดาษ */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="white"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 10l18-7-7 18-2-8-8-3z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && feedbacks.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">
              ยังไม่มีข้อเสนอแนะสำหรับแพ็กเกจนี้
            </div>
          )}
        </div>
      </div>
    </section>
  );
}