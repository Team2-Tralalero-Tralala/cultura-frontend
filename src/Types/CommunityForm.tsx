/**
 * CommunityFormData
 * -----------------
 * โครงสร้างข้อมูลหลักที่ใช้เก็บและส่งข้อมูลของ "วิสาหกิจชุมชน" (Community)
 * ใช้ทั้งในแบบฟอร์มหน้าเว็บ (Frontend) และในการสื่อสารกับ Backend
 *
 * ฟิลด์ต่าง ๆ จะครอบคลุมข้อมูลของวิสาหกิจทั้งหมด เช่น
 * - ข้อมูลทั่วไป (ชื่อ, ประเภท, การจดทะเบียน)
 * - ข้อมูลทางการเงิน (บัญชีธนาคาร)
 * - ข้อมูลสถานที่ตั้ง (บ้านเลขที่, หมู่, จังหวัด, พิกัด)
 * - ข้อมูลการติดต่อ (เบอร์โทร, อีเมล, เว็บไซต์, Social Media)
 * - ผู้ดูแลหลักและผู้ประสานงาน
 * - สมาชิกของชุมชน
 */
export type CommunityFormData = {
  id?: number;
  locationId?: number;
  adminId: number;
  name: string;
  alias?: string;
  type: string;
  registerNumber: string;
  registerDate: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  description: string;
  mainActivityName: string;
  mainActivityDescription: string;
  status: string;
  detail: string;
  houseNumber: string;
  villageNumber?: number | null;
  longitude: number;
  latitude: number;
  location: {
    province: string;
    district: string;
    subDistrict: string;
    postalCode: string;
  };
  phone: string;
  email: string;
  urlWebsite: string;
  urlFacebook: string;
  urlLine: string;
  urlTiktok: string;
  urlOther: string;
  mainAdmin: string;
  mainAdminPhone: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  rating: number;
  member: string[];
};
