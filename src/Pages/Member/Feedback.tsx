/**
 * Component: MemberFeedbacks (Client)
 * Responsibility:
 * - แสดงข้อเสนอแนะทั้งหมดของแพ็กเกจที่สมาชิกเป็นเจ้าของ
 */
import React from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

/**
 * Types (API)
 * คำอธิบาย: ประเภทข้อมูลที่คาดว่าจะได้รับจาก backend สำหรับโครงสร้างข้อมูลแพ็กเกจและข้อเสนอแนะ
 */
type ApiFeedbackImage = { id: number; feedbackId: number; image: string };
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
type ApiBookingHistory = {
    id: number;
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

type ApiDataWrapper = {
    packages: ApiPackage[];
};

type ApiResponse = {
    status: number;
    error: boolean;
    message: string;
    data: ApiDataWrapper;
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

type SortOrder = 'newest' | 'oldest'; // เพิ่ม Type สำหรับสถานะการเรียงลำดับ

/**
 * คำอธิบาย: ฟังก์ชันสำหรับแปลง userId เป็นชื่อที่แสดงเพื่อป้องกันการแสดงข้อมูลส่วนตัว (id จริง)
 */
const maskUserIdAsDisplayName = (userId: number) =>
    `ผู้ใช้ #${String(userId).slice(0, 1)}***`;

/**
 * คำอธิบาย: ฟังก์ชันสำหรับแปลงรูปแบบวันที่จาก ISO String เป็นรูปแบบวันที่ภาษาไทย
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
    currentSort: SortOrder; // เพิ่ม prop สำหรับสถานะการเรียงลำดับ
    onFilterClick: () => void;
    onRefreshClick: () => void;
    isLoading?: boolean;
}> = ({
    totalItems,
    totalPackages,
    searchQuery,
    onSearchChange,
    currentSort, // รับค่าสถานะการเรียงลำดับ
    onFilterClick,
    onRefreshClick,
    isLoading = false,
}) => {
        const sortDisplay = currentSort === 'newest' ? 'ล่าสุด' : 'เก่าสุด'; // ใช้เพื่อแสดงผลบนปุ่ม
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
                            // เปลี่ยนข้อความบนปุ่ม
                            aria-label={`เรียงตาม: ${sortDisplay} (เปิดตัวเลือก)`}
                        >
                            <Icon icon="hugeicons:filter" width={18} height={18} />
                            {/* แสดงสถานะการเรียงลำดับปัจจุบัน */}
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
                                <img src={imageSource} alt={`feedback-image-${index}`} className="w-full h-full object-cover" />
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

// Component สำหรับ Modal ตัวกรอง/เรียงลำดับ
const SortFilterModal: React.FC<{
    sortOrder: SortOrder;
    onSortChange: (newSort: SortOrder) => void;
    onClose: () => void;
}> = ({ sortOrder, onSortChange, onClose }) => (
    <div className="absolute top-15 right-0 w-[150px] z-10 bg-white border rounded-lg space-y-2 ">
        <button
            className={`w-full text-left p-2 rounded-md transition duration-150 ease-in-out
                ${sortOrder === 'newest'
                    ? 'bg-emerald-100 font-medium text-emerald-700'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
            onClick={() => { onSortChange('newest'); onClose(); }}

        >
            <Icon icon="ic:round-sort" width={18} height={18} className="inline mr-2" />
            ล่าสุด
        </button>
        <button
            className={`w-full text-left p-2 rounded-md transition duration-150 ease-in-out
                ${sortOrder === 'oldest'
                    ? 'bg-emerald-100 font-medium text-emerald-700'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
            onClick={() => { onSortChange('oldest'); onClose(); }}
        >
            <Icon icon="ic:round-sort" width={18} height={18} className="inline mr-2 transform rotate-180" />
            เก่าสุด
        </button>
    </div>
);


export default function Feedback() {
    const [packageGroups, setPackageGroups] = React.useState<PackageGroup[]>([]);
    const [totalItems, setTotalItems] = React.useState<number>(0);
    const [totalPackages, setTotalPackages] = React.useState<number>(0);

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState<string>("");

    const [sortOrder, setSortOrder] = React.useState<SortOrder>('newest'); // เพิ่ม State สำหรับการเรียงลำดับ
    const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false); // เพิ่ม State สำหรับ Modal

    const navigate = useNavigate();

    /**
     * คำอธิบาย: ฟังก์ชันสำหรับดึงข้อมูลข้อเสนอแนะทั้งหมดจาก Server แปลงโครงสร้างข้อมูล และอัปเดต State เพื่อแสดงผล
     */
    const fetchAllFeedbacks = React.useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const response = await axios.get<ApiResponse>(`${API_BASE_URL}/member/feedbacks/all`, {
                withCredentials: true,
            });

            // Backend returns { data: { packages: [...] } }
            const responseData = response.data?.data;
            const packageList: ApiPackage[] = responseData?.packages ?? [];

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
                            images: (feedback.feedbackImages ?? []).map((feedbackImage) => feedbackImage.image),
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
            console.error(error);
            setErrorMessage(error?.response?.data?.message || error?.message || "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchAllFeedbacks();
    }, [fetchAllFeedbacks]);

    /**
     * คำอธิบาย: กรองและเรียงลำดับกลุ่มข้อเสนอแนะ
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

                // เรียง Feedback ภายในกลุ่มจากใหม่สุดไปเก่าสุดเสมอ (เหมือนต้นฉบับ Admin)
                const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return dateB - dateA; // ใหม่สุดมาก่อน
                });

                return {
                    ...packageGroup,
                    feedbacks: sortedFeedbacks,
                    totalInGroup: sortedFeedbacks.length,
                };
            })
            .filter((packageGroup) => packageGroup.feedbacks.length > 0 || packageGroup.title.toLowerCase().includes(query));

        // 2. เรียงลำดับกลุ่มแพ็กเกจ (ใช้ Feedback ล่าสุดในกลุ่มเป็นเกณฑ์)
        const sortedPackageGroups = groups.sort((a, b) => {
            // ดึงวันที่ของ Feedback ที่ใหม่ที่สุดในแต่ละกลุ่มมาใช้ในการเรียง
            const dateA = a.feedbacks.length > 0
                ? new Date(a.feedbacks[0].createdAt).getTime()
                : 0;

            const dateB = b.feedbacks.length > 0
                ? new Date(b.feedbacks[0].createdAt).getTime()
                : 0;

            // เรียงตามสถานะ sortOrder
            //return sortOrder === 'newest' ? dateB - dateA : dateA - dateB; // ล่าสุด: dateB - dateA, เก่าสุด: dateA - dateB
            return sortOrder === 'newest' ? dateA - dateB : dateB - dateA;
        });


        return sortedPackageGroups;
    }, [packageGroups, searchQuery, sortOrder]);


    // ฟังก์ชันจัดการการเปลี่ยนสถานะการเรียงลำดับ
    const handleSortChange = (newSort: SortOrder) => {
        setSortOrder(newSort);
        setIsFilterModalOpen(false); // ปิด Modal หลังจากเลือก
    };


    return (
        <>
            <Breadcrumb
                current={{
                    label: "ข้อเสนอแนะ",
                    to: `/member/feedbacks`,
                }}
            />
            <main className="min-h-screen bg-white py-8 px-6 space-y-6 shadow-md border rounded-xl">
                <div className="mx-auto bg-white rounded-xl">
                    <div className="relative"> {/* เพิ่ม div relative เพื่อวาง Modal */}
                        <TopControls
                            totalItems={totalItems}
                            totalPackages={totalPackages}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            currentSort={sortOrder} // ส่งสถานะปัจจุบัน
                            onFilterClick={() => setIsFilterModalOpen(!isFilterModalOpen)} // สลับเปิด/ปิด Modal
                            onRefreshClick={fetchAllFeedbacks}
                            isLoading={isLoading}
                        />

                        {/* แสดง Modal เมื่อ isFilterModalOpen เป็น true */}
                        {isFilterModalOpen && (
                            <SortFilterModal
                                sortOrder={sortOrder}
                                onSortChange={handleSortChange}
                                onClose={() => setIsFilterModalOpen(false)}
                            />
                        )}
                    </div>


                    {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

                    {filteredGroups.length === 0 && !isLoading && !errorMessage && (
                        <div className="text-center text-slate-500 py-10">ไม่พบข้อมูลข้อเสนอแนะ</div>
                    )}

                    {filteredGroups.map((packageGroup) => (
                        <PackageGroupSection
                            key={packageGroup.id}
                            group={packageGroup}
                            onViewAllClick={(group) => navigate(`/member/feedbacks/${group.id}`)}
                        />
                    ))}

                    {isLoading && <div className="text-center text-slate-600 py-4">กำลังโหลด...</div>}
                </div>
            </main>
        </>
    );
}