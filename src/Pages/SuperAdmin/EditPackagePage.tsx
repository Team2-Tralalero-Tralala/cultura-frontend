// src/Pages/SuperAdmin/EditPackagePage.tsx
/**
 * - หน้าแก้ไขแพ็กเกจ (บทบาท Superadmin)
 * - ดึงรายละเอียดแพ็กเกจด้วย /super/package/:id แล้วเติมฟอร์ม
 * - ใช้ Zod validate แบบเดียวกับหน้า Create
 * - ส่งอัปเดตด้วย PUT /super/package/:id
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import * as z from "zod";
import TextField from "../../Components/TextField";
import MapPicker from "../../Components/MapPicker";
import { Icon } from "@iconify/react";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import TextArea from "@/Components/TextArea";
import Button from "@/Components/Button";

const apiUrl = import.meta.env.VITE_API_URL;

// ===== Helpers =====
function normalizeOrDefault(value: string, fallback = "-") {
  const trimmed = (value ?? "").toString().trim();
  return trimmed.length ? trimmed : fallback;
}
function toIntOrNull(v: any): number | null {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : null;
}
function toTimeInput(input?: string | Date | null) {
  if (!input) return "";
  if (typeof input === "string") {
    const m = input.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/
    );
    if (m && m[4] !== undefined && m[5] !== undefined) {
      const hh = m[4].padStart(2, "0");
      const mm = m[5].padStart(2, "0");
      return `${hh}:${mm}`;
    }
  }
  const d = new Date(input as any);
  if (isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function toDateOnly(input?: string | Date | null) {
  if (!input) return "";
  if (typeof input === "string") {
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  }
  const d = new Date(input as any);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type PackageForm = {
  name: string;
  description: string;

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

  overseerMemberId: string;
  tagId: string;
  facility: string;

  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  openDate: string;
  openTime: string;
  closeDate: string;
  closeTime: string;

  capacity: string;
  price: string;
  addHomestay: boolean;
};

const initialFormState: PackageForm = {
  name: "",
  description: "",

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

  overseerMemberId: "",
  tagId: "",
  facility: "",

  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  openDate: "",
  openTime: "",
  closeDate: "",
  closeTime: "",

  capacity: "",
  price: "",
  addHomestay: false,
};

// ================== ZOD SCHEMA ==================
const packageSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อแพ็กเกจ"),
  description: z.string().min(1, "กรุณากรอกรายละเอียดแพ็กเกจ"),

  houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  villageNumber: z.string().min(1, "กรุณากรอกหมู่ที่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกอำเภอ / เขต"),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล / แขวง"),
  postalCode: z.number().min(1, "กรุณาเลือกรหัสไปรษณีย์"),

  latitude: z.string().min(1, "หากไม่ทราบพิกัด โปรดค้นหาจุดบนแผนที่และปักหมุด"),
  longitude: z
    .string()
    .min(1, "หากไม่ทราบพิกัด โปรดค้นหาจุดบนแผนที่และปักหมุด"),

  overseerMemberId: z.string().min(1, "กรุณาเลือกผู้ดูแล"),
  capacity: z.string().min(1, "กรุณากรอกจำนวนที่เปิดรับ"),
  price: z.string().min(1, "กรุณากรอกราคา"),

  startDate: z.string().min(1, "กรุณาเลือกวันที่เริ่ม"),
  startTime: z.string().min(1, "กรุณาเลือกเวลาเริ่ม"),
  endDate: z.string().min(1, "กรุณาเลือกวันที่สิ้นสุด"),
  endTime: z.string().min(1, "กรุณาเลือกเวลาสิ้นสุด"),
  openDate: z.string().min(1, "กรุณาเลือกวันที่เปิดจอง"),
  openTime: z.string().min(1, "กรุณาเลือกเวลาเปิดจอง"),
  closeDate: z.string().min(1, "กรุณาเลือกวันที่ปิดจอง"),
  closeTime: z.string().min(1, "กรุณาเลือกเวลาปิดจอง"),

  facility: z.string().min(1, "กรุณากรอกสิ่งอำนวยความสะดวก"),
});

type PackageErrors = Partial<Record<keyof PackageForm, string>>;

export const EditPackagePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formState, setFormState] = useState<PackageForm>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // errors (เพิ่มเพื่อ validate)
  const [formErrors, setFormErrors] = useState<PackageErrors>({});

  // validate ช่องเดียว
  const validateField = (field: keyof PackageForm, value: any) => {
    const base = { ...formState, [field]: value };
    const result = packageSchema.safeParse(base);
    setFormErrors((prev) => ({
      ...prev,
      [field]: result.success
        ? undefined
        : result.error.issues.find((i) => i.path[0] === field)?.message,
    }));
  };

  // validate ทั้งฟอร์ม + เงื่อนไขช่วงวันที่ และเงื่อนไขที่พัก
  const validateAll = () => {
    let ok = true;
    const result = packageSchema.safeParse(formState);
    if (!result.success) {
      const errs: PackageErrors = {};
      for (const issue of result.error.issues) {
        errs[issue.path[0] as keyof PackageForm] = issue.message;
      }
      setFormErrors(errs);
      ok = false;
    } else {
      setFormErrors({});
    }
    if (
      formState.openDate &&
      formState.closeDate &&
      formState.openDate > formState.closeDate
    ) {
      setFormErrors((prev) => ({
        ...prev,
        closeDate: "วันที่ปิดจองต้องไม่น้อยกว่าวันที่เปิดจอง",
      }));
      ok = false;
    }
    if (
      formState.closeDate &&
      formState.endDate &&
      formState.closeDate > formState.endDate
    ) {
      setFormErrors((prev) => ({
        ...prev,
        closeDate: "วันที่ปิดจองต้องไม่ช้ากว่าวันสิ้นสุดกิจกรรม",
      }));
      ok = false;
    }
    if (selectedHomestay) {
      if (!hsCheckInDate) {
        (setFormErrors as any)((prev: any) => ({
          ...prev,
          hsCheckInDate: "กรุณาเลือกวันที่เช็กอิน",
        }));
        ok = false;
      }
      if (!hsCheckInTime) {
        (setFormErrors as any)((prev: any) => ({
          ...prev,
          hsCheckInTime: "กรุณาเลือกเวลาเช็กอิน",
        }));
        ok = false;
      }
      if (!hsCheckOutDate) {
        (setFormErrors as any)((prev: any) => ({
          ...prev,
          hsCheckOutDate: "กรุณาเลือกวันที่เช็กเอาท์",
        }));
        ok = false;
      }
      if (!hsCheckOutTime) {
        (setFormErrors as any)((prev: any) => ({
          ...prev,
          hsCheckOutTime: "กรุณาเลือกเวลาเช็กเอาท์",
        }));
        ok = false;
      }
    }
    return ok;
  };

  // + types ภายในไฟล์
  type TagOption = { id: number; name: string };

  // + states
  const [tagQuery, setTagQuery] = useState("");
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);

  // + ค้นหาแท็กแบบ debounce + dropdown control
  const searchBoxRef = React.useRef<HTMLDivElement | null>(null);
  const [openTagBox, setOpenTagBox] = useState(false);

  // ===== Member picker =====
  type MemberOption = { id: number; fname: string; lname: string };
  const [memberQuery, setMemberQuery] = useState("");
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const showMemberBox =
    memberQuery.trim().length >= 1 && memberOptions.length > 0;

  React.useEffect(() => {
    const q = memberQuery.trim();
    if (!q) {
      setMemberOptions([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`${apiUrl}/member/community/members`, {
          params: { q, limit: 10 },
          withCredentials: true,
        });

        const raw = res?.data?.data ?? [];
        setMemberOptions(
          (Array.isArray(raw) ? raw : []).map((m: any) => ({
            id: Number(m.id),
            fname: m.fname ?? "",
            lname: m.lname ?? "",
          }))
        );
      } catch (e) {
        console.error("search members error:", e);
        setMemberOptions([]);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [memberQuery, apiUrl]);

  // ปิด dropdown เมื่อคลิกนอกกรอบ
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(e.target as Node))
        setOpenTagBox(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const MIN_TAG_QUERY_CHARS = 2;
  const norm = (s: string) => (s ?? "").toLowerCase().normalize("NFC").trim();

  React.useEffect(() => {
    const q = tagQuery.trim();
    if (q.length < MIN_TAG_QUERY_CHARS) {
      setTagOptions([]);
      setOpenTagBox(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`${apiUrl}/tags`, {
          params: { q, limit: 8 },
          withCredentials: true,
        });
        const raw = res?.data?.data ?? res?.data?.items ?? res?.data ?? [];
        const opts = (Array.isArray(raw) ? raw : []).map((t: any) => ({
          id: Number(t.id),
          name: t.name ?? t.title ?? "",
        }));
        const byText = opts.filter((o) => norm(o.name).includes(norm(q)));
        const filtered = byText.filter(
          (o) => !selectedTags.some((s) => s.id === o.id)
        );
        setTagOptions(filtered);
        setOpenTagBox(filtered.length > 0);
      } catch (e) {
        console.error("search tags error:", e);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [tagQuery, selectedTags]);

  const addTag = (opt: TagOption) => {
    if (selectedTags.some((t) => t.id === opt.id)) return;
    setSelectedTags((prev) => [...prev, opt]);
    setTagQuery("");
    setTagOptions([]);
    setOpenTagBox(false);
  };
  const removeTag = (id: number) =>
    setSelectedTags((prev) => prev.filter((t) => t.id !== id));

  // ===== Homestay picker =====
  type HomestayOption = {
    id: number;
    name: string;
    facility?: string;
    images?: { image: string }[];
  };

  const [homestayQuery, setHomestayQuery] = useState("");
  const [homestayOptions, setHomestayOptions] = useState<HomestayOption[]>([]);
  const [selectedHomestay, setSelectedHomestay] =
    useState<HomestayOption | null>(null);

  const homestayBoxRef = React.useRef<HTMLDivElement | null>(null);
  const [openHomestayBox, setOpenHomestayBox] = useState(false);
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        homestayBoxRef.current &&
        !homestayBoxRef.current.contains(e.target as Node)
      ) {
        setOpenHomestayBox(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const MIN_HOMESTAY_QUERY_CHARS = 2;
  React.useEffect(() => {
    const q = homestayQuery.trim();
    if (q.length < MIN_HOMESTAY_QUERY_CHARS) {
      setHomestayOptions([]);
      setOpenHomestayBox(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`${apiUrl}/member/community/homestays`, {
          params: { q, limit: 8 },
          withCredentials: true,
        });

        const raw = res?.data?.data ?? res?.data?.items ?? res?.data ?? [];
        const opts: HomestayOption[] = (Array.isArray(raw) ? raw : []).map(
          (h: any) => ({
            id: Number(h.id),
            name: h.name ?? "",
            facility: h.facility ?? h.description ?? "",
            images: h.homestayImage ?? h.images ?? [],
          })
        );
        setHomestayOptions(opts);
        setOpenHomestayBox(opts.length > 0);
      } catch (e) {
        console.error("search homestays error:", e);
        setHomestayOptions([]);
        setOpenHomestayBox(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [homestayQuery]);

  const chooseHomestay = (h: HomestayOption) => {
    setSelectedHomestay(h);
    setHomestayQuery("");
    setHomestayOptions([]);
    setOpenHomestayBox(false);
    setFormField("tagId" as any, formState.tagId);
  };

  // ฟังก์ชัน set field + validate ช่องนั้น
  const setFormField = <K extends keyof PackageForm>(
    key: K,
    value: PackageForm[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    validateField(key, value);
  };

  const canSubmitForm = useMemo(() => {
    const required = [
      formState.name,
      formState.description,
      formState.houseNumber,
      formState.villageNumber,
      formState.province,
      formState.district,
      formState.subDistrict,
      formState.postalCode,
      formState.latitude,
      formState.longitude,
      formState.overseerMemberId,
      formState.capacity,
      formState.price,
      formState.startDate,
      formState.endDate,
      formState.openDate,
      formState.closeDate,
    ];
    return required.every((v) => String(v ?? "").trim() !== "");
  }, [formState]);

  // ====== Homestay check-in/out (optional) ======
  const [hsCheckInDate, setHsCheckInDate] = useState("");
  const [hsCheckInTime, setHsCheckInTime] = useState("");
  const [hsCheckOutDate, setHsCheckOutDate] = useState("");
  const [hsCheckOutTime, setHsCheckOutTime] = useState("");

  const clearHomestay = () => {
    setSelectedHomestay(null);
    setHsCheckInDate("");
    setHsCheckInTime("");
    setHsCheckOutDate("");
    setHsCheckOutTime("");
  };

  // ========= Load package detail =========
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/super/package/${id}`, {
          withCredentials: true,
        });
        const p = res?.data?.data;

        if (!mounted || !p) return;

        // map basic
        const location = p.location ?? {};
        const tags = (p.tagPackages ?? [])
          .map((tp: any) => tp.tag)
          .filter(Boolean);

        // homestay (ใช้รายการแรกหากมี)
        const hs =
          Array.isArray(p.homestayHistories) && p.homestayHistories.length > 0
            ? p.homestayHistories[0]
            : null;

        setFormState({
          name: p.name ?? "",
          description: p.description ?? "",
          houseNumber: location.houseNumber ?? "",
          villageNumber:
            location.villageNumber != null
              ? String(location.villageNumber)
              : "",
          province: location.province ?? "",
          district: location.district ?? "",
          subDistrict: location.subDistrict ?? "",
          postalCode: location.postalCode ?? "",
          addressDetail: location.detail ?? "",
          latitude: location.latitude != null ? String(location.latitude) : "",
          longitude:
            location.longitude != null ? String(location.longitude) : "",
          placeQuery: "",

          overseerMemberId:
            p.overseerMemberId != null ? String(p.overseerMemberId) : "",
          tagId: "",
          facility: p.warning ?? "",

          startDate: toDateOnly(p.startDate),
          startTime: toTimeInput(p.startDate),
          endDate: toDateOnly(p.dueDate),
          endTime: toTimeInput(p.dueDate),
          openDate: toDateOnly(p.openBookingAt),
          openTime: toTimeInput(p.openBookingAt),
          closeDate: toDateOnly(p.closeBookingAt),
          closeTime: toTimeInput(p.closeBookingAt),

          capacity: p.capacity != null ? String(p.capacity) : "",
          price: p.price != null ? String(p.price) : "",
          addHomestay: !!hs,
        });

        // ตั้งชื่อผู้ดูแลเริ่มต้นในช่องค้นหา (อ่านได้อย่างเดียว)
        if (p.overseerPackage) {
          setMemberQuery(
            `${p.overseerPackage.fname ?? ""} ${
              p.overseerPackage.lname ?? ""
            }`.trim()
          );
        }

        // ตั้งแท็กเริ่มต้น
        setSelectedTags(
          (tags as any[]).map((t) => ({ id: Number(t.id), name: t.name ?? "" }))
        );

        // ตั้งค่า homestay และเวลา (ถ้ามี)
        if (hs?.homestay) {
          setSelectedHomestay({
            id: Number(hs.homestay.id),
            name: hs.homestay.name ?? "",
            facility: hs.homestay.facility ?? "",
            images: hs.homestay.homestayImage ?? [],
          });
        }
        if (hs?.checkInTime) {
          setHsCheckInDate(toDateOnly(hs.checkInTime));
          setHsCheckInTime(toTimeInput(hs.checkInTime));
        }
        if (hs?.checkOutTime) {
          setHsCheckOutDate(toDateOnly(hs.checkOutTime));
          setHsCheckOutTime(toTimeInput(hs.checkOutTime));
        }
      } catch (e: any) {
        console.error("Load package detail error:", e?.response?.data || e);
        setErrorMessage(
          e?.response?.data?.message ||
            e?.message ||
            "ไม่สามารถโหลดข้อมูลแพ็กเกจ"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id) return;

    const formEl = e.currentTarget;
    if (!formEl.reportValidity()) return;

    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!window.confirm("ยืนยันการบันทึกการแก้ไขแพ็กเกจใช่หรือไม่?")) return;

    if (
      formState.openDate &&
      formState.closeDate &&
      formState.openDate > formState.closeDate
    ) {
      setErrorMessage(
        "ช่วงเปิดจองไม่ถูกต้อง: วันที่เปิดจองต้องไม่เกินวันที่ปิดจอง"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (
      formState.closeDate &&
      formState.endDate &&
      formState.closeDate > formState.endDate
    ) {
      setErrorMessage("วันที่ปิดจองต้องไม่ช้ากว่าวันสิ้นสุดกิจกรรม");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        overseerMemberId: Number(formState.overseerMemberId),
        name: normalizeOrDefault(formState.name),
        description: normalizeOrDefault(formState.description),
        capacity: Math.max(1, Number(formState.capacity || 0)),
        price: Math.max(0, Number(formState.price || 0)),
        warning: normalizeOrDefault(formState.facility),
        // สถานะคงเดิมตามระบบของคุณ หรือให้แก้ในหน้าอื่น
        startDate: normalizeOrDefault(formState.startDate),
        dueDate: normalizeOrDefault(formState.endDate),
        ...(formState.startTime.trim() && {
          startTime: formState.startTime.trim(),
        }),
        ...(formState.endTime.trim() && { endTime: formState.endTime.trim() }),
        openBookingAt: normalizeOrDefault(formState.openDate),
        closeBookingAt: normalizeOrDefault(formState.closeDate),
        ...(formState.openTime.trim() && {
          openTime: formState.openTime.trim(),
        }),
        ...(formState.closeTime.trim() && {
          closeTime: formState.closeTime.trim(),
        }),

        ...(selectedHomestay &&
          hsCheckInDate && { homestayCheckInDate: hsCheckInDate }),
        ...(selectedHomestay &&
          hsCheckInTime && { homestayCheckInTime: hsCheckInTime }),
        ...(selectedHomestay &&
          hsCheckOutDate && { homestayCheckOutDate: hsCheckOutDate }),
        ...(selectedHomestay &&
          hsCheckOutTime && { homestayCheckOutTime: hsCheckOutTime }),

        facility: normalizeOrDefault(formState.facility),
        tagIds: selectedTags.map((t) => t.id),
        ...(selectedHomestay ? { homestayId: selectedHomestay.id } : {}),

        location: {
          houseNumber: normalizeOrDefault(formState.houseNumber),
          villageNumber: toIntOrNull(formState.villageNumber),
          subDistrict: normalizeOrDefault(formState.subDistrict),
          district: normalizeOrDefault(formState.district),
          province: normalizeOrDefault(formState.province),
          postalCode: normalizeOrDefault(formState.postalCode),
          detail: normalizeOrDefault(formState.addressDetail),
          latitude: Number(formState.latitude),
          longitude: Number(formState.longitude),
        },
      };

      await axios.put(`${apiUrl}/super/package/${id}`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      alert("บันทึกแพ็กเกจสำเร็จ!");
      navigate("/super/packages/all");
    } catch (error: any) {
      console.error("Edit package (superadmin) error:", error?.response?.data);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "บันทึกแพ็กเกจไม่สำเร็จ"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  }

  const startPos = React.useMemo(
    () =>
      [
        Number(formState.latitude) || 13.7563,
        Number(formState.longitude) || 100.5018,
      ] as [number, number],
    [formState.latitude, formState.longitude]
  );

  return (
    <div className="w-full max-w-none px-0 lg:px-0">
      {errorMessage && (
        <div className="text-red-600 text-sm">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="text-emerald-700 text-sm">{successMessage}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full bg-white rounded-lg p-5 md:p-6 lg:p-7 shadow-sm space-y-8"
      >
        <button
          type="button"
          onClick={() => navigate("/super/packages/all")}
          className="inline-flex items-center gap-2 text-xl mb-1 group"
          aria-label="ย้อนกลับไปหน้ารายการแพ็กเกจ"
        >
          <Icon icon="mingcute:arrow-left-line" width={22} />
          <span>{loading ? "กำลังโหลด..." : "แก้ไขแพ็กเกจ"}</span>
        </button>

        {/* ชื่อ/คำอธิบาย */}
        <section className="space-y-4">
          <TextField
            id="name"
            label="ชื่อแพ็กเกจ"
            required
            placeholder="ชื่อแพ็กเกจ"
            value={formState.name}
            onChange={(e) => setFormField("name", e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
          <div>
            <TextArea
              id="description"
              label="คำอธิบายแพ็กเกจ"
              required
              placeholder="คำอธิบายแพ็กเกจ"
              value={formState.description}
              onChange={(e) => setFormField("description", e.target.value)}
              error={!!formErrors?.description}
              helperText={formErrors?.description}
            />
            {!!formErrors.description && (
              <div className="text-red-600 text-sm mt-1">
                {formErrors.description}
              </div>
            )}
          </div>
        </section>

        {/* ที่อยู่ */}
        <section className="space-y-4">
          <div className="grid md:grid-cols-2 gap-5">
            <TextField
              id="houseNumber"
              label="บ้านเลขที่"
              required
              placeholder="กรอกบ้านเลขที่ของชุมชน"
              value={formState.houseNumber}
              onChange={(e) => setFormField("houseNumber", e.target.value)}
              error={!!formErrors.houseNumber}
              helperText={formErrors.houseNumber}
            />
            <TextField
              id="villageNumber"
              label="หมู่ที่"
              required
              placeholder="กรอกหมู่ของชุมชน"
              value={formState.villageNumber}
              onChange={(e) => setFormField("villageNumber", e.target.value)}
              error={!!formErrors.villageNumber}
              helperText={formErrors.villageNumber}
            />

            {/* ที่อยู่แบบ selector */}
            <div className="md:col-span-2">
              <ThailandLocationSelector
                value={{
                  province: formState.province,
                  district: formState.district,
                  subdistrict: formState.subDistrict,
                  postalCode: formState.postalCode,
                }}
                onChange={(loc: ThailandLocation) => {
                  setFormState((prev) => ({
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
              {/* แสดง error ใต้ selector */}
              <div className="grid grid-cols-2 gap-y-[6px] gap-x-[12px] mt-2">
                <div>
                  {!!formErrors.province && (
                    <div className="text-red-600 text-sm">
                      {formErrors.province}
                    </div>
                  )}
                </div>
                <div>
                  {!!formErrors.district && (
                    <div className="text-red-600 text-sm">
                      {formErrors.district}
                    </div>
                  )}
                </div>
                <div>
                  {!!formErrors.subDistrict && (
                    <div className="text-red-600 text-sm">
                      {formErrors.subDistrict}
                    </div>
                  )}
                </div>
                <div>
                  {!!formErrors.postalCode && (
                    <div className="text-red-600 text-sm">
                      {formErrors.postalCode}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* คำอธิบายที่อยู่ */}
            <div className="md:col-span-2">
              <TextArea
                id="addressDetail"
                label="คำอธิบายที่อยู่"
                required
                placeholder="คำอธิบายที่อยู่"
                value={formState.addressDetail}
                onChange={(e) => setFormField("addressDetail", e.target.value)}
                error={!!formErrors?.addressDetail}
                helperText={formErrors?.addressDetail}
              />
            </div>

            {/* Map Picker */}
            <div className="md:col-span-2">
              <MapPicker
                startingPosition={startPos}
                startingZoom={13}
                onChange={([lat, lng]) => {
                  setFormField("latitude", String(lat));
                  setFormField("longitude", String(lng));
                }}
              />
              <div className="grid grid-cols-2 gap-3 mt-2">
                {!!formErrors.latitude && (
                  <div className="text-red-600 text-sm">
                    {formErrors.latitude}
                  </div>
                )}
                {!!formErrors.longitude && (
                  <div className="text-red-600 text-sm">
                    {formErrors.longitude}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ผู้ดูแล + ความจุ */}
        <section className="grid md:grid-cols-2 gap-5">
          {/* เลือกผู้ดูแล */}
          <div className="space-y-2">
            <label className="block text-base font-semibold">
              เลือกผู้ดูแล <span className="text-red-600">*</span>
            </label>

            <div className="relative">
              <div className="flex items-center gap-3 rounded-md border border-gray-400 bg-white px-4 py-2">
                <Icon icon="mingcute:search-line" width="22" />
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อ/นามสกุล เพื่อค้นหา"
                  className="w-full outline-none border-none bg-transparent"
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && memberOptions[0]) {
                      e.preventDefault();
                      const m = memberOptions[0];
                      setFormField("overseerMemberId", String(m.id));
                      setMemberQuery(`${m.fname} ${m.lname}`);
                    }
                  }}
                />
              </div>

              {/* Dropdown */}
              {showMemberBox && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-56 overflow-auto">
                  {memberOptions.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-green-50"
                      onClick={() => {
                        setFormField("overseerMemberId", String(m.id));
                        setMemberQuery(`${m.fname} ${m.lname}`);
                      }}
                    >
                      {m.fname} {m.lname}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!!formErrors.overseerMemberId && (
              <div className="text-red-600 text-sm">
                {formErrors.overseerMemberId}
              </div>
            )}
          </div>

          {/* ความจุ */}
          <TextField
            id="capacity"
            label="เปิดรับจำนวน"
            required
            type="number"
            placeholder="จำนวนคนที่เปิดรับ"
            value={formState.capacity}
            onChange={(e) => setFormField("capacity", e.target.value)}
            error={!!formErrors.capacity}
            helperText={formErrors.capacity}
          />
        </section>

        {/* สิ่งอำนวยความสะดวก */}
        <section>
          <div className="md:col-span-2">
            <TextArea
              id="facility"
              label="สิ่งอำนวยความสะดวก"
              required
              placeholder="สิ่งอำนวยความสะดวก"
              value={formState.facility}
              onChange={(e) => setFormField("facility", e.target.value)}
              error={!!formErrors?.facility}
              helperText={formErrors?.facility}
            />
            {!!formErrors.facility && (
              <div className="text-red-600 text-sm mt-1">
                {formErrors.facility}
              </div>
            )}
          </div>
        </section>

        {/* วันเวลา */}
        <section className="grid md:grid-cols-4 gap-5">
          <TextField
            id="startDate"
            label="วัน/เดือน/ปี (ค.ศ.) ที่เริ่ม"
            required
            type="date"
            value={formState.startDate}
            onChange={(e) => setFormField("startDate", e.target.value)}
            error={!!formErrors.startDate}
            helperText={formErrors.startDate}
          />
          <TextField
            id="startTime"
            label="เวลาที่เริ่ม"
            required
            type="time"
            value={formState.startTime}
            onChange={(e) => setFormField("startTime", e.target.value)}
            error={!!formErrors.startTime}
            helperText={formErrors.startTime}
          />
          <TextField
            id="endDate"
            label="วัน/เดือน/ปี (ค.ศ.) ที่สิ้นสุด"
            required
            type="date"
            value={formState.endDate}
            onChange={(e) => setFormField("endDate", e.target.value)}
            error={!!formErrors.endDate}
            helperText={formErrors.endDate}
          />
          <TextField
            id="endTime"
            label="เวลาที่สิ้นสุด"
            required
            type="time"
            value={formState.endTime}
            onChange={(e) => setFormField("endTime", e.target.value)}
            error={!!formErrors.endTime}
            helperText={formErrors.endTime}
          />
          <TextField
            id="openDate"
            label="วัน/เดือน/ปี (ค.ศ.) ที่เปิดจอง"
            required
            type="date"
            value={formState.openDate}
            onChange={(e) => setFormField("openDate", e.target.value)}
            error={!!formErrors.openDate}
            helperText={formErrors.openDate}
          />
          <TextField
            id="openTime"
            label="เวลาที่เปิดจอง"
            required
            type="time"
            value={formState.openTime}
            onChange={(e) => setFormField("openTime", e.target.value)}
            error={!!formErrors.openTime}
            helperText={formErrors.openTime}
          />
          <TextField
            id="closeDate"
            label="วัน/เดือน/ปี (ค.ศ.) ที่ปิดจอง"
            required
            type="date"
            value={formState.closeDate}
            onChange={(e) => setFormField("closeDate", e.target.value)}
            error={!!formErrors.closeDate}
            helperText={formErrors.closeDate}
          />
          <TextField
            id="closeTime"
            label="เวลาที่ปิดจอง"
            required
            type="time"
            value={formState.closeTime}
            onChange={(e) => setFormField("closeTime", e.target.value)}
            error={!!formErrors.closeTime}
            helperText={formErrors.closeTime}
          />
        </section>

        {/* แท็ก / ราคา */}
        <section className="grid md:grid-cols-2 gap-5">
          {/* ช่องค้นหาแท็ก */}
          <div className="space-y-2">
            <label htmlFor="tags" className="block text-base font-semibold">
              แท็ก <span className="text-red-600">*</span>
            </label>

            <div ref={searchBoxRef} className="relative">
              <div className="flex items-center gap-3 rounded-md border border-gray-400 bg-white px-4 py-2">
                <Icon icon="mingcute:search-line" width="22" />
                <input
                  id="tags"
                  type="text"
                  placeholder="ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา"
                  className="w-full outline-none border-none bg-transparent"
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  onFocus={() =>
                    setOpenTagBox(
                      tagQuery.trim().length >= MIN_TAG_QUERY_CHARS &&
                        tagOptions.length > 0
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagOptions[0]) {
                      e.preventDefault();
                      addTag(tagOptions[0]);
                    }
                    if (e.key === "Escape") setOpenTagBox(false);
                  }}
                />
              </div>

              {openTagBox && tagOptions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-56 overflow-auto">
                  {tagOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-green-50"
                      onClick={() => addTag(opt)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* แสดงแท็กที่เลือกแล้ว (โหลดมาจาก server + เพิ่มใหม่) */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedTags.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-2 rounded-md px-3 py-1 border bg-gray-50"
                  >
                    {t.name}
                    <button
                      type="button"
                      className="leading-none text-gray-600 hover:text-black"
                      onClick={() => removeTag(t.id)}
                      aria-label={`ลบแท็ก ${t.name}`}
                      title="ลบ"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ราคา */}
          <TextField
            id="price"
            label="ราคา"
            required
            type="number"
            placeholder="กรอกราคา"
            value={formState.price}
            onChange={(e) => setFormField("price", e.target.value)}
            error={!!formErrors.price}
            helperText={formErrors.price}
          />
        </section>

        {/* สื่อแพ็กเกจ (ยังไม่ bind ไฟล์เดิม — ใช้สำหรับอัปโหลดเพิ่ม/แทน) */}
        <section className="space-y-6">
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

          <div className="space-y-2">
            <label className="block text-base font-semibold">
              อัปโหลดวิดีโอเพิ่มเติม <span className="text-red-600">*</span>
            </label>
            <UploadCard
              max={5}
              accept="video/*"
              multiple
              value={videoFiles}
              onChange={setVideoFiles}
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
        </section>

        {/* ที่พัก (ไม่บังคับ) */}
        <section className="space-y-3">
          <label className="block text-base font-semibold">
            ที่พัก <span className="text-gray-500 text-sm">(ไม่บังคับ)</span>
          </label>

          {/* กล่องค้นหาที่พัก */}
          <div ref={homestayBoxRef} className="relative">
            <div className="flex items-center gap-3 rounded-md border border-gray-400 bg-white px-4 py-2">
              <Icon icon="mingcute:search-line" width="22" />
              <input
                type="text"
                placeholder="ค้นหาชื่อที่พัก"
                className="w-full outline-none border-none bg-transparent"
                value={homestayQuery}
                onChange={(e) => setHomestayQuery(e.target.value)}
                onFocus={() =>
                  setOpenHomestayBox(
                    homestayQuery.trim().length >= MIN_HOMESTAY_QUERY_CHARS &&
                      homestayOptions.length > 0
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && homestayOptions[0]) {
                    e.preventDefault();
                    chooseHomestay(homestayOptions[0]);
                  }
                  if (e.key === "Escape") setOpenHomestayBox(false);
                }}
              />
            </div>

            {openHomestayBox && homestayOptions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-56 overflow-auto">
                {homestayOptions.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-green-50"
                    onClick={() => chooseHomestay(h)}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* การ์ดแสดงที่พักที่เลือก */}
          {selectedHomestay && (
            <>
              {/* แถววันที่/เวลา (ถ้ามีที่พัก) */}
              <div className="grid md:grid-cols-4 gap-4 mb-3">
                <TextField
                  id="hsCheckInDate"
                  label="วัน/เดือน/ปี (ค.ศ.) ที่เช็กอินพัก (หากมีที่พัก)"
                  type="date"
                  value={hsCheckInDate}
                  onChange={(e) => setHsCheckInDate(e.target.value)}
                  error={!!(formErrors as any).hsCheckInDate}
                  helperText={(formErrors as any).hsCheckInDate}
                />
                <TextField
                  id="hsCheckInTime"
                  label="เวลาเช็กอิน"
                  type="time"
                  value={hsCheckInTime}
                  onChange={(e) => setHsCheckInTime(e.target.value)}
                  error={!!(formErrors as any).hsCheckInTime}
                  helperText={(formErrors as any).hsCheckInTime}
                />
                <TextField
                  id="hsCheckOutDate"
                  label="วัน/เดือน/ปี (ค.ศ.) ที่เช็กเอาท์ (หากมีที่พัก)"
                  type="date"
                  value={hsCheckOutDate}
                  onChange={(e) => setHsCheckOutDate(e.target.value)}
                  error={!!(formErrors as any).hsCheckOutDate}
                  helperText={(formErrors as any).hsCheckOutDate}
                />
                <TextField
                  id="hsCheckOutTime"
                  label="เวลาเช็กเอาท์"
                  type="time"
                  value={hsCheckOutTime}
                  onChange={(e) => setHsCheckOutTime(e.target.value)}
                  error={!!(formErrors as any).hsCheckOutTime}
                  helperText={(formErrors as any).hsCheckOutTime}
                />
              </div>

              {/* การ์ดที่พัก + ปุ่มถังขยะ */}
              <div className="relative rounded-xl border p-4 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={clearHomestay}
                  aria-label="เอาที่พักนี้ออก"
                  title="เอาที่พักนี้ออก"
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border hover:bg-red-50"
                >
                  <Icon icon="mdi:trash-can-outline" width="18" />
                </button>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-4">
                    <img
                      className="w-full h-40 object-cover rounded-lg"
                      src={
                        selectedHomestay.images?.[0]?.image ||
                        "https://placehold.co/640x480?text=Homestay"
                      }
                      alt={selectedHomestay.name}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-8">
                    <div className="font-semibold text-lg mb-2">
                      {selectedHomestay.name}
                    </div>

                    {selectedHomestay.facility && (
                      <div>
                        <div className="font-semibold mb-1">
                          สิ่งอำนวยความสะดวกที่พัก
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedHomestay.facility
                            .split(/[,•\n]/)
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .slice(0, 12)
                            .map((f, i) => (
                              <li key={i} className="text-sm">
                                {f}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <div className="flex justify-end mt-2.5 gap-2">
          <div className="w-36">
            <Button type="cancel" onClick={() => navigate(-1)}>
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
    </div>
  );
};

export default EditPackagePage;
