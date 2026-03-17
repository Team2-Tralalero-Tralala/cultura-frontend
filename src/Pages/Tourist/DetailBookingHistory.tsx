/**
 * คำอธิบาย: หน้าแสดงประวัติการจองของนักท่องเที่ยว (Tourist)
 */
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import Button from "@/Components/Button";
import FilterDropdown from "@/Components/Filters/Tourists/FiltersForTR";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/Navbar/NavbarTourist";
import Pagination from "@/Components/Pagination/PaginationRoundedForCardPackage";
import { useEffect, useState } from "react";
import { getTouristBookingHistory, cancelBookingByTourist } from "@/Libs/BookingHistoryService";
import type { TouristBookingHistory } from "@/Types/BookingHistory";
import { useSearchParams, useNavigate } from "react-router-dom";
import ModalCancelBooking from "@/Components/Modal/ModalCancelBooking";
import { ModalAlert } from "@/Components/Modal/ModalAlert";

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
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const API_UPLOAD = API_URL.replace(/\/api\/?$/, "/");

  /**
   * คำอธิบาย: สร้าง URL ของรูปภาพเต็มรูปแบบจาก path อย่างปลอดภัย และจัดการ path ที่ซ้ำซ้อน
   * Input: fileName (ชื่อไฟล์หรือ path ของรูปภาพ)
   * Output: URL เต็มของรูปภาพที่พร้อมใช้งานสำหรับ <img>
   */
  const getImageUrl = (fileName?: string) => {
    if (!fileName) return "";
    if (fileName.startsWith("http")) return fileName;
    const baseUrl = API_URL.replace(/\/api\/?$/, "");
    const cleanedPath = fileName.replace(/^\/?uploads\//, "");
    return `${baseUrl}/uploads/${cleanedPath}`;
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useState(false);
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);

  /**
   * คำอธิบาย: จัดการการยืนยันการยกเลิกการจอง
   * Input: reason (string)
   * Output: void (เรียก API ยกเลิกการจองและรีเฟรชข้อมูล)
   */
  const handleConfirmCancel = async (touristRejectReason: string) => {
    if (!selectedBooking) return;

    try {
      await cancelBookingByTourist(selectedBooking.id, touristRejectReason);
      setIsCancelModalOpen(false);
      setIsSuccessAlertOpen(true);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setIsErrorAlertOpen(true);
    }
  };

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

  /**
   * คำอธิบาย: แปลงวันที่เป็นรูปแบบ "x เวลาที่แล้ว" (Time Ago)
   * Input: dateString (string)
   * Output: string (เวลาที่ผ่านไปแล้ว)
   */
  const timeAgo = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const timeIntervals = [
      { unit: "ปี", seconds: 31536000 },
      { unit: "เดือน", seconds: 2592000 },
      { unit: "วัน", seconds: 86400 },
      { unit: "ชั่วโมง", seconds: 3600 },
      { unit: "นาที", seconds: 60 },
      { unit: "วินาที", seconds: 1 },
    ];

    for (const interval of timeIntervals) {
      const quotient = Math.floor(diffInSeconds / interval.seconds);
      if (quotient > 0) {
        return `${quotient} ${interval.unit}`;
      }
    }
    return "เมื่อสักครู่";
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
                  className={`border-2 p-5 rounded-2xl cursor-pointer ${selectedBooking?.id === item.id ? "border-[#1DC9A0]" : "border-[#E5E7EB]"
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
                  <p className="font-bold">ราคา {formatPrice(item.package.price)} บาท</p>
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
                        src={getImageUrl(selectedBooking.package.packageFile[0].filePath)}
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
                  <div className=" justify-self-end">
                    {selectedBooking.isParticipate &&
                      new Date() > new Date(selectedBooking.package.dueDate) ? (
                      (!selectedBooking.feedbacks || selectedBooking.feedbacks.length === 0) && (
                        <Button
                          type="cancel"
                          onClick={() =>
                            navigate(`/tourist/booking-history/${selectedBooking.id}/feedback`)
                          }
                        >
                          ข้อเสนอแนะ
                        </Button>
                      )
                    ) : (
                      <div className="w-full">
                        {(selectedBooking.status === "BOOKED" ||
                          selectedBooking.status === "PENDING") &&
                          new Date(selectedBooking.package.startDate).getTime() -
                          new Date().getTime() >
                          7 * 24 * 60 * 60 * 1000 && (
                            <Button type="cancel" onClick={() => setIsCancelModalOpen(true)}>
                              ยกเลิกการจอง
                            </Button>
                          )}
                        {(selectedBooking.status === "REFUND_PENDING" ||
                          selectedBooking.status === "REFUNDED" ||
                          selectedBooking.status === "REFUND_REJECTED") && (
                            <Button
                              type="cancel"
                              onClick={() =>
                                navigate(`/tourist/cancel/booking/${selectedBooking.id}`)
                              }
                            >
                              รายละเอียดคำขอคืนเงิน
                            </Button>
                          )}
                      </div>
                    )}
                  </div>
                  {selectedBooking.feedbacks && selectedBooking.feedbacks.length > 0 && (
                    <div className="border border-[#E5E7EB] p-6 rounded-2xl shadow-sm">
                      <div className="flex flex-col gap-6">
                        {selectedBooking.feedbacks.map((feedback, index) => (
                          <div key={index} className="flex flex-col gap-4">
                            {/* Review Header */}
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl font-bold">
                                  {/* User Avatar Placeholder */}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-6 h-6"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <div className="font-bold text-lg">
                                  {/* User is viewing their own history, so we use 'คุณ' */}
                                  คุณ
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex text-black">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill={i < feedback.rating ? "currentColor" : "none"}
                                      stroke="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  ))}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {timeAgo(feedback.createdAt)}
                                </div>
                              </div>
                            </div>

                            {/* Review Content */}
                            <p className="text-gray-800 text-base leading-relaxed">
                              {feedback.message}
                            </p>

                            {/* Images */}
                            {feedback.feedbackImages && feedback.feedbackImages.length > 0 && (
                              <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
                                {feedback.feedbackImages.map((img) => (
                                  <img
                                    key={img.id}
                                    src={getImageUrl(img.image)}
                                    alt="feedback"
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                  />
                                ))}
                              </div>
                            )}

                            {/* Reply Section */}
                            {feedback.replyMessage && (
                              <div className="bg-gray-100 p-4 rounded-xl mt-2 flex gap-3">
                                {feedback.responder?.profileImage ? (
                                  <img
                                    src={getImageUrl(feedback.responder.profileImage)}
                                    alt="Responder"
                                    className="w-10 h-10 rounded-full object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-400 shrink-0 flex items-center justify-center text-white">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="w-6 h-6"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-gray-900">
                                      {feedback.responder?.fname
                                        ? `${feedback.responder.fname} ${feedback.responder.lname || ""}`
                                        : "ผู้ดูแล"}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {feedback.replyAt ? timeAgo(feedback.replyAt) : ""}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm leading-relaxed">
                                    {feedback.replyMessage}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Divider for multiple feedbacks */}
                            {index < selectedBooking.feedbacks.length - 1 && (
                              <hr className="border-gray-200 mt-4" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
      <ModalCancelBooking
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={(touristRejectReason) => handleConfirmCancel(touristRejectReason)}
      />
      <ModalAlert
        isOpen={isSuccessAlertOpen}
        type="success"
        role="tourist"
        onClose={() => {
          setIsSuccessAlertOpen(false);
          if (selectedBooking) {
            navigate(`/tourist/cancel/booking/${selectedBooking.id}`);
          }
        }}
        title="ยกเลิกการจองสําเร็จ"
        message="ตรวจสอบสถานะการคืนเงินได้ที่ประวัติการจอง"
      />
      <ModalAlert
        isOpen={isErrorAlertOpen}
        onClose={() => setIsErrorAlertOpen(false)}
        type="error"
        role="tourist"
        title="เกิดข้อผิดพลาด"
        message="ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่อีกครั้ง"
      />
    </div>
  );
}
