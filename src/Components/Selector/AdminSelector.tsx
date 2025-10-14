import { getUnassignedAdmins } from "@/Libs/CommunityService";
import Autocomplete from "@mui/material/Autocomplete";
import React, { useState, useEffect } from "react";

export interface Admin {
  id: number;
  fname: string;
  lname: string;
}

interface AdminSelectorProps {
  value?: number; // id ของ admin ที่เลือก
  admin?: Admin | null; // ✅ admin ปัจจุบันจาก community.admin
  onChange: (value: number | null) => void;
}

export function AdminSelector({ value, admin, onChange }: AdminSelectorProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAdmins() {
      try {
        setLoading(true);
        const res = await getUnassignedAdmins();
        const unassigned = res.data.data as Admin[];

        // ✅ รวม admin ปัจจุบัน (ถ้ามี) เข้ากับลิสต์โดยไม่ซ้ำ
        const merged = admin
          ? [admin, ...unassigned.filter((a) => a.id !== admin.id)]
          : unassigned;

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

  const renderCustomInput = (id: string, label: string, params: any) => {
    const { InputProps, inputProps } = params;
    return (
      <div ref={InputProps.ref} className="w-full">
        <label
          htmlFor={id}
          className="block text-base font-semibold text-gray-800 mb-1.5"
        >
          {label} <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <input
            {...inputProps}
            id={id}
            type="text"
            placeholder={label}
            className="block w-full rounded-form border border-gray-400 focus:ring-1 focus:ring-gray-400 focus:border-gray-500 bg-white px-4 py-2 text-base text-gray-900 placeholder:text-gray-500 leading-relaxed transition-shadow outline-none"
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
      getOptionLabel={(option) =>
        option ? `${option.fname} ${option.lname}` : ""
      }
      value={selectedAdmin}
      onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
      renderInput={(params) =>
        renderCustomInput("admin-selector", "เลือกผู้ดูแล", params)
      }
    />
  );
}
