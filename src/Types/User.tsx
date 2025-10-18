// แถวข้อมูลแต่ละรายการในตาราง
export type UserRow = {
  id: number;
  username: string;
  activityRole: string;
  email: string;
  BLOCKED: boolean;
};

// รูปแบบข้อมูลที่ได้จาก API (ตรงกับ Prisma Service)
export type UserDtoFromApi = {
  id: number;
  username: string | null;
  email: string;
  activityRole: string;
  status: string; // ตัวอย่างเช่น "ACTIVE" หรือ "BLOCKED"
};

// โครงสร้าง Pagination Response เหมือนเดิม
export type PaginationResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};