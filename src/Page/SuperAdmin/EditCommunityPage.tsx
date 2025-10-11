import Button from "@/Components/Button";
import { useEffect, useState } from "react";
import { getCommunityById, updateCommunity } from "@/Libs/CommunityService";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { type ThailandLocation } from "@/Components/LocationSelector";
import EditCommunityAccordion from "@/Components/Community/EditCommunityAccordion";
import { useParams } from "react-router";
import Stack from "@mui/material/Stack";

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

export function EditCommunityPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);

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
    status: "OPEN",
  });

  const [checked, setChecked] = useState(true);

  // ✅ โหลดข้อมูลจาก API ครั้งแรก
  useEffect(() => {
    async function fetchCommunity() {
      try {
        setLoading(true);
        const res = await getCommunityById(Number(params.id));
        const data = res.data?.data;

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
            subdistrict: data.location?.subDistrict || "",
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

  // ✅ สลับสถานะ OPEN / CLOSED
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    setChecked(newChecked);
    setFormData((prev) => ({
      ...prev,
      status: newChecked ? "OPEN" : "CLOSED",
    }));
  };

  // ✅ ฟังก์ชันบันทึก
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

      const finalPayload = {
        ...rest,
        adminId: Number(adminId),
        rating: Number(rating),
        location: {
          houseNumber: houseNumber || null,
          villageNumber: Number(villageNumber) || null,
          subDistrict: location.subdistrict || null,
          district: location.district || null,
          province: location.province || null,
          postalCode: String(location.postalCode) || null,
          detail: locationDetail || null,
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
    }
  }

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="w-auto space-y-4">
      {/* ✅ สวิตช์เปิด/ปิดสถานะ */}
      <FormControlLabel
        label={checked ? "สถานะชุมชน: เปิด (OPEN)" : "สถานะชุมชน: ปิด (CLOSED)"}
        control={<Switch checked={checked} onChange={handleChange} />}
      />
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        สถานะชุมชน
        <Switch checked={checked} onChange={handleChange} />
      </Stack>

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
