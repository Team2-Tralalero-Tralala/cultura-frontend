import { useRef, useState } from "react";

/** โครงข้อมูลช่วงราคา */
type Range = { min: number; max: number };

/** Props สั้นๆ: ค่าปัจจุบัน + ตัวส่งค่าออก + ขอบเขต + step */
type Props = {
  value: Range;
  onChange: (v: Range) => void;
  min?: number;
  max?: number;
  step?: number;
  title?: string;
};

/**
 * PriceRange
 * - สไลเดอร์คู่ (min/max) + กล่องกรอกเลข
 * - คลิกที่ "ราง" แล้วหัวจับจะย้ายไปตำแหน่งที่คลิก
 * - ลากลื่น ๆ ด้วย draft state ภายใน (แสดงผลทันที) แล้วค่อย sync ออกไปที่พาเรนต์ด้วย rAF
 */
export default function PriceRange({
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 100,
  title = "ช่วงราคา",
}: Props) {
  /** อ้างอิง DOM ของ "ราง" เพื่อคำนวณตำแหน่งเมาส์ → ค่า */
  const trackRef = useRef<HTMLDivElement>(null);

  /** draft = ค่าชั่วคราวระหว่างลาก → เรนเดอร์จากค่านี้เพื่อไม่ให้หน่วง */
  const [draft, setDraft] = useState<Range | null>(null);

  /** เก็บ id ของ requestAnimationFrame สำหรับ sync ออกนอก */
  const rafId = useRef<number | null>(null);

  /** ค่า "ที่ใช้แสดงผลจริง" ตอนนี้ (ถ้ากำลังลากใช้ draft, ไม่งั้นใช้ value จากพาเรนต์) */
  const shown = draft ?? value;

  /** ยูทิลพื้นฐาน */
  const clamp = (n: number) => Math.min(Math.max(n, min), max);
  const roundToStep = (n: number) => Math.round(n / step) * step;
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const nf = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

  /** แปลงข้อความใน input → ตัวเลข (รองรับมีคอมม่า) */
  const toNum = (s: string) => {
    const n = Number(String(s).replaceAll(",", "").trim());
    return Number.isFinite(n) ? n : NaN;
    // ถ้าพิมพ์ว่าง/ตัวอักษร จะได้ NaN แล้วเราจะไม่อัปเดตค่า
  };

  /** จากตำแหน่งเมาส์บนราง → ค่าราคา (อิง min/max + ปัดตาม step) */
  const fromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return shown.min;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ratio = x / rect.width;
    return clamp(roundToStep(min + ratio * (max - min)));
  };

  /**
   * scheduleMove:
   * - เขียนค่าใหม่ลง draft "ทันที" เพื่อให้ UI ลื่น
   * - แล้วค่อย onChange ออกไปยังพาเรนต์ในเฟรมถัดไป (rAF)
   * - บังคับไม่ให้ min > max / max < min
   */
  const scheduleMove = (which: "min" | "max", nextVal: number) => {
    const base = draft ?? value; // ใช้ฐานล่าสุดเท่าที่เห็นบนจอ
    const next: Range =
      which === "min"
        ? { min: clamp(Math.min(nextVal, base.max)), max: base.max }
        : { min: base.min, max: clamp(Math.max(nextVal, base.min)) };

    setDraft(next); // เรนเดอร์บนจอทันที

    if (rafId.current != null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => onChange(next)); // sync ออกนอก
  };

  /**
   * startDrag:
   * - เริ่มโหมดลาก (จากหัวจับหรือจากรางก็ได้)
   * - ผูก pointermove / pointerup กับ window เพื่อให้ลากต่อได้แม้ออกจากราง
   */
  const startDrag = (which: "min" | "max", clientX?: number) => {
    if (typeof clientX === "number") scheduleMove(which, fromClientX(clientX));

    const onMove = (e: PointerEvent) => {
      e.preventDefault(); // กันหน้าเว็บเลื่อนบนมือถือ
      scheduleMove(which, fromClientX(e.clientX));
    };
    const onUp = () => {
      setDraft(null); // เลิกลาก → กลับไปใช้ value จากพาเรนต์
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp, { passive: true });
  };

  /**
   * คลิกที่ราง:
   * - คำนวณค่า ณ จุดคลิก
   * - เลือกหัวจับที่ "ใกล้สุด" แล้วเริ่มลากทันที
   */
  const onTrackPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const target = fromClientX(e.clientX);
    const distMin = Math.abs(target - shown.min);
    const distMax = Math.abs(target - shown.max);
    const which: "min" | "max" = distMin <= distMax ? "min" : "max";
    startDrag(which, e.clientX);
  };

  return (
    <div className="w-[292px] h-[165px] rounded-[20px] border border-gray-800/60 bg-white shadow-sm px-4 pt-3 pb-4">
      <div className="mb-2 text-[20px] font-bold leading-none">{title}</div>

      {/* SLIDER */}
      <div
        ref={trackRef}
        className="relative mb-3 h-[28px] select-none touch-none"
        onPointerDown={onTrackPointerDown}
      >
        {/* รางเทา (ไม่รับ pointer) */}
        <div className="pointer-events-none absolute left-[8px] right-[8px] top-1/2 h-[8px] -translate-y-1/2 rounded-full bg-gray-300" />

        {/* แถบเขียว: ใช้ shown (draft) → ลื่น, ไม่มี transition เพื่อตามหัวจับทันที */}
        <div
          className="pointer-events-none absolute top-1/2 h-[8px] -translate-y-1/2 rounded-full bg-emerald-500"
          style={{
            left: `${pct(shown.min)}%`,
            right: `${100 - pct(shown.max)}%`,
            willChange: "left, right",
          }}
        />

        {/* input range โปร่งใส: เพื่อรองรับคีย์บอร์ด/แอ็กซิส และจำกัด hit-area ไม่ให้ทับกัน */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value.min}
          onChange={(e) => onChange({ min: Number(e.target.value), max: value.max })}
          className="absolute top-0 bottom-0 opacity-0"
          style={{ left: 0, right: `${100 - pct(shown.max)}%` }}
          aria-label="ราคาเริ่มต้น"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value.max}
          onChange={(e) => onChange({ min: value.min, max: Number(e.target.value) })}
          className="absolute top-0 bottom-0 opacity-0"
          style={{ left: `${pct(shown.min)}%`, right: 0 }}
          aria-label="ราคาสิ้นสุด"
        />

        {/* หัวจับ: ใช้ pointer events ของเราเองเพื่อเริ่มลาก (ลื่น+ควบคุมทิศทางได้) */}
        <Thumb leftPct={pct(shown.min)} onPointerDown={(e) => startDrag("min", e.clientX)} />
        <Thumb leftPct={pct(shown.max)} onPointerDown={(e) => startDrag("max", e.clientX)} />
      </div>

      {/* กล่องกรอกเลข: พิมพ์แล้วสไลเดอร์ขยับตาม (ผ่าน scheduleMove → ลื่นเหมือนลาก) */}
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
}

/** หัวจับกลม ๆ (แค่ UI) — onPointerDown ใช้เริ่ม drag */
function Thumb({
  leftPct,
  onPointerDown,
}: {
  leftPct: number;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className="absolute top-1/2 h-[28px] w-[28px] -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-emerald-500 bg-white shadow touch-none"
      style={{ left: `${leftPct}%` }}
      onPointerDown={onPointerDown}
      aria-hidden
    />
  );
}

/** ช่องกรอกเลข มีไอคอนสกุลเงินด้านซ้าย */
function MoneyInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (txt: string) => void;
}) {
  return (
    <div className="relative w-[118px]">
      <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-[18px] font-semibold">
        ฿
      </span>
      <input
        inputMode="numeric"
        className="h-[50px] w-full rounded-[18px] border-2 border-emerald-500 bg-white pl-9 pr-3 text-[18px] font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
