// src/Pages/SuperAdmin/CreateHomestaysPage.tsx
import React from "react";
import * as z from "zod";
import axios from "axios";
import { Icon } from "@iconify/react";
import Button from "@/Components/Button";
import TextField from "@/Components/TextField";
import TextArea from "@/Components/TextArea";
import MapPicker from "@/Components/MapPicker";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import { useNavigate, useParams } from "react-router-dom";

// ✅ ใช้ Modal ตัวใหม่ (SweetAlert2 wrapper)
import { Modal } from "@/Components/Modal/Modal";
const apiUrl = import.meta.env.VITE_API_URL as string;
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
  guestPerRoom: z.string().min(1).refine((v) => Number(v) >= 1 && Number.isInteger(Number(v)), "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"),
  totalRoom: z.string().min(1).refine((v) => Number(v) >= 1 && Number.isInteger(Number(v)), "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"),
  houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  villageNumber: z.string().min(1, "กรุณากรอกหมู่ที่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล/แขวง"),
  postalCode: z.number().min(1, "กรุณาเลือกรหัสไปรษณีย์"),
  addressDetail: z.string().optional().default(""),
  // latitude: z.string().min(1, "กรุณาปักหมุดบนแผนที่"),
  // longitude: z.string().min(1, "กรุณาปักหมุดบนแผนที่"),
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
};

function cryptoId() {
  return Math.random().toString(36).slice(2, 9);
}
function createNewItem(order: number): HSItem {
  return {
    id: cryptoId(),
    open: true,
    form: { ...initialHomestay },
    errors: {},
    coverFiles: [],
    galleryFiles: [],
  };
}
function normalizeOrDefault(value: string, fallback = "") {
  const trimmed = (value ?? "").toString().trim();
  return trimmed.length ? trimmed : fallback;
}

export default function CreateHomestaysPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = React.useState<HSItem[]>([createNewItem(1)]);

  // ✅ state สำหรับ Modal ยืนยัน
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingPayloads, setPendingPayloads] = React.useState<any[] | null>(null);
  const [isSaving, setIsSaving] = React.useState(false); // ✅ เพิ่ม
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null); 

  const addItem = () => setItems((prev) => [...prev, createNewItem(prev.length + 1)]);
  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((x) => x.id !== id));
  const toggleOpen = (id: string) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, open: !x.open } : x)));

  function setField(id: string, key: keyof HomestayForm, value: any) {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
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

  // กด "บันทึก" → validate → เตรียม payload → เปิด Modal
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSaving) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payloads = items.map((x) => ({
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
        postalCode: normalizeOrDefault(x.form.postalCode),
        detail: normalizeOrDefault(x.form.addressDetail),
        latitude: Number(x.form.latitude),
        longitude: Number(x.form.longitude),
      },
      // _coverFilesCount: x.coverFiles.length,
      // _galleryFilesCount: x.galleryFiles.length,
    }));

    setPendingPayloads(payloads);
    setConfirmOpen(true);
  }

  // ✅ callback เมื่อกดยืนยันใน Modal (ตอนนี้ยังไม่ยิง API)
  const onConfirmSave = async () => {
  setConfirmOpen(false);
  if (!pendingPayloads || pendingPayloads.length === 0) return;

  try {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cid = Number(communityId);
    if (!cid) throw new Error("communityId ไม่ถูกต้อง");

    // ยิงทีละรายการ → ผ่าน createHomestayDto ของ backend แน่นอน
    for (const payload of pendingPayloads) {
      await axios.post(
        `${apiUrl}/super/homestays/${cid}`,
        payload,
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
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
        {items.map((x, idx) => (
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
                                    postalCode: loc.postalCode ?? "",
                                  },
                                }
                              : it
                          )
                        );
                        setField(x.id, "province", loc.province ?? "");
                        setField(x.id, "district", loc.district ?? "");
                        setField(x.id, "subDistrict", loc.subdistrict ?? "");
                        setField(x.id, "postalCode", loc.postalCode ?? "");
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
                  <TextField
                    id={`placeQuery_${x.id}`}
                    label="ค้นหาสถานที่"
                    placeholder="พิมพ์ชื่อสถานที่หรือสถานที่ใกล้เคียงเพื่อปักหมุด"
                    value={x.form.placeQuery}
                    onChange={(e) => setField(x.id, "placeQuery", e.target.value)}
                  />
                  <MapPicker
                    startingPosition={[
                      Number(x.form.latitude) || 13.7563,
                      Number(x.form.longitude) || 100.5018,
                    ]}
                    startingZoom={12}
                    onChange={([lat, lng]) => {
                      setField(x.id, "latitude", String(lat));
                      setField(x.id, "longitude", String(lng));
                    }}
                  />
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {!!x.errors.latitude && <div className="text-red-600 text-sm">{x.errors.latitude}</div>}
                    {!!x.errors.longitude && <div className="text-red-600 text-sm">{x.errors.longitude}</div>}
                  </div>
                </div>

                {/* อัปโหลดรูป (ตอนนี้ยังไม่ส่งไป backend) */}
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
        ))}

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