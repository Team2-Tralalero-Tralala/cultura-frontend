import React, { type JSX } from "react";

// Props ของ Pagination component
type PaginationProps = {
  totalPages: number;           // จำนวนหน้าทั้งหมด (เช่น 10 หน้า)
  currentPage: number;          // หน้าปัจจุบัน (เริ่มนับจาก 1)
  onPageChange: (page: number) => void; // callback ที่จะถูกเรียกเมื่อมีการเปลี่ยนหน้า
  className?: string;           // สำหรับส่ง className เพิ่มเติมจากภายนอก
  disabled?: boolean;           // ถ้า true = ปิดการใช้งาน pagination ทั้งหมด
};
asdladnsfnsdnsdnfsfnasdadja