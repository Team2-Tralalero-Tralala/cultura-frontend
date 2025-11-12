/**
 * คำอธิบาย: component สำหรับหน้ารายของ Admin
 * แสดงข้อมูลสรุปต่างๆประกอบด้วย
 * 1. ข้อมูลสรุป (summary) - แพ็กเกจทั้งหมด รายได้ทั้งหมด การจองสำเร็จ ยกเลิกการจอง
 * 2. ข้อมูลกราฟ (graph) - แสดงกราฟการจองและรายได้ตามวันที่
 * 3. ข้อมูลแพ็กเกจ 20 อันดับที่ยอดจองเยอะที่สุกในชุมชม
 * ใช้ร่วมกับ Service สำหรับดึงข้อมูล Dashboard
 */
import { LineGraph } from "@/Components/LineGraph";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import React from "react";
import {
  fetchAdminDashboardData,
  type AdminDashboardFilters,
  type AdminDashboardResponse,
} from "@/Services/dashboard-service";
import { BarChart } from "@/Components/Graph/BarChart";
import { Icon } from "@iconify/react";
import { WeeklyDate } from "@/Components/calendar/WeeklyDate";

/**
 * Component: DashboardPage
 * วัตถุประสงค์: ใช้สำหรับแสดงข้อมูลสรุปผล Dashboard ของผู้ดูแลชุมชน
 */
export function DashboardPage() {
  const [dashboardData, setDashboardData] = React.useState<AdminDashboardResponse>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  // กำหนดช่วงวันที่เริ่มต้นเป็นสัปดาห์ปัจจุบัน
  const getCurrentWeek = React.useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = วันอาทิตย์, 6 = วันเสาร์
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // ปรับให้เป็นวันจันทร์

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return [startOfWeek, endOfWeek] as [Date, Date];
  }, []);

  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>(() =>
    getCurrentWeek()
  );
  const [showCalendar, setShowCalendar] = React.useState<boolean>(false);
  const [showCalendar2, setShowCalendar2] = React.useState<boolean>(false);
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const calendarRef2 = React.useRef<HTMLDivElement>(null);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับแปลง Date เป็น string รูปแบบ YYYY-MM-DD
   * Input : date (Date | null) - วันที่ที่ต้องการแปลง
   * Output : string - วันที่ในรูปแบบ YYYY-MM-DD หรือ string ว่างถ้า date เป็น null
   */
  const formatDateToString = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  /**
   * ฟังก์ชัน fetchData
   * คำอธิบาย : ดึงข้อมูล Dashboard จาก API โดยใช้ช่วงวันที่ที่เลือก
   * Input : ไม่มี
   * Output :
   *   - เซ็ตข้อมูลใน state dashboardData
   *   - เซ็ต errorMessage เมื่อเกิดข้อผิดพลาด
   */
  const fetchData = React.useCallback(async () => {
    const [startDate, endDate] = dateRange;
    if (!startDate || !endDate) return;
    console.log(startDate, endDate);
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const dateStart = formatDateToString(startDate);
      const dateEnd = formatDateToString(endDate);

      const filters: AdminDashboardFilters = {
        dateStart,
        dateEnd,
        groupBy: "day",
      };

      const data = await fetchAdminDashboardData(filters);
      setDashboardData(data);
    } catch (e: any) {
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  /*
   * คำอธิบาย : จัดการเมื่อมีการเลือกช่วงวันที่ครบ
   * Input : start (Date) - วันที่เริ่มต้น, end (Date) - วันที่สิ้นสุด
   * Output : ปิดปฏิทินหลังจากเลือกครบ
   */
  const handleRangeCommit = (start: Date, end: Date) => {
    setDateRange([start, end]);
    setShowCalendar(false);
    setShowCalendar2(false);
  };

  /*
   * คำอธิบาย : ปิดปฏิทินเมื่อคลิกภายนอก
   * Input : ไม่มี
   * Output : ตั้งค่า showCalendar และ showCalendar2 เป็น false
   */
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (calendarRef2.current && !calendarRef2.current.contains(event.target as Node)) {
        setShowCalendar2(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  /*
   * คำอธิบาย : โหลดข้อมูลใหม่เมื่อมีการเปลี่ยนแปลงวันที่
   * Input : ไม่มี
   * Output : ไม่มี
   */
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4 h-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
        </div>
      ) : errorMessage ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">{errorMessage}</div>
        </div>
      ) : dashboardData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col justify-end">
                <p className="text-base mb-2 font-semibold">แพ็กเกจทั้งหมด</p>
                <div className="flex justify-between w-full items-end gap-2">
                  <p className="text-2xl font-bold">
                    {dashboardData.summary.totalPackages.toLocaleString()}
                  </p>
                  <p className="font-bold text-base">แพ็กเกจ</p>
                </div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col justify-end">
                <p className="text-base mb-2 font-semibold">รายได้ทั้งหมด</p>
                <div className="flex justify-between w-full items-end gap-2">
                  <p className="text-2xl font-bold">
                    {dashboardData.summary.totalRevenue.toLocaleString()}
                  </p>
                  <p className="font-bold text-base">บาท</p>
                </div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col justify-end">
                <p className="text-base mb-2 font-semibold">การจองสำเร็จ</p>
                <div className="flex justify-between w-full items-end gap-2">
                  <p className="text-2xl font-bold">
                    {dashboardData.summary.successBookingCount.toLocaleString()}
                  </p>
                  <p className="font-bold text-base">ครั้ง</p>
                </div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col justify-end">
                <p className="text-base mb-2 font-semibold">ยกเลิกการจอง</p>
                <div className="flex justify-between w-full items-end gap-2">
                  <p className="text-2xl font-bold">
                    {dashboardData.summary.cancelledBookingCount.toLocaleString()}
                  </p>
                  <p className="font-bold text-base">ครั้ง</p>
                </div>
              </div>
            </div>
            {/* total package */}
            <div className="flex flex-col w-full p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">จำนวนการจองแพ็กเกจทั้งหมด</h2>
                <div className="relative" ref={calendarRef}>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Icon icon="quill:calendar" className="w-5 h-5" />
                    <span className="text-sm">
                      {dateRange[0] && dateRange[1]
                        ? `${formatDateToString(dateRange[0])} - ${formatDateToString(
                            dateRange[1]
                          )}`
                        : "เลือกช่วงวันที่"}
                    </span>
                  </button>

                  {showCalendar && (
                    <div className="absolute right-0 top-full mt-2 z-50">
                      <WeeklyDate
                        value={dateRange}
                        onChange={setDateRange}
                        onRangeCommit={handleRangeCommit}
                      />
                    </div>
                  )}
                </div>
              </div>
              <LineGraph
                className="w-full h-64"
                labels={dashboardData.graph.bookingCountGraph.labels}
                data={dashboardData.graph.bookingCountGraph.data}
                title=""
              />
            </div>
          </div>
          {/* total revenue */}
          <div className="flex flex-col w-full bg-white p-6  border-2 border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">รายได้จากแพ็กเกจทั้งหมด</h2>
              <div className="relative" ref={calendarRef2}>
                <button
                  type="button"
                  onClick={() => setShowCalendar2(!showCalendar2)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Icon icon="quill:calendar" className="w-5 h-5" />
                  <span className="text-sm">
                    {dateRange[0] && dateRange[1]
                      ? `${formatDateToString(dateRange[0])} - ${formatDateToString(dateRange[1])}`
                      : "เลือกช่วงวันที่"}
                  </span>
                </button>

                {showCalendar2 && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <WeeklyDate
                      value={dateRange}
                      onChange={setDateRange}
                      onRangeCommit={handleRangeCommit}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="pl-10 pr-10">
              <BarChart
                className="w-full h-64"
                labels={dashboardData.graph.revenueGraph.labels}
                data={dashboardData.graph.revenueGraph.data}
                title=""
              />
            </div>
          </div>
          <Accordion className="!border-2 !border-gray-200 !rounded-lg shadow-sm p-2">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <h2 className="text-2xl font-semibold">20 แพ็กเกจที่มีการจองสูงสุด</h2>
            </AccordionSummary>

            <AccordionDetails>
              <div className="overflow-x-auto">
                <table className="w-full text-start">
                  <thead>
                    <tr className="bg-[#4A816F] text-white rounded-t-lg">
                      <th className="py-3 px-4 text-left rounded-tl-lg w-[10%]">อันดับ</th>
                      <th className="py-3 px-4 text-left w-[80%]">ชื่อแพ็กเกจ</th>
                      <th className="py-3 px-4 text-left rounded-tr-lg w-[10%]">จำนวนการจอง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.package.topPackages &&
                    dashboardData.package.topPackages.length > 0 ? (
                      dashboardData.package.topPackages.map((pkg, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-2 px-4 pl-8">{pkg.rank}</td>
                          <td className="py-2 px-4 text-gray-800 font-medium">{pkg.name || "-"}</td>
                          <td className="py-2 px-4 text-gray-700 text-center">
                            {pkg.bookingCount?.toLocaleString() ?? 0} ครั้ง
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
            </AccordionDetails>
          </Accordion>
        </div>
      ) : null}
    </div>
  );
}
