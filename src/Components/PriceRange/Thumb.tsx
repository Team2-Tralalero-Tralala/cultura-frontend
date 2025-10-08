type Props = {
  leftPct: number;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
};

/**
 * UI Component สำหรับปุ่มจับสไลเดอร์ (Thumb)
 * @param {number} leftPct - ตำแหน่งแนวนอนในหน่วยเปอร์เซ็นต์
 * @param {Function} onPointerDown - callback ที่จะถูกเรียกเมื่อผู้ใช้กดที่ปุ่มนี้
 */
const Thumb = ({ leftPct, onPointerDown }: Props) => {
  return (
    <div
      className="absolute top-1/2 h-[28px] w-[28px] -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-emerald-500 bg-white shadow touch-none"
      style={{ left: `${leftPct}%` }}
      onPointerDown={onPointerDown}
      aria-hidden
    />
  );
};

export default Thumb;