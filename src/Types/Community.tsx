// แถวข้อมูลแต่ละรายการในตาราง (พร้อมแสดงผล)
export type CommunityRow = {
  id: number;
  name: string; // ชื่อชุมชน
  province: string; // จังหวัด
  admin: string; // ชื่อผู้ดูแล
  status: string; // OPEN | CLOSED
};

// โครงสร้างข้อมูลจาก API (ตรงกับ Prisma Service ฝั่ง backend)
export type CommunityDtoFromApi = {
  id: number;
  name: string;
  location: { province: string } | null;
  admin: { fname: string; lname: string } | null;
  status: string;
};

// โครงสร้าง Pagination Response (ข้อมูล + pagination)
export type PaginationResponse<T> = {
  data: T[]; // ✅ backend ส่งข้อมูลใน key = "data"
  pagination: {
    // ✅ โครงสร้างย่อย pagination
    currentPage: number; // หน้าปัจจุบัน
    totalPages: number; // จำนวนหน้าทั้งหมด
    totalCount: number; // จำนวนรายการทั้งหมด
    limit: number; // จำนวนรายการต่อหน้า
  };
};
