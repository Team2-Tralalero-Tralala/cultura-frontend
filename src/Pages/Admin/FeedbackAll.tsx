/**
 * Responsibility:
 *  - แสดง “ข้อเสนอแนะทั้งหมด” ของแพ็กเกจภายในชุมชน (group เป็นรายแพ็กเกจ)
 */

import React from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const apiBaseUrl = import.meta.env.VITE_API_URL;

/**
 * คำอธิบาย: ประเภทข้อมูลรูปภาพประกอบข้อเสนอแนะจาก API
 */
type ApiFeedbackImage = { id: number; feedbackId: number; image: string };

/**
 * คำอธิบาย: ประเภทข้อมูลข้อเสนอแนะจาก API
 */
type ApiFeedback = {
  id: number;
  bookingHistoryId: number;
  createdAt: string;
  message: string;
  rating: number;
  responderId: number | null;
  replyAt: string | null;
  replyMessage: string | null;
  feedbackImages: ApiFeedbackImage[];
};

/**
 * คำอธิบาย: ประเภทข้อมูลประวัติการจองจาก API
 */
type ApiBookingHistory = {
  id: number;
  touristId: number;
  packageId: number;
  status: string;
  totalParticipant: number;
  feedbacks: ApiFeedback[];
};

/**
 * คำอธิบาย: ประเภทข้อมูลแพ็กเกจจาก API
 */
type ApiPackage = {
  id: number;
  name: string;
  bookingHistories: ApiBookingHistory[];
};

/**
 * คำอธิบาย: ประเภทข้อมูลชุมชนจาก API
 */
type ApiCommunity = {
  id: number;
  name: string;
  packages: ApiPackage[];
};

/**
 * คำอธิบาย: รูปแบบการตอบกลับมาตรฐานจาก API
 */
type ApiResponse = {
  status: number;
  error: boolean;
  message: string;
  data: ApiCommunity;
};

type FeedbackCard = {
  id: number;
  userName: string;
  rating: number;
  createdAt: string;
  message: string;
  images: string[];
  replied?: { at: string; message: string } | null;
};

type PackageGroup = {
  id: number | string;
  title: string;
  totalInGroup: number;
  feedbacks: FeedbackCard[];
};

type SortOrder = "newest" | "oldest";

/**
 * คำอธิบาย: ฟังก์ชันสำหรับแปลง userId เป็นชื่อที่แสดงเพื่อป้องกันการแสดงข้อมูลส่วนตัว (id จริง)
 */
const maskUserIdAsDisplayName = (userId: number) => `ผู้ใช้ #${String(userId).slice(0, 1)}***`;

/**
 * คำอธิบาย: ฟังก์ชันสำหรับแปลงรูปแบบวันที่จาก ISO String เป็นรูปแบบวันที่ภาษาไทย
 */
const formatDateThai = (isoDateString: string) => {
  const date = new Date(isoDateString);

  // 'th-TH' จะแปลงเป็นพุทธศักราชให้อัตโนมัติ
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * คำอธิบาย: Component สำหรับแสดงไอคอนดาวตามคะแนน (Rating) ที่ได้รับ
 */
const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, index) => (
      <Icon
        key={index}
        icon="ic:twotone-star"
        className={index < rating ? "text-black" : "text-slate-300"}
        width={18}
        height={18}
      />
    ))}
  </div>
);

/**
 * คำอธิบาย: Component ส่วนควบคุมด้านบน แสดงสรุปจำนวนรายการ ช่องค้นหา ปุ่มตัวกรอง
 */
const TopControls: React.FC<{
  totalItems: number;
  totalPackages: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  currentSort: SortOrder; // ยังคงเก็บสถานะการเรียงลำดับ
  onSortChange: (sort: SortOrder) => void; // ยังคงมีฟังก์ชันเปลี่ยนสถานะ
  onFilterClick: () => void; // ฟังก์ชันนี้จะถูกเรียกเมื่อกดปุ่ม Filter
  onRefreshClick: () => void;
  isLoading?: boolean;
}> = ({
  totalItems,
  totalPackages,
  searchQuery,
  onSearchChange,
  currentSort,
  onSortChange,
  onFilterClick, // ใช้ฟังก์ชันนี้แทนการสลับทันที
  onRefreshClick,
  isLoading,
}) => {
  const sortDisplay = currentSort === "newest" ? "ล่าสุด" : "เก่าสุด";
  return (
    <section className="rounded-xl bg-white border-slate-200 mb-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-black">
          <span className="font-semibold">ทั้งหมด</span> :{" "}
          <span className="text-base">{totalItems}</span> รายการ จาก{" "}
          <span className="text-base">{totalPackages}</span> แพ็กเกจ
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Icon
              icon="mdi:magnify"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width={20}
              height={20}
            />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ค้นหา"
              className="w-[269px] h-[51px] rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-600 transition"
            />
          </div>

          <button
            type="button"
            onClick={onFilterClick}
            className="inline-flex w-[150px] items-center justify-center gap-2 h-[51px] px-4 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            // 💡 เปลี่ยน aria-label ให้สอดคล้อง
            aria-label={`เรียงตาม: ${sortDisplay} (เปิดตัวเลือก)`}
          >
            <Icon icon="hugeicons:filter" width={18} height={18} />
            {sortDisplay}
          </button>
        </div>
      </div>
    </section>
  );
};

/**
 * คำอธิบาย: Component การ์ดแสดงรายละเอียดของข้อเสนอแนะแต่ละรายการ รวมถึงรูปภาพประกอบ
 */
const FeedbackCardView: React.FC<{ feedback: FeedbackCard }> = ({ feedback }) => {
  // ดึงมาแสดงสูงสุดแค่ 3 รูป
  const displayImages = feedback.images.slice(0, 3);
  // คำนวณรูปส่วนเกิน (เช่น มี 5 รูป, โชว์ 3, เหลือเศษ 2)
  const extraCount = feedback.images.length - 3;

  return (
    <div className="px-[30px]">
      <div className="bg-white rounded-xl border border-[#C9C9C9] p-5 flex flex-col gap-3 w-full w-[500px] h-[350px]">
        <div className="flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <Icon icon="mdi:account" className="text-slate-500" />
            </div>
            <div className="text-lg font-medium text-slate-800">{feedback.userName}</div>
          </div>
          <div className="flex flex-col gap-1 text-sm items-end text-slate-500">
            <Stars rating={feedback.rating} />
            <span>{formatDateThai(feedback.createdAt)}</span>
          </div>
        </div>

        <div className="h-[130px] overflow-hidden">
          <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line line-clamp-5">
            {feedback.message || "-"}
          </p>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2">
          {displayImages.map((imageSource, index) => {
            const isLastSlot = index === 2;
            const hasOverlay = isLastSlot && extraCount > 0;

            return (
              <div
                key={index}
                className="relative w-full h-[110px] rounded-lg overflow-hidden border border-slate-200"
              >
                <img src={imageSource} alt="" className="w-full h-full object-cover" />

                {hasOverlay && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">+{extraCount}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * คำอธิบาย: Component แสดงกลุ่มข้อเสนอแนะแยกตามแพ็กเกจ พร้อมส่วนหัวและรายการภายในการ์ด
 */
const PackageGroupSection: React.FC<{
  group: PackageGroup;
  onViewAllClick?: (group: PackageGroup) => void;
}> = ({ group, onViewAllClick }) => {
  return (
    <section className="rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden mb-4">
      <div className="bg-[#4A816F] h-[72px] text-white px-5 py-3 flex items-center justify-between">
        <h2 className="text-[20px] font-semibold">{group.title}</h2>
        <div className="flex items-center gap-3">
          <span className="text-lg opacity-90">{group.totalInGroup} ข้อเสนอแนะ</span>
        </div>
      </div>

      <div className="px-5 pt-5 bg-[#E7E7E7]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {group.feedbacks.map((feedback) => (
            <FeedbackCardView key={feedback.id} feedback={feedback} />
          ))}
        </div>
      </div>

      <div className="px-5 py-3 flex justify-end bg-[#E7E7E7]">
        <button
          type="button"
          onClick={() => onViewAllClick?.(group)}
          className="inline-flex items-center w-[101px] h-[39px] justify-center px-4 py-2 rounded-lg bg-[#055035] text-white hover:bg-[#3d6c5c]"
          aria-label="ดูข้อเสนอแนะทั้งหมดในกลุ่มนี้"
        >
          ดูทั้งหมด
        </button>
      </div>
    </section>
  );
};

/**
 * คำอธิบาย: หน้าแสดงข้อเสนอแนะทั้งหมดสำหรับ Admin
 */
export default function FeddbackAll() {
  const [packageGroups, setPackageGroups] = React.useState<PackageGroup[]>([]);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [totalPackages, setTotalPackages] = React.useState<number>(0);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const navigate = useNavigate();

  const [sortOrder, setSortOrder] = React.useState<SortOrder>("newest");
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับดึงข้อมูลข้อเสนอแนะทั้งหมดจาก Server แปลงโครงสร้างข้อมูล และอัปเดต State เพื่อแสดงผล
   */
  const fetchAllFeedbacks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await axios.get<ApiResponse>(`${apiBaseUrl}/admin/package/feedbacks/all`, {
        withCredentials: true,
      });
      const communityData = response.data?.data;
      const packageList: ApiPackage[] = communityData?.packages ?? [];

      const nextGroups: PackageGroup[] = packageList.map((apiPackage) => {
        const groupFeedbacks: FeedbackCard[] = [];

        (apiPackage.bookingHistories ?? []).forEach((bookingHistory) => {
          (bookingHistory.feedbacks ?? []).forEach((feedback) => {
            groupFeedbacks.push({
              id: feedback.id,
              userName: maskUserIdAsDisplayName(bookingHistory.touristId),
              rating: feedback.rating ?? 0,
              createdAt: feedback.createdAt,
              message: feedback.message ?? "",
              images: (feedback.feedbackImages ?? []).map((imageItem) => imageItem.image),
              replied: feedback.replyMessage
                ? { at: feedback.replyAt ?? "", message: feedback.replyMessage }
                : null,
            });
          });
        });

        return {
          id: apiPackage.id,
          title: apiPackage.name,
          totalInGroup: groupFeedbacks.length,
          feedbacks: groupFeedbacks,
        };
      });

      setPackageGroups(nextGroups);
      setTotalItems(nextGroups.reduce((sum, packageGroup) => sum + packageGroup.totalInGroup, 0));
      setTotalPackages(nextGroups.length);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || error?.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAllFeedbacks();
  }, [fetchAllFeedbacks]);

  /**
   * คำอธิบาย: กรองกลุ่มข้อเสนอแนะตามคำค้นหา (Search Query)
   */
  const filteredGroups = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // 1. กรองตามคำค้นหาและเรียง Feedback ภายในกลุ่ม
    let groups = packageGroups
      .map((packageGroup) => {
        const filteredFeedbacks = packageGroup.feedbacks.filter(
          (feedback) =>
            feedback.userName.toLowerCase().includes(query) ||
            feedback.message.toLowerCase().includes(query) ||
            packageGroup.title.toLowerCase().includes(query)
        );

        const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          // เรียง Feedback ภายในกลุ่มจากใหม่สุดไปเก่าสุดเสมอ
          return dateB - dateA;
        });

        return {
          ...packageGroup,
          feedbacks: sortedFeedbacks,
          totalInGroup: sortedFeedbacks.length,
        };
      })
      .filter(
        (packageGroup) =>
          packageGroup.feedbacks.length > 0 || packageGroup.title.toLowerCase().includes(query)
      );

    const sortedPackageGroups = groups.sort((a, b) => {
      const dateA = a.feedbacks.length > 0 ? new Date(a.feedbacks[0].createdAt).getTime() : 0;

      const dateB = b.feedbacks.length > 0 ? new Date(b.feedbacks[0].createdAt).getTime() : 0;
      return sortOrder === "newest" ? dateA - dateB : dateB - dateA;
    });

    return sortedPackageGroups;
  }, [packageGroups, searchQuery, sortOrder]);

  const handleSortChange = (newSort: SortOrder) => {
    setSortOrder(newSort);
    setIsFilterModalOpen(false);
  };

  const SortFilterModal = () => (
    <div className="absolute top-15 right-0 w-[150px] z-10 bg-white border rounded-lg space-y-2 ">
      <button
        className={`w-full text-left p-2 rounded-md 
                ${
                  sortOrder === "newest"
                    ? "bg-emerald-100 font-medium text-emerald-700"
                    : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
        onClick={() => handleSortChange("newest")}
      >
        <Icon icon="ic:round-sort" width={18} height={18} className="inline mr-2" />
        ล่าสุด
      </button>
      <button
        className={`w-full text-left p-2 rounded-md 
                ${
                  sortOrder === "oldest"
                    ? "bg-emerald-100 font-medium text-emerald-700"
                    : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
        onClick={() => handleSortChange("oldest")}
      >
        <Icon
          icon="ic:round-sort"
          width={18}
          height={18}
          className="inline mr-2 transform rotate-180"
        />
        เก่าสุด
      </button>
    </div>
  );

  return (
    <>
      <Breadcrumb
        current={{
          label: "ข้อเสนอแนะ",
          to: `/admin/packages/feedbacks`,
        }}
      />
      <main className="min-h-screen bg-white py-6 px-6 space-y-6 shadow-md border rounded-xl">
        <div className="mx-auto bg-white rounded-xl">
          <div className="relative">
            <TopControls
              totalItems={totalItems}
              totalPackages={totalPackages}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              currentSort={sortOrder}
              onSortChange={setSortOrder}
              onFilterClick={() => setIsFilterModalOpen((prev) => !prev)}
              onRefreshClick={fetchAllFeedbacks}
              isLoading={isLoading}
            />
            {isFilterModalOpen && <SortFilterModal />}
          </div>

          {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

          {filteredGroups.map((packageGroup) => (
            <PackageGroupSection
              key={packageGroup.id}
              group={packageGroup}
              onViewAllClick={(g) => navigate(`/admin/package/feedbacks/${g.id}`)}
            />
          ))}

          {isLoading && <div className="text-center text-slate-600 py-4">กำลังโหลด...</div>}
        </div>
      </main>
    </>
  );
}
