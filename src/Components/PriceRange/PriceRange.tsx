import { useRef, useState } from "react";
import MoneyInput from "./MoneyInput";
import Thumb from "./Thumb";

// สร้าง Type Definition สำหรับใช้ใน Component
type Range = { min: number; max: number };

type Props = {
  value: Range;
  onChange: (v: Range) => void;
  min?: number;
  max?: number;
  step?: number;
  title?: string;
};

/**
 * Component สไลเดอร์สำหรับเลือกช่วงราคา (Price Range Slider)
 * เป็น Controlled Component ที่รับ `value` และ `onChange` จาก Parent
 * @param {Range} value - (จำเป็น) object ค่า min/max ที่จะแสดงผล
 * @param {Function} onChange - (จำเป็น) callback function ที่จะถูกเรียกเมื่อค่าเปลี่ยนแปลง
 * @param {number} min - (ไม่จำเป็น) ค่าต่ำสุดของสไลเดอร์
 * @param {number} max - (ไม่จำเป็น) ค่าสูงสุดของสไลเดอร์
 * @param {number} step - (ไม่จำเป็น) ระยะการเลื่อนแต่ละขั้น
 * @param {string} title - (ไม่จำเป็น) หัวข้อของ Component
 */
const PriceRange = ({
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 100,
  title = "ช่วงราคา",
}: Props) => {
  // --- State and Refs ---

  /** Ref อ้างอิงถึง DOM ของรางสไลเดอร์ เพื่อใช้คำนวณตำแหน่ง */
  const trackRef = useRef<HTMLDivElement>(null);

  /**
   * State ชั่วคราว (Draft) สำหรับเก็บค่าระหว่างที่ผู้ใช้กำลังลากเมาส์/นิ้ว
   * เพื่อให้ UI ตอบสนองลื่นไหลทันที โดยไม่ต้องรอ Parent re-render
   */
  const [draft, setDraft] = useState<Range | null>(null);

  /** Ref สำหรับเก็บ ID ของ requestAnimationFrame เพื่อจัดการการอัปเดตค่าไปยัง Parent */
  const rafId = useRef<number | null>(null);

  // --- Derived State and Utilities ---

  /** ค่าที่ใช้แสดงผลจริงบน UI (ถ้ากำลังลากจะใช้ draft, ถ้าไม่จะใช้ value จาก props) */
  const shown = draft ?? value;

  /** ฟังก์ชันจำกัดค่าให้อยู่ในขอบเขต min-max */
  const clamp = (n: number) => Math.min(Math.max(n, min), max);
  /** ฟังก์ชันปัดเศษตัวเลขตามค่า step ที่กำหนด */
  const roundToStep = (n: number) => Math.round(n / step) * step;
  /** ฟังก์ชันคำนวณเปอร์เซ็นต์ของค่าบนรางสไลเดอร์ */
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  /** ตัวจัดการ Format ตัวเลข (เช่น 50000 -> 50,000) */
  const nf = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

  // --- Handlers and Logic ---

  /** แปลงข้อความจาก input (ที่มี comma) กลับเป็นตัวเลข */
  const toNum = (s: string) => {
    const n = Number(String(s).replaceAll(",", "").trim());
    return Number.isFinite(n) ? n : NaN;
  };

  /** แปลงตำแหน่งแกน X ของเมาส์/นิ้ว ให้เป็นค่าตัวเลขบนสไลเดอร์ */
  const fromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return shown.min;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ratio = x / rect.width;
    return clamp(roundToStep(min + ratio * (max - min)));
  };

  /**
   * อัปเดต UI ทันทีด้วย draft state และส่งค่ากลับให้ Parent Component
   * ผ่าน requestAnimationFrame เพื่อไม่ให้เกิดการ re-render ถี่เกินไป
   */
  const scheduleMove = (which: "min" | "max", nextVal: number) => {
    const base = draft ?? value;
    const next: Range =
      which === "min"
        ? { min: clamp(Math.min(nextVal, base.max)), max: base.max }
        : { min: base.min, max: clamp(Math.max(nextVal, base.min)) };

    setDraft(next); // อัปเดต UI ทันที

    if (rafId.current != null) cancelAnimationFrame(rafId.current);
    // ส่งค่ากลับไปหา Parent ใน frame ถัดไป
    rafId.current = requestAnimationFrame(() => onChange(next));
  };

  /** ฟังก์ชันเริ่มการลาก: จะทำงานเมื่อผู้ใช้กดที่ปุ่มจับ (Thumb) */
  const startDrag = (which: "min" | "max", clientX?: number) => {
    if (typeof clientX === "number") scheduleMove(which, fromClientX(clientX));

    // สร้าง Event Listener สำหรับการลากและการปล่อย
    const onMove = (e: PointerEvent) => {
      e.preventDefault();
      scheduleMove(which, fromClientX(e.clientX));
    };
    const onUp = () => {
      setDraft(null); // สิ้นสุดการลาก, กลับไปใช้ค่าจาก props
      // ลบ Event Listener ออกเพื่อไม่ให้เปลือง memory
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    // ผูก Event Listener เข้ากับ window เพื่อให้ลากได้แม้เมาส์จะอยู่นอก Component
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp, { passive: true });
  };

  /** ฟังก์ชันทำงานเมื่อผู้ใช้ "กด" ที่รางสไลเดอร์โดยตรง */
  const onTrackPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const targetValue = fromClientX(e.clientX);
    // คำนวณว่าปุ่มจับอันไหน (min/max) อยู่ใกล้ตำแหน่งที่กดมากกว่ากัน
    const distMin = Math.abs(targetValue - shown.min);
    const distMax = Math.abs(targetValue - shown.max);
    const whichToDrag: "min" | "max" = distMin <= distMax ? "min" : "max";
    // เริ่มการลากปุ่มจับอันที่ใกล้ที่สุด
    startDrag(whichToDrag, e.clientX);
  };

  return (
    <div className="w-[292px] h-[165px] rounded-[20px] border border-gray-800/60 bg-white shadow-sm px-4 pt-3 pb-4">
      <div className="mb-2 text-[20px] font-bold leading-none">{title}</div>

      {/* --- Slider Track and Thumbs --- */}
      <div
        ref={trackRef}
        className="relative mb-3 h-[28px] select-none touch-none"
        onPointerDown={onTrackPointerDown}
      >
        {/* รางสไลเดอร์สีเทา (พื้นหลัง) */}
        <div className="pointer-events-none absolute left-[8px] right-[8px] top-1/2 h-[8px] -translate-y-1/2 rounded-full bg-gray-300" />
        
        {/* แถบสีเขียวที่แสดงช่วงราคาที่เลือก */}
        <div
          className="pointer-events-none absolute top-1/2 h-[8px] -translate-y-1/2 rounded-full bg-emerald-500"
          style={{
            left: `${pct(shown.min)}%`,
            right: `${100 - pct(shown.max)}%`,
          }}
        />

        {/* input range ที่ซ่อนไว้เพื่อ Accessibility (ควบคุมด้วยคีย์บอร์ด/โปรแกรมอ่านหน้าจอ) */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={value.min}
          onChange={(e) => onChange({ min: Number(e.target.value), max: value.max })}
          className="absolute top-0 bottom-0 opacity-0 pointer-events-none"
          style={{ left: 0, right: `${100 - pct(shown.max)}%` }}
          aria-label="ราคาเริ่มต้น"
        />
        <input
          type="range"
          min={min} max={max} step={step}
          value={value.max}
          onChange={(e) => onChange({ min: value.min, max: Number(e.target.value) })}
          className="absolute top-0 bottom-0 opacity-0 pointer-events-none"
          style={{ left: `${pct(shown.min)}%`, right: 0 }}
          aria-label="ราคาสิ้นสุด"
        />

        {/* ปุ่มจับ (Thumbs) ที่ผู้ใช้ลาก */}
        <Thumb leftPct={pct(shown.min)} onPointerDown={(e) => startDrag("min", e.clientX)} />
        <Thumb leftPct={pct(shown.max)} onPointerDown={(e) => startDrag("max", e.clientX)} />
      </div>

      {/* --- Min/Max Input Fields --- */}
      <div className="flex items-center justify-between">
        <MoneyInput
          value={nf.format(shown.min)}
          onChange={(txt) => {
            const n = toNum(txt);
            if (!Number.isNaN(n)) scheduleMove("min", n);
          }}
        />
        <span className="mx-1 text-[18px] text-gray-600">–</span>
        <MoneyInput
          value={nf.format(shown.max)}
          onChange={(txt) => {
            const n = toNum(txt);
            if (!Number.isNaN(n)) scheduleMove("max", n);
          }}
        />
      </div>
    </div>
  );
};

export default PriceRange;