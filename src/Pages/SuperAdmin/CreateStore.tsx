/**
 * ฟังก์ชันหลักของหน้า CreateStore
 * คำอธิบาย : แสดงฟอร์มสร้างร้านค้าใหม่ พร้อมจัดการการอัปโหลดรูปภาพ
 */
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import Button from "@/Components/Button";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import MapPicker from "@/Components/MapPicker";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import { TagSelector, type Tag } from "@/Components/Selector/TagSelector";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import TextArea from "@/Components/TextArea";
import TextField from "@/Components/TextField";
import { createStore } from "@/Services/store-service";
import type { StoreData } from "@/Types/Store";
import { Icon } from "@iconify/react";
import React from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import z from "zod";

const storeSchema = z.object({
  name: z.string("กรุณากรอกชื่อร้านค้า").min(1, "กรุณากรอกชื่อร้านค้า"),
  detail: z.string("กรุณากรอกรายละเอียดของร้านค้า").min(1, "กรุณากรอกรายละเอียดของร้านค้า"),
  houseNumber: z.string("กรุณากรอกบ้านเลขที่").min(1, "กรุณากรอกบ้านเลขที่"),
  province: z.string("กรุณาเลือกจังหวัด").min(1, "กรุณาเลือกจังหวัด"),
  district: z.string("กรุณาเลือกอำเภอ/เขต").min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: z.string("กรุณาเลือกตำบล/แขวง").min(1, "กรุณาเลือกตำบล/แขวง"),
  latitude: z.union([
    z.string().min(1, "กรุณากรอกละติจูด"),
    z.number().refine((n) => !isNaN(n), "กรุณากรอกละติจูด"),
  ]),
  longitude: z.union([
    z.string().min(1, "กรุณากรอกลองจิจูด"),
    z.number().refine((n) => !isNaN(n), "กรุณากรอกลองจิจูด"),
  ]),
  tagStores: z
    .array(z.number(), "กรุณาเลือกประเภทร้านค้าอย่างน้อย 1 รายการ")
    .min(1, "กรุณาเลือกประเภทร้านค้าอย่างน้อย 1 รายการ"),
});
/**
 * ฟังก์ชันหลักของหน้า CreateStore
 * คำอธิบาย : แสดงฟอร์มสร้างร้านค้าใหม่ พร้อมจัดการการอัปโหลดรูปภาพ
 */
export function CreateStore() {
  const [coverFiles, setCoverFiles] = React.useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [formErrors, setFormErrors] = React.useState<Record<string, string | undefined>>({});
  const [location, setLocation] = React.useState<ThailandLocation>({
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });
  const startingPosition: [number, number] = [13.736717, 100.523186];
  const startingZoom = 13;
  const [position, setPosition] = useState<[number, number]>(startingPosition);
  const [formData, setFormData] = React.useState<Partial<StoreData>>({
    latitude: position[0],
    longitude: position[1],
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const { communityId } = useParams();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  const validateField = (field?: string, value?: any, mergedData?: any) => {
    const data = mergedData || formData;

    if (field) {
      const singleSchema = z.object({
        [field]: storeSchema.shape[field as keyof typeof storeSchema.shape],
      });
      const result = singleSchema.safeParse({ [field]: value });

      setFormErrors((prev) => ({
        ...prev,
        [field]: result.success
          ? undefined
          : result.error.issues.find((err) => err.path[0] === field)?.message,
      }));

      return result.success;
    }

    const result = storeSchema.safeParse(data);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        newErrors[fieldName as string] = issue.message;
      });
      setFormErrors(newErrors);
      console.log("❌ Validation errors:", result.error.issues); // ช่วย debug ได้ง่ายมาก
      return false;
    }

    setFormErrors({});
    return true;
  };
  /**
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
   * Input :
   *   - e : เหตุการณ์การเปลี่ยนแปลงจาก input field
   * Output : none (อัปเดต state formData และตรวจสอบความถูกต้องของฟิลด์)
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    const updated = { ...formData, [id]: value };
    setFormData(updated);
    validateField(id as keyof typeof formData, value);
  };

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่าของ select หรือ custom input
   * Input :
   *   - field : ชื่อฟิลด์ที่ต้องการอัปเดต
   *   - value : ค่าที่จะตั้งให้กับฟิลด์นั้น
   * Output : none (อัปเดต state formData และตรวจสอบความถูกต้องของฟิลด์)
   */
  const handleValueChange = (field: keyof typeof formData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    validateField(field, value);
  };
  const tagList = React.useMemo<Tag[]>(
    () => (formData.tagStores ?? []).map((id) => ({ id, name: "" })),
    [formData.tagStores]
  );
  /**
   * คำอธิบาย : ฟังก์ชันสำหรับส่งข้อมูลฟอร์มไปยัง backend เพื่อสร้างร้านค้าใหม่
   * โดยจะจัดการแยกข้อมูล location และไฟล์รูปภาพออกจากกัน
   * Input : none (ใช้ข้อมูลจาก state formData, location, position, coverFiles, galleryFiles)
   * Output : none (เรียกใช้ createStore() เพื่อส่งข้อมูลไปยัง backend)
   */
  const handleSubmit = async () => {
    try {
      const isValid = validateField();
      if (!isValid) {
        setAlertType("error");
        setAlertTitle("ข้อมูลไม่ถูกต้อง");
        setAlertMessage("กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก");
        setAlertOpen(true);
        return;
      }
      const {
        locationDetail,
        houseNumber,
        longitude,
        latitude,
        villageNumber,
        province,
        district,
        subDistrict,
        postalCode,
        ...cleanForm
      } = formData;
      const formDataToSend = new FormData();

      formDataToSend.append(
        "data",
        JSON.stringify({
          ...cleanForm,
          location: {
            houseNumber: formData.houseNumber,
            villageNumber: Number(formData.villageNumber),
            province: location.province,
            district: location.district,
            subDistrict: location.subdistrict,
            postalCode: String(location.postalCode),
            detail: formData.locationDetail,
            latitude: Number(position[0]),
            longitude: Number(position[1]),
          },
        })
      );

      coverFiles.forEach((file) => {
        formDataToSend.append("cover", file);
      });

      galleryFiles.forEach((file) => {
        formDataToSend.append("gallery", file);
      });

      await createStore(Number(communityId), formDataToSend);
      setAlertType("success");
      setAlertTitle("สร้างวิสาหกิจชุมชนสำเร็จ");
      setAlertMessage("ข้อมูลวิสหากิจชุมชนถูกบันทึก");
      setAlertOpen(true);
      navigate(`/super/community/${communityId}/stores/all`);
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "เกิดข้อผิดพลาดจากระบบ กรุณาลองใหม่อีกครั้ง";

      const thaiMessageMatch = backendMessage.match(/[\u0E00-\u0E7F].*/);
      let cleanMessage = thaiMessageMatch ? thaiMessageMatch[0].trim() : backendMessage.trim();
      cleanMessage = cleanMessage.replace(/["');]+$/g, "").trim();

      setAlertType("error");
      setAlertTitle("เกิดข้อผิดพลาด");
      setAlertMessage(cleanMessage);
      setAlertOpen(true);
    }
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "จัดการชุมชน", to: "/super/communities/all" },
          { label: formData.name || "ชื่อชุมชน", to: `/super/community/${communityId}` },
          { label: "จัดการร้านค้า", to: `/super/community/${communityId}/stores/all` },
          { label: "เพิ่มร้านค้า" },
        ]}
      />
      <div className="bg-white p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <Link
            to="/super/communities/all"
            className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
          >
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
            <h1 className="text-xl font-bold">เพิ่มร้านค้า</h1>
          </Link>
        </div>
        <div className="border-2 p-6 rounded-lg grid gap-y-[24px] gap-x-[30px]">
          <div className="col-span-2">
            <TextField
              id="name"
              label="ชื่อร้านค้า"
              required
              placeholder="ป้อนชื่อร้านค้า"
              value={formData.name}
              onChange={handleFormChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
          </div>
          <div className="col-span-2">
            <TextArea
              id="detail"
              label="รายละเอียดร้านค้า"
              required
              placeholder="ป้อนรายละเอียดร้านค้า"
              value={formData.detail}
              onChange={handleFormChange}
              error={!!formErrors.detail}
              helperText={formErrors.detail}
            />
          </div>
          <div>
            <TextField
              id="houseNumber"
              label="บ้านเลขที่"
              required
              placeholder="ป้อนบ้านเลขที่ร้านค้า"
              value={formData.houseNumber}
              onChange={handleFormChange}
              error={!!formErrors.houseNumber}
              helperText={formErrors.houseNumber}
            />
          </div>
          <div>
            <TextField
              id="villageNumber"
              label="หมู่ที่"
              placeholder="ป้อนหมู่ของร้านค้า"
              value={formData.villageNumber}
              onChange={handleFormChange}
              error={!!formErrors.villageNumber}
              helperText={formErrors.villageNumber}
            />
          </div>
          <div className="col-span-2">
            <ThailandLocationSelector
              value={location}
              onChange={(loc) => {
                setLocation(loc); // เก็บไว้แสดงผลใน selector
                setFormData((prev) => ({
                  ...prev,
                  province: loc.province,
                  district: loc.district,
                  subDistrict: loc.subdistrict,
                  postalCode: loc.postalCode,
                }));
                // ตรวจสอบความถูกต้องของ field ที่เกี่ยวข้อง
                validateField("province", loc.province);
                validateField("district", loc.district);
                validateField("subDistrict", loc.subdistrict);
              }}
              error={{
                province: !!formErrors.province,
                district: !!formErrors.district,
                subdistrict: !!formErrors.subDistrict,
              }}
              helperText={{
                province: formErrors.province,
                district: formErrors.district,
                subdistrict: formErrors.subDistrict,
              }}
            />
          </div>
          <div className="col-span-2">
            <TextArea
              id="locationDetail"
              label="คำอธิบายที่อยู่"
              placeholder="คำอธิบายที่อยู่"
              value={formData.locationDetail}
              onChange={handleFormChange}
              error={!!formErrors.locationDetail}
              helperText={formErrors.locationDetail}
            />
          </div>
          <div className="col-span-2">
            <MapPicker
              startingPosition={position}
              startingZoom={startingZoom}
              onChange={setPosition}
            />
          </div>
          <div className="col-span-2">
            <TagSelector
              value={formData.tagStores}
              tag={tagList}
              onChange={(ids) => handleValueChange("tagStores", ids)}
            />
          </div>
          <div className="col-span-2">
            <h3 className="font-bold text-base mb-3">
              อัพโหลดภาพหน้าปก
              <span className="text-red-600"> *</span>{" "}
            </h3>
            <UploadCard
              max={1}
              accept="image/*"
              multiple={false}
              value={coverFiles}
              onChange={setCoverFiles}
              itemW={160}
              itemH={110}
              square={false}
              itemClass="border border-dashed border-black/60 bg-slate-200/60"
              rounded="rounded-lg"
              gapCls="gap-4"
              containerClass="w-full"
              wrap
              iconSizeCls="w-10 h-10"
            />
          </div>
          <div className="col-span-2">
            <h3 className="font-bold text-base mb-3">
              อัพโหลดรูปภาพเพิ่มเติม
              <span className="text-red-600"> *</span>{" "}
            </h3>
            <UploadCard
              max={5}
              accept="image/*"
              multiple={false}
              value={galleryFiles}
              onChange={setGalleryFiles}
              itemW={160}
              itemH={110}
              square={false}
              itemClass="border border-dashed border-black/60 bg-slate-200/60"
              rounded="rounded-lg"
              gapCls="gap-4"
              containerClass="w-full"
              wrap
              iconSizeCls="w-10 h-10"
            />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <div className="w-32 mr-2.5">
            <Button type="cancel">ยกเลิก</Button>
          </div>
          <div className="w-32">
            <Button type="confirm-admin" onClick={() => setOpenConfirm(true)}>
              บันทึก
            </Button>
          </div>
        </div>
        <Modal
          open={openConfirm}
          title="ยืนยันการสร้างร้านค้า"
          text="คุณต้องการยืนยันการสร้างร้านค้าหรือไม่"
          onConfirm={async () => {
            setOpenConfirm(false);
            await handleSubmit();
          }}
          onCancel={() => setOpenConfirm(false)}
        />
        <ModalAlert
          open={alertOpen}
          type={alertType}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setAlertOpen(false)}
        />
      </div>
    </div>
  );
}
