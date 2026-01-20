/*
 * คำอธิบาย : Type สำหรับกำหนดโครงสร้างข้อมูลแถวของตารางชุมชน (Community)
 * ใช้สำหรับแสดงผลใน DataGrid หรือ List หลังจากแปลงข้อมูลจาก API แล้ว (Flatten Data)
 * Input :
 * - id (number)       : รหัสชุมชน (ใช้เป็น key ของ row)
 * - name (string)     : ชื่อชุมชน
 * - province (string) : จังหวัด (ดึงค่ามาจาก location.province)
 * - admin (string)    : ชื่อ-นามสกุลผู้ดูแล (ดึงค่าและต่อ string มาจาก admin object)
 * - status (string)   : สถานะชุมชน (เช่น OPEN, CLOSED)
 * Output :
 * - Object ข้อมูลสำหรับแสดงผลในแต่ละแถวของ Component ตาราง
 */
export type CommunityRow = {
  id: number;
  name: string;
  province: string;
  admin: string;
  status: string;
};

/*
 * คำอธิบาย : Type สำหรับรับข้อมูลดิบของชุมชนจาก API Response
 * โครงสร้างข้อมูลจะซ้อนกัน (Nested) ตาม Relation ใน Database และรองรับค่า Null
 * Input :
 * - id (number)             : รหัสชุมชน
 * - name (string | null)    : ชื่อชุมชน
 * - status (string | null)  : สถานะชุมชน
 * - location (object | null): ข้อมูลสถานที่ (ประกอบด้วย province)
 * - admin (object | null)   : ข้อมูลผู้ดูแล (ประกอบด้วย id, fname, lname)
 * Output :
 * - Object ข้อมูลดิบเพื่อนำไป Process หรือ Map เป็น CommunityRow ต่อไป
 */
export type CommunityDtoFromApi = {
  id: number;
  name: string | null;
  status: string | null;

  location: {
    province: string | null
  } | null;

  admin: {
    id: number;
    fname: string | null;
    lname: string | null
  } | null;
};

/*
 * คำอธิบาย : Generic Type สำหรับ Response จาก API ที่มีการแบ่งหน้า (Pagination)
 * ใช้เป็น Wrapper มาตรฐานสำหรับข้อมูล List ทุกประเภทในระบบ
 * Input :
 * - T (Generic)    : Type ของข้อมูลภายใน List (เช่น CommunityRow)
 * - data (T[])     : Array ข้อมูลจริงตาม Type T
 * - pagination     : Object ข้อมูล Metadata สำหรับการแบ่งหน้า
 * - currentPage (number) : เลขหน้าที่กำลังแสดงผล
 * - totalPages (number)  : จำนวนหน้าทั้งหมดที่มี
 * - totalCount (number)  : จำนวนรายการทั้งหมดใน Database
 * - limit (number)       : จำนวนรายการที่แสดงต่อหน้า
 * Output :
 * - Structure มาตรฐานสำหรับนำไปใช้กับ Hook หรือ Component ที่รองรับ Pagination
 */
export type PaginationResponse<T> = {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
};
