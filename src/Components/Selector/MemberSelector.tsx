import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Popper from "@mui/material/Popper";
import { useState } from "react";
import { getUnassignedMembers } from "@/Libs/CommunityService";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

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
export default function MemberSelector({
  value = [],
  member = [],
  onChange,
}: MemberSelectorProps) {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true);
        const response = await getUnassignedMembers();
        const unassigned = response.data?.data || [];

        // ป้องกัน null/undefined จาก prop member
        const safeMember = Array.isArray(member) ? member : [];

        // รวมข้อมูลโดยกรอง undefined ออก
        const merged = [
          ...unassigned,
          ...safeMember.filter(
            (old) => old && !unassigned.some((m: Member) => m.id === old.id)
          ),
        ].filter((m) => m && m.id); // กรอง object ที่ไม่มี id ออก

        setMembers(merged);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, [member]);

  React.useEffect(() => {
    if (!members || members.length === 0) return;
    if (!value || value.length === 0) {
      setSelectedMembers([]);
      return;
    }

    const preselected = members.filter((m) => value.includes(m.id));
    setSelectedMembers(preselected);
  }, [members, value]);

  const handleChange = (_: any, newValue: Member[]) => {
    setSelectedMembers(newValue);
    onChange(newValue.map((v) => v.id)); // ✅ แก้ตรงนี้
  };

  return (
    <div>
      <Autocomplete
        multiple
        disablePortal
        disableCloseOnSelect
        PopperComponent={CustomPopper}
        options={members}
        getOptionLabel={(option) => `${option.fname} ${option.lname}`}
        value={selectedMembers}
        loading={loading}
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
            {option.fname} {option.lname}
          </li>
        )}
        renderInput={(params) => {
          // Destructure props carefully
          const { InputProps, inputProps } = params;
          const { ref: InputRef, ...InputPropsRest } = InputProps;
          const { ref: InputElementRef, ...inputPropsRest } = inputProps;

          return (
            <div
              // Pass event handlers and wrapper-ref from InputProps to the outer div
              {...InputPropsRest}
              ref={InputRef}
              className="w-full"
            >
              <label className="block text-base font-semibold text-gray-800 mb-1.5">
                สมาชิก
              </label>
              <div className="relative">
                <input
                  // Pass native input props to the actual input element
                  {...inputPropsRest}
                  // Pass the actual input element ref here
                  ref={InputElementRef}
                  id="custom-autocomplete"
                  type="text"
                  placeholder="เลือกสมาชิก"
                  className="block w-full rounded-form border-1
                  border-gray-400 focus:ring-gray-400 focus:border-gray-500
                  bg-white px-5 py-2 text-base text-gray-900 placeholder:text-gray-500
                  leading-relaxed placeholder:leading-relaxed
                  focus:outline-none focus:ring-1 transition-shadow"
                />
              </div>
            </div>
          );
        }}
      />

      <div className="mt-4">
        <div className="text-base font-semibold mb-1">
          จำนวนสมาชิก {selectedMembers.length} คน
        </div>
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
                    const updated = selectedMembers.filter(
                      (m) => m.id !== item.id
                    );
                    setSelectedMembers(updated);
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
