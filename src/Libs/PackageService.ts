/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { api } from "./AccountService";
import type { PackageRequestDetail } from "@/Types/Package";
const apiUrl = import.meta.env.VITE_API_URL;

export type Role = "member" | "admin" | "superadmin";

const roleToPrefix = (role: Role) => (role === "superadmin" ? "super" : role);

export async function fetchPackagesByRole(role: Role, page: number, limit: number) {
  const prefix = roleToPrefix(role); // <-- แปลงตรงนี้
  const res = await axios.get(`${apiUrl}/${prefix}/packages`, {
    params: { page, limit },
    withCredentials: true,
  });

  const obj = res.data?.data?.data ?? {};
  const list: any[] = Array.isArray(obj) ? obj : Object.values(obj);

  const total = Number(res.data?.data?.pagination?.totalCount ?? list.length) || 0;

  const rows = list.map((p: any) => {
    const ov = p.overseerPackage ?? p.owner ?? p.overseer ?? null;
    const fullName = `${ov?.fname ?? ""} ${ov?.lname ?? ""}`.trim();
    const ownerName =
      ov?.name?.trim?.() ||
      fullName ||
      undefined ||
      ov?.username ||
      (p.overseerMemberId ? `ID ${p.overseerMemberId}` : "-");

    return {
      id: Number(p.id),
      title: p.name ?? p.title ?? "(ไม่มีชื่อ)",
      community: p.community?.name ?? (p.communityId ? `ID ${p.communityId}` : "-"),
      owner: ownerName ?? "-",
      published: p.statusPackage === "PUBLISH" || !!p.published,
      approved: p.statusApprove === "APPROVE" || !!p.approved,
    };
  });

  return { rows, total, page, limit };
}

// // Services/package/package-service.ts

//  function composeDateTime(dateStr: string, timeStr?: string, useEndOfDayIfMissing = false): Date {
//      // dateStr: "yyyy-mm-dd", timeStr: "HH:mm"
//      const [y, m, d] = dateStr.split("-").map(Number);
//      let hh = 0, mm = 0, ss = 0;

//      if (timeStr && /^\d{2}:\d{2}$/.test(timeStr)) {
//          const [h, min] = timeStr.split(":").map(Number);
//          hh = h; mm = min;
//      } else if (useEndOfDayIfMissing) {
//          hh = 23; mm = 59; ss = 59;   // ถ้าไม่กรอกเวลา “สิ้นสุด” ให้ปิดวันท้ายสุด
//      }

//      // สร้าง Date แบบ local (MySQL DATETIME ไม่มี timezone)
//      return new Date(y, (m - 1), d, hh, mm, ss, 0);
//  }

/*
 * คำอธิบาย : ฟังก์ชันสำหรับลบข้อมูลแพ็กเกจ (Soft Delete)
 * Input : id - รหัสของแพ็กเกจที่ต้องการลบ
 * Output : ผลลัพธ์จากการเรียก API เพื่อลบแพ็กเกจ
 */
export async function deletePackageAdmin(id: number) {
  const res = await axios.patch(`${apiUrl}/admin/package/${id}`, null, {
    withCredentials: true,
  });
  return res.data;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับโหลดข้อมูลแพ็กเกจที่จบแล้วทั้งหมดของชุมชนที่อยู่ในชุมชนของ admin
 * Input : page, limit, search
 * Output : ผลลัพธ์จากการเรียก API เพื่อดึงข้อมูลแพ็กเกจที่จบแล้ว (Promise)
 */
export async function getHistoriesPackageAdmin(page = 1, limit = 50) {
  const params = { page, limit };
  const res = await axios.get(`${apiUrl}/admin/packages/histories/all`, {
    params,
    withCredentials: true,
  });
  return res.data;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับโหลดข้อมูลแพ็กเกจที่จบแล้วทั้งหมดของชุมชนที่อยู่ในชุมชนของ member
 * Input : page, limit, search
 * Output : ผลลัพธ์จากการเรียก API เพื่อดึงข้อมูลแพ็กเกจที่จบแล้ว (Promise)
 */
export async function getHistoriesPackageMember(page = 1, limit = 50) {
  const params = { page, limit };
  const res = await axios.get(`${apiUrl}/member/packages/histories/all`, {
    params,
    withCredentials: true,
  });
  return res.data;
}

/**
 * คำอธิบาย : ฟังก์ชันสำหรับโหลดข้อมูลผู้ที่เข้าร่วมแพ็กเกจ
 * Input : packageId, page, limit, searchName
 * Output : ผลลัพธ์จากการเรียก API เพื่อดึงข้อมูลผู้ที่เข้าร่วมแพ็กเกจ (Promise)
 */
export async function getParticipantsInPackage(
  packageId: number,
  page: number,
  limit: number,
  searchName?: string,
) {
  const res = await api.get(`/shared/participants/package/${packageId}`, {
    params: {
      page,
      limit,
      searchName,
    },
  });
  return res.data?.data;
}
/**
 * คำอธิบาย : ฟังก์ชันสำหรับอัปเดตสถานะผู้ที่เข้าร่วมแพ็กเกจ
 * Input : bookingHistoryId, isParticipate
 * Output : ผลลัพธ์จากการเรียก API เพื่ออัปเดตสถานะผู้ที่เข้าร่วมแพ็กเกจ (Promise)
 */
export async function updateParticipantStatus(bookingHistoryId: number, isParticipate: boolean) {
  const res = await api.post(`/shared/participate/${bookingHistoryId}/status`, { isParticipate });
  return res.data.data;
}

/**
 * คำอธิบาย : ดึงรายละเอียดคำขอแพ็กเกจ (ผู้ใช้ทั่วไปหรือสิทธิ์ตามที่ backend อนุญาต)
 * Input : requestId: string (รหัสคำขอแพ็กเกจ)
 * Output: Promise<PackageRequestDetail> (ข้อมูลรายละเอียดคำขอแพ็กเกจ)
 */
export async function fetchPackageRequestDetail(requestId: string): Promise<PackageRequestDetail> {
  const res = await axios.get(`${apiUrl}/super/package-requests/${requestId}`, {
    withCredentials: true,
  });
  return (res.data?.data ?? res.data) as PackageRequestDetail;
}

/**
 * คำอธิบาย : ดึงรายละเอียดคำขอแพ็กเกจ (เส้นทางสำหรับแอดมิน)
 * Input : requestId: string (รหัสคำขอแพ็กเกจ)
 * Output: Promise<PackageRequestDetail> (ข้อมูลรายละเอียดคำขอแพ็กเกจ)
 */
export async function fetchPackageRequestDetailForAdmin(
  requestId: string,
): Promise<PackageRequestDetail> {
  const res = await axios.get(`${apiUrl}/admin/package-requests/${requestId}`, {
    withCredentials: true,
  });
  return (res.data?.data ?? res.data) as PackageRequestDetail;
}

/**
 * ฟังก์ชัน : fetchPackageRequests
 * คำอธิบาย : ดึงรายการคำขอแพ็กเกจทั้งหมด (สำหรับ Super User) พร้อมระบบ pagination และการกรอง
 * Input : page: number (default 1) - หมายเลขหน้าที่ต้องการ
 * Input : limit: number (default 10) - จำนวนรายการต่อหน้า
 * Input : search?: string (optional) - คำค้นหาสำหรับชื่อแพ็กเกจ
 * Input : statusApprove?: string (optional) - สถานะการอนุมัติที่ต้องการกรอง
 * Output: Promise<AxiosResponse> (Axios response ที่มีข้อมูลรายการคำขอแพ็กเกจ)
 */
export async function fetchPackageRequests(
  page = 1,
  limit = 10,
  search?: string,
  statusApprove?: string,
) {
  return axios.get(`${apiUrl}/super/package-requests`, {
    withCredentials: true,
    params: { page, limit, search, statusApprove },
  });
}

/**
 * ฟังก์ชัน : approvePackageRequest
 * คำอธิบาย : อนุมัติคำขอแพ็กเกจ (สำหรับ Super User)
 * Input : packageId: number - รหัสของแพ็กเกจที่ต้องการอนุมัติ
 * Output: Promise<AxiosResponse> (Axios response ยืนยันผลการอนุมัติ)
 */
export async function approvePackageRequest(packageId: number) {
  return axios.patch(
    `${apiUrl}/super/package-requests/${packageId}/approve`,
    {},
    { withCredentials: true },
  );
}

/**
 * ฟังก์ชัน : rejectPackageRequest
 * คำอธิบาย : ปฏิเสธคำขอแพ็กเกจ (สำหรับ Super User) พร้อมระบุเหตุผล
 * Input : packageId: number - รหัสของแพ็กเกจที่ต้องการปฏิเสธ
 * Input : reason: string - เหตุผลในการปฏิเสธ
 * Output: Promise<AxiosResponse> (Axios response ยืนยันผลการปฏิเสธ)
 */
export async function rejectPackageRequest(packageId: number, reason: string) {
  return axios.patch(
    `${apiUrl}/super/package-requests/${packageId}/reject`,
    { reason },
    { withCredentials: true },
  );
}

/**
 * ฟังก์ชัน : approvePackageRequestForAdmin
 * คำอธิบาย : อนุมัติคำขอแพ็กเกจ (สำหรับ Admin)
 * Input : packageId: number - รหัสของแพ็กเกจที่ต้องการอนุมัติ
 * Output: Promise<AxiosResponse> (Axios response ยืนยันผลการอนุมัติ)
 */
export async function approvePackageRequestForAdmin(packageId: number) {
  return axios.patch(
    `${apiUrl}/admin/package-requests/${packageId}/approve`,
    {},
    { withCredentials: true },
  );
}

/**
 * ฟังก์ชัน : rejectPackageRequestForAdmin
 * คำอธิบาย : ปฏิเสธคำขอแพ็กเกจ (สำหรับ Admin) พร้อมระบุเหตุผล
 * Input : packageId: number - รหัสของแพ็กเกจที่ต้องการปฏิเสธ
 * Input : reason: string - เหตุผลในการปฏิเสธ
 * Output: Promise<AxiosResponse> (Axios response ยืนยันผลการปฏิเสธ)
 */
export async function rejectPackageRequestForAdmin(packageId: number, reason: string) {
  return axios.patch(
    `${apiUrl}/admin/package-requests/${packageId}/reject`,
    { reason },
    { withCredentials: true },
  );
}
