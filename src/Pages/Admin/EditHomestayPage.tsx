/**
 * EditHomestayAdminPage
 * คำอธิบาย: หน้าแก้ไขข้อมูลที่พักของ Admin
 * ข้อกำหนด:
 *  - ใช้วิธีจัดการรูป (cover/gallery) เหมือนหน้า Store ทุกประการ
 *  - โหลดรูปจาก backend → แปลงเป็น File เพื่อใช้กับ UploadCard
 *  - บันทึกเป็น multipart/form-data: data(JSON) + cover[] + gallery[]
 * หมายเหตุ: ปรับเป็นเวอร์ชัน Admin โดยเปลี่ยน route/API เป็น /admin/*
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
import { ModalAlert } from "@/Components/Modal/ModalAlert";
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
 * ฟังก์ชัน: urlToFile
 * คำอธิบาย: ดึงไฟล์จาก URL แล้วแปลงเป็น File object (ใช้กับ UploadCard)
 * Input : url, filename
 * Output: File object (กำหนด MIME type และเติม flag isFromServer)
 */
async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`);
  const blob = await res.blob();
  const fileExtension = filename.split(".").pop() || "jpg";
  const type = blob.type || `image/${fileExtension}`;
  const file = new File([blob], filename, { type });
  (file as any).isFromServer = true;
  return file;
}

/**
 * ฟังก์ชัน: buildImageCandidates
 * คำอธิบาย: สร้างรายการ URL ผู้สมัครโหลดภาพจากค่า image ใน DB
 * เหตุผล: ป้องกันปัญหา 404 จาก path ที่ต่างกัน (เช่น มี/ไม่มี /api/)
 * Input : raw (path/filename จากฐานข้อมูล)
 * Output: รายการ URL ที่เป็นไปได้ (เรียงตามความเป็นไปได้)
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
 * ฟังก์ชัน: bestEffortUrlToFile
 * คำอธิบาย: ทดลองโหลดภาพตาม candidate URL ไปทีละรายการจนกว่าจะสำเร็จ
 * Input : rawPath, filename
 * Output: File object ที่แปลงสำเร็จ
 */
async function bestEffortUrlToFile(rawPath: string, filename: string): Promise<File> {
  const candidates = buildImageCandidates(rawPath);
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
 * Component: EditHomestayAdminPage
 * หน้าที่: โหลดข้อมูลที่พัก, แสดงฟอร์มแก้ไข, จัดการอัปโหลด/แสดงรูป, และบันทึกข้อมูล (ฝั่ง Admin)
 */
export default function EditHomestayAdminPage() {
  const { homestayId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = React.useState<HomestayForm>(initialForm);
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isConfirmOpen, setConfirmOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertType, setAlertType] = React.useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [communityId, setCommunityId] = React.useState<number | null>(null);
  const [position, setPosition] = React.useState<[number, number]>([0, 0]);
  const startingZoom = 12;
  const [coverFiles, setCoverFiles] = React.useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [tagIds, setTagIds] = React.useState<number[]>([]);

  /**
   * Effect: โหลดข้อมูลที่พักและแปลงรูปเป็น File (ฝั่ง Admin)
   */
  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const id = Number(homestayId);
        if (!id) throw new Error("homestayId ไม่ถูกต้อง");

        const response = await axios.get(`${API_URL}/admin/community/homestay/${id}`, {
          withCredentials: true,
        });
        const homestayData = response?.data?.data ?? response?.data;
        if (!homestayData) throw new Error("ไม่พบข้อมูลที่พัก");

        setCommunityId(homestayData.community?.id ?? null);

        const lat = Number(homestayData.location?.latitude ?? 13.7563);
        const lng = Number(homestayData.location?.longitude ?? 100.5018);
        setPosition([lat, lng]);

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
          latitude: String(lat),
          longitude: String(lng),
          placeQuery: "",
        });

        const imgs: any[] = Array.isArray(homestayData?.homestayImage)
          ? homestayData.homestayImage
          : [];

        const coverFilesFetched: File[] = await Promise.all(
          imgs
            .filter((img) => img.type === "COVER")
            .map((img) =>
              bestEffortUrlToFile(String(img.image || ""), String(img.image || "cover.jpg"))
            )
        );

        const galleryFilesFetched: File[] = await Promise.all(
          imgs
            .filter((img) => img.type === "GALLERY")
            .map((img) =>
              bestEffortUrlToFile(String(img.image || ""), String(img.image || "gallery.jpg"))
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
   * ฟังก์ชัน: validateField
   * คำอธิบาย: ตรวจสอบความถูกต้องของฟิลด์เดี่ยวด้วย Zod แล้วบันทึก error
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
   * ฟังก์ชัน: validateAll
   * คำอธิบาย: ตรวจสอบทั้งฟอร์ม หากไม่ผ่านจะสะสม error ของแต่ละฟิลด์
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
   * ฟังก์ชัน: normalizeOrDefault
   * คำอธิบาย: trim และคืนค่า fallback หากเป็นค่าว่าง
   */
  const normalizeOrDefault = (value: string, fallback = "") => {
    const trimmedValue = (value ?? "").toString().trim();
    return trimmedValue.length ? trimmedValue : fallback;
  };

  /**
   * ฟังก์ชัน: handleMapChange
   * คำอธิบาย: อัปเดต position เมื่อผู้ใช้เลื่อนพินบนแผนที่
   */
  const handleMapChange = React.useCallback((newPosition: [number, number]) => {
    setPosition((previousPosition) =>
      previousPosition[0] === newPosition[0] && previousPosition[1] === newPosition[1]
        ? previousPosition
        : newPosition
    );
  }, []);

  /**
   * ฟังก์ชัน: handleSubmit
   * คำอธิบาย: เปิด Modal เพื่อยืนยันการบันทึก
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    // เปิด Modal ยืนยันทันที
    setConfirmOpen(true);
  };

  /*
   * คำอธิบาย : onConfirmSave
   * - ตรวจสอบความถูกต้อง (Validation)
   * - หากไม่ผ่าน: แสดง Alert Error
   * - หากผ่าน: สร้าง FormData และส่งข้อมูล (axios.put) -> แสดง Alert Success
   * Input: -
   * Output : (void)
   */
  const onConfirmSave = async () => {
    setConfirmOpen(false);
    const isFormValid = validateAll();
    const isFilesValid = coverFiles.length > 0 && galleryFiles.length > 0;

    if (!isFormValid || !isFilesValid) {
      setAlertType("error");
      setAlertTitle("ข้อมูลไม่ครบถ้วน");
      setAlertMessage("กรุณากรอกข้อมูลให้ครบถ้วนก่อนการทำการบันทึก");
      setAlertOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. ส่งข้อมูล (API Call)
    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const id = Number(homestayId);
      if (!id) throw new Error("homestayId ไม่ถูกต้อง");

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

      await axios.put(`${API_URL}/admin/community/homestay/edit/${id}`, formData, {
        withCredentials: true,
      });

      // บันทึกสำเร็จ
      setAlertType("success");
      setAlertTitle("แก้ไขที่พักสำเร็จ");
      setAlertMessage("ข้อมูลที่พักถูกแก้ไขเรียบร้อยแล้ว");
      setAlertOpen(true);

    } catch (error: any) {
      console.error("Update homestay error:", error?.response?.data || error);
      // บันทึกไม่สำเร็จ
      setAlertType("error");
      setAlertTitle("เกิดข้อผิดพลาด");
      setAlertMessage("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setAlertOpen(true);
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
            // to: `/admin/community/${communityId}/homestay/${homestayId}/edit`,
            to: `/admin/community/homestay/${homestayId}/edit`,
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
              onClick={() => (communityId ? navigate(`/admin/community/homestays`) : navigate(-1))}
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
                placeholder="กรอกชื่อที่พัก"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              <TextField
                id="type"
                label="ประเภทที่พัก"
                required
                placeholder="กรอกประเภทของที่พัก"
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
                  placeholder="กรอกสิ่งอำนวยความสะดวก"
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
                placeholder="กรอกบ้านเลขที่ของที่พัก"
                value={form.houseNumber}
                onChange={(event) => setField("houseNumber", event.target.value)}
                error={!!formErrors.houseNumber}
                helperText={formErrors.houseNumber}
              />
              <TextField
                id="villageNumber"
                label="หมู่ที่"
                placeholder="กรอกหมู่ที่ของที่พัก"
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
                  onChange={(loc: ThailandLocation) => {
                    setForm((prev) => ({
                      ...prev,
                      province: loc.province ?? "",
                      district: loc.district ?? "",
                      subDistrict: loc.subdistrict ?? "",
                      postalCode: loc.postalCode ?? "",
                    }));
                    validateField("province", loc.province ?? "");
                    validateField("district", loc.district ?? "");
                    validateField("subDistrict", loc.subdistrict ?? "");
                    validateField("postalCode", loc.postalCode ?? "");
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
              <h3 className="font-bold text-base mb-2">
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

              <h3 className="font-bold text-base mt-6 mb-2">
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
                    ? navigate(`/admin/community/homestays`)
                    : // ? navigate(`/admin/community/${communityId}/homestay/all`)
                      navigate(-1)
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
        title="ยืนยันการแก้ไขที่พัก"
        text="คุณต้องการยืนยันการแก้ไขที่พักหรือไม่"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={onConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Modal Alert */}
      <ModalAlert
        open={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertOpen(false);
          if (alertType === "success") {
            if (communityId) navigate(`/admin/community/homestays`);
            else navigate(-1);
          }
        }}
      />
    </div>
  );
}
