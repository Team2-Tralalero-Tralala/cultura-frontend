/*
 * คำอธิบาย : Type สำหรับกำหนดโครงสร้างข้อมูลแถวของตารางการจอง (สำหรับสมาชิกเจ้าของแพ็กเกจ)
 * ใช้สำหรับแสดงผลใน DataGrid หรือ List หลังจากแปลงข้อมูลจาก API และจัด Format แล้ว
 * Input :
 * - id (number)          : รหัสการจอง
 * - touristName (string) : ชื่อ-นามสกุลนักท่องเที่ยว (ต่อ string มาแล้ว)
 * - packageName (string) : ชื่อแพ็กเกจ
 * - totalPrice (string)  : ราคารวมที่ต้องจ่าย (Format เป็น string เช่น "1,500 บาท")
 * - status (string)      : สถานะการจอง
 * - transferSlip (string): path หรือ url ของรูปสลิปโอนเงิน
 * Output :
 * - Object ข้อมูลสำหรับแสดงผลในแต่ละแถวของ Component ตาราง
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
 * คำอธิบาย : Type สำหรับรับข้อมูลดิบของการจองจาก API Response (ฝั่ง Member)
 * โครงสร้างข้อมูลจะซ้อนกัน (Nested) และมีฟิลด์ totalPrice ที่คำนวณมาจาก Backend
 * Input :
 * - id (number)             : รหัสการจอง
 * - tourist (object | null) : ข้อมูลนักท่องเที่ยว (fname, lname)
 * - package (object | null) : ข้อมูลแพ็กเกจ (name, price)
 * - totalPrice (number)     : ราคารวม (คำนวณจาก Backend: ราคา x จำนวนคน)
 * - status (string | null)  : สถานะการจอง
 * - transferSlip (string | null) : ข้อมูลสลิปโอนเงิน
 * Output :
 * - Object ข้อมูลดิบเพื่อนำไป Process หรือ Map เป็น BookingMemberRow ต่อไป
 */
export type BookingMemberDtoFromApi = {
  id: number;

  tourist: {
    fname: string | null;
    lname: string | null;
  } | null;
  package: {
    name: string | null;
    price: number | null;
  } | null;

  totalPrice: number;
  status: string | null;
  transferSlip: string | null;
};

/*
 * คำอธิบาย : Type สำหรับเก็บข้อมูล Metadata ของการแบ่งหน้า (Pagination)
 * ใช้ส่งเป็น Props ให้กับ Component ควบคุมการเปลี่ยนหน้า หรือใช้ใน State
 * Input :
 * - currentPage (number) : เลขหน้าที่กำลังแสดงผลอยู่
 * - totalPages (number)  : จำนวนหน้าทั้งหมด
 * - totalCount (number)  : จำนวนรายการทั้งหมดในฐานข้อมูล
 * - limit (number)       : จำนวนรายการที่แสดงต่อหน้า
 * Output :
 * - Object ข้อมูลสำหรับควบคุม Logic การเปลี่ยนหน้าใน UI
 */
export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
};
