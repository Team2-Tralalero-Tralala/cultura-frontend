import React from "react"; 


// Props ของ Pagination component
type PaginationProps = {
  totalPages: number;           // จำนวนหน้าทั้งหมด (เช่น 10 หน้า)
  currentPage: number;          // หน้าปัจจุบัน (เริ่มนับจาก 1)
  onPageChange: (page: number) => void; // callback ที่จะถูกเรียกเมื่อมีการเปลี่ยนหน้า
  className?: string;           // สำหรับส่ง className เพิ่มเติมจากภายนอก
};

const ELLIPSIS = "…" as const; // สัญลักษณ์ … (ใช้ใน pagination)
type PageToken = number | typeof ELLIPSIS; // ประเภทของ token ที่ใช้ใน pagination (เลข หรือ …)

// ฟังก์ชันสร้าง array ของเลขจาก start → end
function range(start: number, end: number): number[] { 
  const out: number[] = []; 
  for (let i = start; i <= end; i++) out.push(i); 
  return out;
}

// ฟังก์ชัน clamp = จำกัดค่าให้อยู่ในช่วง min-max
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// แสดงเลขไม่เกิน 7 ตัว (รวม …)
function getPaginationRange(totalPages: number, currentPage: number): PageToken[] {
  const total = Math.max(1, Math.floor(totalPages)); // จำนวนหน้ารวม ต้องไม่น้อยกว่า 1
  const current = clamp(Math.floor(currentPage), 1, total); // จำกัด currentPage ให้อยู่ในช่วง 1 - total

  // ถ้าจำนวนหน้าทั้งหมดไม่เกิน 7 → แสดงทั้งหมด
  if (total <= 7) {
    return range(1, total);
  }

  // ถ้าอยู่ช่วงต้น (หน้า 1–3) → แสดง 1-5, …, last
  if (current <= 3) {
    return [1, 2, 3, 4, 5, ELLIPSIS, total];
  }

  // ถ้าอยู่ช่วงท้าย (ใกล้ last) → แสดง first, …, last-4 ถึง last
  if (current >= total - 2) {
    return [1, ELLIPSIS, total - 4, total - 3, total - 2, total - 1, total];
  }

  // กรณีอยู่ตรงกลาง → แสดง first, …, (current-1, current, current+1), …, last
  return [1, ELLIPSIS, current - 1, current, current + 1, ELLIPSIS, total];
}

// ฟังก์ชันรวม className (คล้าย clsx)
function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  className,
}: PaginationProps) {
  // คำนวณ pages ที่จะแสดง (memoized)
  const pages = React.useMemo(
    () => getPaginationRange(totalPages, currentPage),
    [totalPages, currentPage]
  );

  const canPrev = currentPage > 1; // ปุ่ม Prev ใช้ได้เมื่อไม่อยู่หน้าแรก
  const canNext = currentPage < totalPages; // ปุ่ม Next ใช้ได้เมื่อไม่อยู่หน้าสุดท้าย

  // ฟังก์ชันเปลี่ยนหน้า (เรียก onPageChange)
  const go = (p: number) => {
    const clamped = clamp(p, 1, totalPages);
    if (clamped !== currentPage) onPageChange(clamped);
  };

  return (
    <nav className={cx("inline-flex items-center gap-[5px]", className)} aria-label="Pagination">
      {/* ปุ่ม Previous */}
      <button
        type="button"
        onClick={() => go(currentPage - 1)}
        disabled={!canPrev}
        aria-label="Previous page"
        className={cx(baseBtn, !canPrev && disabledBtn)}
      >
        <span aria-hidden>‹</span>
      </button>

      {/* ปุ่มเลขหน้า */}
      {pages.map((t, idx) =>
        t === ELLIPSIS ? (
          // กรณีเป็น …
          <span key={`dots-${idx}`} className="px-2 text-xl select-none" aria-hidden>
            …
          </span>
        ) : (
          // กรณีเป็นเลขปกติ
          <button
            key={t}
            type="button"
            onClick={() => go(t)}
            aria-current={t === currentPage ? "page" : undefined}
            aria-label={`Page ${t}${t === currentPage ? ", current" : ""}`}
            className={cx(
              baseBtn,
              t === currentPage ? activeBtn : outlineBtn,
            )}
          >
            {t}
          </button>
        )
      )}

      {/* ปุ่ม Next */}
      <button
        type="button"
        onClick={() => go(currentPage + 1)}
        disabled={!canNext}
        aria-label="Next page"
        className={cx(baseBtn, !canNext && disabledBtn)}
      >
        <span aria-hidden>›</span>
      </button>
    </nav>
  );
}

// baseBtn = ปุ่มพื้นฐาน (ทุกปุ่มใช้ร่วมกัน)
const baseBtn =
  "h-[30px] w-[35px] rounded-md border text-sm font-medium flex items-center justify-center transition disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

// outlineBtn = ปุ่มเลขหน้า (ยังไม่ active)
const outlineBtn =
  "border-[#00BF6A] text-black hover:bg-emerald-50 focus-visible:ring-[#00BF6A]";

// activeBtn = ปุ่มเลขหน้าที่ active (currentPage)
const activeBtn =
  "bg-[#00BF6A] text-white border-[#00BF6A] hover:bg-[#00a85c] focus-visible:ring-[#00BF6A]";

// disabledBtn = ปุ่มที่ถูกปิดการใช้งาน (Prev/Next ไม่กดได้)
const disabledBtn = "opacity-40 hover:bg-transparent";

