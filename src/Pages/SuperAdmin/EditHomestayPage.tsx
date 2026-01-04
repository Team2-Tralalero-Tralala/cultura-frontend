/**
 * คำอธิบาย : หน้าแก้ไขข้อมูลที่พักของ Super Admin ทำหน้าที่โหลดข้อมูลเดิม แสดงฟอร์ม จัดการรูปภาพ และบันทึกการแก้ไข
 */
import React from "react";
import * as z from "zod";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";

import Button from "@/Components/Button";
import TextField from "@/Components/TextField";
import TextArea from "@/Components/TextArea";
import MapPicker from "@/Components/MapPicker";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import { Modal } from "@/Components/Modal/Modal";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import { TagSelector } from "@/Components/Selector/TagSelector";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const API_URL = import.meta.env.VITE_API_URL as string;

/** ฟอร์มข้อมูลที่พัก */
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

/** ค่าเริ่มต้นของฟอร์ม */
const initialForm: HomestayForm = {
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

const schema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อที่พัก"),
  type: z.string().min(1, "กรุณากรอกประเภทของที่พัก"),
  facility: z.string().min(1, "กรุณากรอกสิ่งอำนวยความสะดวก"),
  guestPerRoom: z
    .string()
    .min(1)
    .refine(
      (guestPerRoomValue) =>
        Number(guestPerRoomValue) >= 1 && Number.isInteger(Number(guestPerRoomValue)),
      "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"
    ),
  totalRoom: z
    .string()
    .min(1)
    .refine(
      (refineValue) => Number(refineValue) >= 1 && Number.isInteger(Number(refineValue)),
      "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"
    ),
  houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล/แขวง"),
  // villageNumber: z.string().min(1, "กรุณากรอกหมู่ที่"),
  addressDetail: z.string().optional().default(""),
  placeQuery: z.string().optional().default(""),
});

/**
 * คำอธิบาย : ดึงไฟล์จาก URL แล้วแปลงเป็น File object เพื่อใช้กับ UploadCard
 * Input : url (ที่อยู่ไฟล์), filename (ชื่อไฟล์)
 * Output : File object (กำหนด MIME type และเติม flag isFromServer)
 */
async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`fetch ${url} -> ${response.status}`);
  const blob = await response.blob();
  const fileExtension = filename.split(".").pop() || "jpg";
  const type = blob.type || `image/${fileExtension}`;
  const file = new File([blob], filename, { type });
  (file as any).isFromServer = true;
  return file;
}

/**
 * คำอธิบาย : สร้างรายการ URL ผู้สมัครโหลดภาพจากค่า image ใน DB เพื่อป้องกันปัญหา 404 จาก path ที่ต่างกัน
 * Input : rawImagePath (path หรือ filename จากฐานข้อมูล)
 * Output : รายการ URL ที่เป็นไปได้ (เรียงตามความเป็นไปได้)
 */
function buildImageCandidates(rawImagePath: string): string[] {
  if (!rawImagePath) return [];
  if (/^https?:\/\//i.test(rawImagePath)) return [rawImagePath];
  const origin = (() => {
    try {
      return new URL(API_URL).origin;
    } catch {
      return window.location.origin;
    }
  })();

  const normalizedPath = String(rawImagePath)
    .replace(/\\/g, "/")
    .replace(/^\.?\/*/, "");
  const imagePathPrefixes = ["uploads/"];
  const candidates = new Set<string>();
  for (const prefix of imagePathPrefixes) {
    const candidatePath = normalizedPath.startsWith(prefix)
      ? normalizedPath
      : `${prefix}${normalizedPath}`;
    candidates.add(`${origin}/${encodeURI(candidatePath)}`);
    candidates.add(`${origin}/api/${encodeURI(candidatePath)}`);
  }
  return Array.from(candidates);
}

/**
 * คำอธิบาย : ทดลองโหลดภาพตาม candidate URL ไปทีละรายการจนกว่าจะสำเร็จ
 * Input : rawImagePath (path หรือ filename ของรูปภาพ), filename (ชื่อไฟล์ปลายทาง)
 * Output : File object ที่แปลงสำเร็จ
 */
async function bestEffortUrlToFile(rawImagePath: string, filename: string): Promise<File> {
  const candidates = buildImageCandidates(rawImagePath);
  let lastError: unknown = null;
  for (const candidateUrl of candidates) {
    try {
      return await urlToFile(candidateUrl, filename);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("no image url works");
}

type FormErrors = Partial<Record<keyof HomestayForm, string>>;

/**
 * Component: EditHomestayPage
 * หน้าที่: โหลดข้อมูลที่พัก, แสดงฟอร์มแก้ไข, จัดการอัปโหลด/แสดงรูป, และบันทึกข้อมูล
 */
export default function EditHomestayPage() {
  const { homestayId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = React.useState<HomestayForm>(initialForm);
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isConfirmOpen, setConfirmOpen] = React.useState(false);
  const [communityId, setCommunityId] = React.useState<number | null>(null);
  const [position, setPosition] = React.useState<[number, number]>([0, 0]);
  const startingZoom = 12;
  const [coverFiles, setCoverFiles] = React.useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [tagIds, setTagIds] = React.useState<number[]>([]);

  /**
   * คำอธิบาย : โหลดข้อมูลที่พักจาก API และแปลง URL รูปภาพเป็น File Object
   * Input : -
   * Output : -
   */
  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const homestayIdNumber = Number(homestayId);
        if (!homestayIdNumber) throw new Error("homestayId ไม่ถูกต้อง");

        const response = await axios.get(
          `${API_URL}/super/homestays/${homestayIdNumber}`,
          {
            withCredentials: true,
          }
        );
        const homestayData = response?.data?.data ?? response?.data;
        if (!homestayData) throw new Error("ไม่พบข้อมูลที่พัก");

        setCommunityId(homestayData.community?.id ?? null);

        const latitude = Number(homestayData.location?.latitude ?? 13.7563);
        const longitude = Number(homestayData.location?.longitude ?? 100.5018);
        setPosition([latitude, longitude]);

        setForm({
          name: homestayData.name ?? "",
          type: homestayData.type ?? "",
          facility: homestayData.facility ?? "",
          guestPerRoom: String(homestayData.guestPerRoom ?? ""),
          totalRoom: String(homestayData.totalRoom ?? ""),
          houseNumber: homestayData.location?.houseNumber ?? "",
          villageNumber: String(homestayData.location?.villageNumber ?? ""),
          province: homestayData.location?.province ?? "",
          district: homestayData.location?.district ?? "",
          subDistrict: homestayData.location?.subDistrict ?? "",
          postalCode: homestayData.location?.postalCode ?? "",
          addressDetail: homestayData.location?.detail ?? "",
          latitude: String(latitude),
          longitude: String(longitude),
          placeQuery: "",
        });

        const homestayImages: any[] = Array.isArray(homestayData?.homestayImage)
          ? homestayData.homestayImage
          : [];

        const coverFilesFetched: File[] = await Promise.all(
          homestayImages
            .filter((imageItem) => imageItem.type === "COVER")
            .map((imageItem) =>
              bestEffortUrlToFile(
                String(imageItem.image || ""),
                String(imageItem.image || "cover.jpg")
              )
            )
        );

        const galleryFilesFetched: File[] = await Promise.all(
          homestayImages
            .filter((imageItem) => imageItem.type === "GALLERY")
            .map((imageItem) =>
              bestEffortUrlToFile(
                String(imageItem.image || ""),
                String(imageItem.image || "gallery.jpg")
              )
            )
        );

        setCoverFiles(coverFilesFetched);
        setGalleryFiles(galleryFilesFetched);
        const currentTagIds: number[] = Array.isArray(homestayData?.tagHomestays)
          ? homestayData.tagHomestays
            .map((tagItem: any) => tagItem?.tag?.id ?? tagItem?.id)
            .filter((tagId: any) => typeof tagId === "number")
          : [];
        setTagIds(currentTagIds);
      } catch (err: any) {
        console.error("Load homestay error:", err?.response?.data || err);
        setErrorMessage(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "โหลดข้อมูลไม่สำเร็จ"
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [homestayId]);

  /**
   * คำอธิบาย : ตรวจสอบความถูกต้องของฟิลด์เดี่ยวด้วย Zod แล้วบันทึก Error ลงใน State
   * Input : key (ชื่อฟิลด์), value (ค่าของฟิลด์นั้น)
   * Output : -
   */
  const validateField = (key: keyof HomestayForm, value: any) => {
    const formWithNewValue = { ...form, [key]: value };
    const validationResult = schema.safeParse(formWithNewValue);
    setFormErrors((prev) => ({
      ...prev,
      [key]: validationResult.success
        ? undefined
        : validationResult.error.issues.find((issue) => issue.path[0] === key)?.message,
    }));
  };

  /**
   * คำอธิบาย : ตรวจสอบข้อมูลในฟอร์มทั้งหมดตาม Schema
   * Input : -
   * Output : Boolean (true หากข้อมูลถูกต้อง, false หากมีข้อผิดพลาด)
   */
  const validateAll = () => {
    const validationResult = schema.safeParse(form);
    if (validationResult.success) {
      setFormErrors({});
      return true;
    }
    const validationErrors: FormErrors = {};
    for (const issue of validationResult.error.issues) {
      validationErrors[issue.path[0] as keyof HomestayForm] = issue.message;
    }
    setFormErrors(validationErrors);
    return false;
  };

  /**
   * ฟังก์ชัน: setField
   * คำอธิบาย: อัปเดตค่าฟอร์มและตรวจสอบความถูกต้องของฟิลด์นั้นทันที
   */
  const setField = <FieldKey extends keyof HomestayForm>(
    key: FieldKey,
    value: HomestayForm[FieldKey]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    validateField(key, value);
  };

  /**
   * คำอธิบาย : ตัดช่องว่างและคืนค่า Default หากข้อมูลเป็นค่าว่าง
   * Input : value (ค่าที่ต้องการตรวจสอบ), fallback (ค่าเริ่มต้นถ้าเป็นค่าว่าง)
   * Output : ข้อมูล String ที่ผ่านการตัดช่องว่างแล้ว
   */
  const normalizeOrDefault = (value: string, fallback = "") => {
    const trimmedValue = (value ?? "").toString().trim();
    return trimmedValue.length ? trimmedValue : fallback;
  };

  /**
   * คำอธิบาย : อัปเดตตำแหน่ง (Position) เมื่อผู้ใช้เลื่อนหมุดบนแผนที่
   * Input : newPosition (พิกัดใหม่ Latitude และ Longitude)
   * Output : -
   */
  const handleMapChange = React.useCallback((newPosition: [number, number]) => {
    setPosition((previousPosition) =>
      previousPosition[0] === newPosition[0] && previousPosition[1] === newPosition[1]
        ? previousPosition
        : newPosition
    );
  }, []);

  /**
   * คำอธิบาย : ตรวจสอบความถูกต้องของฟอร์มและเปิด Modal เพื่อยืนยันการบันทึก
   * Input : event (เหตุการณ์จาก Form Submit)
   * Output : -
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setConfirmOpen(true);
  };

  /**
   * คำอธิบาย : สร้าง FormData และส่ง Request แบบ PUT ไปยัง API เพื่อบันทึกข้อมูล
   * Input : -
   * Output : -
   */
  const onConfirmSave = async () => {
    setConfirmOpen(false);

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const homestayIdNumber = Number(homestayId);
      if (!homestayIdNumber) throw new Error("homestayId ไม่ถูกต้อง");

      const payload = {
        name: normalizeOrDefault(form.name),
        type: normalizeOrDefault(form.type),
        guestPerRoom: Math.max(1, Number(form.guestPerRoom || 0)),
        totalRoom: Math.max(1, Number(form.totalRoom || 0)),
        facility: normalizeOrDefault(form.facility),
        tagHomestays: Array.isArray(tagIds) ? tagIds : [],
        location: {
          houseNumber: normalizeOrDefault(form.houseNumber),
          villageNumber: Number(form.villageNumber) || null,
          subDistrict: normalizeOrDefault(form.subDistrict),
          district: normalizeOrDefault(form.district),
          province: normalizeOrDefault(form.province),
          postalCode: normalizeOrDefault(form.postalCode),
          detail: normalizeOrDefault(form.addressDetail),
          latitude: position[0],
          longitude: position[1],
        },
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      coverFiles.forEach((file: any) => formData.append("cover", file));
      galleryFiles.forEach((file: any) => formData.append("gallery", file));

      await axios.put(`${API_URL}/super/homestay/edit/${homestayIdNumber}`, formData, {
        withCredentials: true,
      });

      setSuccessMessage("อัปเดตที่พักสำเร็จ");
      if (communityId) navigate(`/super/community/${communityId}/homestay/all`);
      else navigate(-1);
    } catch (error: any) {
      console.error("Update homestay error:", error?.response?.data || error);
      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "อัปเดตที่พักไม่สำเร็จ"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-none">
      {/* breadcrump */}
      <div>
        <Breadcrumb
          current={{
            label: "แก้ไขที่พัก",
            to: `/super/community/${communityId}/homestay/${homestayId}/edit`,
          }}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              className="flex items-center gap-2 text-xl"
              onClick={() =>
                communityId
                  ? navigate(`/super/community/${communityId}/homestay/all`)
                  : navigate(-1)
              }
            >
              <Icon icon="mingcute:arrow-left-line" width={22} />
              <span className="font-bold text-xl">แก้ไขที่พัก</span>
            </button>
          </div>
          <div className="space-y-6 md:col-span-2 border border-gray-300 rounded-md p-3">
            {/* ฟิลด์ข้อมูลหลัก */}
            <div className="grid md:grid-cols-2 gap-5">
              <TextField
                id="name"
                label="ชื่อที่พัก"
                required
                placeholder="พิมพ์ชื่อที่พัก"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              <TextField
                id="type"
                label="ประเภทที่พัก"
                required
                placeholder="พิมพ์ประเภทของที่พัก"
                value={form.type}
                onChange={(event) => setField("type", event.target.value)}
                error={!!formErrors.type}
                helperText={formErrors.type}
              />
              <div className="md:col-span-2">
                <TextArea
                  id="facility"
                  label="สิ่งอำนวยความสะดวก"
                  required
                  placeholder="ใส่รายละเอียดความสะดวกสบายของที่พัก"
                  value={form.facility}
                  onChange={(event) => setField("facility", event.target.value)}
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
                value={form.totalRoom}
                onChange={(event) => setField("totalRoom", event.target.value)}
                error={!!formErrors.totalRoom}
                helperText={formErrors.totalRoom}
              />
              <TextField
                id="guestPerRoom"
                label="จำนวนผู้เข้าพักต่อห้อง"
                required
                type="number"
                placeholder="กรอกจำนวนผู้เข้าพักต่อห้อง"
                value={form.guestPerRoom}
                onChange={(event) => setField("guestPerRoom", event.target.value)}
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
                value={form.houseNumber}
                onChange={(event) => setField("houseNumber", event.target.value)}
                error={!!formErrors.houseNumber}
                helperText={formErrors.houseNumber}
              />
              <TextField
                id="villageNumber"
                label="หมู่ที่"
                placeholder="หมู่ที่"
                value={form.villageNumber}
                onChange={(event) => setField("villageNumber", event.target.value)}
                error={!!formErrors.villageNumber}
                helperText={formErrors.villageNumber}
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
                    setForm((prev) => ({
                      ...prev,
                      province: location.province ?? "",
                      district: location.district ?? "",
                      subDistrict: location.subdistrict ?? "",
                      postalCode: location.postalCode ?? "",
                    }));
                    validateField("province", location.province ?? "");
                    validateField("district", location.district ?? "");
                    validateField("subDistrict", location.subdistrict ?? "");
                    validateField("postalCode", location.postalCode ?? "");
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
                <div className="grid grid-cols-2 gap-y-[6px] gap-x-[12px] mt-2">
                  <div>
                    {!!formErrors.province && (
                      <div className="text-red-600 text-sm">{formErrors.province}</div>
                    )}
                  </div>
                  <div>
                    {!!formErrors.district && (
                      <div className="text-red-600 text-sm">{formErrors.district}</div>
                    )}
                  </div>
                  <div>
                    {!!formErrors.subDistrict && (
                      <div className="text-red-600 text-sm">{formErrors.subDistrict}</div>
                    )}
                  </div>
                  <div>
                    {!!formErrors.postalCode && (
                      <div className="text-red-600 text-sm">{formErrors.postalCode}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <TextArea
                  id="addressDetail"
                  label="คำอธิบายที่อยู่"
                  placeholder="คำอธิบายที่อยู่"
                  value={form.addressDetail}
                  onChange={(event) => setField("addressDetail", event.target.value)}
                  error={!!formErrors.addressDetail}
                  helperText={formErrors.addressDetail}
                />
              </div>
            </div>

            {/* แผนที่ */}
            <div className="space-y-3">
              {position[0] !== 0 && position[1] !== 0 && (
                <MapPicker
                  startingPosition={position}
                  startingZoom={startingZoom}
                  onChange={handleMapChange}
                />
              )}
            </div>

            {/* เลือกแท็ก */}
            <div className="md:col-span-2">
              <TagSelector value={tagIds} onChange={(ids) => setTagIds(ids)} />
            </div>

            {/* อัปโหลดรูปภาพ */}
            <section className="mt-4">
              <h3 className="font-semibold text-base mb-2">
                ภาพหน้าปก (COVER) <span className="text-red-600">*</span>
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

              <h3 className="font-semibold text-base mt-6 mb-2">
                รูปเพิ่มเติม (GALLERY) <span className="text-red-600">*</span>
              </h3>
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
            </section>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 mt-6">
            <div className="w-36">
              <Button
                type="cancel"
                onClick={() =>
                  communityId
                    ? navigate(`/super/community/${communityId}/homestay/all`)
                    : navigate(-1)
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
        open={isConfirmOpen}
        title="ยืนยันการบันทึกข้อมูลที่พัก"
        text="คุณต้องการอัปเดตข้อมูลที่พักนี้หรือไม่"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={onConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
