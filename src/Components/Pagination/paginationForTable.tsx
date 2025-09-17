import React from "react";

// Props ของ Pagination for Table component
export type DataPagerProps = {
  totalCount: number;/** จำนวนรายการทั้งหมด */
  pageSize: number;/** ขนาดต่อหน้า (เช่น 10/30/50) */
  pageIndex: number;/** เลขหน้าปัจจุบัน (เริ่ม 1) */
  onPageIndexChange: (page: number) => void;/** เปลี่ยนหน้า */
  onPageSizeChange: (size: number) => void;/** เปลี่ยนจำนวนต่อหน้า */
  className?: string;/** className ภายนอก (ถ้าต้องการ) */
};