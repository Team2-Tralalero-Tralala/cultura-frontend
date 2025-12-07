/*
 * Component: CommunitySelector
 * Description:
 *  - สำหรับเลือก "ชุมชนวิสาหกิจ" 1 รายการ
 *  - ใช้ Autocomplete ของ MUI พร้อมระบบค้นหา
 *  - ดึงข้อมูลจาก API /communities หรือ endpoint ที่มีอยู่
 */

import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

interface Community {
  id: number;
  name: string;
}

interface CommunitySelectorProps {
  value?: number | null;
  onChange: (value: number | null) => void;
}

export default function CommunitySelector({ value = null, onChange }: CommunitySelectorProps) {
  const [options, setOptions] = React.useState<Community[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // โหลดรายชื่อชุมชนจาก API
  React.useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const res = await axios.get(`${apiUrl}/super/communities`, {
          params: { search: inputValue },
          withCredentials: true,
        });
        setOptions(res.data?.data.data || []);
      } catch (err) {
        console.error("Error fetching communities:", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchCommunities, 300);
    return () => clearTimeout(delayDebounce);
  }, [inputValue]);

  const selectedCommunity = options.find((c) => c.id === value) || null;

  return (
    <div>
      <label className="block text-base font-semibold text-gray-800 mb-1.5">ชุมชนวิสาหกิจ</label>
      <Autocomplete
        value={selectedCommunity}
        onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        options={options}
        getOptionLabel={(option) => option.name}
        loading={loading}
        noOptionsText="ไม่พบข้อมูลชุมชน"
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="ค้นหาชุมชน"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </div>
  );
}
