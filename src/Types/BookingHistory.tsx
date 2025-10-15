/* 
 * คำอธิบาย : Type ของข้อมูล Booking History ที่แสดงในฝั่ง Client
 * อิงจากผลลัพธ์ของ BE ที่ select: tourist, package, status, transferSlip, bookingAt
 */
export interface BookingHistoryItem {
  tourist: { fname: string; lname: string };
  package: { name: string; price: number };
  status: string;
  transferSlip: string | null;
  bookingAt: string; 
}
