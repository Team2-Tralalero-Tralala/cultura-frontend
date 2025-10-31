/*
 * คำอธิบาย : Component สำหรับเลือกที่อยู่ในประเทศไทย (จังหวัด, อำเภอ, ตำบล, รหัสไปรษณีย์)
 * ใช้ข้อมูลจากไฟล์ geography.json บน GitHub เพื่อสร้าง dropdown แบบเชื่อมโยงกัน
 * โดยจะโหลดข้อมูลจังหวัดทั้งหมด และเมื่อเลือกจังหวัด จะกรองอำเภอ และตำบลตามลำดับ
 * ใช้ร่วมกับ Component TextField และ Material UI Autocomplete
 *
 * ฟังก์ชันหลัก:
 * 1. loadLocationData() — โหลดข้อมูลจังหวัด/อำเภอ/ตำบลจาก API
 * 2. handleProvinceChange(), handleDistrictChange(), handleSubdistrictChange() — จัดการอีเวนต์เมื่อผู้ใช้เลือกข้อมูล
 * 3. renderCustomInput() — สร้าง input แบบ custom ให้กับ Autocomplete
 *
 * Output: ส่งข้อมูล ThailandLocation (province, district, subdistrict, postalCode)
 * กลับไปยัง component แม่ผ่าน props.onChange()
 */

import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import TextField from "@/Components/TextField";

interface GeographyItem {
  provinceNameTh: string;
  districtNameTh: string;
  subdistrictNameTh: string;
  postalCode: string;
}

interface Subdistrict {
  nameTh: string;
  postalCode: string;
}

interface District {
  nameTh: string;
  subdistricts: Record<string, Subdistrict>;
}

interface Province {
  nameTh: string;
  districts: Record<string, District>;
}

export interface ThailandLocation {
  province?: string;
  district?: string;
  subdistrict?: string;
  postalCode?: string;
}

interface ThailandLocationSelectProps {
  value?: ThailandLocation;
  onChange: (value: ThailandLocation) => void;
  labelPrefix?: string;
  disabled?: boolean;
  error?: {
    province?: boolean;
    district?: boolean;
    subdistrict?: boolean;
    
  };
  helperText?: {
    province?: string;
    district?: string;
    subdistrict?: string;
  };
}

/*
 * คำอธิบาย : ฟังก์ชันโหลดข้อมูลที่ตั้งในประเทศไทย (จังหวัด, อำเภอ, ตำบล, รหัสไปรษณีย์)
 * Input : ไม่มี
 * Output : Object รูปแบบ Record<string, Province> ที่จัดโครงสร้างจังหวัด → อำเภอ → ตำบล
 */
async function loadLocationData() {
  try {
    const response = await axios.get(
      "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/geography.json"
    );
    const data: GeographyItem[] = response.data;
    const provinces: Record<string, Province> = {};
    data.forEach((item) => {
      if (!provinces[item.provinceNameTh]) {
        provinces[item.provinceNameTh] = {
          nameTh: item.provinceNameTh,
          districts: {},
        };
      }
      const province = provinces[item.provinceNameTh];
      if (!province.districts[item.districtNameTh]) {
        province.districts[item.districtNameTh] = {
          nameTh: item.districtNameTh,
          subdistricts: {},
        };
      }
      const district = province.districts[item.districtNameTh];
      if (!district.subdistricts[item.subdistrictNameTh]) {
        district.subdistricts[item.subdistrictNameTh] = {
          nameTh: item.subdistrictNameTh,
          postalCode: item.postalCode,
        };
      }
    });
    return provinces;
  } catch (error) {
    console.error(error);
    return {};
  }
}
/*
 * คำอธิบาย : Component สำหรับแสดงตัวเลือกจังหวัด/อำเภอ/ตำบล/รหัสไปรษณีย์
 * Input : props.value (ThailandLocation), props.onChange (callback)
 * Output : อัปเดตค่าที่ผู้ใช้เลือกแล้วส่งกลับไปยัง Component แม่ผ่าน onChange()
 */
export default function ThailandLocationSelector({
  value,
  onChange,
  error = {
    province: false,
    district: false,
    subdistrict: false,
  },
  helperText = {
    province: "",
    district: "",
    subdistrict: "",
  },
}: ThailandLocationSelectProps) {
  const [geoData, setGeoData] = useState<Record<string, Province>>({});
  const [ready, setReady] = useState(false);

  // โหลด geography.json
  useEffect(() => {
    async function fetchData() {
      const provinces = await loadLocationData();
      setGeoData(provinces);
      setReady(true);
    }
    fetchData();
  }, []);

  /*
   * คำอธิบาย : เมื่อข้อมูล geography โหลดเสร็จแล้ว
   * ให้ซิงก์ค่าที่ได้จาก API เข้ากับ state ปัจจุบัน (ใช้เมื่อแก้ไขข้อมูลที่มีอยู่)
   * Input : value จาก props
   * Output : อัปเดต province/district/subdistrict/postalCode ให้ถูกต้องตามข้อมูล geoData
   */
  useEffect(() => {
    if (!ready || !value?.province) return;
    const province = geoData[value.province];
    if (!province) return;
    const district = province.districts[value.district ?? ""];
    const subdistrict = district?.subdistricts[value.subdistrict ?? ""];

    onChange({
      province: value.province,
      district: district ? value.district : "",
      subdistrict: subdistrict ? value.subdistrict : "",
      postalCode: subdistrict?.postalCode || value.postalCode || "",
    });
  }, [ready]);

  const provinceOptions = useMemo(
    () => Object.keys(geoData).map((name) => ({ label: name })),
    [geoData]
  );

  const districtOptions = useMemo(() => {
    if (!value?.province) return [];
    const province = geoData[value.province];
    if (!province) return [];
    return Object.keys(province.districts).map((name) => ({ label: name }));
  }, [geoData, value?.province]);

  const subdistrictOptions = useMemo(() => {
    if (!value?.province || !value?.district) return [];
    const province = geoData[value.province];
    const district = province?.districts[value.district];
    if (!district) return [];
    return Object.keys(district.subdistricts).map((name) => ({
      label: name,
      postalCode: district.subdistricts[name].postalCode,
    }));
  }, [geoData, value?.province, value?.district]);

  /*
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้เลือกจังหวัดใหม่
   * Input : newValue (จังหวัดใหม่ที่ผู้ใช้เลือก)
   * Output : รีเซ็ตค่าอำเภอ/ตำบล และส่งค่า province ใหม่กลับไปยัง onChange()
   */
  const handleProvinceChange = (_: any, newValue: { label: string } | null) => {
    onChange({
      province: newValue?.label || "",
      district: "",
      subdistrict: "",
      postalCode: "",
    });
  };
  /*
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้เลือกอำเภอใหม่
   * Input : newValue (อำเภอใหม่ที่ผู้ใช้เลือก)
   * Output : รีเซ็ตค่าตำบล และอัปเดต district ใน onChange()
   */
  const handleDistrictChange = (_: any, newValue: { label: string } | null) => {
    onChange({
      ...value,
      district: newValue?.label || "",
      subdistrict: "",
      postalCode: "",
    });
  };
  /*
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้เลือกตำบลใหม่
   * Input : newValue (ตำบลใหม่ที่ผู้ใช้เลือก)
   * Output : อัปเดตรหัสไปรษณีย์ตามตำบล และส่งค่ากลับไปยัง onChange()
   */
  const handleSubdistrictChange = (_: any, newValue: any | null) => {
    onChange({
      ...value,
      subdistrict: newValue?.label || "",
      postalCode: newValue?.postalCode || "",
    });
  };
  /*
   * คำอธิบาย : ฟังก์ชันเรนเดอร์ช่อง input ของ Autocomplete แบบ custom
   * Input :
   *    - id (string): ชื่อฟิลด์ เช่น province, district
   *    - label (string): ป้ายกำกับ
   *    - params (object): พารามิเตอร์จาก Material UI Autocomplete
   * Output : JSX ของ input พร้อม label และ adornment
   */
  const renderCustomInput = (
    id: string,
    label: string,
    params: any,
    error?: boolean,
    helperText?: string
  ) => {
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
    <div className="grid grid-cols-2 gap-y-[24px] gap-x-[30px]">
      <Autocomplete
        id="province"
        disablePortal
        disableClearable
        loading={!ready}
        options={provinceOptions}
        value={provinceOptions.find((opt) => opt.label === value?.province) || null}
        onChange={handleProvinceChange}
        renderInput={(params) =>
          renderCustomInput("province", "จังหวัด", params, error?.province, helperText?.province)
        }
      />

      <Autocomplete
        id="district"
        disablePortal
        disableClearable
        loading={!ready}
        options={districtOptions}
        value={districtOptions.find((opt) => opt.label === value?.district) || null}
        onChange={handleDistrictChange}
        renderInput={(params) =>
          renderCustomInput("district", "อำเภอ", params, error?.district, helperText?.district)
        }
        disabled={!value?.province}
      />

      <Autocomplete
        id="subDistrict"
        disablePortal
        disableClearable
        loading={!ready}
        options={subdistrictOptions}
        value={subdistrictOptions.find((opt) => opt.label === value?.subdistrict) || null}
        onChange={handleSubdistrictChange}
        renderInput={(params) =>
          renderCustomInput(
            "subDistrict",
            "ตำบล",
            params,
            error?.subdistrict,
            helperText?.subdistrict
          )
        }
        disabled={!value?.district}
      />

      <div className="w-full">
        <TextField
          id="postalCode"
          type="text"
          value={value?.postalCode}
          label="รหัสไปรษณีย์"
          placeholder="รหัสไปรษณีย์"
          required
          readOnly={true}
        />
      </div>
    </div>
  );
}
