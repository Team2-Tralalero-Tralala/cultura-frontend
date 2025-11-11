/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export type Role = "member" | "admin" | "superadmin";

const roleToPrefix = (role: Role) => (role === "superadmin" ? "super" : role);

export async function fetchPackagesByRole(role: Role, page: number, limit: number) {
    const prefix = roleToPrefix(role);             // <-- แปลงตรงนี้
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
            (fullName || undefined) ||
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
  * คำอธิบาย : ฟังก์ชันสำหรับโหลดข้อมูลร้านค้าทั้งหมดของชุมชนที่อยู่ในชุมชนของ admin
  * Input : page, limit
  * Output : ผลลัพธ์จากการเรียก API เพื่อดึงข้อมูลร้านค้า (Promise)
  */
export async function getHistoriesPackageAdmin(page = 1, limit = 50) {
  const params = { page, limit };
  const res = await axios.get(`${apiUrl}/admin/package/histories/all`, {
    params,
    withCredentials: true, // ส่ง cookie/token ไปด้วย
  });
  return res.data;
}