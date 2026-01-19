/**
 * คำอธิบาย : Component ประวัติการจองของนักท่องเที่ยว
 * แสดงรายการประวัติการจอง พร้อมตัวกรอง การค้นหา และการจัดเรียง
 * พร้อมการแบ่งหน้า (Pagination)
 */
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { getBookingsByTourist } from "@/Libs/BookingHistoryService";
import Pagination from "@/Components/Pagination/PaginationRoundedForCardPackage";
import type { Pagination as PaginationType } from "@/Components/Tables/Types";
import FilterDropdown from "@/Components/Filters/Tourists/FiltersForTR";
import NavbarTourist from "@/Components/NavbarTourist";
import Footer from "@/Components/Footer";
import BookingHistoryCardList, { type BookingItem } from "@/Components/BookingHistoryCardList";
import Button from "@/Components/Button";

/*
 * คำอธิบาย : ตัวแปรสำหรับ map ค่า status จาก API เป็นข้อความภาษาไทย
 */
const statusMap: Record<string, string> = {
  PENDING: "รอยืนยัน",
  BOOKED: "จองสำเร็จ",
  REJECTED: "ถูกปฏิเสธ",
  REFUND_PENDING: "รอคืนเงิน",
  REFUNDED: "คืนเงินแล้ว",
  REFUND_REJECTED: "ปฏิเสธคืนเงิน",
};

/*
 * คำอธิบาย : Component สำหรับหน้า "ประวัติการจองของนักท่องเที่ยว"
 * แสดงประวัติการจองของนักท่องเที่ยว
 * พร้อมตัวกรอง การค้นหา การจัดเรียง และการแบ่งหน้า
 */
export default function BookingHistoryTourist() {
  const [activeSort, setActiveSort] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState({
    status: "ALL",
    period: "ALL",
  });
  const [rawBookings, setRawBookings] = useState<BookingItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationType>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลประวัติการจองทั้งหมดจาก API
   * Input :
   *   - status (string) : สถานะการจองที่ต้องการกรอง
   *   - period (string) : ช่วงเวลาที่ต้องการกรอง
   * Output : ไม่มีข้อมูลส่งกลับ (ผลลัพธ์จะถูกตั้งค่าใน state)
   */
  const fetchRawData = async (status = filterState.status, period = filterState.period) => {
    try {
      setIsLoading(true);
      const isCancelledGroup = status === "CANCELLED";
      const statusParam = status === "ALL" || isCancelledGroup ? "" : status;
      const periodParam = period === "ALL" ? "" : period;

      const initialRes = await getBookingsByTourist(
        1,
        1000,
        "newest",
        statusParam,
        periodParam,
        "",
      );

      let allData = initialRes.data || [];
      const {
        totalCount,
        totalPages,
        limit: serverLimit,
      } = initialRes.pagination || { totalCount: 0, totalPages: 1, limit: 10 };

      if (allData.length < totalCount && totalPages > 1) {
        const promises = [];
        for (let page = 2; page <= totalPages; page++) {
          promises.push(
            getBookingsByTourist(page, serverLimit, "newest", statusParam, periodParam, ""),
          );
        }
        const results = await Promise.all(promises);
        results.forEach((response) => {
          if (response.data) {
            allData = allData.concat(response.data);
          }
        });
      }
      if (isCancelledGroup) {
        const refundStatuses = ["REJECTED", "REFUND_PENDING", "REFUNDED", "REFUND_REJECTED"];
        allData = allData.filter((item: any) => refundStatuses.includes(item.status));
      }

      /*
       * คำอธิบาย : ฟังก์ชันสำหรับ map ข้อมูลที่ได้รับจาก API ไปยังโครงสร้าง BookingItem
       * Input : ข้อมูลดิบจาก API (any[])
       * Output : ข้อมูลที่ถูกแมปแล้ว BookingItem[]
       */
      const mapped: BookingItem[] = allData.map((item: any) => ({
        id: item.id,
        title: item.package?.name ?? "ชื่อแพ็กเกจ",
        location: item.package?.location ?? item.package?.community?.name ?? "-",
        bookingDate: item.bookingAt
          ? new Date(item.bookingAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
        rawBookingDate: item.bookingAt || 0,
        price: item.package?.price ?? item.totalPrice ?? 0,
        status: item.status ?? "-",
        statusLabel: statusMap[item.status] ?? item.status ?? "-",
        isJoined: item.participation_status === "JOINED" || item.participation_status === true,
        isEnded: item.package?.dueDate ? new Date(item.package.dueDate) < new Date() : false,
      }));

      setRawBookings(mapped);
    } catch (error) {
      console.error("Failed to fetch booking history:", error);
    } finally {
      setIsLoading(false);
    }
  };
  /**
   * คำอธิบาย: ดึงข้อมูลใหม่เมื่อมีการเปลี่ยนแปลง filter (status หรือ period)
   * Input: - (ใช้ filterState)
   * Output: - (เรียก fetchRawData)
   */
  useEffect(() => {
    fetchRawData(filterState.status, filterState.period);
  }, [filterState.status, filterState.period]);

  useEffect(() => {
    let processed = [...rawBookings];

    /*
     * คำอธิบาย : ฟังก์ชัน useEffect สำหรับประมวลผลข้อมูลการจองเมื่อ rawBookings, searchQuery, activeSort หรือ pagination.currentPage เปลี่ยนแปลง
     */
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      processed = processed.filter((item) => {
        const packageName = item.title?.toLowerCase() || "";
        const id = String(item.id);
        return packageName.includes(lowerSearch) || id.includes(lowerSearch);
      });
    }

    /*
     * คำอธิบาย : การจัดเรียงข้อมูลตามวันที่จอง
     */
    if (activeSort === "oldest") {
      processed.sort(
        (bookingA: any, bookingB: any) =>
          new Date(bookingA.rawBookingDate).getTime() - new Date(bookingB.rawBookingDate).getTime(),
      );
    } else {
      processed.sort(
        (bookingA: any, bookingB: any) =>
          new Date(bookingB.rawBookingDate).getTime() - new Date(bookingA.rawBookingDate).getTime(),
      );
    }

    /*
     * คำอธิบาย : การตั้งค่าการแบ่งหน้า (Pagination)
     */
    const totalCount = processed.length;
    const totalPages = Math.ceil(totalCount / pagination.limit) || 1;
    const validCurrentPage = Math.min(pagination.currentPage, totalPages) || 1;

    if (totalCount !== pagination.totalCount || totalPages !== pagination.totalPages) {
      setPagination((previous) => ({
        ...previous,
        totalCount,
        totalPages,
        currentPage: validCurrentPage,
      }));
    }

    /*
     * คำอธิบาย : การตัดข้อมูลตามหน้าปัจจุบันและขนาดหน้าที่กำหนด
     */
    const startIndex = (validCurrentPage - 1) * pagination.limit;
    const sliced = processed.slice(startIndex, startIndex + pagination.limit);
    setBookings(sliced);
  }, [rawBookings, searchQuery, activeSort, pagination.currentPage, pagination.limit]);

  const handleSort = (type: "newest" | "oldest") => {
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
          <h1 className="mb-8 text-2xl font-bold text-gray-900">ประวัติการจอง</h1>

          {/* Toolbar */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            {/* Sorting Buttons */}
            <div className="flex gap-2">
              <Button
                type={activeSort === "newest" ? "confirm-tourist" : "cancel"}
                onClick={() => handleSort("newest")}
                className={`font-medium transition-colors border w-auto px-4 whitespace-nowrap ${
                  activeSort === "newest" ? "border-[#00BF6A]" : "border-gray-300 text-gray-700"
                }`}
              >
                ล่าสุด
              </Button>
              <Button
                type={activeSort === "oldest" ? "confirm-tourist" : "cancel"}
                onClick={() => handleSort("oldest")}
                className={`font-medium transition-colors border w-auto px-4 whitespace-nowrap ${
                  activeSort === "oldest" ? "border-[#00BF6A]" : "border-gray-300 text-gray-700"
                }`}
              >
                เก่าสุด
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex w-full items-center gap-2 sm:w-auto">
              {/* Search Input */}
              <div className="relative flex w-full max-w-xs items-center rounded-lg border border-black bg-white px-4 py-1.5 sm:w-80">
                <input
                  type="text"
                  placeholder=""
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPagination((previous) => ({ ...previous, currentPage: 1 }));
                  }}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
                <div className="ml-2 text-gray-400">
                  <Icon icon="mdi:magnify" width={20} height={20} />
                </div>
              </div>

              {/* Filter Button replaced by Dropdown */}
              <FilterDropdown
                sections={[
                  {
                    title: "สถานะ",
                    key: "status",
                    options: [
                      { label: "ทั้งหมด", value: "ALL" },
                      { label: "รอยืนยัน", value: "PENDING" },
                      { label: "จองสำเร็จ", value: "BOOKED" },
                      { label: "ยกเลิกการจอง", value: "CANCELLED" },
                    ],
                  },
                  {
                    title: "ย้อนหลัง",
                    key: "period",
                    options: [
                      { label: "ทั้งหมด", value: "ALL" },
                      { label: "7 วัน", value: "7_DAYS" },
                      { label: "1 เดือน", value: "1_MONTH" },
                      { label: "1 ปี", value: "1_YEAR" },
                    ],
                  },
                ]}
                selected={filterState}
                onChange={(key, value) => {
                  const newState = { ...filterState, [key]: value };
                  setFilterState(newState);
                  setPagination((previous) => ({ ...previous, currentPage: 1 }));
                }}
                label="ตัวกรอง"
                icon="material-symbols:sort"
              />
            </div>
          </div>

          {/* Booking List */}
          <BookingHistoryCardList isLoading={isLoading} bookings={bookings} />

          {/* Pagination Control */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>แสดง</span>
              <select
                value={pagination.limit}
                onChange={(event) => {
                  const newLimit = Number(event.target.value);
                  setPagination((previous) => ({ ...previous, limit: newLimit, currentPage: 1 }));
                }}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 outline-none focus:border-[#00BF6A]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
              <span>รายการ</span>
            </div>

            <Pagination
              totalData={pagination.totalCount}
              limit={pagination.limit}
              onQueryChange={({ page, limit }) => {
                setPagination((previous) => ({ ...previous, currentPage: page, limit }));
              }}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
