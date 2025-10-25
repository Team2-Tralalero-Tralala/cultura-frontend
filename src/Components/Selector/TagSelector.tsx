import { getTags } from "@/Services/tag-service";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import React from "react";

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
}
/**
 * คำอธิบาย : Component หลักสำหรับเลือกแท็ก (Tag) ของชุมชน
 * โดยใช้ Autocomplete ที่สามารถเลือกหลายรายการได้ (multiple select)
 * Input :
 *   - value : ค่าของแท็กที่ถูกเลือก (array ของ id)
 *   - tag : รายการแท็กทั้งหมด (array ของ Tag)
 *   - onChange : ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่าของแท็กที่ถูกเลือก
 */
export function TagSelector({ value = [], tag = [], onChange }: TagSelectorProps) {
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

  // ซิงค์ selectedTags กับ value ที่ได้รับจาก props
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
    onChange(newValue.map((v) => v.id));
  };

  return (
    <div>
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
            <div
              // Pass event handlers and wrapper-ref from InputProps to the outer div
              ref={InputRef}
              className="w-full"
            >
              <div className="relative">
                <input
                  // Pass native input props to the actual input element
                  {...inputPropsRest}
                  // Pass the actual input element ref here
                  ref={InputElementRef}
                  id="custom-autocomplete"
                  type="text"
                  placeholder="ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา"
                  className="block w-full rounded-form border-1
                    border-gray-400 focus:ring-gray-400 focus:border-gray-500
                    bg-white px-5 py-2 text-base text-gray-900 placeholder:text-gray-500
                    leading-relaxed placeholder:leading-relaxed
                    focus:outline-none focus:ring-1 transition-shadow"
                />
                {InputProps.endAdornment && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {InputProps.endAdornment}
                  </div>
                )}
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
                    const updated = selectedTags.filter((m) => m.id !== item.id);
                    setSelectedTags(updated);
                    onChange(updated.map((v) => v.id));
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
