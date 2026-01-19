/**
 * คำอธิบาย: หน้าแสดงประวัติการจองของนักท่องเที่ยว (Tourist)
 */
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import Button from "@/Components/Button";
import FilterDropdown from "@/Components/Filters/Tourists/FiltersForTR";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/NavbarTourist";
import Pagination from "@/Components/Pagination/PaginationRoundedForCardPackage";
import { useEffect, useState } from "react";
import { getTouristBookingHistory } from "@/Libs/BookingHistoryService";
import type { TouristBookingHistory } from "@/Types/BookingHistory";
import { useSearchParams } from "react-router-dom";

/**
 * Component: DetailBookingHistory
 * คำอธิบาย: หน้าแสดงประวัติการจองของนักท่องเที่ยว (Tourist)
 * Input: -
 * Output: JSX.Element (หน้าจอแสดงรายการและรายละเอียดการจอง)
 */
export function DetailBookingHistory() {
  const [bookingHistories, setBookingHistories] = useState<TouristBookingHistory[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<TouristBookingHistory | null>(null);
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const API_URL = import.meta.env.VITE_API_URL;
  const API_UPLOAD = API_URL.replace("/api", "");
  const [searchParams, setSearchParams] = useSearchParams();

  // Status map for filter
  const statusMap: Record<string, string> = {
    PENDING: "รอการยืนยัน",
    BOOKED: "จองสำเร็จ",
    REJECTED: "ถูกปฏิเสธ",
    REFUNDED: "คืนเงินแล้ว",
    REFUND_PENDING: "รอการคืนเงิน",
    REFUND_REJECTED: "การคืนเงินถูกปฏิเสธ",
  };

  const [filterState, setFilterState] = useState<{
    status: string | string[];
    period: string;
  }>({
    status: "ALL",
    period: "all",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  /**
   * คำอธิบาย: ดึงข้อมูลประวัติการจองจาก API ตาม Pagination และ Filter ที่เลือก
   * Input: - (ใช้ state: pagination, filterState, sort)
   * Output: void (อัปเดต state: bookingHistories, pagination, selectedBooking)
   */
  const fetchBookingHistory = async () => {
    try {
      let dateFilter = undefined;
      if (filterState.period !== "all") {
        const to = new Date();
        const from = new Date();
        if (filterState.period === "7Days") {
          from.setDate(to.getDate() - 7);
        } else if (filterState.period === "1Month") {
          from.setMonth(to.getMonth() - 1);
        } else if (filterState.period === "1Year") {
          from.setFullYear(to.getFullYear() - 1);
        }
        dateFilter = { from, to };
      }

      const response = await getTouristBookingHistory(
        pagination.currentPage,
        pagination.limit,
        sort,
        {
          status: filterState.status,
          date: dateFilter,
        },
      );

      setBookingHistories(response.data);
      setPagination((prev) => ({
        ...prev,
        ...response.pagination,
      }));
    } catch (error) {
      console.error("Error fetching booking history:", error);
    }
  };

  /**
   * คำอธิบาย: ดึงข้อมูลประวัติการจองจาก API ตาม Pagination และ Filter ที่เลือก
   * Input: - (ใช้ state: pagination.currentPage, pagination.limit, sort, filterState)
   * Output: void (อัปเดต state: bookingHistories, pagination, selectedBooking)
   */
  useEffect(() => {
    fetchBookingHistory();
  }, [pagination.currentPage, pagination.limit, sort, filterState]);

  /**
   * คำอธิบาย: จัดการการเลือก Booking History ตาม URL Parameter
   * Input: - (ใช้ state: bookingHistories, searchParams)
   * Output: void (อัปเดต state: selectedBooking)
   */
  useEffect(() => {
    if (bookingHistories.length > 0) {
      const bookingId = searchParams.get("bookingId");
      if (bookingId) {
        const found = bookingHistories.find((booking) => booking.id.toString() === bookingId);
        if (found) {
          setSelectedBooking(found);
        } else {
          // Fallback to first if ID not found in current list
          setSelectedBooking(bookingHistories[0]);
        }
      } else {
        // Default to first if no ID in URL
        setSelectedBooking(bookingHistories[0]);
      }
    } else {
      setSelectedBooking(null);
    }
  }, [bookingHistories, searchParams]);

  /**
   * คำอธิบาย: จัดการการเปลี่ยนแปลงการเรียงลำดับ (ล่าสุด/เก่าสุด)
   * Input: value ("desc" | "asc")
   * Output: void (อัปเดต state: sort)
   */
  const handleSort = (value: "desc" | "asc") => {
    setSort(value);
  };

  /**
   * คำอธิบาย: แปลงวันที่เป็นรูปแบบภาษาไทย
   * Input: dateString (string)
   * Output: string (วันที่ในรูปแบบที่กำหนด หรือ "" ถ้าไม่มี input)
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      minute: "numeric",
      hour: "numeric",
    });
  };

  /**
   * คำอธิบาย: จัดรูปแบบตัวเลขราคาให้มี comma คั่นหลักพัน
   * Input: price (number)
   * Output: string (ราคาที่จัดรูปแบบแล้ว)
   */
  const formatPrice = (price: number) => {
    return price ? price.toLocaleString() : "0";
  };

  /**
   * คำอธิบาย: แปลงสถานะภาษาอังกฤษเป็นภาษาไทย
   * Input: status (string)
   * Output: string (ข้อความสถานะภาษาไทย)
   */
  const getStatusText = (status: string) => {
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarTourist />
      <div className="container mx-auto px-5">
        <div>
          <Breadcrumb
            current={{
              label: "ประวัติการจอง",
              to: location.pathname,
            }}
          />
        </div>
        <h1 className="text-[40px] font-bold mb-2">ประวัติการจอง</h1>
      </div>
      <hr />
      <div className="container mx-auto px-5 mb-10">
        <div className="flex justify-between items-center pt-10">
          {sort === "desc" ? (
            <div className="flex w-40 gap-2.5">
              <Button type="confirm-tourist" onClick={() => handleSort("desc")}>
                ล่าสุด
              </Button>
              <Button type="cancel" onClick={() => handleSort("asc")}>
                เก่าสุด
              </Button>
            </div>
          ) : (
            <div className="flex w-40 gap-2.5">
              <Button type="cancel" onClick={() => handleSort("desc")}>
                ล่าสุด
              </Button>
              <Button type="confirm-tourist" onClick={() => handleSort("asc")}>
                เก่าสุด
              </Button>
            </div>
          )}
          <FilterDropdown
            sections={[
              {
                title: "สถานะ",
                key: "status",
                options: [
                  { label: "ทั้งหมด", value: "ALL" },
                  { label: "รอการยืนยัน", value: "PENDING" },
                  { label: "จองสำเร็จ", value: "BOOKED" },
                  { label: "ถูกปฏิเสธ", value: "REJECTED" },
                  {
                    label: "ยกเลิกการจอง",
                    value: ["REFUNDED", "REFUNDED_PENDING", "REFUND_REJECTED"],
                  },
                ],
              },
              {
                title: "ย้อนหลัง",
                key: "period",
                options: [
                  { label: "ทั้งหมด", value: "all" },
                  { label: "7 วัน", value: "7Days" },
                  { label: "1 เดือน", value: "1Month" },
                  { label: "1 ปี", value: "1Year" },
                ],
              },
            ]}
            selected={filterState}
            onChange={(key, val) => {
              const newState = { ...filterState, [key]: val };
              setFilterState(newState);
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
            label="ตัวกรอง"
            icon="material-symbols:sort"
          />
        </div>
        <div>
          <div className="flex justify-between gap-2 items-start">
            {/* List Column */}
            <div className="w-3/6 mt-5 flex flex-col gap-4">
              {bookingHistories.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setSearchParams({ bookingId: item.id.toString() }, { replace: true })
                  }
                  className={`border-2 p-5 rounded-2xl cursor-pointer ${
                    selectedBooking?.id === item.id ? "border-[#1DC9A0]" : "border-[#E5E7EB]"
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="text-[20px] font-bold">{item.package.name}</h3>
                    <p>{getStatusText(item.status)}</p>
                  </div>

                  <p className="text-base text-[#898989] mb-2">
                    {item.package.community.location.subDistrict}{" "}
                    {item.package.community.location.district}{" "}
                    {item.package.community.location.province}
                  </p>
                  <p className="font-bold">ราคา THB {formatPrice(item.package.price)}</p>
                </div>
              ))}
              {bookingHistories.length === 0 && <p>ไม่พบข้อมูลการจอง</p>}
            </div>

            {/* Detail Column */}
            <div className="grid grid-cols-1 gap-4 w-3/6">
              {selectedBooking && (
                <>
                  <div className="border-2 border-[#E5E7EB] p-5 mt-5 rounded-2xl">
                    {selectedBooking.package.packageFile.length > 0 ? (
                      <img
                        src={`${API_UPLOAD}/${selectedBooking.package.packageFile[0].filePath}`}
                        alt=""
                        className="w-full h-auto object-cover rounded-md mb-4"
                        onError={(event) => {
                          (event.target as HTMLImageElement).src = "https://placehold.co/800x450";
                        }}
                      />
                    ) : (
                      <img
                        src="https://placehold.co/800x450"
                        alt=""
                        className="w-full h-auto object-cover rounded-md mb-4"
                      />
                    )}
                    <h3 className="mb-2">{selectedBooking.package.name}</h3>
                    <p className="mb-2">
                      ที่อยู่: {selectedBooking.package.community.location.subDistrict}{" "}
                      {selectedBooking.package.community.location.district}{" "}
                      {selectedBooking.package.community.location.province}
                    </p>
                    <p className="mb-2">{selectedBooking.package.community.name}</p>
                    <p className="mb-2">{selectedBooking.package.description}</p>
                    <div className="grid grid-cols-2 mt-4 gap-y-2">
                      <p>ราคา</p>
                      <p className="text-end">{formatPrice(selectedBooking.package.price)} บาท</p>
                      <p>สถานะ</p>
                      <p className="text-end">{getStatusText(selectedBooking.status)}</p>
                      {selectedBooking.status === "REFUND_REJECTED" ||
                      selectedBooking.status === "REJECTED" ? (
                        <>
                          <p>เหตุผลที่ปฏิเสธ</p>
                          <p className="text-end">{selectedBooking.rejectReason ?? "-"}</p>
                        </>
                      ) : (
                        ""
                      )}
                      <p>วันที่เข้าร่วม</p>
                      <p className="text-end">{formatDate(selectedBooking.package.startDate)}</p>
                      <p>ดำเนินการจองเวลา</p>
                      <p className="text-end">{formatDate(selectedBooking.bookingAt)}</p>
                      <p>จำนวนผู้เข้าจองทั้งหมด</p>
                      <p className="text-end">{selectedBooking.totalParticipant} ท่าน</p>
                      <p className="font-bold">ราคารวม</p>
                      <p className="text-end font-bold ">
                        {formatPrice(
                          selectedBooking.package.price * selectedBooking.totalParticipant,
                        )}{" "}
                        บาท
                      </p>
                    </div>
                  </div>
                  <div className="w-1/5 justify-self-end">
                    {(selectedBooking.status === "BOOKED" ||
                      selectedBooking.status === "PENDING") &&
                      new Date(selectedBooking.package.startDate).getTime() - new Date().getTime() >
                        7 * 24 * 60 * 60 * 1000 && <Button type="cancel">ยกเลิกการจอง</Button>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>แสดง</span>
            <select
              value={pagination.limit}
              onChange={(event) => {
                const newLimit = Number(event.target.value);
                setPagination((prev) => ({ ...prev, limit: newLimit, currentPage: 1 }));
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
              setPagination((prev) => ({ ...prev, currentPage: page, limit }));
            }}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
