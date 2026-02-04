// แถวข้อมูลแต่ละรายการในตาราง (สำหรับแสดงผล)
export type HomestayRow = {
  id: number;
  name: string; // ชื่อที่พัก
  facility: string; // สิ่งอำนวยความสะดวก
  type: string; // ประเภทห้องพัก
};
// โครงสร้างข้อมูลจาก API (ตรงกับ Prisma Service ฝั่ง backend)
export type HomestayDtoFromApi = {
  id: number;
  name: string;
  facility: string;
  type: string;
};

// โครงสร้าง Pagination Response (ข้อมูล + pagination)
export type PaginationResponse<T> = {
  data: T[]; // backend ใช้ key = data (ไม่ใช่ items)
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
