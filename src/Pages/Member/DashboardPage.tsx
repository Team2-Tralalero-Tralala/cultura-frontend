/**
 * คำอธิบาย: Component สำหรับหน้า Dashboard ของ Member
 * - แสดงข้อมูลสรุป (summary)
 * - แสดงกราฟการจองและรายได้ (graph)
 * - แสดงข้อมูลแพ็กเกจยอดนิยม 5 อันดับ
 * Input: -
 * Output: หน้า Dashboard ที่แสดงข้อมูลสรุปและกราฟ
 */
import { LineGraph } from "@/Components/LineGraph";
import React from "react";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, format } from "date-fns";
import {
  fetchMemberDashboardData,
  type MemberDashboardFilters,
  type MemberDashboardResponse,
} from "@/Libs/DashboardService";
import { BarChart } from "@/Components/Graph/BarChart";
import { CalendarTrigger } from "@/Components/calendar/InputCalendar/SetTypeCalendar/CalendarTrigger";

/**
 * คำอธิบาย: หน้า Dashboard ของ Member
 */
export function DashboardPage() {
  const [dashboardData, setDashboardData] = React.useState<MemberDashboardResponse>();
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
    let dates: Date[] = [];

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
        dates = [startDate, endDate];
        break;
      }
      case "monthly": {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        // Only select the current month
        dates = [startDate];
        break;
      }
      case "yearly": {
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        // Only select the current year
        dates = [startDate];
        break;
      }
    }
    return { start: startDate, end: endDate, dates: dates, periodType: periodType };
  };

  const initialDateRange = calculateInitialDateRange("weekly");

  const [revenueDateRange, setRevenueDateRange] = React.useState<{
    start: Date;
    end: Date;
    dates: Date[];
    periodType: PeriodType;
  }>(initialDateRange);

  const [bookingDateRange, setBookingDateRange] = React.useState<{
    start: Date;
    end: Date;
    dates: Date[];
    periodType: PeriodType;
  }>(initialDateRange);

  const [packageDateRange, setPackageDateRange] = React.useState<{
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

      const filters: MemberDashboardFilters = {
        bookingPeriodType: bookingDateRange.periodType,
        bookingDates: getFormattedDates(bookingDateRange.dates),
        revenuePeriodType: revenueDateRange.periodType,
        revenueDates: getFormattedDates(revenueDateRange.dates),
        packagePeriodType: packageDateRange.periodType,
        packageDates: getFormattedDates(packageDateRange.dates),
      };
      const response = await fetchMemberDashboardData(filters);
      setDashboardData(response);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [bookingDateRange, revenueDateRange, packageDateRange]);

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
   * คำอธิบาย: อัปเดต state ช่วงเวลาสำหรับรายได้เมื่อมีการเปลี่ยนแปลงจาก CalendarTrigger
   * Input: range (Object containing start, end, dates, mode)
   * Output: - (อัปเดต state revenueDateRange)
   */
  const handleRevenueDateChange = (range: {
    start: Date;
    end: Date;
    dates: Date[];
    mode: PeriodType;
  }) => {
    setRevenueDateRange({
      start: range.start,
      end: range.end,
      dates: range.dates,
      periodType: range.mode,
    });
  };

  /**
   * คำอธิบาย: อัปเดต state ช่วงเวลาสำหรับแพ็กเกจเมื่อมีการเปลี่ยนแปลงจาก CalendarTrigger
   * Input: range (Object containing start, end, dates, mode)
   * Output: - (อัปเดต state packageDateRange)
   */
  const handlePackageDateChange = (range: {
    start: Date;
    end: Date;
    dates: Date[];
    mode: PeriodType;
  }) => {
    setPackageDateRange({
      start: range.start,
      end: range.end,
      dates: range.dates,
      periodType: range.mode,
    });
  };

  return (
    <div className="space-y-4 h-full">
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
          <h1 className="font-bold text-xl mb-4">รายงานและสถิติ</h1>
          <div>
            <div className="bg-white pl-8 pr-8 pt-6 pb-6 rounded-auth-card mb-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-xl">สถิติการจองแพ็กเกจ</h2>
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
                    <p className="text-base mb-2 font-semibold">แพ็กเกจทั้งหมด</p>
                    <div className="flex justify-between w-full items-end gap-2">
                      <p className="text-2xl font-bold">
                        {" "}
                        {(dashboardData.summary?.totalPackages ?? 0).toLocaleString()}
                      </p>
                      <p className="font-bold text-base">แพ็กเกจ</p>
                    </div>
                  </div>
                  <div className="border-2 border-gray-200 rounded-2xl p-6 flex flex-col justify-end">
                    <p className="text-base mb-2 font-semibold">รายได้ทั้งหมด</p>
                    <div className="flex justify-between w-full items-end gap-2">
                      <p className="text-2xl font-bold">
                        {(dashboardData.summary?.totalRevenue ?? 0).toLocaleString()}
                      </p>
                      <p className="font-bold text-base">บาท</p>
                    </div>
                  </div>
                  <div className="border-2 border-gray-200 rounded-2xl p-6 flex flex-col justify-end">
                    <p className="text-base mb-2 font-semibold">การจองสำเร็จ</p>
                    <div className="flex justify-between w-full items-end gap-2">
                      <p className="text-2xl font-bold">
                        {(dashboardData.summary?.successBookingCount ?? 0).toLocaleString()}
                      </p>
                      <p className="font-bold text-base">ครั้ง</p>
                    </div>
                  </div>
                  <div className="border-2 border-gray-200 rounded-2xl p-6 flex flex-col justify-end">
                    <p className="text-base mb-2 font-semibold">ยกเลิกการจอง</p>
                    <div className="flex justify-between w-full items-end gap-2">
                      <p className="text-2xl font-bold">
                        {(dashboardData.summary?.cancelledBookingCount ?? 0).toLocaleString()}
                      </p>
                      <p className="font-bold text-base">ครั้ง</p>
                    </div>
                  </div>
                </div>
                <div>
                  <LineGraph
                    className="w-full h-[350px] border-2 border-gray-200 rounded-2xl p-6"
                    labels={dashboardData.graph.bookingCountGraph.labels}
                    data={dashboardData.graph.bookingCountGraph.data}
                    title="จำนวนการจองแพ็กเกจ"
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
            <div className="bg-white pl-8 pr-8 pt-6 pb-6 rounded-auth-card mb-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-xl ">รายได้จากการจองแพ็กเกจ</h2>
                <CalendarTrigger
                  mode={revenueDateRange.periodType}
                  dateRange={[revenueDateRange.start, revenueDateRange.end]}
                  dateList={revenueDateRange.dates}
                  onModeChange={(mode) => setRevenueDateRange(calculateInitialDateRange(mode))}
                  onChange={handleRevenueDateChange}
                />
              </div>
              <BarChart
                className="w-full h-[500px]"
                labels={dashboardData.graph.revenueGraph.labels}
                data={dashboardData.graph.revenueGraph.data}
                title=""
                labelX={
                  revenueDateRange.periodType === "weekly"
                    ? "วัน"
                    : revenueDateRange.periodType === "monthly"
                      ? "เดือน"
                      : "ปี"
                }
              />
            </div>
            <div className="bg-white pl-8 pr-8 pt-6 pb-6 rounded-auth-card mb-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-xl ">5 แพ็กเกจที่มีการจองสูงสุด</h2>
                <CalendarTrigger
                  mode={packageDateRange.periodType}
                  dateRange={[packageDateRange.start, packageDateRange.end]}
                  dateList={packageDateRange.dates}
                  onModeChange={(mode) => setPackageDateRange(calculateInitialDateRange(mode))}
                  onChange={handlePackageDateChange}
                />
              </div>
              <table className="w-full text-start">
                <thead>
                  <tr className="bg-[#4A816F] text-white rounded-t-lg">
                    <th className="py-3 px-4 text-left rounded-tl-lg w-[10%]">อันดับ</th>
                    <th className="py-3 px-4 text-left w-[80%]">ชื่อแพ็กเกจ</th>
                    <th className="py-3 px-4 text-left rounded-tr-lg w-[10%]">จำนวนการจอง</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.package?.topPackages &&
                  dashboardData.package.topPackages.length > 0 ? (
                    dashboardData.package.topPackages.map((packageItem, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-4 pl-8">{packageItem.rank}</td>
                        <td className="py-2 px-4 text-gray-800 font-medium">
                          {packageItem.name || "-"}
                        </td>
                        <td className="py-2 px-4 text-gray-700 text-center">
                          {packageItem.bookingCount?.toLocaleString() ?? 0} ครั้ง
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-500">
                        ไม่มีข้อมูลการจองในช่วงเวลานี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
