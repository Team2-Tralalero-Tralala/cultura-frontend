/*
 * คำอธิบาย : Component สำหรับเลือกผู้ดูแล (Admin) ของวิสาหกิจชุมชน
 * ใช้ร่วมกับ MUI Autocomplete เพื่อแสดงรายชื่อผู้ดูแลที่ยังไม่ถูกมอบหมายให้กับชุมชนอื่น
 * และสามารถรวมผู้ดูแลปัจจุบันของชุมชนเข้าในรายการได้โดยไม่ซ้ำ
 * Input :
 *   - value (number | undefined) : id ของผู้ดูแลที่ถูกเลือกในปัจจุบัน
 *   - admin (Admin | null) : ข้อมูลผู้ดูแลปัจจุบันจากชุมชน (ใช้เมื่อแก้ไข)
 *   - onChange (function) : ฟังก์ชัน callback ที่ส่งค่า id ของผู้ดูแลเมื่อมีการเลือกใหม่
 * Output :
 *   - ส่งค่า id ของผู้ดูแล (number) กลับไปยัง parent component ผ่าน onChange
 *   - แสดง Autocomplete dropdown ของผู้ดูแลทั้งหมดที่สามารถเลือกได้
 */

import { getUnassignedAdmins } from "@/Services/community-service";
import Autocomplete from "@mui/material/Autocomplete";
import { useState, useEffect } from "react";

export interface Admin {
  id: number;
  fname: string;
  lname: string;
}

interface AdminSelectorProps {
  value?: number; // id ของ admin ที่เลือก
  admin?: Admin | null; // ✅ admin ปัจจุบันจาก community.admin
  onChange: (value: number | null) => void;
  error?: boolean;
  helperText?: string;
}
/*
 * คำอธิบาย : ฟังก์ชันหลักของ Component สำหรับโหลดและแสดงรายชื่อผู้ดูแล (Admin)
 * Input :
 *   - value : id ของผู้ดูแลที่ถูกเลือกในปัจจุบัน
 *   - admin : ข้อมูลผู้ดูแลปัจจุบันจากชุมชน (ถ้ามี)
 *   - onChange : ฟังก์ชัน callback สำหรับส่งค่า id ของผู้ดูแลกลับเมื่อเลือกใหม่
 * Output :
 *   - แสดง Autocomplete สำหรับเลือกผู้ดูแล
 *   - เรียกใช้ onChange() เพื่ออัปเดตค่าใน parent component
 */
export function AdminSelector({
  value,
  admin,
  onChange,
  error = false,
  helperText = "",
}: AdminSelectorProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  /*
   * คำอธิบาย : ฟังก์ชันภายในสำหรับดึงรายชื่อผู้ดูแลที่ยังไม่ถูกมอบหมาย
   * รวมกับผู้ดูแลปัจจุบันของชุมชน (ถ้ามี) เพื่อแสดงใน Autocomplete
   * Input : none (ใช้ข้อมูลจาก state admin)
   * Output : อัปเดต state 'admins' ด้วยข้อมูลผู้ดูแลทั้งหมด
   */
  useEffect(() => {
    async function loadAdmins() {
      try {
        setLoading(true);
        const res = await getUnassignedAdmins();
        const unassigned = res.data.data as Admin[];

        // ✅ รวม admin ปัจจุบัน (ถ้ามี) เข้ากับลิสต์โดยไม่ซ้ำ
        const merged = admin ? [admin, ...unassigned.filter((a) => a.id !== admin.id)] : unassigned;

        setAdmins(merged);
      } catch (error) {
        console.error(error);
        setAdmins(admin ? [admin] : []);
      } finally {
        setLoading(false);
      }
    }
    loadAdmins();
  }, [admin]);

  // ✅ ค้นหา admin ปัจจุบันจาก options
  const selectedAdmin = admins.find((a) => a.id === value) || admin || null;

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับสร้าง Input ที่ใช้ใน Autocomplete ของ MUI
   * เพื่อกำหนด label, placeholder และสไตล์ของ input field
   * Input :
   *   - id (string) : id ของ input
   *   - label (string) : ข้อความ label ที่จะแสดงบน input
   *   - params (any) : พารามิเตอร์ที่ MUI ส่งมาให้สำหรับ render input
   * Output :
   *   - JSX element ของ custom input field ที่มี label และสไตล์ตามกำหนด
   */
  const renderCustomInput = (id: string, label: string, params: any) => {
    const { InputProps, inputProps } = params;
    return (
      <div ref={InputProps.ref} className="w-full">
        {/* Label + Error message ในบรรทัดเดียวกัน */}
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor={id} className="block text-base font-semibold text-gray-800">
            {label} <span className="text-red-600">*</span>
          </label>
          {error && (
            <span id={`${id}-helper-text`} className="text-xs text-red-600 ml-2 whitespace-nowrap">
              {helperText}
            </span>
          )}
        </div>

        {/* Input field */}
        <div className="relative">
          <input
            {...inputProps}
            id={id}
            type="text"
            placeholder={label}
            className={`block w-full rounded-form border px-4 py-2 text-base text-gray-900 placeholder:text-gray-500 leading-relaxed transition-shadow outline-none
        ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-400"
            : "border-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-400"
        }`}
          />
          {InputProps.endAdornment && (
            <div className="absolute inset-y-0 right-2 flex items-center">
              {InputProps.endAdornment}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Autocomplete
      id="admin-selector"
      disablePortal
      disableClearable
      loading={loading}
      options={admins}
      noOptionsText="ไม่พบผู้ดูแล"
      getOptionLabel={(option) => (option ? `${option.fname} ${option.lname}` : "")}
      value={selectedAdmin!}
      onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
      renderInput={(params) => renderCustomInput("admin-selector", "เลือกผู้ดูแล", params)}
      slotProps={{
        popper: {
          sx: {
            "& .MuiAutocomplete-listbox": {
              fontFamily: "var(--font-sarabun)",
              fontSize: "16px",
            },
            "& .MuiAutocomplete-option": {
              fontFamily: "var(--font-sarabun)",
              fontSize: "16px",
            },
          },
        },
      }}
      sx={{
        "& .MuiInputBase-input": {
          fontFamily: "var(--font-sarabun)",
        },
      }}
    />
  );
}
