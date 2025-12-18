import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { getBookingsByTourist } from "@/Services/booking-history-service";
import Pagination from "@/Components/Pagination/PaginationRoundedForCardPackage";
import type { Pagination as PaginationType } from "@/Components/Tables/Types";
import FilterDropdown from "@/Components/Filters/Tourists/FiltersForTR";
import NavbarTourist from "@/Components/NavbarTourist";
import Footer from "@/Components/Footer";

/*
 * Data Types
 */
type BookingStatus = "Payment" | "Complete" | "Cancel" | "Review" | string;

interface BookingItem {
    id: number;
    title: string;
    location: string;
    price: number;
    status: BookingStatus;
    statusLabel: string;
}

const statusMap: Record<string, string> = {
    PENDING: "รอยืนยัน",
    BOOKED: "จองสำเร็จ",
    REJECTED: "ถูกปฏิเสธ",
    REFUND_PENDING: "รอคืนเงิน",
    REFUNDED: "คืนเงินแล้ว",
    REFUND_REJECTED: "ปฏิเสธคืนเงิน",

};

export default function BookingHistoryTourist() {
    const navigate = useNavigate();
    const [activeSort, setActiveSort] = useState<"latest" | "oldest">("latest");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter State
    const [filterState, setFilterState] = useState({
        status: "ALL",
        period: "ALL",
    });

    // Data State
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationType>({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
    });

    const fetchBookings = async (page = 1, limit = 10, sort = activeSort, status = filterState.status, period = filterState.period, search = searchQuery) => {
        try {
            setIsLoading(true);

            // Prepare params
            const statusParam = status === "ALL" ? "" : status;
            const periodParam = period === "ALL" ? "" : period;

            // Note: service needs update to accept period
            const res = await getBookingsByTourist(page, limit, sort, statusParam, periodParam, search);

            const mapped: BookingItem[] = res.data.map((item: any) => ({
                id: item.id,
                title: item.package?.name ?? "ชื่อแพ็กเกจ",
                location: item.package?.location ?? item.package?.community?.name ?? "-",
                price: item.package?.price ?? item.totalPrice ?? 0,
                status: item.status ?? "-",
                statusLabel: statusMap[item.status] ?? item.status ?? "-",
            }));

            setBookings(mapped);
            setPagination(prev => ({
                ...prev,
                ...res.pagination,
                currentPage: page,
                limit: limit
            }));

        } catch (error) {
            console.error("Failed to fetch booking history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch when sort changes or on mount
        fetchBookings(1, pagination.limit, activeSort, filterState.status, filterState.period, searchQuery);
    }, [activeSort]);

    const handleSort = (type: "latest" | "oldest") => {
        setActiveSort(type);
    };

    return (
        <div className="bg-white min-h-screen flex flex-col font-prompt">
            <NavbarTourist />

            <div className="flex-grow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    {/* Breadcrumb */}
                    <div className="mb-2">
                        <Breadcrumb
                            current={{
                                label: "ประวัติการจอง",
                                to: "/tourist/booking-history",
                            }}
                        />
                    </div>

                    {/* Page Title */}
                    <h1 className="mb-8 text-3xl font-bold text-gray-900">ประวัติการจอง</h1>

                    {/* Toolbar */}
                    {/* Toolbar */}
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        {/* Sorting Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSort("latest")}
                                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors border ${activeSort === "latest"
                                    ? "bg-[#00BF6A] text-white border-[#00BF6A]"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                ล่าสุด
                            </button>
                            <button
                                onClick={() => handleSort("oldest")}
                                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors border ${activeSort === "oldest"
                                    ? "bg-[#00BF6A] text-white border-[#00BF6A]"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                เก่าสุด
                            </button>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex w-full items-center gap-2 sm:w-auto">
                            {/* Search Input */}
                            <div className="relative flex w-full max-w-xs items-center rounded-full border border-gray-300 bg-white px-4 py-1.5 sm:w-80">
                                <input
                                    type="text"
                                    placeholder=""
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            fetchBookings(1, pagination.limit, activeSort, filterState.status, filterState.period, searchQuery);
                                        }
                                    }}
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                                />
                                <button
                                    onClick={() => fetchBookings(1, pagination.limit, activeSort, filterState.status, filterState.period, searchQuery)}
                                    className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    <Icon
                                        icon="mdi:magnify"
                                        width={20}
                                        height={20}
                                    />
                                </button>
                            </div>

                            {/* Filter Button replaced by Dropdown */}
                            <FilterDropdown
                                sections={[
                                    {
                                        title: "สถานะ",
                                        key: "status",
                                        options: [
                                            { label: "ทั้งหมด", value: "ALL" },
                                            ...Object.entries(statusMap).map(([key, label]) => ({
                                                label,
                                                value: key,
                                            })),
                                        ]
                                    },
                                    {
                                        title: "ย้อนหลัง",
                                        key: "period",
                                        options: [
                                            { label: "ทั้งหมด", value: "ALL" },
                                            { label: "7 วัน", value: "7_DAYS" },
                                            { label: "1 เดือน", value: "1_MONTH" },
                                            { label: "1 ปี", value: "1_YEAR" },
                                        ]
                                    }
                                ]}
                                selected={filterState}
                                onChange={(key, val) => {
                                    const newState = { ...filterState, [key]: val };
                                    setFilterState(newState);
                                    fetchBookings(1, pagination.limit, activeSort, newState.status, newState.period, searchQuery);
                                }}
                                label="ตัวกรอง"
                                icon="material-symbols:sort"
                            />
                        </div>
                    </div>

                    {/* Booking List */}
                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            <div className="py-10 text-center text-gray-500">กำลังโหลด...</div>
                        ) : bookings.length === 0 ? (
                            <div className="py-10 text-center text-gray-400">ไม่มีประวัติการจอง</div>
                        ) : (
                            bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
                                    onClick={() => navigate(`/tourist/booking-history/${booking.id}`)}
                                >
                                    {/* Card Content */}
                                    <div className="flex flex-col gap-1 pr-20">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {booking.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">{booking.location}</p>
                                        <p className="mt-1 font-bold text-gray-900">
                                            ราคา THB {booking.price.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    {/* Status (Top Right) */}
                                    <div className="absolute top-6 right-6 text-sm text-gray-400">
                                        {booking.statusLabel}
                                    </div>

                                    {/* Action Buttons (Bottom Right) */}
                                    <div className="mt-4 flex justify-end gap-3 sm:absolute sm:bottom-6 sm:right-6 sm:mt-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/tourist/booking-history/${booking.id}/feedback`);
                                            }}
                                            className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            ข้อเสนอแนะ
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/tourist/booking-history/${booking.id}`);
                                            }}
                                            className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            ดูเพิ่มเติม
                                        </button>
                                    </div>
                                </div>
                            )))}
                    </div>

                    {/* Pagination Control */}
                    <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span>แสดง</span>
                            <select
                                value={pagination.limit}
                                onChange={(e) => {
                                    const newLimit = Number(e.target.value);
                                    fetchBookings(1, newLimit, activeSort, filterState.status, filterState.period, searchQuery);
                                }}
                                className="rounded-md border border-gray-300 bg-white px-2 py-1 outline-none focus:border-[#00BF6A]"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>รายการ</span>
                        </div>

                        <Pagination
                            totalData={pagination.totalCount}
                            limit={pagination.limit}
                            onQueryChange={({ page, limit }) => fetchBookings(page, limit, activeSort, filterState.status, filterState.period, searchQuery)}
                        />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
