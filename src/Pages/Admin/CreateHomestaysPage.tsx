/**
 * คำอธิบาย: Component หน้าสำหรับเพิ่มที่พักรายการเดียว (สำหรับ Admin) รองรับการกรอกข้อมูล ตรวจสอบความถูกต้อง และอัปโหลดรูปภาพ
 */
import React from "react";
import * as z from "zod";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "@/Components/Button";
import TextField from "@/Components/Input/TextField";
import TextArea from "@/Components/Input/TextArea";
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
 * คำอธิบาย: ตัดช่องว่างของข้อความและคืนค่า fallback หากข้อความว่างเปล่า
 * Input: value (ค่าที่ต้องการตรวจสอบ), fallback (ค่าที่จะคืนกลับถ้าว่าง)
 * Output: ข้อความที่ตัดช่องว่างแล้ว หรือค่า fallback
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
 * คำอธิบาย: Component หน้าสำหรับเพิ่มที่พักรายการเดียว (สำหรับ Admin)
 * หน้าที่:
 * - จัดการ state ของฟอร์มที่พัก
 * - ตรวจสอบข้อมูล (Validation)
 * - บันทึกข้อมูลที่พักใหม่ลงฐานข้อมูล
 */
export default function CreateHomestaysPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [homestayForm, setHomestayForm] = React.useState<HomestayForm>(initialHomestay);
  const [formErrors, setFormErrors] = React.useState<HomestayFormErrors>({});
  const [coverFiles, setCoverFiles] = React.useState<FileLike[]>([]);
  const [galleryFiles, setGalleryFiles] = React.useState<FileLike[]>([]);
  const [tagIds, setTagIds] = React.useState<number[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [pendingPayloads, setPendingPayloads] = React.useState<any[] | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  /**
   * คำอธิบาย: อัปเดตฟิลด์ในฟอร์ม และ validate ฟิลด์นั้นทันที
   * Input: key (ชื่อฟิลด์), value (ค่าใหม่)
   * Output: -
   */
  function setHomestayFormField(key: keyof HomestayForm, value: any) {
    setHomestayForm((previousForm) => {
      if (previousForm[key] === value) return previousForm;

      const nextFormState = { ...previousForm, [key]: value };
      const parsed = homestaySchema.safeParse(nextFormState);
      setFormErrors((previousErrors) => {
        const nextErrorsState = { ...previousErrors };
        if (parsed.success) {
          delete nextErrorsState[key];
        } else {
          const found = parsed.error.issues.find((issue) => issue.path[0] === key);
          if (found) nextErrorsState[key] = found.message;
          else delete nextErrorsState[key];
        }
        return nextErrorsState;
      });
      return nextFormState;
    });
  }

  /**
   * คำอธิบาย: ตรวจสอบความถูกต้องของข้อมูลทั้งหมดในฟอร์มก่อนการบันทึก
   * Input: -
   * Output: ผลลัพธ์การตรวจสอบ (true หากถูกต้อง, false หากมีข้อผิดพลาด)
   */
  function validateAll(): boolean {
    const result = homestaySchema.safeParse(homestayForm);
    if (!result.success) {
      const validationErrors: HomestayFormErrors = {};
      for (const issue of result.error.issues) {
        validationErrors[issue.path[0] as keyof HomestayForm] = issue.message;
      }
      setFormErrors(validationErrors);
      return false;
    }
    setFormErrors({});
    return true;
  }

  /**
   * คำอธิบาย: จัดการเมื่อมีการกดปุ่มบันทึกเพื่อเตรียมข้อมูลสำหรับส่งไปยัง Server
   * Input: event (เหตุการณ์จากฟอร์ม)
   * Output: -
   */
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving) return;

    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const latitudeString = (homestayForm.latitude ?? "").trim();
    const longitudeString = (homestayForm.longitude ?? "").trim();
    const latitudeNumber = latitudeString === "" ? null : Number(latitudeString);
    const longitudeNumber = longitudeString === "" ? null : Number(longitudeString);
    const singlePayload = {
      base: {
        name: normalizeOrDefault(homestayForm.name),
        type: normalizeOrDefault(homestayForm.type),
        guestPerRoom: Math.max(1, Number(homestayForm.guestPerRoom || 0)),
        totalRoom: Math.max(1, Number(homestayForm.totalRoom || 0)),
        facility: normalizeOrDefault(homestayForm.facility),
        location: {
          houseNumber: normalizeOrDefault(homestayForm.houseNumber),
          villageNumber: Number(homestayForm.villageNumber) || null,
          subDistrict: normalizeOrDefault(homestayForm.subDistrict),
          district: normalizeOrDefault(homestayForm.district),
          province: normalizeOrDefault(homestayForm.province),
          postalCode: normalizeOrDefault(String(homestayForm.postalCode ?? "")),
          detail: normalizeOrDefault(homestayForm.addressDetail),
          latitude: latitudeNumber,
          longitude: longitudeNumber,
        },
        tagHomestays: Array.isArray(tagIds) ? tagIds : [],
      },
      coverFiles: coverFiles,
      galleryFiles: galleryFiles,
    };

    setPendingPayloads([singlePayload]);
    setIsConfirmModalOpen(true);
  }

  /**
   * คำอธิบาย: ฟังก์ชันจัดการเมื่อมีการเปลี่ยนตำแหน่งบนแผนที่
   * Input: position (อาร์เรย์เก็บค่าละติจูดและลองจิจูด)
   * Output: -
   */
  const onMapChange = React.useCallback((position: [number, number]) => {
    const [latitude, longitude] = position;
    setHomestayForm((previousForm) => ({
      ...previousForm,
      latitude: String(latitude),
      longitude: String(longitude),
    }));
  }, []);

  /**
   * คำอธิบาย: ยืนยันการบันทึกข้อมูล ส่งข้อมูลไปยัง API และจัดการการอัปโหลดไฟล์
   * Input: -
   * Output: -
   */
  const onConfirmSave = async () => {
    setIsConfirmModalOpen(false);
    if (!pendingPayloads || pendingPayloads.length === 0) {
      return;
    }

    try {
      setIsSaving(true);
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
        await axios.post(`${API_URL}/admin/community/homestay`, formData, {
          withCredentials: true,
        });
      }
      navigate("/admin/community/homestays");
    } catch (error: any) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
      setPendingPayloads(null);
    }
  };

  const startingPosition = React.useMemo<[number, number]>(() => {
    const numberLatitude = Number(homestayForm.latitude);
    const numberLongitude = Number(homestayForm.longitude);
    return [
      !Number.isNaN(numberLatitude) && homestayForm.latitude !== "" ? numberLatitude : 13.7563,
      !Number.isNaN(numberLongitude) && homestayForm.longitude !== "" ? numberLongitude : 100.5018,
    ];
  }, [homestayForm.latitude, homestayForm.longitude]);

  return (
    <div className="w-full max-w-none">
      {/* breadcrump */}
      <div>
        <Breadcrumb
          current={{
            label: "เพิ่มที่พัก",
            to: `/admin/community/homestay/create`,
          }}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center gap-2 text-xl cursor-pointer"
              onClick={() => navigate(`/admin/community/homestays`)}
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
                value={homestayForm.name}
                onChange={(event) => setHomestayFormField("name", event.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              <TextField
                id="type"
                label="ประเภทที่พัก"
                required
                placeholder="พิมพ์ประเภทของที่พัก"
                value={homestayForm.type}
                onChange={(event) => setHomestayFormField("type", event.target.value)}
                error={!!formErrors.type}
                helperText={formErrors.type}
              />
              <div className="md:col-span-2">
                <TextArea
                  id="facility"
                  label="สิ่งอำนวยความสะดวก"
                  required
                  placeholder="ใส่รายละเอียดความสะดวกสบายของที่พัก"
                  value={homestayForm.facility}
                  onChange={(event) => setHomestayFormField("facility", event.target.value)}
                  error={!!formErrors.facility}
                  helperText={formErrors.facility}
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
                value={homestayForm.totalRoom}
                onChange={(event) => setHomestayFormField("totalRoom", event.target.value)}
                error={!!formErrors.totalRoom}
                helperText={formErrors.totalRoom}
              />
              <TextField
                id="guestPerRoom"
                label="จำนวนผู้เข้าพักต่อห้อง"
                required
                type="number"
                placeholder="กรอกจำนวนผู้เข้าพักต่อห้อง"
                value={homestayForm.guestPerRoom}
                onChange={(event) => setHomestayFormField("guestPerRoom", event.target.value)}
                error={!!formErrors.guestPerRoom}
                helperText={formErrors.guestPerRoom}
              />
            </div>

            {/* ที่อยู่ */}
            <div className="grid md:grid-cols-2 gap-5">
              <TextField
                id="houseNumber"
                label="บ้านเลขที่"
                required
                placeholder="บ้านเลขที่"
                value={homestayForm.houseNumber}
                onChange={(event) => setHomestayFormField("houseNumber", event.target.value)}
                error={!!formErrors.houseNumber}
                helperText={formErrors.houseNumber}
              />

              <TextField
                id="villageNumber"
                label="หมู่ที่"
                placeholder="หมู่ที่"
                value={homestayForm.villageNumber}
                onChange={(event) => setHomestayFormField("villageNumber", event.target.value)}
                error={!!formErrors.villageNumber}
                helperText={formErrors.villageNumber}
              />

              <div className="md:col-span-2">
                <ThailandLocationSelector
                  value={{
                    province: homestayForm.province,
                    district: homestayForm.district,
                    subdistrict: homestayForm.subDistrict,
                    postalCode: homestayForm.postalCode,
                  }}
                  onChange={(location: ThailandLocation) => {
                    setHomestayFormField("province", location.province ?? "");
                    setHomestayFormField("district", location.district ?? "");
                    setHomestayFormField("subDistrict", location.subdistrict ?? "");
                    setHomestayFormField("postalCode", (location.postalCode ?? "").toString());
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

              <div className="md:col-span-2">
                <TextArea
                  id="addressDetail"
                  label="คำอธิบายที่อยู่"
                  placeholder="คำอธิบายที่อยู่"
                  value={homestayForm.addressDetail}
                  onChange={(event) => setHomestayFormField("addressDetail", event.target.value)}
                  error={!!formErrors.addressDetail}
                  helperText={formErrors.addressDetail}
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
                {!!formErrors.latitude && (
                  <div className="text-red-600 text-sm">{formErrors.latitude}</div>
                )}
                {!!formErrors.longitude && (
                  <div className="text-red-600 text-sm">{formErrors.longitude}</div>
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
              <Button
                type="cancel"
                onClick={
                  () => navigate(`/admin/community/homestays`)
                  // navigate(`/admin/community/${communityId}/homestay/all`)
                }
              >
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
        isOpen={isConfirmModalOpen}
        title="ยืนยันการบันทึกที่พัก"
        text={`คุณต้องการบันทึกที่พักจำนวน ${pendingPayloads?.length ?? 0} รายการหรือไม่`}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={onConfirmSave}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setPendingPayloads(null);
        }}
      />
    </div>
  );
}
