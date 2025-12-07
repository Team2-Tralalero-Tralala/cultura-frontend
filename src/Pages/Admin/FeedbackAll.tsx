/**
 * Responsibility:
 *  - แสดง “ข้อเสนอแนะทั้งหมด” ของแพ็กเกจภายในชุมชน (group เป็นรายแพ็กเกจ)
 *  - มีแถบสรุปจำนวน, ช่องค้นหา (ฝั่ง client), ปุ่มตัวกรอง (placeholder), และปุ่ม refresh
 *  - การ์ดแต่ละใบแสดงชื่อผู้ใช้ (mask), คะแนน, เวลา (ชั่วโมงที่แล้ว), ข้อความ และรูปภาพแนบ
 */

import React from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/** ENV: API Base URL */
const apiBaseUrl = import.meta.env.VITE_API_URL;

/* ============================== Types (API) =============================== */
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

/* ============================== Types (UI) ================================ */
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

/* ============================== Helpers ================================== */
/** แปลง id ให้ดูเป็นชื่อผู้ใช้แบบปิดบัง */
const maskUserIdAsDisplayName = (userId: number) => `ผู้ใช้ #${String(userId).slice(0, 1)}***`;

const formatDateThai = (iso: string) => {
    const date = new Date(iso);

    // 'th-TH' จะแปลงเป็นพุทธศักราชให้อัตโนมัติ
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const timeSinceIso = (iso: string) => {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));

    if (hours < 24) {
        // ถ้าไม่ถึง 24 ชม. ให้แสดงเป็นชั่วโมง (ขั้นต่ำ 1 ชม.)
        return `${Math.max(1, hours)} ชั่วโมง`;
    }

    // ถ้าเกิน 24 ชม. ให้คำนวณเป็นวัน
    const days = Math.floor(hours / 24);
    return `${days} วัน`;
};

/* ============================== UI Bits ================================== */
/** ดาวแสดงคะแนน (0-5) */
const Stars: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <Icon
                key={i}
                icon="ic:twotone-star"
                className={i < rating ? "text-black" : "text-slate-300"}
                width={18}
                height={18}
            />
        ))}
    </div>
);

/** แถบควบคุมด้านบน: จำนวน/ค้นหา/กรอง/รีเฟรช */
const TopControls: React.FC<{
    totalItems: number;
    totalPackages: number;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onFilterClick: () => void;
    onRefreshClick: () => void;
    isLoading?: boolean;
}> = ({
    totalItems,
    totalPackages,
    searchQuery,
    onSearchChange,
    onFilterClick,
    onRefreshClick,
    isLoading,
}) => {
        return (
            <section className="rounded-xl bg-white border-slate-200 mb-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    {/* Summary */}
                    <div className="text-black">
                        <span className="font-semibold">ทั้งหมด</span> :{" "}
                        <span className="text-base">{totalItems}</span> รายการ จาก{" "}
                        <span className="text-base">{totalPackages}</span> แพ็กเกจ
                    </div>

                    {/* Actions: search + filter + refresh */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Icon
                                icon="mdi:magnify"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                width={20}
                                height={20}
                            />
                            <input
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="ค้นหา"
                                className="w-[269px] h-[51px] rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-600 transition"
                            />
                        </div>

                        {/* Filter (placeholder) */}
                        <button
                            type="button"
                            onClick={onFilterClick}
                            className="inline-flex w-[127px] items-center gap-2 h-[51px] px-4 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            aria-label="ตัวกรอง"
                        >
                            <Icon icon="hugeicons:filter" width={18} height={18} />
                            ตัวกรอง
                        </button>
                    </div>
                </div>
            </section>
        );
    };

/** การ์ดแสดง feedback เดี่ยว */
const FeedbackCardView: React.FC<{ feedback: FeedbackCard }> = ({ feedback }) => {
    const thumbnails = feedback.images.slice(0, 4);
    const overflowCount = Math.max(0, feedback.images.length - 4);

    // ดึงมาแสดงสูงสุดแค่ 3 รูป
    const displayImages = feedback.images.slice(0, 3);
    // คำนวณรูปส่วนเกิน (เช่น มี 5 รูป, โชว์ 3, เหลือเศษ 2)
    const extraCount = feedback.images.length - 3;

    return (
        <div className="px-[30px]">
            {/* ปรับ h-auto หรือกำหนด height ตายตัวถ้าต้องการให้การ์ดเท่ากันเป๊ะๆ ในทุกแถว */}
            <div className="bg-white rounded-xl border border-[#C9C9C9] p-5 flex flex-col gap-3 w-full w-[500px] h-[350px]">

                {/* Header: user + rating + time */}
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

                {/* Body: message (Fix Height & Line Clamp) */}
                {/* h-[72px] คือความสูงที่จองไว้ประมาณ 3-4 บรรทัด แม้ข้อความสั้นก็จะกินพื้นที่เท่านี้ */}
                <div className="h-[130px] overflow-hidden">
                    <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line line-clamp-5">
                        {feedback.message || "-"}
                    </p>
                </div>

                {/* Images: Grid 3 (Bottom) */}
                <div className="mt-auto grid grid-cols-3 gap-2">
                    {displayImages.map((src, idx) => {
                        // เช็คว่าเป็นรููปช่องที่ 3 และยังมีรูปเหลืออีกไหม
                        const isLastSlot = idx === 2;
                        const hasOverlay = isLastSlot && extraCount > 0;

                        return (
                            <div
                                key={idx}
                                className="relative w-full h-[110px] rounded-lg overflow-hidden border border-slate-200"
                            >
                                <img src={src} alt="" className="w-full h-full object-cover" />

                                {/* Overlay ถ้ามีรูปเกิน 3 รูป */}
                                {hasOverlay && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white text-xl font-bold">+{extraCount}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* กรณีไม่มีรูปเลย หรือรูปไม่ครบ 3 อาจจะปล่อยว่างไว้ หรือใส่ placeholder ก็ได้ 
                        แต่ code นี้จะปล่อยว่างตาม flex/grid
                    */}
                </div>
            </div>
        </div>
    );
};

/** กล่อง group รายแพ็กเกจ */
const PackageGroupSection: React.FC<{
    group: PackageGroup;
    onViewAllClick?: (group: PackageGroup) => void;
}> = ({ group, onViewAllClick }) => {
    return (
        <section className="rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden mb-4">
            {/* Header (green) */}
            <div className="bg-[#4A816F] h-[72px] text-white px-5 py-3 flex items-center justify-between">
                <h2 className="text-[20px] font-semibold">{group.title}</h2>
                <div className="flex items-center gap-3">
                    <span className="text-lg opacity-90">{group.totalInGroup} ข้อเสนอแนะ</span>
                </div>
            </div>

            {/* Body */}
            <div className="px-5 pt-5 bg-[#E7E7E7]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {group.feedbacks.map((f) => (
                        <FeedbackCardView key={f.id} feedback={f} />
                    ))}
                </div>
            </div>

            {/* Footer: ดูทั้งหมด */}
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

/* ============================== Page =============================== */
export default function FeddbackAll() {
    /** State: data groups & summaries */
    const [packageGroups, setPackageGroups] = React.useState<PackageGroup[]>([]);
    const [totalItems, setTotalItems] = React.useState<number>(0);
    const [totalPackages, setTotalPackages] = React.useState<number>(0);

    /** State: ui status */
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    const navigate = useNavigate();

    /**
     * ดึงข้อมูลทั้งหมด: community → packages → bookingHistories → feedbacks
     * mapping → PackageGroup[]
     */
    const fetchAllFeedbacks = React.useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const response = await axios.get<ApiResponse>(
                `${apiBaseUrl}/packages/admin/package/feedbacks/all`,
                { withCredentials: true }
            );
            const communityData = response.data?.data;
            const packageList: ApiPackage[] = communityData?.packages ?? [];

            const nextGroups: PackageGroup[] = packageList.map((pkg) => {
                const groupFeedbacks: FeedbackCard[] = [];

                (pkg.bookingHistories ?? []).forEach((bookingHistory) => {
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
                    id: pkg.id,
                    title: pkg.name,
                    totalInGroup: groupFeedbacks.length,
                    feedbacks: groupFeedbacks,
                };
            });

            setPackageGroups(nextGroups);
            setTotalItems(nextGroups.reduce((sum, g) => sum + g.totalInGroup, 0));
            setTotalPackages(nextGroups.length);
        } catch (err: any) {
            setErrorMessage(err?.response?.data?.message || err?.message || "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchAllFeedbacks();
    }, [fetchAllFeedbacks]);

    /**
     * Filter (ฝั่ง client) ตาม searchQuery
     * - ค้นหาใน userName และ message
     */
    const filteredGroups = React.useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return packageGroups;

        return packageGroups
            .map((g) => {
                const filteredFeedbacks = g.feedbacks.filter(
                    (f) =>
                        f.userName.toLowerCase().includes(q) ||
                        f.message.toLowerCase().includes(q) ||
                        g.title.toLowerCase().includes(q)
                );
                return {
                    ...g,
                    feedbacks: filteredFeedbacks,
                    totalInGroup: filteredFeedbacks.length,
                };
            })
            .filter((g) =>
                g.feedbacks.length > 0 ||
                g.title.toLowerCase().includes(q)
            );
    }, [packageGroups, searchQuery]);

    /* ============================= Render ============================== */
    return (
        <>
            <Breadcrumb
                current={{
                    label: "ข้อเสนอแนะ",
                    to: `/admin/packages/feedbacks`,
                }}
            />
            <main className="min-h-screen bg-white py-8 px-6 space-y-6 shadow-md border rounded-xl">
                <div className="mx-auto bg-white rounded-xl">
                    <TopControls
                        totalItems={totalItems}
                        totalPackages={totalPackages}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onFilterClick={() => { }}
                        onRefreshClick={fetchAllFeedbacks}
                        isLoading={isLoading}
                    />

                    {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

                    {filteredGroups.map((group) => (
                        <PackageGroupSection key={group.id} group={group}
                            onViewAllClick={(g) => navigate(`/admin/package/feedbacks/${g.id}`)} />
                    ))}

                    {isLoading && (
                        <div className="text-center text-slate-600 py-4">กำลังโหลด...</div>
                    )}
                </div>
            </main>
        </>
    );
}