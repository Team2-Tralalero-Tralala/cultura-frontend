/**
 * คำอธิบาย : Component สำหรับแสดงรายการ Feedback ของแพ็กเกจตาม packageId
 * โดยรองรับการดึงข้อมูลจาก backend, การเรียงลำดับตามวันที่ (ใหม่สุด / เก่าสุด)
 * และการตอบกลับ Feedback ผ่าน Modal ยืนยันการส่งข้อความ
 */
import React from "react";
import { useParams } from "react-router-dom";
import FilterDropdown from "@/Components/Filters/Communities/FiltersForCM";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { Modal } from "@/Components/Modal/Modal";
import * as PackageFeedbackService from "@/Libs/FeedbackService";

const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

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

type SortOrder = "newest" | "oldest";

/**
 * คำอธิบาย: แปลงชื่อไฟล์รูปภาพจาก backend ให้เป็น URL ที่พร้อมใช้งาน
 * Input: fileName (ชื่อไฟล์รูปภาพ)
 * Output: URL ของรูปภาพ หรือ undefined หากไม่มีข้อมูล
 */
function getImageUrl(fileName?: string): string | undefined {
  if (!fileName) {
    return undefined;
  }

  const cleanedPath = fileName.replace(/^\/?uploads\//, "");
  return `${apiUrl}/uploads/${cleanedPath}`;
}

/**
 * คำอธิบาย: แปลงค่าเวลาให้เป็นรูปแบบวันเดือนปีพ.ศ.
 * Input: isoDateString (วันที่และเวลาในรูปแบบ ISO)
 * Output: วันที่ในรูปแบบภาษาไทย (เช่น 12 ม.ค. 2567)
 */
const formatDateThai = (isoDateString: string) => {
  const date = new Date(isoDateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * คำอธิบาย: แปลงชื่อ-นามสกุลนักท่องเที่ยวแบบ Mask (แสดงเฉพาะตัวแรก ที่เหลือเป็น *)
 * Input: tourist (ข้อมูลนักท่องเที่ยว)
 * Output: ชื่อ-นามสกุลแบบ Mask
 */
function formatFullName(tourist: Tourist): string {
  const mask = (text: string) => (text ? text[0] + "*".repeat(Math.max(1, text.length - 1)) : "");
  return `${mask(tourist.fname)} ${mask(tourist.lname)}`.trim();
}

/**
 * คำอธิบาย: แปลงคะแนนรีวิวให้เป็นสัญลักษณ์ดาว
 * Input: rating (คะแนน 1-5)
 * Output: สัญลักษณ์ดาว string (เช่น ★★★☆☆)
 */
function renderStars(rating: number): string {
  return Array.from({ length: 5 })
    .map((_, starIndex) => (starIndex < rating ? "★" : "☆"))
    .join("");
}

/**
 * คำอธิบาย: Component หน้าแสดงรายละเอียด Feedback ของแพ็กเกจ
 */
export default function DetailFeedbackPage() {
  const { packageId } = useParams<{ packageId: string }>();

  const [feedbackLists, setFeedbackLists] = React.useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [sortOrder, setSortOrder] = React.useState<SortOrder>("newest");

  const [replyTexts, setReplyTexts] = React.useState<Record<number, string>>({});

  const [isReplyModalOpen, setIsReplyModalOpen] = React.useState<boolean>(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = React.useState<number | null>(null);

  const packageIdNumber = Number(packageId);

  /**
   * คำอธิบาย: ดึงข้อมูล Feedback ตาม packageId
   * Input: packageIdNumber (รหัสแพ็กเกจ)
   * Output: - (อัปเดต state feedbackLists)
   */
  React.useEffect(() => {
    if (!packageIdNumber) {
      return;
    }

    setIsLoading(true);

    PackageFeedbackService.getPackageFeedbacksByPackageId(packageIdNumber).then((response) => {
      const typedResponse = response as { data?: Feedback[] } | Feedback[];
      const feedbackResponseLists = Array.isArray(typedResponse)
        ? typedResponse
        : (typedResponse.data ?? []);

      setFeedbackLists(feedbackResponseLists);
      setIsLoading(false);
    });
  }, [packageIdNumber]);

  /**
   * คำอธิบาย: เรียงลำดับรายการ Feedback ตามตัวเลือก (ใหม่สุด/เก่าสุด)
   */
  const sortedFeedbackLists = React.useMemo(() => {
    return [...feedbackLists]
      .map((feedbackItem) => ({
        feedbackItem,
        createdAtTime: new Date(feedbackItem.createdAt).getTime(),
      }))
      .sort((current, next) => {
        if (sortOrder === "newest") {
          return next.createdAtTime - current.createdAtTime;
        }
        return current.createdAtTime - next.createdAtTime;
      })
      .map((item) => item.feedbackItem);
  }, [feedbackLists, sortOrder]);

  const packageName = feedbackLists[0]?.bookingHistory?.package?.name ?? "ชื่อแพ็กเกจ";

  const filterOptions: { label: string; value: SortOrder }[] = [
    { label: "ใหม่สุด", value: "newest" },
    { label: "เก่าสุด", value: "oldest" },
  ];

  /**
   * คำอธิบาย: อัปเดตข้อความตอบกลับใน state ตาม feedbackId
   * Input: feedbackId (รหัส Feedback), value (ข้อความตอบกลับ)
   * Output: - (อัปเดต state replyTexts)
   */
  function handleChangeReplyText(feedbackId: number, value: string): void {
    setReplyTexts((previousReplyTexts) => ({
      ...previousReplyTexts,
      [feedbackId]: value,
    }));
  }

  /**
   * คำอธิบาย: เปิด Modal ยืนยันการตอบกลับ
   * Input: feedbackId (รหัส Feedback ที่ต้องการตอบกลับ)
   * Output: - (อัปเดต state isReplyModalOpen, selectedFeedbackId)
   */
  function handleOpenReplyModal(feedbackId: number): void {
    const replyMessage = replyTexts[feedbackId]?.trim();

    if (!replyMessage) {
      return;
    }

    setSelectedFeedbackId(feedbackId);
    setIsReplyModalOpen(true);
  }

  /**
   * คำอธิบาย: ปิด Modal การตอบกลับ
   * Input: -
   * Output: - (อัปเดต state isReplyModalOpen, selectedFeedbackId)
   */
  function handleCloseReplyModal(): void {
    setIsReplyModalOpen(false);
    setSelectedFeedbackId(null);
  }

  /**
   * คำอธิบาย: ส่งข้อความตอบกลับไปยัง Backend และอัปเดตข้อมูลในหน้าจอ
   * Input: feedbackId (รหัส Feedback)
   * Output: -
   */
  async function sendReply(feedbackId: number): Promise<void> {
    const replyMessage = replyTexts[feedbackId]?.trim();

    if (!replyMessage) {
      return;
    }

    await PackageFeedbackService.replyPackageFeedbackAdmin(feedbackId, { replyMessage });

    setFeedbackLists((previousFeedbacks) =>
      previousFeedbacks.map((feedbackItem) =>
        feedbackItem.id === feedbackId
          ? {
              ...feedbackItem,
              replyMessage,
            }
          : feedbackItem,
      ),
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

          <div className="[&_svg:first-of-type]:hidden [&_*]:text-base">
            <FilterDropdown
              options={filterOptions}
              selected={sortOrder}
              onChange={(value) => setSortOrder(value as SortOrder)}
            />
          </div>
        </div>

        <div className="w-full rounded-2xl overflow-hidden bg-[#EDEDED]">
          <div className="bg-[#4E8374] px-6 py-3">
            <h2 className="text-white text-lg font-semibold">{packageName}</h2>
          </div>

          <div className="p-6 space-y-6">
            {isLoading && <div className="text-gray-500 text-sm">ไม่มีข้อเสนอแนะในแพ็กเกจนี้</div>}

            {sortedFeedbackLists.map((feedbackItem) => {
              const hasReply =
                !!feedbackItem.replyMessage && feedbackItem.replyMessage.trim() !== "";

              const feedbackTimeLabel = formatDateThai(feedbackItem.createdAt);

              const replyName = feedbackItem.responder
                ? `${feedbackItem.responder.fname} ${feedbackItem.responder.lname}`
                : "ผู้ดูแลแพ็กเกจ";

              const replyAvatarLetter =
                feedbackItem.responder?.fname?.charAt(0).toUpperCase() ||
                replyName.charAt(0).toUpperCase();

              const replyTimeLabel = feedbackItem.replyAt
                ? formatDateThai(feedbackItem.createdAt)
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
                          {feedbackItem.bookingHistory.tourist.fname?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>

                      <span className="font-semibold text-gray-800">
                        {formatFullName(feedbackItem.bookingHistory.tourist)}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-black">{renderStars(feedbackItem.rating)}</div>
                      {feedbackTimeLabel && (
                        <div className="text-xs text-gray-500">{feedbackTimeLabel}</div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-800 text-sm leading-relaxed">{feedbackItem.message}</p>

                  {feedbackItem.feedbackImages?.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {feedbackItem.feedbackImages.map((feedbackImage, imageIndex) => {
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
                      })}
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

                          <span className="font-semibold text-gray-800 text-sm">{replyName}</span>
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
                            handleChangeReplyText(feedbackItem.id, event.target.value)
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
                ไม่มีข้อเสนอแนะในแพ็กเกจนี้
              </div>
            )}
          </div>
        </div>
      </section>

      <Modal
        isOpen={isReplyModalOpen}
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
