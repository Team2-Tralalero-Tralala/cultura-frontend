// แถวข้อมูลแต่ละรายการในตาราง
export type CommunityRow = {
  id: number;
  name: string;
  province: string;
  admin: string;
  status: string; // OPEN | CLOSED
};

// รูปแบบข้อมูลที่ได้จาก API (ตรงกับ Prisma Service)
export type CommunityDtoFromApi = {
  id: number;
  name: string;
  location: { province: string } | null;
  admin: { fname: string; lname: string } | null;
  status: string;
};

// โครงสร้าง Pagination Response เหมือนเดิม
export type PaginationResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
