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

// ฟังก์ชัน clamp = จำกัดค่าให้อยู่ในช่วง min-max
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// คำนวณช่วง from–to และหน้าปลอดภัย
function getRange(totalCount: number, pageSize: number, pageIndex: number) {
  const size = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(Math.max(0, totalCount) / size));
  const safePage = clamp(Math.floor(pageIndex), 1, totalPages);
  const from = totalCount === 0 ? 0 : (safePage - 1) * size + 1;
  const to = Math.min(totalCount, safePage * size);
  return { totalPages, safePage, from, to };
}

// ปุ่มลูกศร < >
function ArrowPager({ totalPages, page, onChange }: { totalPages: number; page: number; onChange: (p: number) => void; }) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <nav className="inline-flex items-center gap-[5px]" aria-label="Pagination">
      <button type="button" onClick={() => onChange(page - 1)} disabled={!canPrev} className="h-[30px] w-[35px] rounded-md border text-sm font-medium flex items-center justify-center disabled:opacity-40">‹</button>
      <button type="button" onClick={() => onChange(page + 1)} disabled={!canNext} className="h-[30px] w-[35px] rounded-md border text-sm font-medium flex items-center justify-center disabled:opacity-40">›</button>
    </nav>
  );
}