/*
 * คำอธิบาย : Component สำหรับหน้ารายงาน (Dashboard) ของ Super Admin
 * แสดงข้อมูลสรุปและรายงานต่างๆ ของระบบ ประกอบด้วย:
 * 1. ข้อมูลสรุป (summary) - แพ็กเกจรวม ชุมชนรวม ค่าจองสำเร็จ ค่าจองยกเลิก
 * 2. ข้อมูลกราฟ (graph) - แสดงกราฟการจองตามวันที่
 * 3. ข้อมูลสถิติ (stats) - แสดงสถิติตามจังหวัด
 * ใช้ร่วมกับ Service สำหรับดึงข้อมูล Dashboard
 */
import { WeeklyDate } from "@/Components/calendar/WeeklyDate";
import { Combobox } from "@/Components/ComboBox";
import FiltersForCM from "@/Components/Filters/Communities/FiltersForCM";
import { LineGraph } from "@/Components/LineGraph";
import { PieGraph } from "@/Components/PieGraph";
import SearchBarTable from "@/Components/Search/SearchBarTable";
import DataTable from "@/Components/Tables/DataTable";
import type { Column, Pagination } from "@/Components/Tables/Types";
import type { DashboardResponse } from "@/Services/dashboard-service";
import {
  fetchDashboardData,
  type DashboardFilters,
  type DashboardStatsItem,
} from "@/Services/dashboard-service";
import { Icon } from "@iconify/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import axios from "axios";
import React from "react";

/*
 * คำอธิบาย : คอลัมน์ตารางสำหรับแสดงสถิติตามจังหวัด
 */
const statsColumns: Column<DashboardStatsItem>[] = [
  {
    key: "province",
    header: "จังหวัด",
    className: "text-left",
    render: (row) => <div>{row.province}</div>,
  },
  {
    key: "communityCount",
    header: "จำนวนวิสหกิจชุมชน",
    className: "text-right",
    render: (row) => <div>{row.communityCount}</div>,
  },
  {
    key: "packageCount",
    header: "จำนวนแพ็กเกจ",
    className: "text-right",
    render: (row) => <div>{row.packageCount}</div>,
  },
  {
    key: "bookingCount",
    header: "การจองทั้งหมด",
    className: "text-right",
    render: (row) => <div>{row.bookingCount}</div>,
  },
  {
    key: "successBookingCount",
    header: "การจองสําเร็จ",
    className: "text-right",
    render: (row) => <div className="text-green-600">{row.successBookingCount}</div>,
  },
  {
    key: "cancelledBookingCount",
    header: "ยกเลิกการจอง",
    className: "text-right",
    render: (row) => <div className="text-red-600">{row.cancelledBookingCount}</div>,
  },
];

/*
 * คำอธิบาย : Interface สำหรับข้อมูลภูมิศาสตร์ของประเทศไทย
 */
interface GeographyItem {
  provinceNameTh: string;
  districtNameTh: string;
  subdistrictNameTh: string;
  postalCode: string;
}

/*
 * คำอธิบาย : ฟังก์ชันโหลดข้อมูลจังหวัดทั้งหมดในประเทศไทย
 * Input : ไม่มี
 * Output : Array ของจังหวัด (province names)
 */
async function loadProvinces(): Promise<string[]> {
  try {
    const response = await axios.get(
      "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/geography.json"
    );
    const data: GeographyItem[] = response.data;
    const provincesSet = new Set<string>();
    data.forEach((item) => {
      provincesSet.add(item.provinceNameTh);
    });
    return Array.from(provincesSet).sort();
  } catch (error) {
    console.error("Error loading provinces:", error);
    return [];
  }
}

/*
 * คำอธิบาย : Component หลักสำหรับหน้า "รายงาน"
 * ใช้จัดการ state ของข้อมูล Dashboard การโหลดข้อมูล
 * รวมถึงการแสดงข้อมูลสรุป กราฟ และสถิติ
 */
export default function DashboardPage() {
  // ====== state ข้อมูล ======
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [dashboardData, setDashboardData] = React.useState<DashboardResponse | null>(null);

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

  // ====== state สำหรับ Accordion ======
  const [expanded, setExpanded] = React.useState<string | false>("stats-panel");

  // ====== state สำหรับ Filters ======
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>("");
  const [filterRegion, setFilterRegion] = React.useState<string>("all");
  const [selectedProvince, setSelectedProvince] = React.useState<string>("");
  const [provinceOptions, setProvinceOptions] = React.useState<{ value: string; label: string }[]>(
    []
  );
  const [pagination, setPagination] = React.useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  // ตัวเลือกภูมิภาค
  const regionOptions = React.useMemo(
    () => [
      { label: "ทั้งหมด", value: "all" },
      { label: "ภาคเหนือ", value: "north" },
      { label: "ภาคกลาง", value: "central" },
      { label: "ภาคตะวันออกเฉียงเหนือ", value: "northeast" },
      { label: "ภาคใต้", value: "south" },
    ],
    []
  );

  // ====== โหลดข้อมูลจังหวัด ======
  /*
   * คำอธิบาย : โหลดรายชื่อจังหวัดทั้งหมดของประเทศไทย
   * Input : ไม่มี
   * Output : อัพเดท provinceOptions
   */
  React.useEffect(() => {
    async function fetchProvinces() {
      try {
        const provinces = await loadProvinces();
        setProvinceOptions(provinces.map((name) => ({ value: name, label: name })));
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    }
    fetchProvinces();
  }, []);

  // ====== ปิดปฏิทินเมื่อคลิกข้างนอก ======
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

  // ====== Debounce search query ======
  /*
   * คำอธิบาย : หน่วงเวลา search query 1 วินาที
   * Input : ไม่มี
   * Output : อัพเดท debouncedSearchQuery เมื่อ searchQuery ไม่เปลี่ยนแปลงเป็นเวลา 1 วินาที
   */
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // ====== โหลดข้อมูล ======
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

  /*
   * คำอธิบาย : ดึงข้อมูล Dashboard จาก API
   * Input : ไม่มี
   * Output :
   *    - อัพเดท state ของ dashboardData และ pagination
   *    - หากเกิดข้อผิดพลาดจะเซ็ต errorMessage
   */
  const fetchData = React.useCallback(async () => {
    const [startDate, endDate] = dateRange;
    if (!startDate || !endDate) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const dateStart = formatDateToString(startDate);
      const dateEnd = formatDateToString(endDate);

      const filters: DashboardFilters = {
        dateStart,
        dateEnd,
        page: pagination.currentPage,
        limit: pagination.limit,
        groupBy: "day",
        province: selectedProvince || undefined,
        region: filterRegion !== "all" ? filterRegion : undefined,
        search: debouncedSearchQuery || undefined,
      };

      const data = await fetchDashboardData(filters);
      setDashboardData(data);

      // อัพเดท pagination จาก API response
      if (data.stats.pagination) {
        setPagination(data.stats.pagination as Pagination);
      }
    } catch (e: any) {
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [
    dateRange,
    pagination.currentPage,
    pagination.limit,
    selectedProvince,
    filterRegion,
    debouncedSearchQuery,
  ]);

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
   * คำอธิบาย : ควบคุมการขยาย/ย่อของ Accordion
   * Input : panel (string) — รหัสของ panel ที่ต้องการเปิด/ปิด
   * Output : อัพเดท state expanded เพื่อควบคุมการเปิด/ปิด Accordion
   */
  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) =>
      setExpanded(isExpanded ? panel : false);

  /*
   * คำอธิบาย : รีเซ็ต pagination เมื่อมีการเปลี่ยนแปลง filters
   * Input : ไม่มี
   * Output : อัพเดท currentPage เป็น 1
   */
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [debouncedSearchQuery, filterRegion, selectedProvince, dateRange]);

  /*
   * คำอธิบาย : ดึงข้อมูลเมื่อมีการเปลี่ยนแปลง filters หรือ pagination
   * Input : ไม่มี
   * Output : ไม่มี
   */
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4 h-full">
      <h2 className="text-sm">รายงาน</h2>
      <div className="flex flex-col gap-2 w-full rounded-lg p-4 h-full">
        <div className="flex items-center justify-between">
          <h1 className="text-xl">รายงาน</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
          </div>
        ) : errorMessage ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600">{errorMessage}</div>
          </div>
        ) : dashboardData ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 flex flex-col justify-end">
                  <p className="text-sm text-gray-500 mb-2">แพ็กเกจทั้งหมด</p>
                  <div className="flex justify-between w-full items-end gap-2">
                    <p className="text-2xl font-bold">
                      {dashboardData.summary.totalPackages.toLocaleString()}
                    </p>
                    <p className="font-bold">แพ็กเกจ</p>
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 flex flex-col justify-end">
                  <p className="text-sm text-gray-500 mb-2">ชุมชนทั้งหมด</p>
                  <div className="flex justify-between w-full items-end gap-2">
                    <p className="text-2xl font-bold">
                      {dashboardData.summary.totalCommunities.toLocaleString()}
                    </p>
                    <p className="font-bold">ชุมชน</p>
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 flex flex-col justify-end">
                  <p className="text-sm text-gray-500 mb-2">การจองสำเร็จ</p>
                  <div className="flex justify-between w-full items-end gap-2">
                    <p className="text-2xl font-bold">
                      {dashboardData.summary.successBookingCount.toLocaleString()}
                    </p>
                    <p className="font-bold">ครั้ง</p>
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 flex flex-col justify-end">
                  <p className="text-sm text-gray-500 mb-2">ยกเลิกการจอง</p>
                  <div className="flex justify-between w-full items-end gap-2">
                    <p className="text-2xl font-bold">
                      {dashboardData.summary.cancelledBookingCount.toLocaleString()}
                    </p>
                    <p className="font-bold">ครั้ง</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">จำนวนการจองแพ็กเกจทั้งหมด</h3>
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
                  labels={dashboardData.graph.labels}
                  data={dashboardData.graph.data}
                  title=""
                />
              </div>
            </div>

            {/* Statistics Accordion */}
            <Accordion
              className="!shadow-sm !rounded-lg !border-0"
              expanded={expanded === "stats-panel"}
              onChange={handleAccordionChange("stats-panel")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="stats-panel-content"
                id="stats-panel-header"
                className="!rounded-t-lg"
              >
                <h2 className="text-xl font-bold">สถิติ</h2>
              </AccordionSummary>
              <AccordionDetails className="space-y-4 ">
                {/* Filters and Controls */}
                <div className="flex items-center justify-between gap-3 w-full mb-4 px-4">
                  <div className="flex-1 max-w-md">
                    <SearchBarTable
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Icon icon="mdi:printer-outline" className="w-5 h-5" />
                    <span>พิมพ์รายงาน</span>
                  </button>
                </div>

                <div className="flex justify-between gap-4 px-4">
                  <div className="flex flex-row gap-4 items-center">
                    <span className="text-sm font-medium">ภูมิภาค</span>
                    <FiltersForCM
                      options={regionOptions}
                      selected={filterRegion}
                      onChange={setFilterRegion}
                    />
                  </div>
                  <div className="flex flex-row gap-4 items-center">
                    {/* Province Combobox */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">จังหวัด</span>
                      <div className="w-60">
                        <Combobox
                          title="จังหวัด"
                          value={selectedProvince}
                          items={provinceOptions}
                          onChange={(value) => setSelectedProvince(value)}
                        />
                      </div>
                    </div>

                    {/* Calendar Trigger */}
                    <div className="relative" ref={calendarRef2}>
                      <button
                        type="button"
                        onClick={() => setShowCalendar2(!showCalendar2)}
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
                </div>

                <div className="p-4 mx-4 space-y-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  {/* Title and Date Range */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                      ข้อมูลจังหวัดทั้งหมดในช่วง {formatDateToString(dateRange[0])} -{" "}
                      {formatDateToString(dateRange[1])}
                    </h3>
                  </div>

                  {/* Data Table */}
                  <DataTable<DashboardStatsItem>
                    data={dashboardData.stats.data}
                    getKey={(row) => row.province}
                    columns={statsColumns}
                    pageSizeOptions={[10, 30, 50]}
                    onPageChange={(page) => {
                      setPagination((prev) => ({ ...prev, currentPage: page }));
                    }}
                    onPageSizeChange={(pageSize) => {
                      setPagination((prev) => ({ ...prev, currentPage: 1, limit: pageSize }));
                    }}
                    pagination={dashboardData.stats.pagination as Pagination}
                    isLoading={isLoading}
                  />

                  {/* Pie Graph Title */}
                  <div className="mb-4 mt-8">
                    <h3 className="text-lg font-semibold">
                      แผนภูมิวงกลม แสดงข้อมูลของจังหวัด
                      {selectedProvince ? ` ${selectedProvince}` : "ทั้งหมด"} ในช่วง วันที่{" "}
                      {formatDateToString(dateRange[0])} - {formatDateToString(dateRange[1])}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      จำนวนวิสาหกิจชุมชน: {dashboardData.summary.totalCommunities.toLocaleString()} ชุมชน
                    </p>
                    <p className="text-sm text-gray-600">
                      จำนวนแพ็กเกจ: {dashboardData.summary.totalPackages.toLocaleString()} แพ็กเกจ
                    </p>
                  </div>

                  <PieGraph
                    successCount={dashboardData.summary.successBookingCount}
                    cancelledCount={dashboardData.summary.cancelledBookingCount}
                    title=""
                    className="w-full h-64"
                  />
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        ) : null}
      </div>

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
    </div>
  );
}
