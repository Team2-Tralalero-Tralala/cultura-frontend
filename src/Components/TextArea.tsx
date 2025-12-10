/*
 * คำอธิบาย : Component สำหรับสร้าง TextField (อินพุตฟอร์ม)
 * ที่รองรับหลายประเภท เช่น ข้อความทั่วไป, รหัสผ่าน (พร้อมปุ่ม toggle แสดง/ซ่อน),
 * และเบอร์โทรศัพท์ (พร้อม prefix +66 และไอคอนธงไทย)
 */
import type { BaseFieldProps } from "../Types/BaseField";

/*
 * ฟังก์ชัน : RequiredMark
 * คำอธิบาย : แสดงเครื่องหมาย * สีแดง เมื่อฟิลด์เป็น required
 * Input : -
 * Output : React element <span>
 */

function RequiredMark() {
  return <span className="text-red-600"> *</span>;
}

/*
 * ฟังก์ชัน : TextField
 * คำอธิบาย : Component หลักสำหรับ input ฟอร์ม รองรับ text, password, และ tel
 * Input :
 *   - id (string) : id ของ input element
 *   - label (string) : label ที่แสดงด้านบนของ input
 *   - required (boolean) : แสดงเครื่องหมาย * ถ้าเป็นฟิลด์บังคับ
 *   - placeholder (string) : ข้อความ placeholder ใน input
 *   - type (string) : ประเภท input เช่น "text", "password", "tel"
 *   - value (string) : ค่าปัจจุบันของ input
 *   - onChange (function) : callback เมื่อค่ามีการเปลี่ยนแปลง
 *   - error (boolean) : สถานะ error
 *   - helperText (string) : ข้อความแสดง error หรือคำแนะนำ
 * Output : React component <TextField> สำหรับใช้งานเป็น input ในฟอร์ม
 */
const TextArea: React.FC<BaseFieldProps> = ({
  id,
  label,
  required,
  placeholder,
  value,
  onChange,
  error = false,
  helperText = "",
  rows = 4,
}) => {
  return (
    <div className="space-y-1.5">
      {/* Label + helperText in one row */}
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-base text-black font-bold">
          {label}
          {required && <RequiredMark />}
        </label>
        {/* helperText on the right */}
        <span
          id={`${id}-helper-text`}
          className={`text-xs ml-2 min-h-[18px] transition-all ${
            error ? "text-red-600 visible" : "text-gray-500"
          }`}
        >
          {helperText}
        </span>
      </div>

      <div className="relative">
        <textarea
          id={id}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          rows={rows}
          className={`block w-full rounded-form border-1 
            ${
              error
                ? "border-red-600 focus:ring-red-600 focus:border-red-600"
                : "border-gray-400 focus:ring-gray-400 focus:border-gray-500"
            }
            bg-white px-5 py-2 text-base text-gray-900 placeholder:text-gray-500 leading-relaxed placeholder:leading-relaxed
            focus:outline-none focus:ring-1 transition-shadow`}
        />
      </div>
    </div>
  );
};

export default TextArea;
