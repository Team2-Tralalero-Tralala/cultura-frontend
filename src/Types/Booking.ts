/*
 * คำอธิบาย : Type สำหรับข้อมูลการจอง (ฝั่งแอดมิน)
 * ใช้สำหรับแสดงในตารางหน้า "จัดการการจอง"
 */
export type BookingRow = {
  id: number;
  touristName: string;
  packageName: string;
  totalPrice: string;
  status: string;
  transferSlip: string;
  feedbacks?: { id: number }[];
};

/*
 * คำอธิบาย : โครงสร้างข้อมูลที่มาจาก API (ตรงกับ Backend)
 */
export type BookingAdminDtoFromApi = {
  id: number; // ตัวนี้สำคัญ ต้องมี
  bh_id?: number; // เผื่อ backend ส่งชื่อแบบ bh_id (optional)
  tourist: { fname: string; lname: string };
  package: { name: string; price: number };
  totalPrice: number;
  status: string;
  transferSlip: string | null;
};

/*
 * คำอธิบาย : Pagination Structure จาก backend
 */
export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
};

/*
 * คำอธิบาย : Type สำหรับข้อมูลการจอง (ฝั่ง Member – ผู้ดูแลแพ็กเกจ)
 * ใช้สำหรับแสดงในตารางหน้า "จัดการการจอง" ของ Member
 */
export type BookingMemberRow = {
  id: number;
  touristName: string;
  packageName: string;
  totalPrice: string;
  status: string;
  transferSlip: string;
};

/*
 * คำอธิบาย : โครงสร้างข้อมูลที่มาจาก API (ตรงกับ Backend: getBookingsByMember)
 * data[i] ตาม service ฝั่ง BE:
 *  {
 *    id,
 *    tourist: { fname, lname },
 *    package: { name, price },
 *    totalPrice,
 *    status,
 *    transferSlip
 *  }
 */
export type BookingMemberDtoFromApi = {
  id: number;
  tourist: { fname: string; lname: string };
  package: { name: string; price: number };
  totalPrice: number;
  status: string;
  transferSlip: string | null;
};
