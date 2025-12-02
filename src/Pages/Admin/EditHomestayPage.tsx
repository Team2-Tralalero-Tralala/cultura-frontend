// src/Pages/Admin/EditHomestayPage.tsx
/**
 * Component: EditHomestayPageAdmin
 * คำอธิบาย: หน้าแก้ไขข้อมูลที่พักของ Admin (เจ้าของชุมชน)
 * ข้อกำหนด:
 * - โหลดข้อมูลโดยใช้ endpoint ของ Admin (`/admin/homestays/:homestayId`)
 * - บันทึกข้อมูลโดยใช้ endpoint ของ Admin (`/admin/homestay/edit/:homestayId`)
 * - Backend จะตรวจสอบสิทธิ์ว่า Admin เป็นเจ้าของที่พักนี้หรือไม่
 */

import React from "react";
import * as z from "zod";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";

// Internal Components
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

// Config Variables
const apiUrl = import.meta.env.VITE_API_URL as string;

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

/** Schema ตรวจสอบค่าฟอร์ม (Zod) */
const schema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อที่พัก"),
  type: z.string().min(1, "กรุณากรอกประเภทของที่พัก"),
  facility: z.string().min(1, "กรุณากรอกสิ่งอำนวยความสะดวก"),
  guestPerRoom: z
    .string()
    .min(1)
    .refine(
      (v) => Number(v) >= 1 && Number.isInteger(Number(v)),
      "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"
    ),
  totalRoom: z
    .string()
    .min(1)
    .refine(
      (v) => Number(v) >= 1 && Number.isInteger(Number(v)),
      "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"
    ),
  houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  addressDetail: z.string().optional().default(""),
  placeQuery: z.string().optional().default(""),
});

/**
 * ฟังก์ชัน: urlToFile (เหมือนเดิม)
 */
async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`);
  const blob = await res.blob();
  const fileExtension = filename.split(".").pop() || "jpg";
  const type = blob.type || `image/${fileExtension}`;
  const file = new File([blob], filename, { type });
  (file as any).isFromServer = true;
  return file;
}

/**
 * ฟังก์ชัน: buildImageCandidates (เหมือนเดิม)
 */
function buildImageCandidates(rawPath: string): string[] {
  if (!rawPath) return [];
  if (/^https?:\/\//i.test(rawPath)) return [rawPath];
  const origin = (() => {
    try {
      return new URL(apiUrl).origin;
    } catch {
      return window.location.origin;
    }
  })();
  const cleanedPath = String(rawPath).replace(/\\/g, "/").replace(/^\.?\/*/, "");
  const prefixes = [
    "", "uploads/", "upload/", "images/", "image/", "homestay/",
    "homestays/", "homestay/uploads/", "homestays/uploads/",
  ];
  const candidates = new Set<string>();
  for (const prefix of prefixes) {
    const path = cleanedPath.startsWith(prefix) ? cleanedPath : `${prefix}${cleanedPath}`;
    candidates.add(`${origin}/${encodeURI(path)}`);
    candidates.add(`${origin}/api/${encodeURI(path)}`);
  }
  return Array.from(candidates);
}

/**
 * ฟังก์ชัน: bestEffortUrlToFile (เหมือนเดิม)
 */
async function bestEffortUrlToFile(
  rawPath: string,
  filename: string
): Promise<File> {
  const candidates = buildImageCandidates(rawPath);
  let lastErr: unknown = null;
  for (const urlCandidate of candidates) {
    try {
      return await urlToFile(urlCandidate, filename);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("no image url works");
}

type FormErrors = Partial<Record<keyof HomestayForm, string>>;

/**
 * Component: EditHomestayPageAdmin
 * หน้าที่: โหลดข้อมูลที่พัก (ของ Admin), แสดงฟอร์มแก้ไข, และบันทึกข้อมูล
 */
export default function EditHomestaysPage() {
  const { homestayId } = useParams();
  const navigate = useNavigate();

  // ฟอร์มและสถานะทั่วไป
  const [form, setForm] = React.useState<HomestayForm>(initialForm);
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  // (Admin ไม่จำเป็นต้องใช้ communityId ในการนำทาง)
  // const [communityId, setCommunityId] = React.useState<number | null>(null);

  // แผนที่
  const [position, setPosition] = React.useState<[number, number]>([0, 0]);
  const startingZoom = 12;

  // รูปภาพ
  const [coverFiles, setCoverFiles] = React.useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);

  // แท็ก
  const [tagIds, setTagIds] = React.useState<number[]>([]);

  /**
   * Effect: โหลดข้อมูลที่พัก (ปรับปรุง API Endpoint)
   */
  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const id = Number(homestayId);
        if (!id) throw new Error("homestayId ไม่ถูกต้อง");

        // *** เปลี่ยน Endpoint เป็นของ Admin ***
        const res = await axios.get(`${apiUrl}/admin/homestays/${id}`, {
          withCredentials: true,
        });
        const hs = res?.data?.data ?? res?.data;
        if (!hs) throw new Error("ไม่พบข้อมูลที่พัก");

        // (ไม่จำเป็นต้องเก็บ communityId แล้ว)
        // setCommunityId(hs.community?.id ?? null);

        const lat = Number(hs.location?.latitude ?? 13.7563);
        const lng = Number(hs.location?.longitude ?? 100.5018);
        setPosition([lat, lng]);

        setForm({
          name: hs.name ?? "",
          type: hs.type ?? "",
          facility: hs.facility ?? "",
          guestPerRoom: String(hs.guestPerRoom ?? ""),
          totalRoom: String(hs.totalRoom ?? ""),
          houseNumber: hs.location?.houseNumber ?? "",
          villageNumber: String(hs.location?.villageNumber ?? ""),
          province: hs.location?.province ?? "",
          district: hs.location?.district ?? "",
          subDistrict: hs.location?.subDistrict ?? "",
          postalCode: hs.location?.postalCode ?? "",
          addressDetail: hs.location?.detail ?? "",
          latitude: String(lat),
          longitude: String(lng),
          placeQuery: "",
        });

        // โหลดรูปภาพเดิม (เหมือนเดิม)
        const imgs: any[] = Array.isArray(hs?.homestayImage)
          ? hs.homestayImage
          : [];

        const coverFilesFetched: File[] = await Promise.all(
          imgs
            .filter((img) => img.type === "COVER")
            .map((img) =>
              bestEffortUrlToFile(
                String(img.image || ""),
                String(img.image || "cover.jpg")
              )
            )
        );

        const galleryFilesFetched: File[] = await Promise.all(
          imgs
            .filter((img) => img.type === "GALLERY")
            .map((img) =>
              bestEffortUrlToFile(
                String(img.image || ""),
                String(img.image || "gallery.jpg")
              )
            )
        );

        setCoverFiles(coverFilesFetched);
        setGalleryFiles(galleryFilesFetched);

        // ตั้งค่าแท็กเดิม (เหมือนเดิม)
        const currentTagIds: number[] = Array.isArray(hs?.tagHomestays)
          ? hs.tagHomestays
            .map((t: any) => t?.tag?.id ?? t?.id)
            .filter((x: any) => typeof x === "number")
          : [];
        setTagIds(currentTagIds);
      } catch (err: any) {
        console.error("Load homestay error:", err?.response?.data || err);
        setErrorMessage(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "โหลดข้อมูลไม่สำเร็จ (หรือคุณไม่มีสิทธิ์)"
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [homestayId]);

  /**
   * ฟังก์ชัน: validateField (เหมือนเดิม)
   */
  const validateField = (key: keyof HomestayForm, val: any) => {
    const dataToValidate = { ...form, [key]: val };
    const validationResult = schema.safeParse(dataToValidate);
    setFormErrors((prev) => ({
      ...prev,
      [key]: validationResult.success
        ? undefined
        : validationResult.error.issues.find((i) => i.path[0] === key)?.message,
    }));
  };

  /**
   * ฟังก์ชัน: validateAll (เหมือนเดิม)
   */
  const validateAll = () => {
    const validationResult = schema.safeParse(form);
    if (validationResult.success) {
      setFormErrors({});
      return true;
    }
    const errs: FormErrors = {};
    for (const issue of validationResult.error.issues) {
      errs[issue.path[0] as keyof HomestayForm] = issue.message;
    }
    setFormErrors(errs);
    return false;
  };

  /**
   * ฟังก์ชัน: setField (เหมือนเดิม)
   */
  const setField = <FieldKeyType extends keyof HomestayForm>(
    key: FieldKeyType,
    value: HomestayForm[FieldKeyType]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    validateField(key, value);
  };

  /**
   * ฟังก์ชัน: normalizeOrDefault (เหมือนเดิม)
   */
  const normalizeOrDefault = (value: string, fallback = "") => {
    const trimmedValue = (value ?? "").toString().trim();
    return trimmedValue.length ? trimmedValue : fallback;
  };

  /**
   * ฟังก์ชัน: handleMapChange (เหมือนเดิม)
   */
  const handleMapChange = React.useCallback((pos: [number, number]) => {
    setPosition((prev) => (prev[0] === pos[0] && prev[1] === pos[1] ? prev : pos));
  }, []);

  /**
   * ฟังก์ชัน: handleSubmit (เหมือนเดิม)
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
   * ฟังก์ชัน: onConfirmSave (ปรับปรุง API Endpoint และ Navigation)
   */
  const onConfirmSave = async () => {
    setConfirmOpen(false);

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
        // (Admin ไม่ควรส่ง communityId ตอนแก้ไข
        // Backend จะป้องกันการย้ายข้ามชุมชนเอง)
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      coverFiles.forEach((file: any) => formData.append("cover", file));
      galleryFiles.forEach((file: any) => formData.append("gallery", file));

      // *** เปลี่ยน Endpoint เป็นของ Admin ***
      await axios.put(`${apiUrl}/admin/community/homestay/edit/${id}`, formData, {
        withCredentials: true,
      });

      setSuccessMessage("อัปเดตที่พักสำเร็จ");

      // *** เปลี่ยนเส้นทางกลับไปหน้า List ของ Admin ***
      navigate(`/admin/homestays/all`);

    } catch (err: any) {
      console.error("Update homestay error:", err?.response?.data || err);
      setErrorMessage(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "อัปเดตที่พักไม่สำเร็จ"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  // ===== Render (ปรับปรุง Navigation) =====
  return (
    <div className="w-full max-w-none px-8">
      <div>
        <Breadcrumb
          current={{
            label: "แก้ไขรายละเอียดที่พัก",
            to: `/admin/community/homestay/${homestayId}/edit`,
          }}
        />
      </div>
      {/* Alerts (เหมือนเดิม) */}
      {errorMessage && (
        <div className="mb-3 rounded-md bg-red-50 text-red-700 px-4 py-2 border border-red-200">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-3 rounded-md bg-emerald-50 text-emerald-700 px-4 py-2 border border-emerald-200">
          {successMessage}
        </div>
      )}

      {/* Header (ปรับปรุง Navigation) */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          className="flex items-center gap-2 text-xl"
          // *** เปลี่ยนเส้นทางกลับไปหน้า List ของ Admin ***
          onClick={() => navigate("/admin/homestays/all")}
        >
          <Icon icon="mingcute:arrow-left-line" width={22} />
          <span>แก้ไขที่พัก</span>
        </button>
      </div>

      {/* Loading / Form (เหมือนเดิม) */}
      {isLoading ? (
        <div className="rounded-lg bg-white p-5 shadow-sm border">กำลังโหลดข้อมูล...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm border">
            <div className="space-y-6">
              {/* ฟิลด์ข้อมูลหลัก */}
              <div className="grid md:grid-cols-2 gap-5">
                <TextField
                  id="name"
                  label="ชื่อที่พัก"
                  required
                  placeholder="พิมพ์ชื่อที่พัก"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
                <TextField
                  id="type"
                  label="ประเภทที่พัก"
                  required
                  placeholder="พิมพ์ประเภทของที่พัก"
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value)}
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
                    onChange={(e) => setField("facility", e.target.value)}
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
                  onChange={(e) => setField("totalRoom", e.target.value)}
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
                  onChange={(e) => setField("guestPerRoom", e.target.value)}
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
                  onChange={(e) => setField("houseNumber", e.target.value)}
                  error={!!formErrors.houseNumber}
                  helperText={formErrors.houseNumber}
                />
                <TextField
                  id="villageNumber"
                  label="หมู่ที่"
                  placeholder="หมู่ที่"
                  value={form.villageNumber}
                  onChange={(e) => setField("villageNumber", e.target.value)}
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
                    onChange={(e) => setField("addressDetail", e.target.value)}
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
          </section>

          {/* Action Buttons (ปรับปรุง Navigation) */}
          <div className="flex justify-end gap-2 pt-2">
            <div className="w-36">
              <Button
                type="cancel"
                // *** เปลี่ยนเส้นทางกลับไปหน้า List ของ Admin ***
                onClick={() => navigate("/admin/homestays/all")}
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
        </form>
      )}

      {/* Modal ยืนยัน (เหมือนเดิม) */}
      <Modal
        open={confirmOpen}
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
