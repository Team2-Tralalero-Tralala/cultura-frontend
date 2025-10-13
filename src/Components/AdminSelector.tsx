import { getUnassignedAdmins } from "@/Libs/CommunityService";
import Autocomplete from "@mui/material/Autocomplete";
import React, { useState } from "react";

interface Admin {
  id: number;
  fname: string;
  lname: string;
}

export function AdminSelector() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  React.useEffect(() => {
    async function loadAdmins() {
      try {
        setLoading(true);
        const response = await getUnassignedAdmins();
        const data = response.data.data;
        setAdmins(data);
        setLoading(false); // ✅ Add this line for success
      } catch (error) {
        setAdmins([]);
        console.error(error);
        setLoading(false); // ✅ Add this line for error
      }
    }
    loadAdmins();
  }, []);

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
  console.log(selectedAdmin);
  return (
    <>
      <Autocomplete
        id="province"
        disablePortal
        disableClearable
        loading={loading}
        options={admins || []}
        getOptionLabel={(option) => `${option.fname} ${option.lname}`}
        value={selectedAdmin}
        onChange={(_, newValue) => setSelectedAdmin(newValue)}
        renderInput={(params) =>
          renderCustomInput("province", "เลือกผู้ดูแล", params)
        }
      />
    </>
  );
}
