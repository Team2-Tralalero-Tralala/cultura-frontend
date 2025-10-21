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
export function TagSelector({
  value = [],
  tag = [],
  onChange,
}: TagSelectorProps) {
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<Tag[]>([]);

  // โหลด tags แค่ครั้งเดียว
  React.useEffect(() => {
    let active = true;
    getTags().then((respone) => {
      if (!active) return;
      const data = respone.data.data || [];
      const merged = [
        ...data,
        ...tag.filter((t) => t && !data.some((x: Tag) => x.id === t.id)),
      ];
      setTags(merged);
    });
    return () => {
      active = false;
    };
  }, []); // ❗ ไม่มี dependency

  // sync selected tags จาก props (value)
  React.useEffect(() => {
    if (tags.length === 0) return;
    const selected = tags.filter((t) => value.includes(t.id));
    setSelectedTags(selected);
  }, [tags, JSON.stringify(value)]); // ใช้ JSON.stringify เพื่อเทียบค่า ไม่ใช่ reference

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
        // loading={loading}
        onChange={handleChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderTags={() => null}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.id}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              className="mr-2"
              checked={selected}
            />
            {option.name}
          </li>
        )}
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
                {InputProps.endAdornment && ( // ✅ render แยกเอง
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
                    const updated = selectedTags.filter(
                      (m) => m.id !== item.id
                    );
                    setSelectedTags(updated);
                    onChange(updated.map((v) => v.id)); // ✅ sync กลับ parent
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
