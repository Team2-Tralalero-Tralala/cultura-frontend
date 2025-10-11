/*
 * คำอธิบาย : หน้าสำหรับแก้ไขข้อมูลวิสาหกิจชุมชน (Edit Community)
 * ใช้สำหรับโหลดข้อมูลชุมชนจาก API, แสดงฟอร์มผ่าน Accordion, และอัปเดตข้อมูลกลับไปยังระบบ
 * โดยมีการตรวจสอบค่า null/undefined และแปลงข้อมูลให้ตรงกับโครงสร้างของ backend
 *
 * Input : พารามิเตอร์ id จาก URL (communityId)
 * Output : ฟอร์มแก้ไขข้อมูลชุมชนและปุ่มบันทึก
 */

import Button from "@/Components/Button";
import { useEffect, useState } from "react";
import { getCommunityById, updateCommunity } from "@/Libs/CommunityService";
import Switch from "@mui/material/Switch";
import EditCommunityAccordion from "@/Components/Community/EditCommunityAccordion";
import { useParams } from "react-router";
import Stack from "@mui/material/Stack";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับล้าง object โดยตัดค่าที่เป็น null, undefined, หรือ string ว่าง
 * ใช้เพื่อเตรียมข้อมูลก่อนส่งไปยัง API ให้สะอาดและไม่เกิด validation error
 * Input : obj (object ที่ต้องการล้าง)
 * Output : object ที่ล้างค่าที่ไม่จำเป็นออกแล้ว
 */
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
/*
 * คำอธิบาย : Component หลักสำหรับหน้าแก้ไขวิสาหกิจชุมชน
 * โหลดข้อมูลจาก API → แสดงข้อมูลในฟอร์ม → อนุญาตให้แก้ไขและบันทึกกลับ
 */
export function EditCommunityPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);

  // 🔧 default structure ต้องใช้ key `subDistrict` (D ใหญ่)
  const [formData, setFormData] = useState({
    id: "",
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
    locationId: "",
    location: {
      province: "",
      district: "",
      subDistrict: "", // ✅ D ใหญ่
      postalCode: "",
    },
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
    status: "OPEN",
  });

  const [checked, setChecked] = useState(true);

  /*
   * คำอธิบาย : Component หลักสำหรับหน้าแก้ไขวิสาหกิจชุมชน
   * โหลดข้อมูลจาก API → แสดงข้อมูลในฟอร์ม → อนุญาตให้แก้ไขและบันทึกกลับ
   */
  useEffect(() => {
    async function fetchCommunity() {
      try {
        setLoading(true);
        const res = await getCommunityById(Number(params.id));
        const data = res.data.data;

        setFormData({
          id: data.id,
          adminId: data.adminId?.toString() || "",
          name: data.name || "",
          alias: data.alias || "",
          type: data.type || "",
          registerNumber: data.registerNumber || "",
          registerDate: data.registerDate
            ? data.registerDate.split("T")[0]
            : "",
          bankName: data.bankName || "",
          accountName: data.accountName || "",
          accountNumber: data.accountNumber || "",
          description: data.description || "",
          mainActivityName: data.mainActivityName || "",
          mainActivityDescription: data.mainActivityDescription || "",
          houseNumber: data.location?.houseNumber || "",
          villageNumber: data.location?.villageNumber?.toString() || "",
          locationId: data.locationId,
          location: {
            province: data.location?.province || "",
            district: data.location?.district || "",
            subDistrict: data.location?.subDistrict || "", // ✅ ใช้ D ใหญ่เสมอ
            postalCode: data.location?.postalCode?.toString() || "",
          },
          locationDetail: data.location?.detail || "",
          latitude: data.location?.latitude?.toString() || "",
          longitude: data.location?.longitude?.toString() || "",
          phone: data.phone || "",
          email: data.email || "",
          urlWebsite: data.urlWebsite || "",
          urlFacebook: data.urlFacebook || "",
          urlLine: data.urlLine || "",
          urlTiktok: data.urlTiktok || "",
          urlOther: data.urlOther || "",
          mainAdmin: data.mainAdmin || "",
          mainAdminPhone: data.mainAdminPhone || "",
          coordinatorName: data.coordinatorName || "",
          coordinatorPhone: data.coordinatorPhone || "",
          rating: data.rating || 0,
          member: data.member || [],
          status: data.status || "OPEN",
        });

        setChecked(data.status === "OPEN");
      } catch (err) {
        console.error("❌ โหลดข้อมูลไม่สำเร็จ:", err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) fetchCommunity();
  }, [params.id]);

  /*
   * คำอธิบาย : ฟังก์ชันเปลี่ยนสถานะของชุมชน (OPEN / CLOSED)
   * Input : event (React.ChangeEvent<HTMLInputElement>)
   * Output : อัปเดตค่าใน state formData.status และสวิตช์ UI
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    setChecked(newChecked);
    setFormData((prev) => ({
      ...prev,
      status: newChecked ? "OPEN" : "CLOSED",
    }));
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับอัปเดตข้อมูลวิสาหกิจชุมชน
   * Input : formData จาก state
   * Output : ส่งข้อมูลที่ถูกล้างและแปลงค่าแล้วกลับไปยัง API
   */
  async function handleUpdate() {
    try {
      const {
        id,
        adminId,
        rating,
        location,
        houseNumber,
        latitude,
        longitude,
        locationDetail,
        villageNumber,
        locationId,
        ...rest
      } = formData;

      // 🔧 ตรวจสอบและแปลงค่าอย่างปลอดภัย
      const finalPayload = {
        ...rest,
        adminId: Number(adminId) || null,
        rating: Number(rating) || 0,
        location: {
          houseNumber: houseNumber,
          villageNumber: villageNumber,
          subDistrict: location.subDistrict || "", // ✅ ตรง backend
          district: location.district || "",
          province: location.province || "",
          postalCode: String(location.postalCode || ""),
          detail: locationDetail || "",
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
        },
      };

      const cleaned = cleanObject(finalPayload);
      console.log("📦 Final Payload:", cleaned);

      const res = await updateCommunity(Number(params.id), cleaned);
      console.log("✅ อัปเดตสำเร็จ:", res.data);
      alert("บันทึกการแก้ไขเรียบร้อยแล้ว");
    } catch (err: any) {
      console.error("❌ อัปเดตไม่สำเร็จ:", err.response?.data || err.message);
      alert("❌ บันทึกไม่สำเร็จ: โปรดตรวจสอบข้อมูลอีกครั้ง");
    }
  }

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="w-auto space-y-4">
      <div className="flex justify-end">
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          สถานะชุมชน
          <Switch checked={checked} onChange={handleChange} />
        </Stack>
      </div>

      {/* ✅ Accordion รวมฟอร์ม */}
      <EditCommunityAccordion value={formData} onChange={setFormData} />

      {/* ✅ ปุ่มบันทึก */}
      <div className="flex justify-end mt-2.5">
        <div className="w-36">
          <Button type="cancel">ยกเลิก</Button>
        </div>
        <div className="ml-2.5 w-36">
          <Button type="confirm-admin" onClick={handleUpdate}>
            บันทึก
          </Button>
        </div>
      </div>
    </div>
  );
}
