/**
 * คำอธิบาย: หน้า Dashboard ของ Tourist
 * ใช้ร่วมกับ Service สำหรับดึงข้อมูล Dashboard
 */
import LineGraph from "@/Components/LineGraph";
import React from "react";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, format } from "date-fns";
import {
  fetchTouristDashboardData,
  type TouristDashboardFilters,
  type TouristDashboardResponse,
} from "@/Libs/DashboardService";
import { CalendarTrigger } from "@/Components/calendar/InputCalendar/SetTypeCalendar/CalendarTrigger";
import NavbarTourist from "@/Components/NavbarTourist";
import Footer from "@/Components/Footer";
import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";

/**
 * คำอธิบาย: Component สำหรับหน้า Dashboard (Tourist)
 * Input: -
 * Output: JSX.Element
 */
export function DashboardPage() {
  const [dashboardData, setDashboardData] = React.useState<TouristDashboardResponse>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  type PeriodType = "weekly" | "monthly" | "yearly";

  /**
   * คำอธิบาย: คำนวณช่วงวันที่เริ่มต้นตามประเภทช่วงเวลา (รายสัปดาห์, รายเดือน, รายปี)
   * Input: periodType (PeriodType) - ประเภทของช่วงเวลาที่ต้องการคำนวณ
   * Output: Object ที่ประกอบด้วยวันเริ่มต้น (start), วันสิ้นสุด (end), รายการวันที่ (dates), และประเภทช่วงเวลา (periodType)
   */
  const calculateInitialDateRange = (periodType: PeriodType) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let dateList: Date[] = [];

    switch (periodType) {
      case "weekly": {
        startDate = new Date(now);
        const dayOfWeek = startDate.getDay();
        const difference = startDate.getDate() - dayOfWeek; // Start of week (Sunday)
        startDate.setDate(difference);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
        endDate.setHours(23, 59, 59, 999);
        dateList = [startDate, endDate];
        break;
      }
      case "monthly": {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        dateList = [startDate];
        break;
      }
      case "yearly": {
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        dateList = [startDate];
        break;
      }
    }
    return { start: startDate, end: endDate, dates: dateList, periodType: periodType };
  };

  const initialDateRange = calculateInitialDateRange("weekly");

  const [bookingDateRange, setBookingDateRange] = React.useState<{
    start: Date;
    end: Date;
    dates: Date[];
    periodType: PeriodType;
  }>(initialDateRange);

  /**
   * คำอธิบาย: ดึงข้อมูล Dashboard จาก API ตาม filter ที่กำหนด
   * Input: - (ใช้ state ภายใน ฟังก์ชัน)
   * Output: - (อัปเดต state dashboardData)
   */
  const fetchDashboardData = React.useCallback(async () => {
    try {
      setIsLoading(true);

      /**
       * คำอธิบาย: แปลงวันที่เป็น format yyyy-MM-dd และเรียงลำดับ
       * Input: dates (Date[]) - รายการวันที่
       * Output: Array<string> - รายการวันที่ที่ถูก format และเรียงลำดับ
       */
      const getFormattedDates = (dates: Date[]) => {
        const uniqueDates = Array.from(new Set(dates.map((date) => format(date, "yyyy-MM-dd"))));
        return uniqueDates.sort();
      };

      const filters: TouristDashboardFilters = {
        bookingPeriodType: bookingDateRange.periodType,
        bookingDates: getFormattedDates(bookingDateRange.dates),
      };
      const response = await fetchTouristDashboardData(filters);
      setDashboardData(response);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [bookingDateRange]);

  /**
   * คำอธิบาย: ดึงข้อมูล Dashboard ทุกครั้งที่ fetchDashboardData เปลี่ยนแปลง
   * Input: - (ใช้ fetchDashboardData)
   * Output: - (อัปเดต state dashboardData)
   */
  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * คำอธิบาย: อัปเดต state ช่วงเวลาสำหรับการจองเมื่อมีการเปลี่ยนแปลงจาก CalendarTrigger
   * Input: range (Object containing start, end, dates, mode)
   * Output: - (อัปเดต state bookingDateRange)
   */
  const handleBookingDateChange = (range: {
    start: Date;
    end: Date;
    dates: Date[];
    mode: PeriodType;
  }) => {
    setBookingDateRange({
      start: range.start,
      end: range.end,
      dates: range.dates,
      periodType: range.mode,
    });
  };

  /**
   * คำอธิบาย: แปลง status เป็นภาษาไทย
   * Input: status (string)
   * Output: string (สถานะภาษาไทย)
   */
  const formatStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "รอยืนยัน";
      case "BOOKED":
        return "จองสำเร็จ";
      case "REJECTED":
        return "ถูกปฏิเสธ";
      case "REFUND_PENDING":
        return "รอคืนเงิน";
      case "REFUNDED":
        return "คืนเงินแล้ว";
      case "REFUND_REJECTED":
        return "ปฏิเสธคืนเงิน";
      default:
        return status || "-";
    }
  };

  return (
    <div className="space-y-4 h-full bg-white">
      {!dashboardData && isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
        </div>
      ) : !dashboardData && errorMessage ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">{errorMessage}</div>
        </div>
      ) : dashboardData ? (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg pointer-events-none">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 opacity-50"></div>
            </div>
          )}
          <NavbarTourist />
          <div className="container mx-auto px-6 py-8">
            <BreadcrumbNavigation
              current={{
                label: "หน้ารายงาน",
                to: `/tourist/dashboard`,
              }}
            />
            <h1 className="font-bold text-[40px]">รายงาน (Dashboard)</h1>
          </div>
          <hr />
          <div className="container mx-auto px-6 py-8">
            <div>
              <div className="bg-white p-4 rounded-auth-card mb-5 border-2">
                <div className="flex justify-end items-center mb-3">
                  <CalendarTrigger
                    mode={bookingDateRange.periodType}
                    dateRange={[bookingDateRange.start, bookingDateRange.end]}
                    dateList={bookingDateRange.dates}
                    onModeChange={(mode) => setBookingDateRange(calculateInitialDateRange(mode))}
                    onChange={handleBookingDateChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-gray-200 rounded-2xl p-6 flex flex-col justify-end">
                      <p className="text-base mb-2 font-semibold">แพ็กเกจทั้งหมดที่จอง</p>
                      <div className="flex justify-between w-full items-end gap-2">
                        <p className="text-2xl font-bold">
                          {" "}
                          {(dashboardData.summary?.totalBooking ?? 0).toLocaleString()}
                        </p>
                        <p className="font-bold text-base">แพ็กเกจ</p>
                      </div>
                    </div>
                    <div className="border-2 border-gray-200 rounded-2xl p-6 flex flex-col justify-end">
                      <p className="text-base mb-2 font-semibold">แพ็กเกจที่จองสำเร็จ</p>
                      <div className="flex justify-between w-full items-end gap-2">
                        <p className="text-2xl font-bold">
                          {(dashboardData.summary?.successBookingCount ?? 0).toLocaleString()}
                        </p>
                        <p className="font-bold text-base">แพ็กเกจ</p>
                      </div>
                    </div>
                    <div className="border-2 border-gray-200 rounded-2xl p-6 flex flex-col justify-end">
                      <p className="text-base mb-2 font-semibold">แพ็กเกจที่ยกเลิก</p>
                      <div className="flex justify-between w-full items-end gap-2">
                        <p className="text-2xl font-bold">
                          {(dashboardData.summary?.cancelledBookingCount ?? 0).toLocaleString()}
                        </p>
                        <p className="font-bold text-base">แพ็กเกจ</p>
                      </div>
                    </div>
                    <div className="border-2 border-gray-200 rounded-2xl p-6 flex flex-col justify-end">
                      <p className="text-base mb-2 font-semibold">ยอดเงินรวมการจอง</p>
                      <div className="flex justify-between w-full items-end gap-2">
                        <p className="text-2xl font-bold">
                          {(dashboardData.summary?.totalSpend ?? 0).toLocaleString()}
                        </p>
                        <p className="font-bold text-base">บาท</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <LineGraph
                      className="w-full h-[350px] border-2 border-gray-200 rounded-2xl p-6"
                      labels={dashboardData.graph.bookingCountGraph.labels}
                      data={dashboardData.graph.bookingCountGraph.data}
                      title="ค่าใช้จ่ายในการจองแพ็กเกจ"
                      labelX={
                        bookingDateRange.periodType === "weekly"
                          ? "วัน"
                          : bookingDateRange.periodType === "monthly"
                            ? "เดือน"
                            : "ปี"
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white p-10 rounded-auth-card mb-5 border-2">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-xl ">แพ็กเกจที่จองล่าสุด</h2>
                </div>
                <table className="w-full text-start">
                  <thead>
                    <tr className="bg-[#00BF6A] text-white rounded-t-lg">
                      <th className="py-3 px-4 text-left w-[15%]">วันที่จอง</th>
                      <th className="py-3 px-4 text-left w-[45%]">ชื่อแพ็กเกจ</th>
                      <th className="py-3 px-4 text-left w-[15%]">จำนวนผู้จอง</th>
                      <th className="py-3 px-4 text-left w-[10%]">ราคา</th>
                      <th className="py-3 px-4 text-center w-[15%]">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.package?.lastBookingLists &&
                    dashboardData.package.lastBookingLists.length > 0 ? (
                      dashboardData.package.lastBookingLists.map((packages, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="pl-4">
                            {packages.bookingAt
                              ? new Date(packages.bookingAt).toLocaleString("th-TH", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "-"}
                          </td>
                          <td className="py-2 px-4 font-medium">{packages.package.name || "-"}</td>
                          <td className="pl-9">{packages.totalParticipant ?? 0} คน</td>
                          <td className="text-start">
                            {(
                              packages.package.price * packages.totalParticipant
                            ).toLocaleString() || 0}{" "}
                            บาท
                          </td>
                          <td className="py-2 px-4 text-center">{formatStatus(packages.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          ไม่มีข้อมูลการจองในช่วงเวลานี้
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      ) : null}
    </div>
  );
}
