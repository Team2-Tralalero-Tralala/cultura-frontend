/*
 * Type: BlockedAccountRow
 * วัตถุประสงค์: ใช้สำหรับเก็บข้อมูลของผู้ใช้ที่ถูกระงับบัญชี
 * Input: ไม่มี (ใช้ดึงข้อมูลจาก API เท่านั้น)
 * Output: ใช้สำหรับแสดงในตาราง "การระงับบัญชี" ในหน้าผู้ดูแลระบบ
 */
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

/*
 * Type: UserDetail
 * วัตถุประสงค์: ใช้สำหรับเก็บรายละเอียดข้อมูลของผู้ใช้งาน
 * Input: ไม่มี (รับค่าจาก API / Prisma Service)
 * Output: ใช้สำหรับแสดงรายละเอียดผู้ใช้ในหน้าโปรไฟล์หรือหน้ารายละเอียดบัญชี
 */
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

/*
 * DTO: UserDtoFromApi
 * วัตถุประสงค์: ใช้สำหรับเก็บข้อมูลผู้ใช้งานที่ได้รับจาก API (Prisma Service)
 * Input: ไม่มี (ใช้รับข้อมูลจาก API โดยตรง)
 * Output: ใช้สำหรับ mapping ข้อมูลก่อนนำไปแสดงผลในฝั่ง Client
 */
export type UserDtoFromApi = {
  id: number;
  username: string | null;
  email: string;
  activityRole: string;
  status: string; // ตัวอย่างเช่น "ACTIVE" หรือ "BLOCKED"
};

/*
 * Type: AccountRow
 * วัตถุประสงค์: ใช้สำหรับเก็บข้อมูลของผู้ใช้งานในหน้าจัดการบัญชี (Manage Account)
 * Input: ไม่มี (รับข้อมูลจาก API)
 * Output: ใช้แสดงในตาราง "จัดการบัญชี" พร้อมข้อมูล role และชุมชน
 */
export type AccountRow = {
  id: number;
  fname: string;
  lname: string;
  email: string;
  role: {
    name: string;
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

/*
 * Type: PaginationResponse<T>
 * วัตถุประสงค์: ใช้สำหรับเก็บผลลัพธ์ที่มีการแบ่งหน้า (Pagination)
 * Input: T (Generic Type ที่ระบุชนิดของข้อมูล)
 * Output: ใช้สำหรับโครงสร้างผลลัพธ์ของ API ที่รองรับการแบ่งหน้า เช่น รายการผู้ใช้หรือชุมชน
 */
export type PaginationResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

/**
 * Type: AccountCommunityRow
 * วัตถุประสงค์: ใช้สำหรับเก็บข้อมูลของผู้ใช้งานในหน้าจัดการสมาชิกในแต่ละชุมชน (Manage Account Community)
 * Input: ไม่มี (รับข้อมูลจาก API)
 * Output: ใช้แสดงในตาราง "จัดการสมาชิกในแต่ละชุมชน" พร้อมข้อมูล role
 */
export type AccountCommunityRow = {
  id: number;
  fname: string;
  lname: string;
  email: string;
  activityRole: string;
  role: {
    name: string;
  };
};
