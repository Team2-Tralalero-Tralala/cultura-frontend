/**
 * Responsibility:
 *  - แสดง “ข้อเสนอแนะทั้งหมด” ของแพ็กเกจภายในชุมชน (group เป็นรายแพ็กเกจ)
 *  - มีแถบสรุปจำนวน, ช่องค้นหา (ฝั่ง client), ปุ่มตัวกรอง (placeholder), และปุ่ม refresh
 *  - การ์ดแต่ละใบแสดงชื่อผู้ใช้ (mask), คะแนน, เวลา (ชั่วโมงที่แล้ว), ข้อความ และรูปภาพแนบ
 */

import React from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
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

/** แปลง ISO → “N ชั่วโมง” (อย่างน้อย 1 ชั่วโมง) */
const hoursSinceIso = (iso: string) => {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
    return `${hours} ชั่วโมง`;
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

    return (
        <div className="px-[30px]">
            <div className="bg-white rounded-xl border border-[#C9C9C9] p-5 flex flex-col gap-3 w-full min-h-[395px]">
                {/* Header: user + rating + time */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                            <Icon icon="mdi:account" className="text-slate-500" />
                        </div>
                        <div className="text-lg font-medium text-slate-800">{feedback.userName}</div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm items-end text-slate-500">
                        <Stars rating={feedback.rating} />
                        <span>{hoursSinceIso(feedback.createdAt)}</span>
                    </div>
                </div>

                {/* Body: message + images */}
                <div className="flex-1 space-y-3">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {feedback.message || "-"}
                    </p>

                    {thumbnails.length > 0 && (
                        <div className="flex items-center gap-2">
                            {thumbnails.map((src, idx) => (
                                <div
                                    key={idx}
                                    className="w-[151px] h-[96px] rounded-lg overflow-hidden border border-slate-200"
                                >
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            {overflowCount > 0 && (
                                <div className="w-[151px] h-[96px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
                                    +{overflowCount}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Reply box (UI only; ไม่เปลี่ยนพฤติกรรม) */}
                <div className="mt-auto pt-3 border-slate-200">
                    <div className="relative h-10">
                        <input
                            placeholder="ตอบกลับ"
                            className="absolute inset-0 w-full rounded-full border border-slate-300 bg-[#E6E6E6] px-3 pr-12 text-sm outline-none focus:border-emerald-600 transition"
                        />
                        <button
                            type="button"
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#4A816F] text-white flex items-center justify-center hover:bg-emerald-800"
                            title="ส่ง"
                            aria-label="ส่งคำตอบกลับ"
                        >
                            <Icon icon="mdi:send" width={16} height={16} className="block" />
                        </button>
                    </div>
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
        <section className="rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden">
            {/* Header (green) */}
            <div className="bg-[#4A816F] h-[74px] text-white px-5 py-3 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{group.title}</h2>
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
            <div className="px-5 py-5 flex justify-end bg-[#E7E7E7]">
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

    /**
     * ดึงข้อมูลทั้งหมด: community → packages → bookingHistories → feedbacks
     * mapping → PackageGroup[]
     */
    const fetchAllFeedbacks = React.useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const response = await axios.get<ApiResponse>(
                `${apiBaseUrl}/api/packages/admin/package/feedbacks/all`,
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
                    to: `/admin/package/feedbacks`,
                    fromSidebar: true,
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
                    <PackageGroupSection key={group.id} group={group} onViewAllClick={() => { }} />
                ))}

                {isLoading && (
                    <div className="text-center text-slate-600 py-4">กำลังโหลด...</div>
                )}
            </div>
            </main>
        </>
    );
}