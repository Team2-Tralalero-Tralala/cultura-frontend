import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "./TextField";
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
  value?: ThailandLocation;
  onChange?: (value: ThailandLocation) => void;
  labelPrefix?: string;
  disabled?: boolean;
}

export default function ThailandLocationSelect({
  value,
  onChange,
  labelPrefix,
  disabled = false,
}: ThailandLocationSelectProps) {
  const [geoData, setGeoData] = useState<Record<string, Province>>({});
  const [province, setProvince] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [subdistrict, setSubdistrict] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState<string>("");

  // โหลด geography.json
  useEffect(() => {
    async function loadData() {
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
        prov.districts[item.districtCode].subdistricts[item.subdistrictCode] = {
          nameTh: item.subdistrictNameTh,
          postalCode: item.postalCode,
        };
      });
      setGeoData(provinces);
    }
    loadData();
  }, []);

  // ตั้งค่าจาก props (เมื่อมีค่าเริ่มต้น)
  useEffect(() => {
    if (value && Object.keys(geoData).length > 0) {
      const provinceCode = Object.keys(geoData).find(
        (code) => geoData[code].nameTh === value.province
      );
      const districtCode =
        provinceCode &&
        Object.keys(geoData[provinceCode].districts).find(
          (code) =>
            geoData[provinceCode].districts[code].nameTh === value.district
        );
      const subdistrictCode =
        provinceCode &&
        districtCode &&
        Object.keys(
          geoData[provinceCode].districts[districtCode].subdistricts
        ).find(
          (code) =>
            geoData[provinceCode].districts[districtCode].subdistricts[code]
              .nameTh === value.subdistrict
        );

      setProvince(provinceCode || null);
      setDistrict(districtCode || null);
      setSubdistrict(subdistrictCode || null);
      setPostalCode(value.postalCode || "");
    }
  }, [value, geoData]);

  // อัปเดตรหัสไปรษณีย์อัตโนมัติ
  useEffect(() => {
    if (province && district && subdistrict) {
      const subd =
        geoData[province]?.districts[district]?.subdistricts[subdistrict];
      setPostalCode(subd?.postalCode || "");
    } else {
      setPostalCode("");
    }
  }, [province, district, subdistrict, geoData]);

  // แจ้งค่าที่เปลี่ยนไปออกไป (เป็นชื่อภาษาไทย)
  useEffect(() => {
    if (onChange && Object.keys(geoData).length > 0) {
      const provinceName =
        province && geoData[province]?.nameTh ? geoData[province].nameTh : null;
      const districtName =
        province && district && geoData[province]?.districts[district]
          ? geoData[province].districts[district].nameTh
          : null;
      const subdistrictName =
        province &&
        district &&
        subdistrict &&
        geoData[province]?.districts[district]?.subdistricts[subdistrict]
          ? geoData[province].districts[district].subdistricts[subdistrict]
              .nameTh
          : null;

      onChange({
        province: provinceName,
        district: districtName,
        subdistrict: subdistrictName,
        postalCode,
      });
    }
  }, [province, district, subdistrict, postalCode, geoData]);

  // ---------- ตัวเลือก ----------
  const provinceOptions = Object.entries(geoData).map(([code, prov]) => ({
    code,
    label: prov.nameTh,
  }));

  const districtOptions =
    province && geoData[province]
      ? Object.entries(geoData[province].districts).map(([code, dist]) => ({
          code,
          label: dist.nameTh,
        }))
      : [];

  const subdistrictOptions =
    province && district
      ? Object.entries(geoData[province].districts[district].subdistricts).map(
          ([code, subd]) => ({ code, label: subd.nameTh })
        )
      : [];

  // ---------- custom input ----------
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
        value={provinceOptions.find((opt) => opt.code === province)}
        onChange={(_, newValue) => {
          setProvince(newValue?.code || null);
          setDistrict(null);
          setSubdistrict(null);
          setPostalCode("");
        }}
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
        value={districtOptions.find((opt) => opt.code === district)}
        onChange={(_, newValue) => {
          setDistrict(newValue?.code || null);
          setSubdistrict(null);
          setPostalCode("");
        }}
        renderInput={(params) => renderCustomInput("district", "อำเภอ", params)}
        disabled={!province || disabled}
      />

      {/* ตำบล */}
      <Autocomplete
        id="subDistrict"
        disablePortal
        disableClearable
        options={subdistrictOptions}
        value={subdistrictOptions.find((opt) => opt.code === subdistrict)}
        onChange={(_, newValue) => setSubdistrict(newValue?.code || null)}
        renderInput={(params) =>
          renderCustomInput("subDistrict", "ตำบล", params)
        }
        disabled={!district || disabled}
      />

      {/* รหัสไปรษณีย์ */}
      <div className="w-full">
        <TextField
          id="postalCode"
          type="text"
          value={postalCode}
          label="รหัสไปรษณีย์"
          placeholder="รหัสไปรษณีย์"
          required
        />
      </div>
    </div>
  );
}
