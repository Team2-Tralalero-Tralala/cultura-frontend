/*
 * คำอธิบาย : Service สำหรับดึงข้อมูล Dashboard ของ Super Admin
 * โดยดึงข้อมูลสรุป ข้อมูลกราฟ และสถิติต่างๆ ของระบบ
 */
import api from "@/Libs/api";

/*
 * คำอธิบาย : Type definition สำหรับข้อมูลสรุปของ Dashboard
 * หน้าที่ : กำหนดโครงสร้างข้อมูล summary
 */
export interface DashboardSummary {
  totalPackages: number;
  totalCommunities: number;
  successBookingCount: number;
  cancelledBookingCount: number;
}

/*
 * คำอธิบาย : Type definition สำหรับข้อมูลกราฟของ Dashboard
 * หน้าที่ : กำหนดโครงสร้างข้อมูล graph
 */
export interface DashboardGraph {
  labels: string[];
  data: number[];
}

/*
 * คำอธิบาย : Type definition สำหรับข้อมูลสถิติของแต่ละจังหวัด
 * หน้าที่ : กำหนดโครงสร้างข้อมูล stats.data
 */
export interface DashboardStatsItem extends Record<string, unknown> {
  province: string;
  communityCount: number;
  packageCount: number;
  bookingCount: number;
  successBookingCount: number;
  cancelledBookingCount: number;
}

/*
 * คำอธิบาย : Type definition สำหรับข้อมูลสถิติของ Dashboard
 * หน้าที่ : กำหนดโครงสร้างข้อมูล stats
 */
export interface DashboardStats {
  data: DashboardStatsItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}
/*
 * คำอธิบาย : Type definition สำหรับ response ของ Dashboard
 * หน้าที่ : กำหนดสัญญาโครงสร้างข้อมูลที่ใช้ทั้งฝั่งหน้าเว็บและบริการเรียกข้อมูล
 */
export interface DashboardResponse {
  summary: DashboardSummary;
  graph: DashboardGraph;
  stats: DashboardStats;
}

/*
 * คำอธิบาย : Interface สำหรับพารามิเตอร์การกรองข้อมูล Dashboard
 */
export interface DashboardFilters {
  dateStart: string;
  dateEnd: string;
  page?: number;
  limit?: number;
  groupBy?: "hour" | "day" | "week" | "month" | "year";
  province?: string;
  region?: string;
  search?: string;
}

/*
 * คำอธิบาย : ดึงข้อมูล Dashboard จาก API
 * Input :
 *   - filters (DashboardFilters) : พารามิเตอร์สำหรับดึงข้อมูลและกรองผลลัพธ์
 * Output :
 *    - คืนค่า Promise ของ DashboardResponse ที่ประกอบด้วยข้อมูล summary, graph และ stats
 */
export async function fetchDashboardData(filters: DashboardFilters): Promise<DashboardResponse> {
  const { dateStart, dateEnd, page, limit, groupBy, province, region, search } = filters;

  let url = `/super/dashboard?dateStart=${dateStart}&dateEnd=${dateEnd}`;

  if (page) url += `&page=${page}`;
  if (limit) url += `&limit=${limit}`;
  if (groupBy) url += `&groupBy=${groupBy}`;
  if (province) url += `&province=${encodeURIComponent(province)}`;
  if (region) url += `&region=${encodeURIComponent(region)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const res = await api.get(url, {
    withCredentials: true,
  });

  return res.data.data;
}
/*
 * คำอธิบาย : Type definition สำหรับข้อมูลสรุปของ Admin Dashboard
 * หน้าที่ : กำหนดโครงสร้างข้อมูล summary
 */
export interface AdminDashboardSummaryItem {
  totalPackages: number;
  totalRevenue: number;
  successBookingCount: number;
  cancelledBookingCount: number;
}
/*
 * คำอธิบาย : Type definition สำหรับข้อมูลแพ็กเกจของ Admin Dashboard
 * หน้าที่ : กำหนดโครงสร้างข้อมูล package
 */
export interface AdminDashboardPackage {
  data: AdminDashboardSummaryItem[];
  topPackages: {
    rank: number;
    name: string;
    bookingCount: number;
  }[];
}
/*
 * คำอธิบาย : Type definition สำหรับข้อมูลกราฟของ Dashboard
 * หน้าที่ : กำหนดโครงสร้างข้อมูล graph
 */
export interface AdminDashboardGraph {
  bookingCountGraph: {
    labels: string[];
    data: number[];
  };
  revenueGraph: {
    labels: string[];
    data: number[];
  };
}
/*
 * คำอธิบาย : Type definition สำหรับ response ของ Admin Dashboard
 * หน้าที่ : กำหนดสัญญาโครงสร้างข้อมูลที่ใช้ทั้งฝั่งหน้าเว็บและบริการเรียกข้อมูล
 */
export interface AdminDashboardResponse {
  summary: AdminDashboardSummaryItem;
  graph: AdminDashboardGraph;
  package: AdminDashboardPackage;
}
/*
 * คำอธิบาย : Interface สำหรับพารามิเตอร์การกรองข้อมูล Dashboard
 */
export interface AdminDashboardFilters {
  dateStart: string;
  dateEnd: string;
  groupBy?: "hour" | "day" | "week" | "month" | "year";
}
/*
 * คำอธิบาย : ดึงข้อมูล Dashboard จาก API
 * Input :
 *   - filters (DashboardFilters) : พารามิเตอร์สำหรับดึงข้อมูลและกรองผลลัพธ์
 * Output :
 *    - คืนค่า Promise ของ DashboardResponse ที่ประกอบด้วยข้อมูล summary, graph และ stats
 */
export async function fetchAdminDashboardData(
  filters: AdminDashboardFilters
): Promise<AdminDashboardResponse> {
  const { dateStart, dateEnd, groupBy } = filters;

  let url = `/admin/dashboard?dateStart=${dateStart}&dateEnd=${dateEnd}`;

  if (groupBy) url += `&groupBy=${groupBy}`;

  const res = await api.get(url, {
    withCredentials: true,
  });

  return res.data.data;
}
/*
 * คำอธิบาย : Type definition สำหรับพารามิเตอร์การกรองข้อมูล Dashboard
 */
type PeriodType = "weekly" | "monthly" | "yearly";
/*
 * คำอธิบาย : Interface สำหรับพารามิเตอร์การกรองข้อมูล Dashboard
 */
export interface MemberDashboardFilters {
  bookingPeriodType: PeriodType;
  bookingDates: string[];
  revenuePeriodType: PeriodType;
  revenueDates: string[];
  packagePeriodType: PeriodType;
  packageDates: string[];
}
/*
 * ฟังก์ชัน : fetchMemberDashboardData
 * คำอธิบาย : ดึงข้อมูล Dashboard จาก API
 * Input :
 *   - filters (MemberDashboardFilters) : พารามิเตอร์สำหรับดึงข้อมูลและกรองผลลัพธ์
 * Output :
 *    - คืนค่า Promise ของ AdminDashboardResponse ที่ประกอบด้วยข้อมูล summary, graph และ package
 */
export async function fetchMemberDashboardData(
  filters: MemberDashboardFilters
): Promise<AdminDashboardResponse> {
  const {
    bookingPeriodType,
    bookingDates,
    revenuePeriodType,
    revenueDates,
    packagePeriodType,
    packageDates,
  } = filters;

  const params = new URLSearchParams();
  if (Array.isArray(bookingDates)) {
    bookingDates.forEach((date) => params.append("bookingDates", date));
  }
  if (Array.isArray(revenueDates)) {
    revenueDates.forEach((date) => params.append("revenueDates", date));
  }
  if (Array.isArray(packageDates)) {
    packageDates.forEach((date) => params.append("packageDates", date));
  }
  params.append("bookingPeriodType", bookingPeriodType);
  params.append("revenuePeriodType", revenuePeriodType);
  params.append("packagePeriodType", packagePeriodType);

  const url = `/member/dashboard?${params.toString()}`;

  const res = await api.get(url, {
    withCredentials: true,
  });

  return res.data.data;
}
