/*
 * คำอธิบาย : Type สำหรับกำหนดโครงสร้างข้อมูลแถวของตารางที่พัก (Homestay)
 * ใช้สำหรับแสดงผลใน DataGrid หรือ List หลังจากแปลงข้อมูลจาก API แล้ว
 * Input :
 * - id (number)       : รหัสที่พัก (ใช้เป็น key ของ row)
 * - name (string)     : ชื่อที่พัก
 * - facility (string) : ข้อมูลสิ่งอำนวยความสะดวก
 * - type (string)     : ประเภทของที่พัก
 * Output :
 * - Object ข้อมูลสำหรับแสดงผลในแต่ละแถวของ Component ตาราง
 */
export type HomestayRow = {
  id: number;
  name: string;
  facility: string;
  type: string;
};

/*
 * คำอธิบาย : Type สำหรับรับข้อมูลดิบของที่พักจาก API Response
 * โครงสร้างตรงกับ Backend ซึ่งฟิลด์บางตัวอาจมีค่าเป็น null ได้
 * Input :
 * - id (number)             : รหัสที่พัก
 * - name (string | null)    : ชื่อที่พัก (อาจเป็น null)
 * - facility (string | null): สิ่งอำนวยความสะดวก (อาจเป็น null)
 * - type (string | null)    : ประเภทที่พัก (อาจเป็น null)
 * Output :
 * - Object ข้อมูลดิบเพื่อนำไป Process หรือ Map เป็น HomestayRow ต่อไป
 */
export type HomestayDtoFromApi = {
  id: number;
  name: string | null;
  facility: string | null;
  type: string | null;
};

/*
 * คำอธิบาย : Generic Type สำหรับ Response จาก API ที่มีการแบ่งหน้า (Pagination)
 * ใช้เป็น Wrapper มาตรฐานสำหรับข้อมูล List ทุกประเภทในระบบ
 * Input :
 * - T (Generic)     : Type ของข้อมูลภายใน List (เช่น HomestayRow, UserRow)
 * - data (T[])      : Array ข้อมูลจริงตาม Type T
 * - pagination      : Object ข้อมูล Metadata สำหรับการแบ่งหน้า
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

/*
 * คำอธิบาย : Type definition สำหรับรายละเอียดที่พัก
 * หน้าที่ : กำหนดสัญญาโครงสร้างข้อมูลที่ใช้ทั้งฝั่งหน้าเว็บและบริการเรียกข้อมูล
 */
export interface HomestayDetail {
  id: number;
  name: string;
  type: string;
  guestPerRoom: number;
  totalRoom: number;
  facility: string;
  community: {
    id: number;
    name: string;
  };
  location: {
    id: number;
    detail: string | null;
    houseNumber: string;
    villageNumber?: string | null;
    alley?: string | null;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };
  homestayImage: {
    id: number;
    image: string;
    type: "COVER" | "GALLERY";
  }[];
  tagHomestays: {
    tag: {
      id: number;
      name: string;
    };
  }[];
}
