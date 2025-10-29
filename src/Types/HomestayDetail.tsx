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
