import React from "react";

// Props ของ Pagination for Table component
type DataPagerProps = {
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
function ArrowPager({
  totalPages,
  page,
  onChange,
}: {
  totalPages: number;
  page: number;
  onChange: (p: number) => void;
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav className="inline-flex items-center gap-6" aria-label="Pagination">
      {/* ปุ่มก่อนหน้า */}
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={!canPrev}
        className="disabled:opacity-30"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* ปุ่มถัดไป */}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={!canNext}
        className="disabled:opacity-30"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  );
}

// ตัวเลือกจำนวนแถวต่อหน้า
function PageSizeSelect({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [open, setOpen] = React.useState(false);
  const options = [10, 30, 50];

  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
      <span>จำนวนแถวต่อหน้า :</span>
      <div className="relative inline-block">
        {/* ปุ่มกดเปิด dropdown */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setOpen(!open)}
        >
          <span className="text-gray-500">{value}</span>
          <span className="ml-1">{open ? "▲" : "▼"}</span>
        </div>

        {/* รายการตัวเลือก */}
        {open && (
          <div className="absolute mt-1 bg-white rounded-md shadow-md z-10">
            {options.map((n) => (
              <div
                key={n}
                onClick={() => {
                  onChange(n);
                  setOpen(false);
                }}
                className={`w-[94px] h-[43px] flex items-center justify-center rounded-md cursor-pointer ${
                  n === value ? "bg-[#9EFFA2]" : "hover:bg-[#9EFFA2]"
                }`}
              >
                {n}
              </div>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}




// Function สําหรับเรียกใช้งาน Pagination for Table component
export default function DataPager({ totalCount, pageSize, pageIndex, onPageIndexChange, onPageSizeChange, className }: {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  onPageIndexChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}) {
  const { totalPages, safePage, from, to } = getRange(totalCount, pageSize, pageIndex);
  return (
    <div className={`w-full text-sm ${className ?? ""}`}>
      <div className="text-gray-700">ทั้งหมด {totalCount.toLocaleString()} แถว</div>
      <div className="flex items-center mt-[34px]">
        <PageSizeSelect value={pageSize} onChange={(n) => { onPageSizeChange(n); onPageIndexChange(1); }} />
        <div className="flex items-center gap-3 ml-[420px]">
          <div className="text-gray-700">{from}-{to} จาก {totalCount.toLocaleString()}</div>
          <ArrowPager totalPages={totalPages} page={safePage} onChange={onPageIndexChange} />
        </div>
      </div>
    </div>
  );
}