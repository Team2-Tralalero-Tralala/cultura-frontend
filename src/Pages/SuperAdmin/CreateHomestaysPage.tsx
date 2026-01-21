/**
 * คำอธิบาย: หน้า "เพิ่มที่พัก (รายการเดียว)" สำหรับ Super Admin
 * หน้าที่: จัดการฟอร์ม ตรวจสอบข้อมูล ยืนยัน และส่งข้อมูลแบบ multipart/form-data ไปยัง API
 */
import React from "react";
import * as z from "zod";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "@/Components/Button";
import TextField from "@/Components/TextField";
import TextArea from "@/Components/TextArea";
import MapPicker from "@/Components/MapPicker";
import UploadCard from "@/Components/upload/UploadCard";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import { TagSelector } from "@/Components/Selector/TagSelector";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const API_URL = import.meta.env.VITE_API_URL as string;

type FileLike = File;

type HomestayForm = {
  name: string;
  type: string;
  facility: string;
  guestPerRoom: string;
  totalRoom: string;
  houseNumber: string;
  villageNumber: string;
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
  addressDetail: string;
  latitude: string;
  longitude: string;
  placeQuery: string;
};

const initialHomestay: HomestayForm = {
  name: "",
  type: "",
  facility: "",
  guestPerRoom: "",
  totalRoom: "",
  houseNumber: "",
  villageNumber: "",
  province: "",
  district: "",
  subDistrict: "",
  postalCode: "",
  addressDetail: "",
  latitude: "",
  longitude: "",
  placeQuery: "",
};

const homestaySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อที่พัก"),
  type: z.string().min(1, "กรุณากรอกประเภทของที่พัก"),
  facility: z.string().min(1, "กรุณากรอกสิ่งอำนวยความสะดวก"),
  guestPerRoom: z
    .string()
    .min(1)
    .refine(
      (value) => Number(value) >= 1 && Number.isInteger(Number(value)),
      "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป",
    ),
  totalRoom: z
    .string()
    .min(1)
    .refine(
      (value) => Number(value) >= 1 && Number.isInteger(Number(value)),
      "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป",
    ),
  houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล/แขวง"),
  postalCode: z.string().min(1, "กรุณาเลือกรหัสไปรษณีย์"),
  addressDetail: z.string().optional().default(""),
  placeQuery: z.string().optional().default(""),
});

type HomestayFormErrors = Partial<Record<keyof HomestayForm, string>>;

/**
 * คำอธิบาย: ฟังก์ชันสำหรับตัดช่องว่างและคืนค่า default หากเป็นค่าว่าง
 * Input: value (ค่าที่ต้องการตรวจสอบ), fallback (ค่าเริ่มต้นถ้าเป็นค่าว่าง, default = "")
 * Output: ข้อมูล string ที่ผ่านการตัดช่องว่างแล้ว
 */
function normalizeOrDefault(value: string, fallback = "") {
  const trimmed = (value ?? "").toString().trim();
  return trimmed.length ? trimmed : fallback;
}

/**
 * Interceptor เฉพาะกรณี endpoint /shared/tags
 * เหตุผล: บาง BE ส่ง shape เป็น { data: { data: [...] } } จึง flatten ให้เสมอกัน
 */
declare global {
  interface Window {
    __tagsInterceptorAdded?: boolean;
  }
}
if (typeof window !== "undefined" && !window.__tagsInterceptorAdded) {
  window.__tagsInterceptorAdded = true;
  axios.interceptors.response.use(
    (response) => {
      try {
        const url = response?.config?.url ?? "";
        if (typeof url === "string" && url.includes("/shared/tags")) {
          const tagList = (response as any)?.data?.data;
          if (!Array.isArray(tagList) && tagList && Array.isArray(tagList.data)) {
            (response as any).data.data = tagList.data;
          }
          if (!Array.isArray((response as any).data?.data)) {
            (response as any).data.data = Array.isArray(tagList) ? tagList : [];
          }
        }
      } catch {}
      return response;
    },
    (error) => Promise.reject(error),
  );
}

/**
 * คำอธิบาย: Component สำหรับหน้าเพิ่มที่พัก
 * Input: - (ใช้ Params communityId จาก URL)
 * Output: JSX Element หน้า Form เพิ่มที่พัก
 */
export default function CreateHomestaysPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = React.useState<HomestayForm>(initialHomestay);
  const [errors, setErrors] = React.useState<HomestayFormErrors>({});
  const [coverFiles, setCoverFiles] = React.useState<FileLike[]>([]);
  const [galleryFiles, setGalleryFiles] = React.useState<FileLike[]>([]);
  const [tagIds, setTagIds] = React.useState<number[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [pendingPayloads, setPendingPayloads] = React.useState<any[] | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  /**
   * คำอธิบาย: อัปเดตฟิลด์ในฟอร์ม และ validate ฟิลด์นั้นทันที
   * Input: key (keyof HomestayForm), value (any) - ข้อมูลที่ต้องการอัปเดต
   * Output: - (Update form state)
   */
  function setField(key: keyof HomestayForm, value: any) {
    setForm((prevForm) => {
      if (prevForm[key] === value) return prevForm;

      const nextForm = { ...prevForm, [key]: value };
      const parsed = homestaySchema.safeParse(nextForm);
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };
        if (parsed.success) {
          delete nextErrors[key];
        } else {
          const found = parsed.error.issues.find((issue) => issue.path[0] === key);
          if (found) nextErrors[key] = found.message;
          else delete nextErrors[key];
        }
        return nextErrors;
      });
      return nextForm;
    });
  }

  /**
   * คำอธิบาย: ตรวจสอบข้อมูลฟอร์มทั้งหมด
   * Input: - (ใช้ form state)
   * Output: boolean (true หากข้อมูลถูกต้องทั้งหมด, false หากมีข้อผิดพลาด)
   */
  function validateAll(): boolean {
    const result = homestaySchema.safeParse(form);
    if (!result.success) {
      const validationErrors: HomestayFormErrors = {};
      for (const issue of result.error.issues) {
        validationErrors[issue.path[0] as keyof HomestayForm] = issue.message;
      }
      setErrors(validationErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  /**
   * คำอธิบาย: จัดการ submit ฟอร์มเพิ่มที่พัก ป้องกัน reload, ตรวจสอบค่า, และเปิด modal ยืนยัน
   * Input: event (React.FormEvent)
   * Output: - (Update state หรือ Scroll to error)
   */
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving) return;

    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const latitudeString = (form.latitude ?? "").trim();
    const longitudeString = (form.longitude ?? "").trim();
    const latitudeNumber = latitudeString === "" ? null : Number(latitudeString);
    const longitudeNumber = longitudeString === "" ? null : Number(longitudeString);
    const singlePayload = {
      base: {
        name: normalizeOrDefault(form.name),
        type: normalizeOrDefault(form.type),
        guestPerRoom: Math.max(1, Number(form.guestPerRoom || 0)),
        totalRoom: Math.max(1, Number(form.totalRoom || 0)),
        facility: normalizeOrDefault(form.facility),
        location: {
          houseNumber: normalizeOrDefault(form.houseNumber),
          villageNumber: Number(form.villageNumber) || null,
          subDistrict: normalizeOrDefault(form.subDistrict),
          district: normalizeOrDefault(form.district),
          province: normalizeOrDefault(form.province),
          postalCode: normalizeOrDefault(String(form.postalCode ?? "")),
          detail: normalizeOrDefault(form.addressDetail),
          latitude: latitudeNumber,
          longitude: longitudeNumber,
        },
        tagHomestays: Array.isArray(tagIds) ? tagIds : [],
      },
      coverFiles: coverFiles,
      galleryFiles: galleryFiles,
    };

    setPendingPayloads([singlePayload]);
    setIsConfirmOpen(true);
  }

  /**
   * คำอธิบาย: handler สำหรับ MapPicker อัปเดต latitude/longitude ในฟอร์ม
   * Input: position ([number, number]) - พิกัดละติจูดและลองจิจูด
   * Output: - (Update form state)
   */
  const onMapChange = React.useCallback((position: [number, number]) => {
    const [latitude, longitude] = position;
    setForm((prev) => ({
      ...prev,
      latitude: String(latitude),
      longitude: String(longitude),
    }));
  }, []);

  /**
   * คำอธิบาย: ฟังก์ชันยืนยันการบันทึก ส่งข้อมูลฟอร์มไปยัง API และอัปโหลดไฟล์
   * Input: -
   * Output: Promise<void> - (Navigate เมื่อสำเร็จ)
   */
  const onConfirmSave = async () => {
    setIsConfirmOpen(false);
    if (!pendingPayloads || pendingPayloads.length === 0) return;

    try {
      setIsSaving(true);
      const communityIdNumber = Number(communityId);
      if (!communityIdNumber) throw new Error("communityId ไม่ถูกต้อง");

      for (const pendingPayload of pendingPayloads) {
        const dataPayload = {
          ...pendingPayload.base,
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(dataPayload));
        if (pendingPayload.coverFiles?.length) {
          formData.append("cover", pendingPayload.coverFiles[0]);
        }

        if (Array.isArray(pendingPayload.galleryFiles)) {
          for (const galleryFile of pendingPayload.galleryFiles) {
            formData.append("gallery", galleryFile);
          }
        }

        await axios.post(`${API_URL}/super/community/${communityIdNumber}/homestay`, formData, {
          withCredentials: true,
        });
      }
      navigate(`/super/community/${communityId}/homestay/all`);
    } catch (error: any) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
      setPendingPayloads(null);
    }
  };

  const startingPosition = React.useMemo<[number, number]>(() => {
    const numberLatitude = Number(form.latitude);
    const numberLongitude = Number(form.longitude);
    return [
      !Number.isNaN(numberLatitude) && form.latitude !== "" ? numberLatitude : 13.7563,
      !Number.isNaN(numberLongitude) && form.longitude !== "" ? numberLongitude : 100.5018,
    ];
  }, [form.latitude, form.longitude]);

  return (
    <div className="w-full max-w-none">
      <div>
        <Breadcrumb
          current={{
            label: "เพิ่มที่พัก",
            to: `/super/community/${communityId}/homestay/create`,
          }}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center gap-2 text-xl cursor-pointer"
              onClick={() => navigate(`/super/community/${communityId}/homestay/all`)}
            >
              <Icon icon="mingcute:arrow-left-line" width={22} />
              <span className="font-bold text-xl">เพิ่มที่พัก</span>
            </div>
          </div>

          <div className="space-y-6 md:col-span-2 border border-gray-300 rounded-md p-3">
            {/* ชื่อ/ประเภท/สิ่งอำนวยความสะดวก */}
            <div className="grid md:grid-cols-2 gap-5">
              <TextField
                id="name"
                label="ชื่อที่พัก"
                required
                placeholder="พิมพ์ชื่อที่พัก"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                id="type"
                label="ประเภทที่พัก"
                required
                placeholder="พิมพ์ประเภทของที่พัก"
                value={form.type}
                onChange={(event) => setField("type", event.target.value)}
                error={!!errors.type}
                helperText={errors.type}
              />
              <div className="md:col-span-2">
                <TextArea
                  id="facility"
                  label="สิ่งอำนวยความสะดวก"
                  required
                  placeholder="ใส่รายละเอียดความสะดวกสบายของที่พัก"
                  value={form.facility}
                  onChange={(event) => setField("facility", event.target.value)}
                  error={!!errors.facility}
                  helperText={errors.facility}
                />
              </div>
            </div>

            {/* จำนวนห้อง/จำนวนผู้เข้าพัก */}
            <div className="grid md:grid-cols-2 gap-5">
              <TextField
                id="totalRoom"
                label="จำนวนห้องทั้งหมด"
                required
                type="number"
                placeholder="กรอกจำนวนห้องทั้งหมด"
                value={form.totalRoom}
                onChange={(event) => setField("totalRoom", event.target.value)}
                error={!!errors.totalRoom}
                helperText={errors.totalRoom}
              />
              <TextField
                id="guestPerRoom"
                label="จำนวนผู้เข้าพักต่อห้อง"
                required
                type="number"
                placeholder="กรอกจำนวนผู้เข้าพักต่อห้อง"
                value={form.guestPerRoom}
                onChange={(event) => setField("guestPerRoom", event.target.value)}
                error={!!errors.guestPerRoom}
                helperText={errors.guestPerRoom}
              />
            </div>

            {/* ที่อยู่ */}
            <div className="grid md:grid-cols-2 gap-5">
              <TextField
                id="houseNumber"
                label="บ้านเลขที่"
                required
                placeholder="บ้านเลขที่"
                value={form.houseNumber}
                onChange={(event) => setField("houseNumber", event.target.value)}
                error={!!errors.houseNumber}
                helperText={errors.houseNumber}
              />

              <TextField
                id="villageNumber"
                label="หมู่ที่"
                placeholder="หมู่ที่"
                value={form.villageNumber}
                onChange={(event) => setField("villageNumber", event.target.value)}
                error={!!errors.villageNumber}
                helperText={errors.villageNumber}
              />

              <div className="md:col-span-2">
                <ThailandLocationSelector
                  value={{
                    province: form.province,
                    district: form.district,
                    subdistrict: form.subDistrict,
                    postalCode: form.postalCode,
                  }}
                  onChange={(location: ThailandLocation) => {
                    setField("province", location.province ?? "");
                    setField("district", location.district ?? "");
                    setField("subDistrict", location.subdistrict ?? "");
                    setField("postalCode", (location.postalCode ?? "").toString());
                  }}
                  error={{
                    province: !!errors.province,
                    district: !!errors.district,
                    subdistrict: !!errors.subDistrict,
                  }}
                  helperText={{
                    province: errors.province,
                    district: errors.district,
                    subdistrict: errors.subDistrict,
                  }}
                />
              </div>

              <div className="md:col-span-2">
                <TextArea
                  id="addressDetail"
                  label="คำอธิบายที่อยู่"
                  placeholder="คำอธิบายที่อยู่"
                  value={form.addressDetail}
                  onChange={(event) => setField("addressDetail", event.target.value)}
                  error={!!errors.addressDetail}
                  helperText={errors.addressDetail}
                />
              </div>
            </div>

            {/* แผนที่ */}
            <div className="space-y-3">
              <MapPicker
                startingPosition={startingPosition}
                startingZoom={12}
                onChange={onMapChange}
              />
              <div className="grid grid-cols-2 gap-3 mt-2">
                {!!errors.latitude && <div className="text-red-600 text-sm">{errors.latitude}</div>}
                {!!errors.longitude && (
                  <div className="text-red-600 text-sm">{errors.longitude}</div>
                )}
              </div>
            </div>

            {/* แท็ก */}
            <div className="md:col-span-2">
              <TagSelector value={tagIds} onChange={setTagIds} />
            </div>

            {/* อัปโหลดรูป */}
            <div className="grid md:grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="block text-base font-semibold">
                  อัปโหลดภาพหน้าปก <span className="text-red-600">*</span>
                </label>
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

              <div className="space-y-2">
                <label className="block text-base font-semibold">
                  อัปโหลดรูปภาพเพิ่มเติม <span className="text-red-600">*</span>
                </label>
                <UploadCard
                  max={5}
                  accept="image/*"
                  multiple
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 mt-6">
            <div className="w-36">
              <Button type="cancel" onClick={() => history.back()}>
                ยกเลิก
              </Button>
            </div>
            <div className="w-36">
              <Button type="confirm-admin" htmlType="submit">
                {isSaving ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </div>
        </section>
      </form>

      {/* Modal ยืนยัน */}
      <Modal
        isOpen={isConfirmOpen}
        title="ยืนยันการบันทึกที่พัก"
        text={`คุณต้องการบันทึกที่พักจำนวน ${pendingPayloads?.length ?? 0} รายการหรือไม่`}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={onConfirmSave}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingPayloads(null);
        }}
      />
    </div>
  );
}
