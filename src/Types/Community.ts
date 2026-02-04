// แถวข้อมูลแต่ละรายการในตาราง (พร้อมแสดงผล)
export type CommunityRow = {
  id: number;
  name: string; // ชื่อชุมชน
  province: string; // จังหวัด
  admin: string; // ชื่อผู้ดูแล
  status: string; // OPEN | CLOSED
};


// โครงสร้าง Pagination Response (ข้อมูล + pagination)
export type PaginationResponse<T> = {
  data: T[]; // ✅ backend ส่งข้อมูลใน key = "data"
  pagination: {
    // ✅ โครงสร้างย่อย pagination
    currentPage: number; // หน้าปัจจุบัน
    totalPages: number; // จำนวนหน้าทั้งหมด
    totalCount: number; // จำนวนรายการทั้งหมด
    limit: number; // จำนวนรายการต่อหน้า
  };
};

export type CommunityFormData = {
  id?: number;
  locationId?: number;
  adminId: number;
  name: string;
  alias?: string;
  type: string;
  registerNumber: string;
  registerDate: Date;
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
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
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
  communityMembers: number[];
  isRatingVisible: boolean;
};
