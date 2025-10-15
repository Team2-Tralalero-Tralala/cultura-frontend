// แถวข้อมูลแต่ละรายการในตาราง (พร้อมแสดงผล)
export type CommunityRow = {
  id: number;
  name: string;
  province: string;
  admin: string;
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
  items: T[];
  total: number;
  page: number;
  limit: number;
};
