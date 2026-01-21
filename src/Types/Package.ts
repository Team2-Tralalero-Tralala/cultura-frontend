export type PackageRow = {
  id: number;
  title: string;
  community: string;
  owner: string;
  published: boolean;
  approved: boolean;
};

export type PackageDtoFromApi = {
  id: number;
  title: string;
  community: { name: string } | null;
  owner: { fullName: string } | null;
  published: boolean;
  approved: boolean;
};

export type PaginationResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export interface ParticipantsInPackage {
  id: number;
  bookingAt: string;
  tourist: {
    id: number;
    fname: string;
    lname: string;
    phone: string;
  };
  package: {
    dueDate: string;
  };
  isParticipate: boolean;
  [key: string]: any;
}
/*
 * คำอธิบาย : Type definition สำหรับรายละเอียดคำร้องแพ็กเกจ (Package Request)
 * หน้าที่ : กำหนดสัญญาโครงสร้างข้อมูลที่ใช้ทั้งฝั่งหน้าเว็บและบริการเรียกข้อมูล
 */

export interface PackageRequestDetail {
  /** รหัสคำร้อง */
  id: string;
  /** ชื่อแพ็กเกจ */
  name: string;
  /** สถานะแพ็กเกจ */
  statusPackage: String;
  /** คำอธิบายแพ็กเกจ */
  description: string;
  /** จำนวนคนที่เปิดรับ */
  capacity: number;
  /** ราคา (หน่วยบาท) */
  price: number;
  /** วันเริ่มต้นแพ็กเกจ (ISO) */
  startDate: string;
  /** วันสิ้นสุดแพ็กเกจ (ISO) */
  dueDate: string;
  /** วันเปิดให้จอง (ISO) */
  bookingOpenDate: string;
  /** วันปิดการจอง (ISO) */
  bookingCloseDate: string;
  /** สิ่งอำนวยความสะดวก */
  facility: string;
  /** ผู้ดูแลแพ็กเกจ */
  overseerPackage: { fname: string; lname: string };
  /** ผู้สร้างแพ็กเกจ */
  createPackage: { fname: string; lname: string };
  /** รายการแท็กของแพ็กเกจ */
  tagPackages: { tag: { name: string } }[];
  /** ไฟล์สื่อของแพ็กเกจ */
  packageFile: { filePath: string }[];
  /** ข้อมูลสถานที่ตั้งของแพ็กเกจ */
  location: {
    houseNumber: string;
    villageNumber: string;
    alley: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
    detail: string;
    latitude: number;
    longitude: number;
  };
  homestayHistories: {
    checkInTime: string;
    checkOutTime: string;
    homestay: {
      name: string;
      facility?: string;
      homestayImage: { image: string; type?: string }[];
    } | null;
  }[];
}

export interface PackageRequestDetail {
  /** รหัสคำร้อง */
  id: string;
  /** ชื่อแพ็กเกจ */
  name: string;
  /** สถานะแพ็กเกจ */
  statusPackage: String;
  /** คำอธิบายแพ็กเกจ */
  description: string;
  /** จำนวนคนที่เปิดรับ */
  capacity: number;
  /** ราคา (หน่วยบาท) */
  price: number;
  /** วันเริ่มต้นแพ็กเกจ (ISO) */
  startDate: string;
  /** วันสิ้นสุดแพ็กเกจ (ISO) */
  dueDate: string;
  /** วันเปิดให้จอง (ISO) */
  bookingOpenDate: string;
  /** วันปิดการจอง (ISO) */
  bookingCloseDate: string;
  /** สิ่งอำนวยความสะดวก */
  facility: string;
  /** ผู้ดูแลแพ็กเกจ */
  overseerPackage: { fname: string; lname: string };
  /** ผู้สร้างแพ็กเกจ */
  createPackage: { fname: string; lname: string };
  /** รายการแท็กของแพ็กเกจ */
  tagPackages: { tag: { name: string } }[];
  /** ไฟล์สื่อของแพ็กเกจ */
  packageFile: { filePath: string }[];
  /** ข้อมูลสถานที่ตั้งของแพ็กเกจ */
  location: {
    houseNumber: string;
    villageNumber: string;
    alley: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
    detail: string;
    latitude: number;
    longitude: number;
  };
    homestayHistories: {
    checkInTime: string;
    checkOutTime: string;
    homestay: {
      name: string;
      facility?: string;
      homestayImage: { image: string; type?: string }[];
    } | null;
  }[];
}
