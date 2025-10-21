import Button from "@/Components/Button";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import MapPicker from "@/Components/MapPicker";
import { Modal } from "@/Components/Modal/Modal";
import { TagSelector, type Tag } from "@/Components/Selector/TagSelector";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import TextArea from "@/Components/TextArea";
import TextField from "@/Components/TextField";
import { createStore } from "@/Services/store-service";
import type { StoreData } from "@/Types/Store";
import React from "react";
import { useState } from "react";
import { useParams } from "react-router";
import z from "zod";
const storeSchema = z.object({
  name: z.string(),
  detail: z.string(),
  houseNumber: z.string("กรุณากรอกบ้านเลขที่").min(1, "กรุณากรอกบ้านเลขที่"),
  province: z.string("กรุณาเลือกจังหวัด").min(1, "กรุณาเลือกจังหวัด"),
  district: z.string("กรุณาเลือกอำเภอ/เขต").min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: z.string("กรุณาเลือกตำบล/แขวง").min(1, "กรุณาเลือกตำบล/แขวง"),
  latitude: z
    .string("กรุณากรอกละติจูด")
    .min(
      1,
      "หากคุณไม่ทราบละติจูดและลองจิจูดของวิสาหกิจชุมชน โปรดค้นหาวิสาหกิจชุมชนและปักหมุด"
    ),
  longitude: z
    .string("กรุณากรอกลองจิจูด")
    .min(
      1,
      "หากคุณไม่ทราบละติจูดและลองจิจูดของวิสาหกิจชุมชน โปรดค้นหาวิสาหกิจชุมชนและปักหมุด"
    ),
  tagStores: z.number(),
});
export function CreateStore() {
  const [formData, setFormData] = React.useState<Partial<StoreData>>({});
  const [coverFiles, setCoverFiles] = React.useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [formErrors, setFormErrors] = React.useState<
    Record<string, string | undefined>
  >({});
  const [location, setLocation] = React.useState<ThailandLocation>({
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });
  const startingPosition: [number, number] = [13.736717, 100.523186]; // BUU
  const startingZoom = 13;
  const [position, setPosition] = useState<[number, number]>(startingPosition);
  const [openConfirm, setOpenConfirm] = useState(false);
  const { communityId } = useParams();

  const validateField = (field?: string, value?: any) => {
    // ถ้ามี field แสดงว่าตรวจเฉพาะช่องนั้น
    if (field) {
      const result = storeSchema.safeParse({
        ...formData,
        [field]: value,
      });
      setFormErrors((prev) => ({
        ...prev,
        [field]: result.success
          ? undefined
          : result.error.issues.find((err) => err.path[0] === field)?.message,
      }));
      return result.success;
    }

    // ถ้าไม่มี field แปลว่าต้องตรวจทั้งฟอร์ม
    const result = storeSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        newErrors[fieldName as string] = issue.message;
      });
      setFormErrors(newErrors);
      return false;
    }

    // ถ้าผ่านทั้งหมด
    setFormErrors({});
    return true;
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    const updated = { ...formData, [id]: value };
    setFormData(updated);
    validateField(id as keyof typeof formData, value);
  };

  const handleValueChange = (field: keyof typeof formData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    validateField(field, value);
  };
  const tagList = React.useMemo<Tag[]>(
    () => (formData.tagStores ?? []).map((id) => ({ id, name: "" })),
    [formData.tagStores]
  );

  const handleSubmit = async () => {
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

    // สร้าง FormData เพื่อส่ง multipart/form-data
    const formDataToSend = new FormData();

    // ส่งข้อมูลที่ไม่ใช่ไฟล์เป็น JSON string
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
        // ไม่ต้องรวมไฟล์ใน JSON เพราะจะส่งแยก
      })
    );

    // ✅ แนบไฟล์ พร้อมส่ง type กลับไปให้ backend ผ่านชื่อ field
    coverFiles.forEach((file) => {
      formDataToSend.append("cover", file);
    });

    galleryFiles.forEach((file) => {
      formDataToSend.append("gallery", file);
    });

    await createStore(Number(communityId), formDataToSend);
  };

  return (
    <div className="bg-white p-6 rounded-2xl">
      <h1 className="text-xl font-bold pt-3  mb-6">เพิ่มร้านค้า</h1>
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
        title="ยืนยันการสร้างชุมชน"
        text="คุณต้องการยืนยันการสร้างชุมชนหรือไม่"
        onConfirm={async () => {
          setOpenConfirm(false);
          await handleSubmit();
        }}
        onCancel={() => setOpenConfirm(false)}
      />
    </div>
  );
}
