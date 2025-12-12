/*
 * คำอธิบาย : Component สำหรับเลือกสมาชิก (Member) ของวิสาหกิจชุมชน
 * ใช้ร่วมกับ MUI Autocomplete แบบ multiple selection เพื่อเลือกสมาชิกหลายคนได้ในครั้งเดียว
 * โดยจะดึงข้อมูลสมาชิกที่ยังไม่ถูกมอบหมายจาก API และรวมกับสมาชิกที่มีอยู่แล้วในชุมชน
 * Input :
 *   - value (number[]) : id ของสมาชิกที่ถูกเลือกในปัจจุบัน
 *   - member (Member[]) : รายการสมาชิกที่อยู่ในชุมชนเดิม (ใช้เมื่อแก้ไขข้อมูล)
 *   - onChange (function) : ฟังก์ชัน callback สำหรับส่ง id ของสมาชิกที่เลือกกลับไปยัง parent component
 * Output :
 *   - แสดง Autocomplete dropdown สำหรับเลือกสมาชิก
 *   - ส่ง id ของสมาชิกทั้งหมดที่เลือกกลับไปยัง parent component ผ่าน onChange()
 */

import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Popper from "@mui/material/Popper";
import { getUnassignedMembers } from "@/Services/community-service";
import SearchIcon from "@mui/icons-material/Search";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
/*
 * คำอธิบาย : ฟังก์ชัน CustomPopper สำหรับกำหนดตำแหน่งและลักษณะของ Popper
 * ซึ่งเป็นกล่อง dropdown ของ Autocomplete
 * Input : props - ข้อมูลจาก Autocomplete ที่เกี่ยวข้องกับตำแหน่ง anchor element
 * Output : คืนค่า Popper element ที่มีความกว้างเท่ากับ input และไม่ถูกตัดขอบ
 */
function CustomPopper(props: any) {
  const { anchorEl } = props;
  return (
    <Popper
      {...props}
      placement="bottom-start"
      modifiers={[
        { name: "flip", enabled: false },
        { name: "preventOverflow", enabled: true },
      ]}
      style={{
        zIndex: 1300,
        width: anchorEl ? anchorEl.clientWidth : undefined, // ความกว้างเท่ากับ input
      }}
    />
  );
}

export interface Member {
  id: number;
  fname: string;
  lname: string;
}
interface MemberSelectorProps {
  value?: number[];
  member?: Member[];
  onChange: (value: number[]) => void;
}
/*
 * คำอธิบาย : Component หลักสำหรับเลือกสมาชิก (Member) ของชุมชน
 * โดยใช้ Autocomplete ที่สามารถเลือกหลายรายการได้ (multiple select)
 * Input :
 *   - value : id ของสมาชิกที่ถูกเลือก
 *   - member : รายการสมาชิกเดิมในชุมชน (ใช้ในหน้าแก้ไข)
 *   - onChange : callback สำหรับอัปเดตค่าที่เลือกกลับไปยัง parent component
 * Output :
 *   - UI Autocomplete ที่เลือกสมาชิกได้หลายคน
 *   - แสดงรายชื่อสมาชิกที่เลือกไว้ พร้อมปุ่มลบแต่ละคน
 */
export default function MemberSelector({
  value = [],
  member = [],
  onChange = () => {},
}: MemberSelectorProps) {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = React.useState<Member[]>([]);
  /*
   * คำอธิบาย : ฟังก์ชันภายในสำหรับโหลดรายชื่อสมาชิกจาก API
   * โดยจะรวมข้อมูลสมาชิกที่มีอยู่ในชุมชน (prop member) เข้ากับสมาชิกที่ยังไม่ถูกใช้
   * Input : none (ดึงข้อมูลจาก API และ props member)
   * Output : อัปเดต state 'members' ด้วยข้อมูลสมาชิกทั้งหมดที่เลือกได้
   */
  React.useEffect(() => {
    let active = true;
    getUnassignedMembers().then((response) => {
      if (!active) return;
      const data = response.data.data || [];
      const merged = [
        ...data,
        ...member.filter((t) => t && !data.some((x: Member) => x.id === t.id)),
      ];
      setMembers(merged);
    });
    return () => {
      active = false;
    };
  }, [member]);
  /*
   * คำอธิบาย : ฟังก์ชันสำหรับตั้งค่า selectedMembers ให้ตรงกับค่า value ปัจจุบัน
   * Input : none (อ้างอิง state 'members' และ prop 'value')
   * Output : อัปเดต state 'selectedMembers' ให้ตรงกับ id ที่เลือกอยู่ใน value
   */

  React.useEffect(() => {
    if (!members?.length || !value?.length) return;

    setSelectedMembers((prev) => {
      if (prev.length > 0) return prev; // ถ้ามีอยู่แล้วไม่ต้องเซ็ตซ้ำ
      return members.filter((m) => value.includes(m.id));
    });
  }, [members, value]);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการเมื่อมีการเลือกสมาชิกใน Autocomplete
   * Input :
   *   - newValue : รายการสมาชิกที่ถูกเลือกใหม่
   * Output :
   *   - อัปเดต state 'selectedMembers'
   *   - ส่ง id ของสมาชิกที่เลือกทั้งหมดกลับไปยัง parent component ผ่าน onChange()
   */
  const handleChange = (_: any, newValue: Member[]) => {
    setSelectedMembers(newValue);
    onChange(newValue.map((v) => v.id));
  };

  return (
    <div>
      <Autocomplete
        multiple
        disablePortal
        disableClearable
        disableCloseOnSelect
        PopperComponent={CustomPopper}
        options={members}
        getOptionLabel={(option) => `${option.fname} ${option.lname}`}
        value={selectedMembers}
        noOptionsText="ไม่พบสมาชิก"
        onChange={handleChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderTags={() => null}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.id}>
            <Checkbox icon={icon} checkedIcon={checkedIcon} className="mr-2" checked={selected} />
            {option.fname} {option.lname}
          </li>
        )}
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
        renderInput={(params) => {
          // Destructure props carefully
          const { InputProps, inputProps } = params;
          const { ref: InputRef } = InputProps;
          const { ref: InputElementRef, ...inputPropsRest } = inputProps;

          return (
            <div
              // Pass event handlers and wrapper-ref from InputProps to the outer div
              ref={InputRef}
              className="w-full"
            >
              <label className="block text-base font-semibold text-gray-800 mb-1.5">สมาชิก</label>
              <div className="relative">
                <input
                  // Pass native input props to the actual input element
                  {...inputPropsRest}
                  // Pass the actual input element ref here
                  ref={InputElementRef}
                  id="custom-autocomplete"
                  type="text"
                  placeholder="ค้นหาสมาชิก"
                  className="block w-full rounded-form border-1
                  border-gray-400 focus:ring-gray-400 focus:border-gray-500
                  bg-white px-5 py-2 text-base text-gray-900 placeholder:text-gray-500
                  leading-relaxed placeholder:leading-relaxed
                  focus:outline-none focus:ring-1 transition-shadow pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <SearchIcon />
                </div>
                {InputProps.endAdornment && <div className="hidden">{InputProps.endAdornment}</div>}
              </div>
            </div>
          );
        }}
      />

      <div className="mt-4">
        <div className="text-base font-semibold mb-1">จำนวนสมาชิก {selectedMembers.length} คน</div>
        {selectedMembers.length === 0 ? (
          <div className="text-gray-500">ยังไม่ได้เลือก</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((item) => (
              <div
                key={item.id}
                className="flex items-center border border-gray-400 rounded px-3 py-1 text-gray-800"
              >
                <span>
                  {item.fname} {item.lname}
                </span>
                <button
                  onClick={() => {
                    const updated = selectedMembers.filter((member) => member.id !== item.id);
                    setSelectedMembers(updated);
                    onChange(updated.map((member) => member.id));
                  }}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
