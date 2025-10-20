// src/Pages/SuperAdmin/CreateHomestaysPage.tsx

/**
 * คำอธิบาย : หน้า "เพิ่มที่พัก (หลายรายการ)" สำหรับ Super Admin
 * หน้าที่หลัก:
 *   - ให้ผู้ใช้เพิ่มฟอร์มที่พักหลายชุด, ตรวจข้อมูลด้วย zod, ยืนยันผ่าน Modal, แล้วส่ง API ตาม communityId
 *   - รองรับการเลือกแท็กต่อรายการ และอัปโหลดรูป (cover / gallery) ต่อรายการ
 * Input:
 *   - useParams(): communityId จากเส้นทาง /super/community/edit/:communityId
 *   - สถานะภายใน: items (ชุดฟอร์ม), ไฟล์รูป (cover/galleries), สถานะ Modal/บันทึก/ข้อความแจ้ง
 * Output:
 *   - ส่ง multipart/form-data ต่อรายการ: { data: JSON(HomestayDto + tagHomestays), cover[], gallery[] }
 *   - เมื่อสำเร็จ นำทางกลับไปหน้าแก้ไขชุมชน
 */
import React from "react";
import * as z from "zod";
import axios from "axios";
import { Icon } from "@iconify/react";
import Button from "@/Components/Button";
import TextField from "@/Components/TextField";
import TextArea from "@/Components/TextArea";
import MapPicker from "@/Components/MapPicker";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import ThailandLocationSelector, { type ThailandLocation } from "@/Components/Selector/ThailandLocationSelector";
import { TagSelector } from "@/Components/Selector/TagSelector";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "@/Components/Modal/Modal";

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
    .refine((v) => Number(v) >= 1 && Number.isInteger(Number(v)), "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"),
  totalRoom: z
    .string()
    .min(1)
    .refine((v) => Number(v) >= 1 && Number.isInteger(Number(v)), "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"),
  houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  villageNumber: z.string().min(1, "กรุณากรอกหมู่ที่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล/แขวง"),
  postalCode: z.any(),
  addressDetail: z.string().optional().default(""),
  placeQuery: z.string().optional().default(""),
});

type HSFormErrors = Partial<Record<keyof HomestayForm, string>>;

type HSItem = {
  id: string;
  open: boolean;
  form: HomestayForm;
  errors: HSFormErrors;
  coverFiles: FileLike[];
  galleryFiles: FileLike[];
  tagIds: number[];
};

function cryptoId() {
  return Math.random().toString(36).slice(2, 9);
}

function createNewItem(): HSItem {
  return {
    id: cryptoId(),
    open: true,
    form: { ...initialHomestay },
    errors: {},
    coverFiles: [],
    galleryFiles: [],
    tagIds: [],
  };
}

function normalizeOrDefault(value: string, fallback = "") {
  const trimmed = (value ?? "").toString().trim();
  return trimmed.length ? trimmed : fallback;
}

declare global {
  interface Window { __tagsInterceptorAdded?: boolean }
}
if (typeof window !== "undefined" && !window.__tagsInterceptorAdded) {
  window.__tagsInterceptorAdded = true;
  axios.interceptors.response.use(
    (res) => {
      try {
        const url = res?.config?.url ?? "";
        if (typeof url === "string" && url.includes("/shared/tags")) {
          const d = (res as any)?.data?.data;
          // รูปแบบที่พบบ่อย: { data: { data: [...] } } → flatten เป็น { data: [...] }
          if (!Array.isArray(d) && d && Array.isArray(d.data)) {
            (res as any).data.data = d.data;
          }
          // กันเหนียว: ถ้ายังไม่ใช่อาเรย์ ให้เป็น [] ไปเลย จะได้ไม่พังตอน spread
          if (!Array.isArray((res as any).data?.data)) {
            (res as any).data.data = Array.isArray(d) ? d : [];
          }
        }
      } catch { /* ignore */ }
      return res;
    },
    (err) => Promise.reject(err)
  );
}

export default function CreateHomestaysPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = React.useState<HSItem[]>([createNewItem()]);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingPayloads, setPendingPayloads] = React.useState<any[] | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const addItem = () => setItems((prev) => [...prev, createNewItem()]);
  const removeItem = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));
  const toggleOpen = (id: string) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, open: !x.open } : x)));

  function setField(id: string, key: keyof HomestayForm, value: any) {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        if (x.form[key] === value) return x;

        const form = { ...x.form, [key]: value };
        const parsed = homestaySchema.safeParse(form);
        const nextErrors: HSFormErrors = { ...x.errors };
        if (parsed.success) {
          delete nextErrors[key];
        } else {
          const found = parsed.error.issues.find((i) => i.path[0] === key);
          if (found) nextErrors[key] = found.message;
          else delete nextErrors[key];
        }
        return { ...x, form, errors: nextErrors };
      })
    );
  }

  const setCoverFiles = (id: string, files: FileLike[]) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, coverFiles: files } : x)));
  const setGalleryFiles = (id: string, files: FileLike[]) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, galleryFiles: files } : x)));

  const setTags = (id: string, tagIds: number[]) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, tagIds } : x)));

  function validateAll(): boolean {
    let ok = true;
    setItems((prev) =>
      prev.map((x) => {
        const result = homestaySchema.safeParse(x.form);
        if (!result.success) {
          ok = false;
          const errs: HSFormErrors = {};
          for (const issue of result.error.issues) {
            errs[issue.path[0] as keyof HomestayForm] = issue.message;
          }
          return { ...x, errors: errs, open: true };
        }
        return { ...x, errors: {} };
      })
    );
    return ok;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payloads = items.map((x) => {
      const latStr = (x.form.latitude ?? "").trim();
      const lngStr = (x.form.longitude ?? "").trim();
      const latNum = latStr === "" ? null : Number(latStr);
      const lngNum = lngStr === "" ? null : Number(lngStr);

      return {
        base: {
          name: normalizeOrDefault(x.form.name),
          type: normalizeOrDefault(x.form.type),
          guestPerRoom: Math.max(1, Number(x.form.guestPerRoom || 0)),
          totalRoom: Math.max(1, Number(x.form.totalRoom || 0)),
          facility: normalizeOrDefault(x.form.facility),
          location: {
            houseNumber: normalizeOrDefault(x.form.houseNumber),
            villageNumber: Number(x.form.villageNumber) || null,
            subDistrict: normalizeOrDefault(x.form.subDistrict),
            district: normalizeOrDefault(x.form.district),
            province: normalizeOrDefault(x.form.province),
            postalCode: normalizeOrDefault(String(x.form.postalCode ?? "")),
            detail: normalizeOrDefault(x.form.addressDetail),
            latitude: latNum,
            longitude: lngNum,
          },
          tagHomestays: Array.isArray(x.tagIds) ? x.tagIds : [],
        },
        coverFiles: x.coverFiles,
        galleryFiles: x.galleryFiles,
      };
    });

    setPendingPayloads(payloads);
    setConfirmOpen(true);
  }

  const makeOnMapChange = React.useCallback(
    (id: string) => (pos: [number, number]) => {
      const [lat, lng] = pos;
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
              ...it,
              form: {
                ...it.form,
                latitude: String(lat),
                longitude: String(lng),
              },
            }
            : it
        )
      );
    },
    []
  );

  const onConfirmSave = async () => {
    setConfirmOpen(false);
    if (!pendingPayloads || pendingPayloads.length === 0) return;

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const cid = Number(communityId);
      if (!cid) throw new Error("communityId ไม่ถูกต้อง");

      // ส่งทีละรายการ (serial) เพื่อง่ายต่อการ handle error
      for (const p of pendingPayloads) {
        // 1) payload ส่วนที่เป็น JSON (ห้ามใส่ไฟล์ในนี้)
        const dataPayload = {
          ...p.base,
          // ไม่ต้องใส่ homestayImage ใน JSON — จะส่งเป็นไฟล์แยก
          // homestayImage: undefined,
        };

        // 2) สร้าง FormData และแนบ data + ไฟล์
        const fd = new FormData();
        fd.append("data", JSON.stringify(dataPayload));

        // cover: เอา 1 ไฟล์แรกพอ (ตาม backend กำหนด maxCount:1)
        if (p.coverFiles?.length) {
          fd.append("cover", p.coverFiles[0]);
        }

        // gallery: แนบได้หลายไฟล์
        if (Array.isArray(p.galleryFiles)) {
          for (const gf of p.galleryFiles) {
            fd.append("gallery", gf);
          }
        }

        await axios.post(
          `${API_URL}/super/community/${cid}/homestay`,
          fd,
          {
            withCredentials: true,
            // อย่าตั้ง Content-Type เอง ให้ browser ใส่ boundary
            // headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      setSuccessMessage("บันทึกที่พักสำเร็จ");
      navigate(`/super/community/edit/${communityId}`);
    } catch (error: any) {
      console.error("Create homestays error:", error?.response?.data || error);
      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "บันทึกที่พักไม่สำเร็จ"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
      setPendingPayloads(null);
    }
  };


  return (
    <div className="w-full max-w-none px-0">
      {/* Alerts */}
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

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-2 text-xl cursor-pointer"
          onClick={() => navigate(`/super/community/edit/${communityId}`)}
        >
          <Icon icon="mingcute:arrow-left-line" width={22} />
          <span>เพิ่มที่พัก</span>
        </div>

        <div className="w-auto inline-flex">
          <Button type="confirm-admin" onClick={addItem}>
            <Icon icon="mdi:plus" width={18} />
            <span className="ml-2">เพิ่มที่พัก</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {items.map((x, idx) => {
          const startingPosition = React.useMemo<[number, number]>(() => {
            const nlat = Number(x.form.latitude);
            const nlng = Number(x.form.longitude);
            return [
              !Number.isNaN(nlat) && x.form.latitude !== "" ? nlat : 13.7563,
              !Number.isNaN(nlng) && x.form.longitude !== "" ? nlng : 100.5018,
            ];
          }, [x.form.latitude, x.form.longitude]);

          const onMapChange = React.useMemo(() => makeOnMapChange(x.id), [makeOnMapChange, x.id]);

          return (
            <section key={x.id} className="bg-white rounded-xl p-5 md:p-6 shadow-sm border">
              {/* แถบหัว + ปุ่มหุบ/ลบ */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => toggleOpen(x.id)}
                  className="inline-flex items-center gap-2 py-1"
                  aria-label={x.open ? "หุบ" : "ขยาย"}
                  title={x.open ? "หุบ" : "ขยาย"}
                >
                  <Icon icon={x.open ? "mdi:chevron-down" : "mdi:chevron-right"} width={22} />
                  <span className="text-lg font-semibold">{`ที่พักที่ ${idx + 1}`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => removeItem(x.id)}
                  className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-red-50"
                  aria-label="ลบชุดฟอร์มนี้"
                  title="ลบชุดฟอร์มนี้"
                >
                  <Icon icon="mdi:trash-can-outline" width={18} />
                </button>
              </div>

              {x.open && (
                <div className="space-y-6">
                  {/* ชื่อ/ประเภท/สิ่งอำนวยความสะดวก */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <TextField
                      id={`name_${x.id}`}
                      label="ชื่อที่พัก"
                      required
                      placeholder="พิมพ์ชื่อที่พัก"
                      value={x.form.name}
                      onChange={(e) => setField(x.id, "name", e.target.value)}
                      error={!!x.errors.name}
                      helperText={x.errors.name}
                    />
                    <TextField
                      id={`type_${x.id}`}
                      label="ประเภทที่พัก"
                      required
                      placeholder="พิมพ์ประเภทของที่พัก"
                      value={x.form.type}
                      onChange={(e) => setField(x.id, "type", e.target.value)}
                      error={!!x.errors.type}
                      helperText={x.errors.type}
                    />
                    <div className="md:col-span-2">
                      <TextArea
                        id={`facility_${x.id}`}
                        label="สิ่งอำนวยความสะดวก"
                        required
                        placeholder="ใส่รายละเอียดความสะดวกสบายของที่พัก"
                        value={x.form.facility}
                        onChange={(e) => setField(x.id, "facility", e.target.value)}
                        error={!!x.errors.facility}
                        helperText={x.errors.facility}
                      />
                    </div>
                  </div>

                  {/* จำนวนห้อง/จำนวนผู้เข้าพัก */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <TextField
                      id={`totalRoom_${x.id}`}
                      label="จำนวนห้องทั้งหมด"
                      required
                      type="number"
                      placeholder="กรอกจำนวนห้องทั้งหมด"
                      value={x.form.totalRoom}
                      onChange={(e) => setField(x.id, "totalRoom", e.target.value)}
                      error={!!x.errors.totalRoom}
                      helperText={x.errors.totalRoom}
                    />
                    <TextField
                      id={`guestPerRoom_${x.id}`}
                      label="จำนวนผู้เข้าพักต่อห้อง"
                      required
                      type="number"
                      placeholder="กรอกจำนวนผู้เข้าพักต่อห้อง"
                      value={x.form.guestPerRoom}
                      onChange={(e) => setField(x.id, "guestPerRoom", e.target.value)}
                      error={!!x.errors.guestPerRoom}
                      helperText={x.errors.guestPerRoom}
                    />
                  </div>

                  {/* ที่อยู่ */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <TextField
                      id={`houseNumber_${x.id}`}
                      label="บ้านเลขที่"
                      required
                      placeholder="บ้านเลขที่"
                      value={x.form.houseNumber}
                      onChange={(e) => setField(x.id, "houseNumber", e.target.value)}
                      error={!!x.errors.houseNumber}
                      helperText={x.errors.houseNumber}
                    />
                    <TextField
                      id={`villageNumber_${x.id}`}
                      label="หมู่ที่"
                      required
                      placeholder="หมู่ที่"
                      value={x.form.villageNumber}
                      onChange={(e) => setField(x.id, "villageNumber", e.target.value)}
                      error={!!x.errors.villageNumber}
                      helperText={x.errors.villageNumber}
                    />

                    <div className="md:col-span-2">
                      <ThailandLocationSelector
                        value={{
                          province: x.form.province,
                          district: x.form.district,
                          subdistrict: x.form.subDistrict,
                          postalCode: x.form.postalCode,
                        }}
                        onChange={(loc: ThailandLocation) => {
                          setItems((prev) =>
                            prev.map((it) =>
                              it.id === x.id
                                ? {
                                  ...it,
                                  form: {
                                    ...it.form,
                                    province: loc.province ?? "",
                                    district: loc.district ?? "",
                                    subDistrict: loc.subdistrict ?? "",
                                    postalCode: (loc.postalCode ?? "").toString(),
                                  },
                                }
                                : it
                            )
                          );
                          setField(x.id, "province", loc.province ?? "");
                          setField(x.id, "district", loc.district ?? "");
                          setField(x.id, "subDistrict", loc.subdistrict ?? "");
                          setField(x.id, "postalCode", (loc.postalCode ?? "").toString());
                        }}
                      />
                      <div className="grid grid-cols-2 gap-y-[6px] gap-x-[12px] mt-2">
                        <div>{!!x.errors.province && <div className="text-red-600 text-sm">{x.errors.province}</div>}</div>
                        <div>{!!x.errors.district && <div className="text-red-600 text-sm">{x.errors.district}</div>}</div>
                        <div>{!!x.errors.subDistrict && <div className="text-red-600 text-sm">{x.errors.subDistrict}</div>}</div>
                        <div>{!!x.errors.postalCode && <div className="text-red-600 text-sm">{x.errors.postalCode}</div>}</div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <TextArea
                        id={`addressDetail_${x.id}`}
                        label="คำอธิบายที่อยู่"
                        placeholder="คำอธิบายที่อยู่"
                        value={x.form.addressDetail}
                        onChange={(e) => setField(x.id, "addressDetail", e.target.value)}
                        error={!!x.errors.addressDetail}
                        helperText={x.errors.addressDetail}
                      />
                    </div>
                  </div>

                  {/* ค้นหาสถานที่ + แผนที่ */}
                  <div className="space-y-3">
                    <MapPicker startingPosition={startingPosition} startingZoom={12} onChange={onMapChange} />
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {!!x.errors.latitude && <div className="text-red-600 text-sm">{x.errors.latitude}</div>}
                      {!!x.errors.longitude && <div className="text-red-600 text-sm">{x.errors.longitude}</div>}
                    </div>
                  </div>

                  {/* เลือกแท็ก */}
                  <div className="md:col-span-2">
                    <TagSelector
                      value={x.tagIds}
                      onChange={(ids) => setTags(x.id, ids)}
                    />
                  </div>

                  {/* อัปโหลดรูป */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-base font-semibold">
                        อัปโหลดภาพหน้าปก <span className="text-red-600">*</span>
                      </label>
                      <UploadCard
                        max={1}
                        accept="image/*"
                        multiple={false}
                        value={x.coverFiles}
                        onChange={(files) => setCoverFiles(x.id, files)}
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
                        value={x.galleryFiles}
                        onChange={(files) => setGalleryFiles(x.id, files)}
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
              )}
            </section>
          );
        })}

        <div className="flex justify-end gap-2 pt-2">
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
      </form>

      {/* Modal ยืนยัน */}
      <Modal
        open={confirmOpen}
        title="ยืนยันการบันทึกที่พัก"
        text={`คุณต้องการบันทึกที่พักจำนวน ${pendingPayloads?.length ?? 0} รายการหรือไม่`}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={onConfirmSave}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingPayloads(null);
        }}
      />
    </div>
  );
}
