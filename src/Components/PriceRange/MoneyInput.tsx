type Props = {
  value: string;
  onChange: (txt: string) => void;
};

/**
 * UI Component สำหรับช่องกรอกราคา (เป็น Controlled Component เช่นกัน)
 * @param {string} value - ค่าที่จะแสดงในช่อง input
 * @param {Function} onChange - callback ที่จะถูกเรียกเมื่อมีการพิมพ์
 */
const MoneyInput = ({ value, onChange }: Props) => {
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
};

export default MoneyInput;