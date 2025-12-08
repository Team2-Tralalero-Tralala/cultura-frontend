import React from "react";
import { useParams } from "react-router-dom";

import {
  getPackageFeedbacksByPackageIdMember,
  replyPackageFeedback,
} from "@/Services/package-feedbacks-service";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { Modal } from "@/Components/Modal/Modal";

/*
 * ค่าคงที่   : BACKEND_BASE_URL
 * คำอธิบาย : Base URL สำหรับประกอบลิงก์รูปภาพที่เสิร์ฟจาก Backend
 * Input    : -
 * Output   : string - URL พื้นฐานของ backend
 */
const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

type FeedbackImage = {
  image: string;
};

type Tourist = {
  fname: string;
  lname: string;
};

type PackageInfo = {
  name: string;
};

type BookingHistory = {
  tourist: Tourist;
  package: PackageInfo;
};

type Responder = {
  fname: string;
  lname: string;
};

type Feedback = {
  id: number;
  createdAt: string;
  rating: number;
  message: string;
  feedbackImages: FeedbackImage[];
  bookingHistory: BookingHistory;
  replyMessage?: string | null;
  replyAt?: string | null;
  responder?: Responder | null;
};

/*
 * ฟังก์ชัน : getImageUrl
 * คำอธิบาย : แปลงชื่อไฟล์รูปภาพจาก backend ให้เป็น URL ที่พร้อมใช้งานใน <img>
 * Input    : fileName (string | undefined) - ชื่อไฟล์รูปภาพจากฐานข้อมูล
 * Output   : string | undefined - URL ของรูปภาพ หรือ undefined หากไม่มีข้อมูล
 */
function getImageUrl(fileName?: string): string | undefined {
  if (!fileName) {
    return undefined;
  }

  const cleanedPath = fileName.replace(/^\/?uploads\//, "");
  return `${BACKEND_BASE_URL}/uploads/${cleanedPath}`;
}

/*
 * ฟังก์ชัน : formatTimeAgo
 * คำอธิบาย : แปลงค่าเวลาให้เป็นข้อความระบุเวลาที่ผ่านไป เช่น "2 ชั่วโมงที่แล้ว"
 * Input    : createdAt (string) - วันที่และเวลาที่สร้างข้อมูลจากฐานข้อมูล
 * Output   : string - ข้อความเวลาที่ผ่านไปในรูปแบบภาษาไทย
 */
function formatTimeAgo(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) {
    return "";
  }

  const diff = now.getTime() - created.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days < 30) return `${days} วันที่แล้ว`;
  if (months < 12) return `${months} เดือนที่แล้ว`;
  return `${years} ปีที่แล้ว`;
}

/*
 * ฟังก์ชัน : formatMaskedFullName
 * คำอธิบาย : แปลงชื่อจริงให้เป็นรูปแบบปกปิดบางส่วน (เฉพาะตัวแรกที่แสดง ช่วงที่เหลือเป็น *)
 * Input    : tourist (Tourist) - ข้อมูลนักท่องเที่ยว
 * Output   : string - ชื่อที่ถูก mask แล้ว
 */
function formatMaskedFullName(tourist: Tourist): string {
  const getMaskedText = (text: string): string => {
    if (!text) {
      return "";
    }

    const firstCharacter = text[0];
    const maskedCharacters = "*".repeat(Math.max(1, text.length - 1));
    return firstCharacter + maskedCharacters;
  };

  const maskedFirstName = getMaskedText(tourist.fname);
  const maskedLastName = getMaskedText(tourist.lname);

  return `${maskedFirstName} ${maskedLastName}`.trim();
}

/*
 * ฟังก์ชัน : renderStars
 * คำอธิบาย : แปลงคะแนนรีวิวให้เป็นสัญลักษณ์ดาว ★/☆
 * Input    : rating (number) - คะแนนระหว่าง 1–5
 * Output   : string - สัญลักษณ์ดาวจำนวน 5 ตัว
 */
function renderStars(rating: number): string {
  return Array.from({ length: 5 })
    .map((_, starIndex) => (starIndex < rating ? "★" : "☆"))
    .join("");
}

/*
 * ฟังก์ชัน : PackageFeedbacksPage
 * คำอธิบาย   : แสดงรายการ Feedback ของแพ็กเกจ พร้อมความสามารถในการตอบกลับแต่ละรายการ
 * Input      : ไม่มี (ใช้ useParams ดึง packageId จาก URL)
 * Output     : JSX ของหน้าแสดงผล Feedback
 */
export default function PackageFeedbacksPage() {
  const { packageId } = useParams<{ packageId: string }>();

  const [feedbackLists, setFeedbackLists] = React.useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [sortOrder, setSortOrder] =
    React.useState<"latest" | "oldest">("latest");

  const [replyTexts, setReplyTexts] = React.useState<Record<number, string>>(
    {}
  );

  const [isReplyModalOpen, setIsReplyModalOpen] =
    React.useState<boolean>(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = React.useState<
    number | null
  >(null);

  const packageIdNumber = Number(packageId);

  React.useEffect(() => {
    if (!packageIdNumber) {
      return;
    }

    setIsLoading(true);

    getPackageFeedbacksByPackageIdMember(packageIdNumber).then(
      (response) => {
        const typedResponse = response as { data?: Feedback[] } | Feedback[];
        const feedbackResponseLists = Array.isArray(typedResponse)
          ? typedResponse
          : typedResponse.data ?? [];

        setFeedbackLists(feedbackResponseLists);
        setIsLoading(false);
      }
    );
  }, [packageIdNumber]);

  const sortedFeedbackLists = React.useMemo(() => {
    const clonedFeedbackLists = [...feedbackLists];

    if (sortOrder === "latest") {
      return clonedFeedbackLists.sort(
        (feedbackA, feedbackB) =>
          new Date(feedbackB.createdAt).getTime() -
          new Date(feedbackA.createdAt).getTime()
      );
    }

    return clonedFeedbackLists.sort(
      (feedbackA, feedbackB) =>
        new Date(feedbackA.createdAt).getTime() -
        new Date(feedbackB.createdAt).getTime()
    );
  }, [feedbackLists, sortOrder]);

  const packageName =
    feedbackLists[0]?.bookingHistory?.package?.name ?? "ชื่อแพ็กเกจ";

  const filterOptions = [
    { label: "ล่าสุด", value: "latest" },
    { label: "เก่าสุด", value: "oldest" },
  ];

  /*
   * ฟังก์ชัน : handleChangeReplyText
   * คำอธิบาย : อัปเดตข้อความตอบกลับใน state ตาม feedbackId ที่กำหนด
   * Input    : feedbackId (number) - รหัสของ feedback
   *            value (string) - ข้อความที่ผู้ใช้พิมพ์
   * Output   : void
   */
  function handleChangeReplyText(feedbackId: number, value: string): void {
    setReplyTexts((previousReplyTexts) => ({
      ...previousReplyTexts,
      [feedbackId]: value,
    }));
  }

  /*
   * ฟังก์ชัน : handleOpenReplyModal
   * คำอธิบาย : เปิด Modal เพื่อยืนยันการส่งข้อความตอบกลับ
   * Input    : feedbackId (number) - รหัสของ feedback ที่ต้องการตอบ
   * Output   : void
   */
  function handleOpenReplyModal(feedbackId: number): void {
    const replyMessage = replyTexts[feedbackId]?.trim();

    if (!replyMessage) {
      return;
    }

    setSelectedFeedbackId(feedbackId);
    setIsReplyModalOpen(true);
  }

  /*
   * ฟังก์ชัน : handleCloseReplyModal
   * คำอธิบาย : ปิด Modal การตอบกลับและรีเซ็ตค่า feedback ที่ถูกเลือก
   * Input    : -
   * Output   : void
   */
  function handleCloseReplyModal(): void {
    setIsReplyModalOpen(false);
    setSelectedFeedbackId(null);
  }

  /*
   * ฟังก์ชัน : sendReply
   * คำอธิบาย : ส่งข้อความตอบกลับไปยัง backend และอัปเดตรายการ feedback ใน state
   * Input    : feedbackId (number) - รหัส feedback ที่ต้องการตอบกลับ
   * Output   : Promise<void>
   */
  async function sendReply(feedbackId: number): Promise<void> {
    const replyMessage = replyTexts[feedbackId]?.trim();

    if (!replyMessage) {
      return;
    }

    await replyPackageFeedback(feedbackId, { replyMessage });

    setFeedbackLists((previousFeedbacks) =>
      previousFeedbacks.map((feedbackItem) =>
        feedbackItem.id === feedbackId
          ? {
              ...feedbackItem,
              replyMessage,
            }
          : feedbackItem
      )
    );

    setReplyTexts((previousReplyTexts) => ({
      ...previousReplyTexts,
      [feedbackId]: "",
    }));
  }

  return (
    <div>
      <Breadcrumb
        current={{
          label: packageName,
          to: `package/feedback/${packageId}`,
        }}
      />

      <section className="relative bg-white rounded-2xl shadow-sm border border-gray-200 w-full min-h-[500px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">
            ทั้งหมด : {feedbackLists.length} รายการ
          </p>

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

            {sortedFeedbackLists.map((feedbackItem) => {
              const hasReply =
                !!feedbackItem.replyMessage &&
                feedbackItem.replyMessage.trim() !== "";

              const feedbackTimeLabel = formatTimeAgo(feedbackItem.createdAt);

              const replyName = feedbackItem.responder
                ? `${feedbackItem.responder.fname} ${feedbackItem.responder.lname}`
                : "ผู้ดูแลแพ็กเกจ";

              const replyAvatarLetter =
                feedbackItem.responder?.fname?.charAt(0).toUpperCase() ||
                replyName.charAt(0).toUpperCase();

              const replyTimeLabel = feedbackItem.replyAt
                ? formatTimeAgo(feedbackItem.replyAt)
                : "";

              return (
                <div
                  key={feedbackItem.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 space-y-4"
                >

                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-semibold">
                          {feedbackItem.bookingHistory.tourist.fname
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </span>
                      </div>

                      <span className="font-semibold text-gray-800">
                        {formatMaskedFullName(
                          feedbackItem.bookingHistory.tourist
                        )}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-black">
                        {renderStars(feedbackItem.rating)}
                      </div>
                      {feedbackTimeLabel && (
                        <div className="text-xs text-gray-500">
                          {feedbackTimeLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-800 text-sm leading-relaxed">
                    {feedbackItem.message}
                  </p>

                  {feedbackItem.feedbackImages?.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {feedbackItem.feedbackImages.map(
                        (feedbackImage, imageIndex) => {
                          const imageUrl = getImageUrl(feedbackImage.image);

                          if (!imageUrl) {
                            return null;
                          }

                          return (
                            <div
                              key={imageIndex}
                              className="w-32 h-24 bg-gray-100 rounded-md overflow-hidden"
                            >
                              <img
                                src={imageUrl}
                                alt={`feedback-${feedbackItem.id}-${imageIndex}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}

                  {hasReply && (
                    <div className="mt-4 bg-[#EDEDED] rounded-2xl px-4 py-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-sm font-semibold">
                              {replyAvatarLetter}
                            </span>
                          </div>

                          <span className="font-semibold text-gray-800 text-sm">
                            {replyName}
                          </span>
                        </div>

                        {replyTimeLabel && (
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {replyTimeLabel}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-gray-800 leading-relaxed">
                        {feedbackItem.replyMessage}
                      </p>
                    </div>
                  )}

                  {!hasReply && (
                    <div className="pt-2">
                      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 text-sm">
                        <input
                          type="text"
                          placeholder="ตอบกลับ"
                          className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                          value={replyTexts[feedbackItem.id] ?? ""}
                          onChange={(event) =>
                            handleChangeReplyText(
                              feedbackItem.id,
                              event.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          className="ml-3 w-8 h-8 bg-[#4E8374] rounded-full flex items-center justify-center hover:bg-[#3b6d60] transition disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => handleOpenReplyModal(feedbackItem.id)}
                          disabled={!replyTexts[feedbackItem.id]?.trim()}
                          aria-label="ยืนยันการตอบกลับรีวิว"
                        >
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
                  )}
                </div>
              );
            })}

            {!isLoading && feedbackLists.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                ยังไม่มีข้อเสนอแนะสำหรับแพ็กเกจนี้
              </div>
            )}
          </div>
        </div>
      </section>

      <Modal
        open={isReplyModalOpen}
        title="ยืนยันการตอบกลับรีวิวหรือไม่"
        text="คุณจะไม่สามารถย้อนกลับได้"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          if (selectedFeedbackId !== null) {
            void sendReply(selectedFeedbackId);
          }

          setIsReplyModalOpen(false);
          setSelectedFeedbackId(null);
        }}
        onCancel={handleCloseReplyModal}
      />
    </div>
  );
}
