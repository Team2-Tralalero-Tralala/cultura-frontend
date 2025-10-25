/**
 * Bank Selector Component
 * ใช้สำหรับเลือกธนาคารจากรายการที่ดึงมาจาก API
 */
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { useEffect, useState } from "react";

interface Bank {
  name: string;
}
interface BankSelectorProps {
  value?: string;
  bank?: Bank;
  onChange: (value: string | null) => void;
  error?: boolean;
  helperText?: string;
}
/**
 * ฟังก์ชัน: BankSelector
 * ใช้สำหรับเลือกธนาคารจากรายการที่ดึงมาจาก API
 * Input :
 *   - value : ชื่อธนาคารที่ถูกเลือก
 *   - bank : ข้อมูลธนาคารปัจจุบัน (ใช้เมื่อแก้ไข)
 *   - onChange : ฟังก์ชัน callback สำหรับส่งค่าธนาคารที่เลือกกลับไปยัง parent component
 *   - error : ตัวบ่งชี้ว่ามีข้อผิดพลาดในการเลือกหรือไม่
 *   - helperText : ข้อความช่วยเหลือที่จะแสดงเมื่อมีข้อผิดพลาด
 * Output :
 *   - แสดง Autocomplete สำหรับเลือกธนาคาร
 *   - เรียกใช้ onChange() เพื่ออัปเดตค่าใน parent component
 */
export function BankSelector({
  value,
  bank,
  onChange,
  error = false,
  helperText = "",
}: BankSelectorProps) {
  const [banks, setBanks] = useState<Bank[]>([]);

  /**
   * ฟังก์ชันภายใน: useEffect
   * ใช้สำหรับดึงรายชื่อธนาคารจาก API เมื่อ component ถูก mount
   * Input : none
   * Output : อัปเดตรายการธนาคารใน state 'banks'
   */
  useEffect(() => {
    async function loadBank() {
      const response = await axios.get("http://localhost:3000/api/super/banks", {
        withCredentials: true,
      });
      const data = response.data.data;
      setBanks(data);
      console.log(data);
    }
    loadBank();
  }, [bank]);

  const selectedBanks = banks.find((bank) => bank.name === value) || bank || null;
  /**
   * ฟังก์ชันภายใน: renderCustomInput
   * ใช้สำหรับกำหนดรูปแบบของ input field ใน Autocomplete
   * Input :
   *   - id : รหัสของ input field
   *   - label : ป้ายชื่อของ input field
   *   - params : พารามิเตอร์ที่ได้รับจาก Autocomplete
   * Output :
   *   - คืนค่า JSX สำหรับ input field ที่มีการจัดรูปแบบตามที่กำหนด
   */
  const renderCustomInput = (id: string, label: string, params: any) => {
    const { InputProps, inputProps } = params;
    return (
      <div ref={InputProps.ref} className="w-full">
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
            placeholder="เลือกธนาคาร"
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
      id="bank-selector"
      disablePortal
      disableClearable
      options={banks}
      noOptionsText="ไม่พบธนาคาร"
      getOptionLabel={(option) => (option ? `${option.name}` : "")}
      value={selectedBanks!}
      onChange={(_, newValue) => onChange(newValue ? newValue.name : null)}
      renderInput={(params) => renderCustomInput("bank-selector", "ชื่อธนาคาร", params)}
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
