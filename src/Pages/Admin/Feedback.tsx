/**
 * คำอธิบาย : Component สำหรับแสดง "ข้อเสนอแนะทั้งหมด" ของแพ็กเกจภายในชุมชน โดยมีการจัดกลุ่มเป็นรายแพ็กเกจ
 */

import React from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const apiBaseUrl = import.meta.env.VITE_API_URL;
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

type ApiFeedbackImage = {
  id: number;
  feedbackId: number;
  image: string;
};

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

type Tourist = {
  firstName: string;
  lastName: string;
};

type ApiBookingHistory = {
  id: number;
  tourist: Tourist;
  touristId: number;
  packageId: number;
  status: string;
  totalParticipant: number;
  feedbacks: ApiFeedback[];
};

type ApiPackage = {
  id: number;
  name: string;
  bookingHistories: ApiBookingHistory[];
};

type ApiCommunity = {
  id: number;
  name: string;
  packages: ApiPackage[];
};

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

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้าง URL รูปภาพที่สมบูรณ์จากชื่อไฟล์
 * Input : fileName (ชื่อไฟล์รูปภาพ)
 * Output : URL เต็มของรูปภาพ หรือ undefined หากไม่มีชื่อไฟล์
 */
function getImageUrl(fileName?: string): string | undefined {
  if (!fileName) {
    return undefined;
  }
  const cleanedPath = fileName.replace(/^\/?uploads\//, "");
  return `${BACKEND_BASE_URL}/uploads/${cleanedPath}`;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแปลงชื่อผู้ใช้เป็นรูปแบบที่ปกปิดบางส่วนเพื่อความเป็นส่วนตัว
 * Input : tourist (ข้อมูลนักท่องเที่ยวที่มีชื่อและนามสกุล)
 * Output : ชื่อและนามสกุลที่ถูก mask ด้วยเครื่องหมาย *
 */
function formatFullName(tourist: Tourist): string {
  const mask = (text: string) => (text ? text[0] + "*".repeat(Math.max(1, text.length - 1)) : "");
  return `${mask(tourist.firstName)} ${mask(tourist.lastName)}`.trim();
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแปลงวันที่จาก ISO String เป็นรูปแบบภาษาไทย
 * Input : isoDateString (วันที่ในรูปแบบ String)
 * Output : วันที่ในรูปแบบภาษาไทย (เช่น 25 ธ.ค. 2025)
 */
const formatDateThai = (isoDateString: string) => {
  const date = new Date(isoDateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างสตริงดาวตามคะแนน Rating
 * Input : rating (คะแนนเต็ม 5)
 * Output : สตริงรูปดาว (เช่น ★★★☆☆)
 */
function renderStars(rating: number): string {
  return Array.from({ length: 5 })
    .map((_, starIndex) => (starIndex < rating ? "★" : "☆"))
    .join("");
}

/*
 * คำอธิบาย : Component ส่วนควบคุมด้านบน แสดงสรุปจำนวน ช่องค้นหา และปุ่มตัวกรอง
 * Input : Props (totalItems, totalPackages, searchQuery, sortOrder, handlers)
 * Output : JSX Element UI ส่วนควบคุม
 */
const TopControls: React.FC<{
  totalItems: number;
  totalPackages: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  currentSort: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  onFilterClick: () => void;
  onRefreshClick: () => void;
  isLoading?: boolean;
}> = ({ totalItems, totalPackages, searchQuery, onSearchChange, currentSort, onFilterClick }) => {
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
            aria-label={`เรียงตาม: ${sortDisplay}`}
          >
            <Icon icon="hugeicons:filter" width={18} height={18} />
            {sortDisplay}
          </button>
        </div>
      </div>
    </section>
  );
};

/*
 * คำอธิบาย : Component การ์ดแสดงรายละเอียดของข้อเสนอแนะแต่ละรายการ
 * Input : feedback (ข้อมูลข้อเสนอแนะ)
 * Output : JSX Element การ์ดข้อเสนอแนะ
 */
const FeedbackCardView: React.FC<{ feedback: FeedbackCard }> = ({ feedback }) => {
  const displayImages = feedback.images.slice(0, 3);
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
            {renderStars(feedback.rating)}
            <span>{formatDateThai(feedback.createdAt)}</span>
          </div>
        </div>

        <div className="h-[130px] overflow-hidden">
          <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line line-clamp-5">
            {feedback.message || "-"}
          </p>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2">
          {displayImages.map((imageFileName, index) => {
            const isLastSlot = index === 2;
            const hasOverlay = isLastSlot && extraCount > 0;
            const imageUrl = getImageUrl(imageFileName);
            return (
              <div
                key={index}
                className="relative w-full h-[110px] rounded-lg overflow-hidden border border-slate-200"
              >
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
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

/*
 * คำอธิบาย : Component แสดงกลุ่มแพ็กเกจและรายการข้อเสนอแนะภายใน
 * Input : group (ข้อมูลกลุ่มแพ็กเกจ), onViewAllClick (ฟังก์ชันเมื่อกดดูทั้งหมด)
 * Output : JSX Element Section ของแพ็กเกจ
 */
const PackageGroupSection: React.FC<{
  group: PackageGroup;
  onViewAllClick?: (group: PackageGroup) => void;
}> = ({ group, onViewAllClick }) => {
  const hasFeedbacks = group.feedbacks.length > 0;

  return (
    <section className="rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden mb-4">
      <div className="bg-[#4A816F] h-[72px] text-white px-5 py-3 flex items-center justify-between">
        <h2 className="text-[20px] font-semibold">{group.title}</h2>
        <div className="flex items-center gap-3">
          <span className="text-lg opacity-90">{group.totalInGroup} ข้อเสนอแนะ</span>
        </div>
      </div>

      <div className={`px-5 pt-5 bg-[#E7E7E7] ${!hasFeedbacks ? "pb-5" : ""}`}>
        {hasFeedbacks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {group.feedbacks.map((feedback) => (
              <FeedbackCardView key={feedback.id} feedback={feedback} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[100px] text-slate-500 font-medium text-lg">
            ไม่พบข้อเสนอแนะ
          </div>
        )}
      </div>
      {hasFeedbacks && (
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
      )}
    </section>
  );
};

/*
 * คำอธิบาย : หน้าหลักสำหรับแสดงรายการข้อเสนอแนะทั้งหมด (Admin)
 * Input : -
 * Output : JSX Element หน้าจอจัดการข้อเสนอแนะ
 */
export default function FeedbackAll() {
  const [packageGroups, setPackageGroups] = React.useState<PackageGroup[]>([]);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [totalPackages, setTotalPackages] = React.useState<number>(0);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const navigate = useNavigate();

  const [sortOrder, setSortOrder] = React.useState<SortOrder>("newest");
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลข้อเสนอแนะจาก API และแปลงโครงสร้างข้อมูล
   * Input : -
   * Output : void (อัปเดต State ภายใน)
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
              userName: formatFullName(bookingHistory.tourist),
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

  const filteredGroups = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let groups = packageGroups
      .map((packageGroup) => {
        const filteredFeedbacks = packageGroup.feedbacks.filter(
          (feedback) =>
            feedback.userName.toLowerCase().includes(query) ||
            feedback.message.toLowerCase().includes(query) ||
            packageGroup.title.toLowerCase().includes(query)
        );

        const sortedFeedbacks = [...filteredFeedbacks].sort((feedbackA, feedbackB) => {
          const dateA = new Date(feedbackA.createdAt).getTime();
          const dateB = new Date(feedbackB.createdAt).getTime();
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

    // แก้ไข a, b เป็น groupA, groupB
    const sortedPackageGroups = groups.sort((groupA, groupB) => {
      const getTimestamp = (group: PackageGroup) =>
        group.feedbacks.length > 0 ? new Date(group.feedbacks[0].createdAt).getTime() : 0;

      const timeA = getTimestamp(groupA);
      const timeB = getTimestamp(groupB);

      return sortOrder === "newest" ? timeA - timeB : timeB - timeA;
    });

    return sortedPackageGroups;
  }, [packageGroups, searchQuery, sortOrder]);

  const handleSortChange = (newSort: SortOrder) => {
    setSortOrder(newSort);
    setIsFilterModalOpen(false);
  };

  /*
   * คำอธิบาย : Component Modal ตัวเลือกสำหรับเรียงลำดับข้อมูล
   * Input : -
   * Output : JSX Element Modal
   */
  const SortFilterModal = () => (
    <div className="absolute top-[60px] right-0 w-[150px] z-10 bg-white border rounded-lg space-y-2 shadow-lg p-1">
      <button
        className={`w-full text-left p-2 rounded-md ${
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
        className={`w-full text-left p-2 rounded-md ${
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
              onViewAllClick={(packageGroup) =>
                navigate(`/admin/package/feedbacks/${packageGroup.id}`)
              }
            />
          ))}

          {isLoading && <div className="text-center text-slate-600 py-4">กำลังโหลด...</div>}
        </div>
      </main>
    </>
  );
}
