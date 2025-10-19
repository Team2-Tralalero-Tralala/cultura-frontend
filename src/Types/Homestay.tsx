// แถวข้อมูลแต่ละรายการในตาราง (สำหรับแสดงผล)
export type HomestayRow = {
  name: string;       // ชื่อที่พัก
  facility: string;   // สิ่งอำนวยความสะดวก
  type: string;       // ประเภทห้องพัก
};

// โครงสร้างข้อมูลจาก API (ตรงกับ Prisma Service ฝั่ง backend)
export type HomestayDtoFromApi = {
  name: string;
  facility: string;
  type: string;
};

// โครงสร้าง Pagination Response (ข้อมูล + pagination)
export type PaginationResponse<T> = {
  data: T[];                 // backend ใช้ key = data (ไม่ใช่ items)
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
};
