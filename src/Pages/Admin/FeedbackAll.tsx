// src/Pages/Member/FeddbackAll.tsx
/**
 * All Feedbacks (Admin/Member)
 * Endpoint: /api/packages/admin/package/feedbacks/all
 */

import React from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

const apiUrl = import.meta.env.VITE_API_URL;

/* ---------- Types from API ---------- */
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

/* ---------- UI Types ---------- */
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

/* ---------- Helpers ---------- */
const maskIdAsName = (id: number) => `ผู\u{0E49}ใช้ #${String(id).slice(0, 1)}***`;
const timeFromISO = (iso: string) => {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
    return `${hours} ชั่วโมง`;
};

const Stars: React.FC<{ n: number }> = ({ n }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <Icon
                key={i}
                icon="ic:twotone-star"
                className={i < n ? "text-black" : "text-slate-300"}
                width={18}
                height={18}
            />
        ))}
    </div>
);

/* ---------- Search + Filter ---------- */
const TopControls: React.FC<{
    totalItems: number;
    totalPackages: number;
    search: string;
    onSearch: (v: string) => void;
    onFilterClick: () => void;
    onRefresh: () => void;
    loading?: boolean;
}> = ({ totalItems, totalPackages, search, onSearch, onFilterClick, onRefresh, loading }) => {
    return (
        <section className="rounded-xl bg-white shadow-md border border-slate-200 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-black ">
                    <span className="font-semibold">ทั้งหมด</span> : <span className="text-base">{totalItems}</span> รายการ จาก{" "}
                    <span className="text-base">{totalPackages}</span> แพ็กเกจ
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* search */}
                    <div className="relative flex-1">
                        <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width={20} height={20} />
                        <input
                            value={search}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder="ค้นหา"
                            className="w-[269px] h-[51px] rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-600 transition"
                        />
                    </div>

                    {/* filter */}
                    <button
                        type="button"
                        onClick={onFilterClick}
                        className="inline-flex w-[127px] items-center gap-2 h-[51px] px-4 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    >
                        <Icon icon="hugeicons:filter" width={18} height={18} />
                        ตัวกรอง
                    </button>
                </div>
            </div>
        </section>
    );
};

/* ---------- Card ---------- */
const FeedbackCardView: React.FC<{ f: FeedbackCard }> = ({ f }) => {
    const overflow = Math.max(0, f.images.length - 4);
    const thumbs = f.images.slice(0, 4);

    return (
        <div className="px-[30px]">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5
                  flex flex-col gap-3 w-full min-h-[395px]">
                {/* เนื้อหา */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                            <Icon icon="mdi:account" className="text-slate-500" />
                        </div>
                        <div className="text-lg font-medium text-slate-800">{f.userName}</div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm items-end text-slate-500">
                        <Stars n={f.rating} />
                        <span>{timeFromISO(f.createdAt)}</span>
                    </div>
                </div>

                <div className="flex-1 space-y-3">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {f.message || "-"}
                    </p>

                    {thumbs.length > 0 && (
                        <div className="flex items-center gap-2">
                            {thumbs.map((src, idx) => (
                                <div key={idx} className="w-[151px] h-[96px] rounded-lg overflow-hidden border border-slate-200">
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            {overflow > 0 && (
                                <div className="w-[151px] h-[96px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
                                    +{overflow}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ช่องตอบกลับ — อยู่ล่างสุดเสมอ */}
                <div className="mt-auto pt-3 border-slate-200">
                    <div className="relative h-10"> {/* กล่องอ้างอิงสูงเท่า input */}
                        <input
                            placeholder="ตอบกลับ"
                            className="absolute inset-0 w-full rounded-full border border-slate-300 bg-[#E6E6E6] px-3 pr-12 text-sm outline-none focus:border-emerald-600 transition"
                        />
                        <button
                            type="button"
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#4A816F] text-white flex items-center justify-center hover:bg-emerald-800"
                            title="ส่ง"
                        >
                            <Icon icon="mdi:send" width={16} height={16} className="block" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

/* ---------- Group Section ---------- */
const PackageGroupSection: React.FC<{
    group: PackageGroup;
    onViewAll?: (g: PackageGroup) => void;
}> = ({ group, onViewAll }) => {
    return (
        <section className="rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden">
            {/* header เขียว */}
            <div className="bg-[#4A816F] h-[74px] text-white px-5 py-3 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{group.title}</h2>
                <div className="flex items-center gap-3">
                    <span className="text-lg opacity-90">{group.totalInGroup} ข้อเสนอแนะ</span>
                </div>
            </div>

            {/* body */}
            <div className="px-5 pt-5 bg-[#E7E7E7]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {group.feedbacks.map((f) => (
                        <FeedbackCardView key={f.id} f={f} />
                    ))}
                </div>
            </div>

            {/* ดูทั้งหมด — ชิดขวาล่าง */}
            <div className="px-5  py-5 flex justify-end bg-[#E7E7E7]">
                <button
                    type="button"
                    onClick={() => onViewAll?.(group)}
                    className="inline-flex items-center w-[101px] h-[39px] justify-center px-4 py-2 rounded-lg bg-[#055035] text-white hover:bg-[#3d6c5c]"
                >
                    ดูทั้งหมด
                </button>
            </div>
        </section>
    );
};

/* ---------- Page ---------- */
export default function FeddbackAll() {
    const [groups, setGroups] = React.useState<PackageGroup[]>([]);
    const [totalItems, setTotalItems] = React.useState<number>(0);
    const [totalPackages, setTotalPackages] = React.useState<number>(0);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    const [search, setSearch] = React.useState("");

    const fetchAll = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get<ApiResponse>(
                `${apiUrl}/api/packages/admin/package/feedbacks/all`,
                { withCredentials: true }
            );

            const community = res.data?.data;
            const pkgs: ApiPackage[] = community?.packages ?? [];

            const mapped: PackageGroup[] = pkgs.map((p) => {
                const feedbacks: FeedbackCard[] = [];
                (p.bookingHistories ?? []).forEach((bh: ApiBookingHistory) => {
                    (bh.feedbacks ?? []).forEach((fb: ApiFeedback) => {
                        feedbacks.push({
                            id: fb.id,
                            userName: maskIdAsName(bh.touristId),
                            rating: fb.rating ?? 0,
                            createdAt: fb.createdAt,
                            message: fb.message ?? "",
                            images: (fb.feedbackImages ?? []).map((im) => im.image),
                            replied: fb.replyMessage
                                ? { at: fb.replyAt ?? "", message: fb.replyMessage }
                                : null,
                        });
                    });
                });

                return {
                    id: p.id,
                    title: p.name,
                    totalInGroup: feedbacks.length,
                    feedbacks,
                };
            });

            setGroups(mapped);
            setTotalItems(mapped.reduce((acc, g) => acc + g.totalInGroup, 0));
            setTotalPackages(mapped.length);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // filter แบบ client ให้เหมือนช่องค้นหาในภาพ
    const visibleGroups = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return groups;
        return groups
            .map((g) => ({
                ...g,
                feedbacks: g.feedbacks.filter(
                    (f) =>
                        f.userName.toLowerCase().includes(q) ||
                        f.message.toLowerCase().includes(q)
                ),
                // อัปเดตตัวเลขหัวข้อให้ตรงกับที่แสดง
                totalInGroup: g.feedbacks.filter(
                    (f) =>
                        f.userName.toLowerCase().includes(q) ||
                        f.message.toLowerCase().includes(q)
                ).length,
            }))
            .filter((g) => g.feedbacks.length > 0);
    }, [groups, search]);

    return (
        <div className="space-y-6">
            <TopControls
                totalItems={totalItems}
                totalPackages={totalPackages}
                search={search}
                onSearch={setSearch}
                onFilterClick={() => {/* เปิด modal filter ตามจริงได้ที่นี่ */ }}
                onRefresh={fetchAll}
                loading={loading}
            />

            {error && (
                <div className="text-sm text-red-600">{error}</div>
            )}

            {visibleGroups.map((g) => (
                <PackageGroupSection key={g.id} group={g} onViewAll={() => { /* route if needed */ }} />
            ))}

            {loading && <div className="text-center text-slate-600 py-4">กำลังโหลด...</div>}
        </div>
    );
}
