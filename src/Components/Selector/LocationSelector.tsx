/*
 * คำอธิบาย : Component สำหรับเลือกที่ตั้งทางภูมิศาสตร์ของประเทศไทย
 * โดยผู้ใช้สามารถเลือกจังหวัด → อำเภอ → ตำบล → ระบบจะเติมรหัสไปรษณีย์ให้อัตโนมัติ
 * ใช้ข้อมูลจากไฟล์ geography.json บน GitHub Repository ของ thailand-geography-data
 *
 * Input : value (ThailandLocation) - ค่าที่อยู่ปัจจุบันของผู้ใช้
 *          onChange (function) - callback ที่ส่งค่ากลับเมื่อผู้ใช้เปลี่ยนข้อมูล
 *          labelPrefix (string) - ข้อความนำหน้าป้ายชื่อ เช่น “ที่อยู่: ”
 *          disabled (boolean) - ปิดการแก้ไขฟิลด์ทั้งหมด
 * Output : แสดง input แบบ Autocomplete 3 ช่อง (จังหวัด, อำเภอ, ตำบล) และ TextField สำหรับรหัสไปรษณีย์
 */
import React, { useEffect, useState, useMemo } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "../TextField";
import axios from "axios";

interface GeographyItem {
  provinceCode: string;
  provinceNameTh: string;
  districtCode: string;
  districtNameTh: string;
  subdistrictCode: string;
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
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  postalCode: string;
}

interface ThailandLocationSelectProps {
  value: ThailandLocation;
  onChange: (value: ThailandLocation) => void;
  labelPrefix?: string;
  disabled?: boolean;
}
/*
 * คำอธิบาย : Component สำหรับเลือกจังหวัด อำเภอ ตำบล และรหัสไปรษณีย์
 * Input : ThailandLocationSelectProps
 * Output : ส่งข้อมูลตำแหน่งกลับผ่าน onChange()
 */
export default function ThailandLocationSelect({
  value,
  onChange,
  labelPrefix,
  disabled = false,
}: ThailandLocationSelectProps) {
  const [geoData, setGeoData] = useState<Record<string, Province>>({});

  /*
   * คำอธิบาย : โหลดข้อมูล geography.json เพียงครั้งเดียวเมื่อ component mount
   * Input : -
   * Output : เก็บข้อมูลจังหวัด อำเภอ และตำบลทั้งหมดไว้ใน state geoData
   */
  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(
          "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/geography.json"
        );
        const data: GeographyItem[] = res.data;
        const provinces: Record<string, Province> = {};
        data.forEach((item) => {
          if (!provinces[item.provinceCode]) {
            provinces[item.provinceCode] = {
              nameTh: item.provinceNameTh,
              districts: {},
            };
          }
          const prov = provinces[item.provinceCode];
          if (!prov.districts[item.districtCode]) {
            prov.districts[item.districtCode] = {
              nameTh: item.districtNameTh,
              subdistricts: {},
            };
          }
          prov.districts[item.districtCode].subdistricts[item.subdistrictCode] =
            {
              nameTh: item.subdistrictNameTh,
              postalCode: item.postalCode,
            };
        });
        setGeoData(provinces);
      } catch (err) {
        console.error("❌ Error loading geography data", err);
      }
    }
    loadData();
  }, []);

  /*
   * คำอธิบาย : คำนวณรายการจังหวัดทั้งหมดจาก geoData
   * Output : Array ของ { code, label }
   */
  const provinceOptions = useMemo(
    () =>
      Object.entries(geoData).map(([code, prov]) => ({
        code,
        label: prov.nameTh,
      })),
    [geoData]
  );
  /*
   * คำอธิบาย : คำนวณรายการอำเภอจากจังหวัดที่เลือก
   * Output : Array ของ { code, label }
   */
  const districtOptions = useMemo(() => {
    const provinceCode = Object.keys(geoData).find(
      (code) => geoData[code].nameTh === value.province
    );
    if (!provinceCode) return [];
    return Object.entries(geoData[provinceCode].districts).map(
      ([code, dist]) => ({
        code,
        label: dist.nameTh,
      })
    );
  }, [geoData, value.province]);
  /*
   * คำอธิบาย : คำนวณรายการตำบลจากอำเภอที่เลือก
   * Output : Array ของ { code, label }
   */
  const subdistrictOptions = useMemo(() => {
    const provinceCode = Object.keys(geoData).find(
      (code) => geoData[code].nameTh === value.province
    );
    if (!provinceCode) return [];
    const districtCode = Object.keys(geoData[provinceCode].districts).find(
      (code) => geoData[provinceCode].districts[code].nameTh === value.district
    );
    if (!districtCode) return [];
    return Object.entries(
      geoData[provinceCode].districts[districtCode].subdistricts
    ).map(([code, subd]) => ({ code, label: subd.nameTh }));
  }, [geoData, value.province, value.district]);

  /*
   * คำอธิบาย : เมื่อผู้ใช้เลือกจังหวัดใหม่
   * Input : newValue (จังหวัดที่เลือก)
   * Output : รีเซ็ต district, subdistrict, postalCode และส่งข้อมูลใหม่กลับ
   */
  const handleProvinceChange = (_: any, newValue: any) => {
    if (!newValue) return;
    onChange({
      province: newValue.label,
      district: null,
      subdistrict: null,
      postalCode: "",
    });
  };
  /*
   * คำอธิบาย : เมื่อผู้ใช้เลือกอำเภอใหม่
   * Input : newValue (อำเภอที่เลือก)
   * Output : รีเซ็ต subdistrict และ postalCode แล้วส่งข้อมูลกลับ
   */
  const handleDistrictChange = (_: any, newValue: any) => {
    if (!newValue) return;
    onChange({
      ...value,
      district: newValue.label,
      subdistrict: null,
      postalCode: "",
    });
  };
  /*
   * คำอธิบาย : เมื่อผู้ใช้เลือกตำบลใหม่ → ดึงรหัสไปรษณีย์อัตโนมัติ
   * Input : newValue (ตำบลที่เลือก)
   * Output : อัปเดต subdistrict และ postalCode
   */
  const handleSubdistrictChange = (_: any, newValue: any) => {
    if (!newValue) return;
    // คำนวณรหัสไปรษณีย์ใหม่
    const provinceCode = Object.keys(geoData).find(
      (code) => geoData[code].nameTh === value.province
    );
    const districtCode =
      provinceCode &&
      Object.keys(geoData[provinceCode].districts).find(
        (code) =>
          geoData[provinceCode].districts[code].nameTh === value.district
      );
    const postal =
      provinceCode &&
      districtCode &&
      geoData[provinceCode].districts[districtCode].subdistricts[
        Object.keys(
          geoData[provinceCode].districts[districtCode].subdistricts
        ).find(
          (code) =>
            geoData[provinceCode].districts[districtCode].subdistricts[code]
              .nameTh === newValue.label
        ) || ""
      ]?.postalCode;

    onChange({
      ...value,
      subdistrict: newValue.label,
      postalCode: postal || "",
    });
  };

  /*
   * คำอธิบาย : renderCustomInput ใช้ปรับแต่ง UI ของช่องกรอกข้อมูล Autocomplete
   * Input : id, label, params (จาก MUI Autocomplete)
   * Output : Element ของ input พร้อม label และ adornment
   */
  const renderCustomInput = (id: string, label: string, params: any) => {
    const { InputProps, inputProps } = params;
    return (
      <div {...InputProps} ref={InputProps.ref} className="w-full">
        <label
          htmlFor={id}
          className="block text-base font-semibold text-gray-800 mb-1.5"
        >
          {labelPrefix ? `${labelPrefix}${label}` : label}
        </label>
        <div className="relative">
          <input
            {...inputProps}
            id={id}
            ref={inputProps.ref}
            type="text"
            placeholder={label}
            className={`block w-full rounded-form border border-gray-400 
              focus:ring-1 focus:ring-gray-400 focus:border-gray-500
              bg-white px-4 py-2 text-base text-gray-900 placeholder:text-gray-500
              leading-relaxed transition-shadow outline-none`}
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
      {/* จังหวัด */}
      <Autocomplete
        id="province"
        disablePortal
        disableClearable
        options={provinceOptions}
        value={
          provinceOptions.find((opt) => opt.label === value.province) || null
        }
        onChange={handleProvinceChange}
        renderInput={(params) =>
          renderCustomInput("province", "จังหวัด", params)
        }
        disabled={disabled}
      />

      {/* อำเภอ */}
      <Autocomplete
        id="district"
        disablePortal
        disableClearable
        options={districtOptions}
        value={
          districtOptions.find((opt) => opt.label === value.district) || null
        }
        onChange={handleDistrictChange}
        renderInput={(params) => renderCustomInput("district", "อำเภอ", params)}
        disabled={!value.province || disabled}
      />

      {/* ตำบล */}
      <Autocomplete
        id="subDistrict"
        disablePortal
        disableClearable
        options={subdistrictOptions}
        value={
          subdistrictOptions.find((opt) => opt.label === value.subdistrict) ||
          null
        }
        onChange={handleSubdistrictChange}
        renderInput={(params) =>
          renderCustomInput("subDistrict", "ตำบล", params)
        }
        disabled={!value.district || disabled}
      />

      {/* รหัสไปรษณีย์ */}
      <div className="w-full">
        <TextField
          id="postalCode"
          type="text"
          value={value.postalCode || ""}
          label="รหัสไปรษณีย์"
          placeholder="รหัสไปรษณีย์"
          required
        />
      </div>
    </div>
  );
}
