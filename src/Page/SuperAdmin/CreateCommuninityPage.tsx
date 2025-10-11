import CommunityAccordion from "@/Components/Community/CommunityAccordion";
import Button from "@/Components/Button";
import { useState } from "react";
import { createCommunity } from "@/Libs/CommunityService";

import { type ThailandLocation } from "@/Components/LocationSelector";
// 🧹 ล้าง object โดยตัดค่าที่ว่าง/null ออก
function cleanObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanObject).filter((v) => v !== null && v !== undefined);
  } else if (typeof obj === "object" && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const cleaned = cleanObject(value);
      if (
        cleaned !== null &&
        cleaned !== undefined &&
        cleaned !== "" &&
        !(typeof cleaned === "object" && Object.keys(cleaned).length === 0)
      ) {
        acc[key] = cleaned;
      }
      return acc;
    }, {} as Record<string, any>);
  }
  return obj;
}

export function CreateCommuninityPage() {
  const [formData, setFormData] = useState({
    adminId: "",
    name: "",
    alias: "",
    type: "",
    registerNumber: "",
    registerDate: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    description: "",
    mainActivityName: "",
    mainActivityDescription: "",
    villageNumber: "",
    houseNumber: "",
    location: {
      province: "",
      district: "",
      subdistrict: "",
      postalCode: "",
    } as ThailandLocation,
    locationDetail: "",
    latitude: "",
    longitude: "",
    phone: "",
    email: "",
    urlWebsite: "",
    urlFacebook: "",
    urlLine: "",
    urlTiktok: "",
    urlOther: "",
    mainAdmin: "",
    mainAdminPhone: "",
    coordinatorName: "",
    coordinatorPhone: "",
    rating: 0,
    member: [],
    status: "CLOSED",
  });

  // ✅ เมื่อเปลี่ยนที่อยู่จาก ThailandLocationSelect

  // ✅ ฟังก์ชันบันทึก
  async function handleCreate() {
    try {
      const {
        adminId,
        rating,
        location,
        houseNumber,
        latitude,
        longitude,
        locationDetail,
        villageNumber,
        ...rest
      } = formData;

      const finalPayload = {
        ...rest,
        adminId: Number(adminId),
        rating: Number(rating),
        // 🧭 move all address info into location
        location: {
          houseNumber: houseNumber,
          villageNumber: Number(villageNumber),
          subDistrict: location.subdistrict,
          district: location.district,
          province: location.province,
          postalCode: String(location.postalCode),
          detail: locationDetail,
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
      };

      const cleaned = cleanObject(finalPayload);
      console.log("📦 Final Payload:", cleaned);
      const res = await createCommunity(cleaned);
      console.log("✅ success:", res.data);
    } catch (err: any) {
      console.error("❌ error:", err.response?.data || err.message);
    }
  }

  return (
    <div className="w-auto space-y-4">
      {/* ✅ Accordion รวมฟอร์ม */}
      <CommunityAccordion value={formData} onChange={setFormData} />

      {/* ✅ ปุ่มบันทึก */}
      <div className="flex justify-end mt-2.5">
        <div className="w-36">
          <Button type="cancel">ยกเลิก</Button>
        </div>
        <div className="ml-2.5 w-36">
          <Button type="confirm-admin" onClick={handleCreate}>
            สร้าง
          </Button>
        </div>
      </div>
    </div>
  );
}
