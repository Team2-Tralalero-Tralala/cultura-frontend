// ============================================================
// แถวข้อมูลแต่ละรายการในตาราง "การระงับบัญชี"
// ============================================================
export type BlockedAccountRow = {
  id: number;
  fname: string;
  lname: string;
  email: string;
  role: {
    name: string;
  };
  communityAdmin?: {
    name: string | null;
  }[];
  communityMembers?: {
    Community: {
      name: string | null;
    } | null;
  }[];
};

// ============================================================
// รายละเอียดข้อมูลผู้ใช้
// ============================================================
export type UserDetail = {
  id: number;
  fname: string;
  lname: string;
  username: string;
  email: string;
  phone: string;
  profileImage?: string;
  role: { name: string };
  activityRole?: string | null;
  communityMembers?: {
    Community: {
      name: string | null;
    } | null;
  }[];
  communityAdmin?: {
    name: string | null;
  }[];
};

// ============================================================
// รูปแบบข้อมูลที่ได้จาก API (ตรงกับ Prisma Service)
// ============================================================
export type UserDtoFromApi = {
  id: number;
  username: string | null;
  email: string;
  activityRole: string;
  status: string; // ตัวอย่างเช่น "ACTIVE" หรือ "BLOCKED"
};

// ============================================================
// แถวข้อมูลแต่ละรายการในตาราง "จัดการบัญชี"
// ============================================================
export type AccountRow = {
  id: number;
  fname: string;
  lname: string;
  email: string;
  role: {
    name: string; // superadmin, admin, member, tourist
  };
  communityMembers?: {
    Community: {
      name: string | null;
    } | null;
  }[];
  communityAdmin?: {
    name: string | null;
  }[];
};

// ============================================================
// โครงสร้าง Pagination Response
// ============================================================
export type PaginationResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};