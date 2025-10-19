// แถวข้อมูลแต่ละรายการในตาราง "การระงับบัญชี"
export type BlockedAccountRow = {
  id: number;
  fname: string;
  lname: string;
  email: string;
  role: {
    name: string;
  };
  memberOf: {
    name: string | null;
  } | null;
};

// รูปแบบข้อมูลที่ได้จาก API (ตรงกับ Prisma Service)
export type UserDtoFromApi = {
  id: number;
  username: string | null;
  email: string;
  activityRole: string;
  status: string; // ตัวอย่างเช่น "ACTIVE" หรือ "BLOCKED"
};

// แถวข้อมูลแต่ละรายการในตาราง "จัดการบัญชี"
export type AccountRow = {
  id: number;
  fname: string;
  lname: string;
  email: string;
  role: {
    name: string; // superadmin, admin, member, tourist
  };
  memberOf: {
    name: string | null; // ชื่อชุมชน (ถ้ามี)
  } | null;
};

// โครงสร้าง Pagination Response เหมือนเดิม
export type PaginationResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};