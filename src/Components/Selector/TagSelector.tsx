/**
 * คำอธิบาย : Component สำหรับเลือกแท็ก (Tag) ของชุมชน
 * โดยใช้ Autocomplete ที่สามารถเลือกหลายรายการได้ (multiple select)
 */
import { getTags } from "@/Libs/TagService";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
/*
 * คำอธิบาย : ฟังก์ชัน CustomPopper สำหรับกำหนดตำแหน่งและลักษณะของ Popper
 * ซึ่งเป็นกล่อง dropdown ของ Autocomplete
 * Input : props - ข้อมูลจาก Autocomplete ที่เกี่ยวข้องกับตำแหน่ง anchor element
 * Output : คืนค่า Popper element ที่มีความกว้างเท่ากับ input และไม่ถูกตัดขอบ
 */
export interface Tag {
  id: number;
  name: string;
}
interface TagSelectorProps {
  value?: number[];
  tag?: Tag[];
  onChange: (value: number[]) => void;
  error?: boolean;
  helperText?: string;
}
/**
 * คำอธิบาย : Component หลักสำหรับเลือกแท็ก (Tag) ของชุมชน
 * โดยใช้ Autocomplete ที่สามารถเลือกหลายรายการได้ (multiple select)
 * Input :
 *   - value : ค่าของแท็กที่ถูกเลือก (array ของ id)
 *   - tag : รายการแท็กทั้งหมด (array ของ Tag)
 *   - onChange : ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่าของแท็กที่ถูกเลือก
 * output :
 *   - คืนค่า TagSelectorProps
 */
export function TagSelector({
  value = [],
  tag = [],
  onChange,
  error = false,
  helperText = "",
}: TagSelectorProps) {
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<Tag[]>([]);

  // โหลดรายการแท็กทั้งหมดจาก backend
  React.useEffect(() => {
    let active = true;
    getTags().then((respone) => {
      if (!active) return;
      const data = respone.data.data || [];
      const merged = [...data, ...tag.filter((t) => t && !data.some((x: Tag) => x.id === t.id))];
      setTags(merged);
    });
    return () => {
      active = false;
    };
  }, []);

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่าของแท็กที่ถูกเลือก
   * Input :
   *   - tags : รายการแท็กทั้งหมด (array ของ Tag)
   *   - value : ค่าของแท็กที่ถูกเลือก (array ของ id)
   * Output :
   *   - อัปเดตรายการแท็กที่ถูกเลือกใน state 'selectedTags'
   */
  React.useEffect(() => {
    if (tags.length === 0) return;
    const selected = tags.filter((t) => value.includes(t.id));
    setSelectedTags(selected);
  }, [tags, JSON.stringify(value)]); // ใช้ JSON.stringify เพื่อเทียบค่า ไม่ใช่ reference
  /**
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่าของแท็กที่ถูกเลือก
   * Input :
   *   - _ : ค่าเดิม (ไม่ใช้)
   *   - newValue : ค่าของแท็กที่ถูกเลือกใหม่ (array ของ Tag)
   * Output : none (อัปเดต state selectedTags และเรียกใช้ onChange เพื่อส่ง id กลับ parent)
   */
  const handleChange = (_: any, newValue: Tag[]) => {
    setSelectedTags(newValue);
    onChange(newValue.map((tag) => tag.id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-base font-semibold text-gray-800">
          แท็ก <span className="text-red-600">*</span>
        </label>
        {error && <span className="text-xs text-red-600 ml-2 whitespace-nowrap">{helperText}</span>}
      </div>
      <Autocomplete
        multiple
        disableClearable
        disablePortal
        disableCloseOnSelect
        options={tags}
        getOptionLabel={(option) => `${option.name}`}
        value={selectedTags}
        onChange={handleChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderTags={() => null}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.id}>
            <Checkbox icon={icon} checkedIcon={checkedIcon} className="mr-2" checked={selected} />
            {option.name}
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
            <div ref={InputRef} className="w-full">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  {...inputPropsRest}
                  ref={InputElementRef}
                  id="tag-selector"
                  type="text"
                  placeholder="ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา"
                  className={`block w-full rounded-form border pl-10 pr-5 py-2 text-base text-gray-900 placeholder:text-gray-500 leading-relaxed transition-shadow outline-none
                  ${error
                      ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                      : "border-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-400"
                    }`}
                />
                {InputProps.endAdornment && <div className="hidden">{InputProps.endAdornment}</div>}
              </div>
            </div>
          );
        }}
      />

      <div className="mt-4">
        {selectedTags.length === 0 ? (
          <div className="text-gray-500">ยังไม่ได้เลือก</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((item) => (
              <div
                key={item.id}
                className="flex items-center border border-gray-400 rounded px-3 py-1 text-gray-800"
              >
                <span>{item.name}</span>
                <button
                  onClick={() => {
                    const updated = selectedTags.filter((tag) => tag.id !== item.id);
                    setSelectedTags(updated);
                    onChange(updated.map((tag) => tag.id));
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
