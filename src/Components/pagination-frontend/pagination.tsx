import React from "react";

type PaginationProps = {
  currentPage: number;               // หน้าปัจจุบัน (เริ่มที่ 1)
  totalPages: number;                // จำนวนหน้าทั้งหมด
  onPageChange: (page: number) => void; // callback เวลาเปลี่ยนหน้า
  siblingCount?: number;             // จำนวนเลขข้างเคียง (default 1)
};

const DOTS = "…";
