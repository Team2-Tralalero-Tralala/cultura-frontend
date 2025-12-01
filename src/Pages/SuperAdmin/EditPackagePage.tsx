/*
 * คำอธิบาย : Component หน้าสำหรับแก้ไขข้อมูลแพ็กเกจ (สำหรับ Superadmin)
 * - ดึงข้อมูลแพ็กเกจเดิมมาแสดงในฟอร์ม
 * - รองรับการอัปเดตข้อมูล, รูปภาพ (Cover/Gallery), และที่พักที่เกี่ยวข้อง
 * - ส่งข้อมูลแบบ multipart/form-data
 * Input: (via URL params) id - ID ของแพ็กเกจที่ต้องการแก้ไข
 * Output: หน้าฟอร์มสำหรับแก้ไขข้อมูลแพ็กเกจ
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import * as z from "zod";
import TextField from "../../Components/TextField";
import MapPicker from "../../Components/MapPicker";
import { Icon } from "@iconify/react";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import TextArea from "@/Components/TextArea";
import Button from "@/Components/Button";
import CommunityMemberSelector, {
  type Member as CommunityMember,
} from "@/Components/Selector/CommunityMemberSelector";

// ==== เพิ่มให้ตรงกับ EditHomestay ====
import UploadCard from "@/Components/calendar/upload/UploadCard";
import { TagSelector } from "@/Components/Selector/TagSelector";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { PackageStatusDropdown, type PackageStatus } from "@/Components/Selector/PackageStatusDropdown";
import BoxDateInput from "@/Components/calendar/input_calendar/BoxDateInput";
import BoxTimeInput from "@/Components/calendar/input_calendar/BoxTimeInput";
// =====================================

const apiUrl = import.meta.env.VITE_API_URL as string;

/* -------------------- Helpers -------------------- */

/*
 * คำอธิบาย : ตัดช่องว่างและคืนค่า fallback หากสตริงว่าง
 * Input: inputValue - สตริงที่ต้องการตรวจสอบ, fallback - ค่าที่จะคืนหากสตริงว่าง (default: "-")
 * Output : สตริงที่ตัดช่องว่างแล้ว หรือค่า fallback
 */
function normalizeOrDefault(inputValue: string, fallback = "-") {
  const trimmed = (inputValue ?? "").toString().trim();
  return trimmed.length ? trimmed : fallback;
}

/*
 * คำอธิบาย : แปลงค่าใดๆ เป็น number หรือ null
 * Input: value - ค่าที่ต้องการแปลง
 * Output : number หรือ null
 */
function toIntOrNull(value: any): number | null {
  const trimmed = String(value ?? "").trim();
  if (trimmed === "") return null;
  const numberValue = Number(trimmed);
  return Number.isFinite(numberValue) ? numberValue : null;
}

/*
 * คำอธิบาย : แปลง Date object หรือ string วันที่/เวลา เป็น format "HH:mm"
 * Input: input - วันที่/เวลา
 * Output : สตริง "HH:mm" หรือ ""
 */
function toTimeInput(input?: string | Date | null) {
  if (!input) return "";
  const dateObject = new Date(input as any);
  if (!isNaN(dateObject.getTime())) {
    const hours = String(dateObject.getHours()).padStart(2, "0");
    const minutes = String(dateObject.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  if (typeof input === "string") {
    const m = input.match(/^(\d{2}):(\d{2})/);
    if (m) {
      return `${m[1].padStart(2, "0")}:${m[2].padStart(2, "0")}`;
    }
  }

  return "";
}

/*
 * คำอธิบาย : แปลง Date object หรือ string วันที่ เป็น format "YYYY-MM-DD"
 * Input: input - วันที่
 * Output : สตริง "YYYY-MM-DD" หรือ ""
 */
function toDateOnly(input?: string | Date | null) {
  if (!input) return "";
  if (typeof input === "string") {
    const matchResult = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (matchResult) return `${matchResult[1]}-${matchResult[2]}-${matchResult[3]}`;
  }
  const dateObject = new Date(input as any);
  if (isNaN(dateObject.getTime())) return "";
  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const day = String(dateObject.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/*
 * คำอธิบาย : แปลง URL ของรูปภาพเป็น File object
 * Input: url - URL ของรูปภาพ, filename - ชื่อไฟล์
 * Output : Promise<File>
 */
async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch ${url} -> ${response.status}`);
  const blob = await response.blob();
  const extension = filename.split(".").pop() || "jpg";
  const fileType = blob.type || `image/${extension}`;
  const file = new File([blob], filename, { type: fileType });
  (file as any).isFromServer = true;
  return file;
}

/*
 * คำอธิบาย : สร้างรายการ URL ที่เป็นไปได้สำหรับ path ของรูปภาพ
 * Input: rawPath - path ของรูปภาพ
 * Output : Array ของ URL string
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
    "",
    "uploads/"
  ];

  const candidates = new Set<string>();
  for (const prefix of prefixes) {
    const path = cleanedPath.startsWith(prefix) ? cleanedPath : `${prefix}${cleanedPath}`;
    candidates.add(`${origin}/${encodeURI(path)}`);
    candidates.add(`${origin}/api/${encodeURI(path)}`);
  }
  return Array.from(candidates);
}

/*
 * คำอธิบาย : พยายามแปลง path ของรูปภาพเป็น File object โดยลองจาก URL ที่เป็นไปได้
 * Input: rawPath - path ของรูปภาพ, filename - ชื่อไฟล์
 * Output : Promise<File>
 */
async function bestEffortUrlToFile(rawPath: string, filename: string): Promise<File> {
  const candidates = buildImageCandidates(rawPath);
  let lastError: unknown = null;
  for (const url of candidates) {
    try {
      return await urlToFile(url, filename);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("no image url works");
}
/* ------------------------------------------------------------------------------- */

type PackageForm = {
  name: string;
  description: string;
  statusPackage: PackageStatus;
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
  tagId: string; // (ไม่ได้ใช้แล้ว แต่คงไว้ให้ safest)
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
  statusPackage: "DRAFT",
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
  statusPackage: z.enum(["DRAFT", "PUBLISH", "UNPUBLISH"]),
  houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
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
  const [communityId, setCommunityId] = useState<number | undefined>(undefined);
  const [currentOverseer, setCurrentOverseer] = useState<CommunityMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [formErrors, setFormErrors] = useState<PackageErrors>({});
  const [position, setPosition] = useState<[number, number]>([13.7563, 100.5018]);

  // ====== Tag (ใช้วิธีเดียวกับ EditHomestay) ======
  const [tagIds, setTagIds] = useState<number[]>([]);

  // ====== รูปภาพ (เหมือน EditHomestay) ======
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([])

  // สำหรับ BoxDateInput (เหมือน EditCommunity)
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);
  const [openDateObj, setOpenDateObj] = useState<Date | null>(null);
  const [closeDateObj, setCloseDateObj] = useState<Date | null>(null);

  // วันที่เช็กอิน/เอาต์ ที่พัก (optional)
  const [hsCheckInDateObj, setHsCheckInDateObj] = useState<Date | null>(null);
  const [hsCheckOutDateObj, setHsCheckOutDateObj] = useState<Date | null>(null);


  /*
   * คำอธิบาย : ตรวจสอบความถูกต้อง (Validate) ของฟิลด์เดียวในฟอร์ม
   * Input: field - ชื่อฟิลด์ (keyof PackageForm), value - ค่าใหม่, newState - object state ทั้งหมด
   * Output : (void) - อัปเดต formErrors state
   */
  const validateField = React.useCallback(
    (field: keyof PackageForm, value: any, newState: PackageForm) => {
      const result = packageSchema.safeParse(newState);
      setFormErrors((prev) => ({
        ...prev,
        [field]: result.success
          ? undefined
          : result.error.issues.find((issue) => issue.path[0] === field)?.message,
      }));
    },
    []
  );

  /*
   * คำอธิบาย : ตรวจสอบความถูกต้อง (Validate) ของฟอร์มทั้งหมด
   * Input: -
   * Output : boolean - true หากถูกต้องทั้งหมด, false หากมีข้อผิดพลาด
   */
  const validateAll = () => {
    let isValid = true;
    const result = packageSchema.safeParse(formState);
    if (!result.success) {
      const errorsObject: PackageErrors = {};
      for (const issue of result.error.issues) {
        errorsObject[issue.path[0] as keyof PackageForm] = issue.message;
      }
      setFormErrors(errorsObject);
      isValid = false;
    } else {
      setFormErrors({});
    }
    if (formState.openDate && formState.closeDate && formState.openDate > formState.closeDate) {
      setFormErrors((prev) => ({
        ...prev,
        closeDate: "วันที่ปิดจองต้องไม่น้อยกว่าวันที่เปิดจอง",
      }));
      isValid = false;
    }
    if (formState.closeDate && formState.endDate && formState.closeDate > formState.endDate) {
      setFormErrors((prev) => ({
        ...prev,
        closeDate: "วันที่ปิดจองต้องไม่ช้ากว่าวันสิ้นสุดกิจกรรม",
      }));
      isValid = false;
    }
    if (selectedHomestay) {
      if (!hsCheckInDate) {
        (setFormErrors as any)((prev: any) => ({ ...prev, hsCheckInDate: "กรุณาเลือกวันที่เช็กอิน" }));
        isValid = false;
      }
      if (!hsCheckInTime) {
        (setFormErrors as any)((prev: any) => ({ ...prev, hsCheckInTime: "กรุณาเลือกเวลาเช็กอิน" }));
        isValid = false;
      }
      if (!hsCheckOutDate) {
        (setFormErrors as any)((prev: any) => ({ ...prev, hsCheckOutDate: "กรุณาเลือกวันที่เช็กเอาท์" }));
        isValid = false;
      }
      if (!hsCheckOutTime) {
        (setFormErrors as any)((prev: any) => ({ ...prev, hsCheckOutTime: "กรุณาเลือกเวลาเช็กเอาท์" }));
        isValid = false;
      }
    }
    return isValid;
  };

  // ===== Member picker (คงของเดิม) =====
  type MemberOption = { id: number; fname: string; lname: string };
  const [memberQuery, setMemberQuery] = useState("");
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const showMemberBox = memberQuery.trim().length >= 1 && memberOptions.length > 0;

  React.useEffect(() => {
    const query = memberQuery.trim();
    if (!query) {
      setMemberOptions([]);
      return;
    }
    setMemberOptions([]);
  }, [memberQuery]);

  const searchBoxRef = React.useRef<HTMLDivElement | null>(null);
  const [openTagBox, setOpenTagBox] = useState(false); // ไม่ใช้แล้ว แต่คงตัวแปรไว้ให้ compile

  // Effect สำหรับปิดกล่องเมื่อคลิกข้างนอก
  React.useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(event.target as Node)) setOpenTagBox(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const canSubmitForm = useMemo(() => {
    const required = [
      formState.name,
      formState.description,
      formState.statusPackage,
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
    return required.every((value) => String(value ?? "").trim() !== "");
  }, [formState]);

  // ===== Homestay picker (คงของเดิม) =====
  type HomestayOption = {
    id: number;
    name: string;
    facility?: string;
    images?: { image: string }[];
  };

  const [homestayQuery, setHomestayQuery] = useState("");
  const [homestayOptions, setHomestayOptions] = useState<HomestayOption[]>([]);
  const [selectedHomestay, setSelectedHomestay] = useState<HomestayOption | null>(null);

  const homestayBoxRef = React.useRef<HTMLDivElement | null>(null);
  const [openHomestayBox, setOpenHomestayBox] = useState(false);

  // Effect สำหรับปิดกล่อง Homestay เมื่อคลิกข้างนอก
  React.useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (homestayBoxRef.current && !homestayBoxRef.current.contains(event.target as Node)) {
        setOpenHomestayBox(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);


  const MIN_HOMESTAY_QUERY_CHARS = 2;

  /*
   * คำอธิบาย : (Callback) Fetch ข้อมูลที่พักสำหรับ Ccommunity
   * Input: query - ข้อความค้นหา
   * Output : (void) - อัปเดต homestayOptions state
   */
  const fetchHomestays = React.useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length > 0 && trimmedQuery.length < MIN_HOMESTAY_QUERY_CHARS) {
      setHomestayOptions([]);
      setOpenHomestayBox(false);
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/super/homestay-select/${id}`, {
        params: { q: trimmedQuery, limit: 8 },
        withCredentials: true,
      });
      const rawData = response?.data?.data ?? response?.data?.items ?? response?.data ?? [];
      const options: HomestayOption[] = (Array.isArray(rawData) ? rawData : []).map((homestay: any) => ({
        id: Number(homestay.id),
        name: homestay.name ?? "",
        facility: homestay.facility ?? homestay.description ?? "",
        images: homestay.homestayImage ?? homestay.images ?? [],
      }));
      setHomestayOptions(options);
      setOpenHomestayBox(options.length > 0);
    } catch (error) {
      console.error("search homestays error:", error);
      setHomestayOptions([]);
      setOpenHomestayBox(false);
    }
  }, [id]);

  // Effect สำหรับ Debounce การค้นหาที่พัก
  React.useEffect(() => {
    const timerId = setTimeout(() => {
      fetchHomestays(homestayQuery);
    }, 250);
    return () => clearTimeout(timerId);
  }, [homestayQuery, fetchHomestays]);

  /*
   * คำอธิบาย : เลือกที่พักจากรายการ
   * Input: homestay - object ที่พักที่เลือก
   * Output : (void)
   */
  const chooseHomestay = (homestay: HomestayOption) => {
    setSelectedHomestay(homestay);
    setHomestayQuery("");
    setHomestayOptions([]);
    setOpenHomestayBox(false);
    setFormField("tagId" as any, formState.tagId);
  };

  /*
   * คำอธิบาย : (Callback) อัปเดตฟิลด์ในฟอร์ม และ Validate ทันที
   * Input: key - ชื่อฟิลด์, value - ค่าใหม่
   * Output : (void)
   */
  const setFormField = React.useCallback(
    <KeyValue extends keyof PackageForm>(key: KeyValue, value: PackageForm[KeyValue]) => {
      setFormState((prev) => {
        const newState = { ...prev, [key]: value };
        validateField(key, value, newState);
        return newState;
      });
    },
    [validateField]
  );

  // ====== Homestay check-in/out ======
  const [hsCheckInDate, setHsCheckInDate] = useState("");
  const [hsCheckInTime, setHsCheckInTime] = useState("");
  const [hsCheckOutDate, setHsCheckOutDate] = useState("");
  const [hsCheckOutTime, setHsCheckOutTime] = useState("");
  const [hsBookedRoom, setHsBookedRoom] = useState<string>("1");

  /*
   * คำอธิบาย : ล้างข้อมูลที่พักที่เลือกไว้
   * Input: -
   * Output : (void)
   */
  const clearHomestay = () => {
    setSelectedHomestay(null);
    setHsCheckInDateObj(null);
    setHsCheckInDate("");
    setHsCheckInTime("");
    setHsCheckOutDateObj(null);
    setHsCheckOutDate("");
    setHsCheckOutTime("");
    setHsBookedRoom("1");
  };

  // ========= Load package detail =========
  useEffect(() => {
    let mounted = true;

    /*
     * คำอธิบาย : โหลดข้อมูลแพ็กเกจจาก API
     * Input: -
     * Output : (void) - อัปเดต state ต่างๆ ของหน้า
     */
    async function loadPackageData() {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/super/package/${id}`, {
          withCredentials: true,
        });
        const packageData = response?.data?.data;

        setCommunityId(Number(packageData?.communityId ?? packageData?.community?.id ?? NaN) || undefined);

        if (packageData?.overseerPackage) {
          setCurrentOverseer({
            id: Number(packageData.overseerPackage.id),
            fname: packageData.overseerPackage.fname ?? "",
            lname: packageData.overseerPackage.lname ?? "",
          });
        }
        if (!mounted || !packageData) return;

        const locationData = packageData.location ?? {};
        const latitude = Number(locationData.latitude ?? 13.7563);
        const longitude = Number(locationData.longitude ?? 100.5018);
        setPosition([latitude, longitude]);

        const homestayHistory =
          Array.isArray(packageData.homestayHistories) && packageData.homestayHistories.length > 0
            ? packageData.homestayHistories[0]
            : null;

        const startDateRaw = packageData.startDate ?? null;
        const dueDateRaw = packageData.dueDate ?? null;
        const bookingOpenRaw = packageData.bookingOpenDate ?? null;
        const bookingCloseRaw = packageData.bookingCloseDate ?? null;

        const startParsed = startDateRaw ? new Date(startDateRaw) : null;
        const dueParsed = dueDateRaw ? new Date(dueDateRaw) : null;
        const openParsed = bookingOpenRaw ? new Date(bookingOpenRaw) : null;
        const closeParsed = bookingCloseRaw ? new Date(bookingCloseRaw) : null;

        setStartDateObj(startParsed && !isNaN(startParsed.getTime()) ? startParsed : null);
        setEndDateObj(dueParsed && !isNaN(dueParsed.getTime()) ? dueParsed : null);
        setOpenDateObj(openParsed && !isNaN(openParsed.getTime()) ? openParsed : null);
        setCloseDateObj(closeParsed && !isNaN(closeParsed.getTime()) ? closeParsed : null);

        setFormState({
          name: packageData.name ?? "",
          description: packageData.description ?? "",
          statusPackage:
            (packageData.statusPackage as PackageStatus) ?? "DRAFT",
          houseNumber: locationData.houseNumber ?? "",
          villageNumber: locationData.villageNumber != null ? String(locationData.villageNumber) : "",
          province: locationData.province ?? "",
          district: locationData.district ?? "",
          subDistrict: locationData.subDistrict ?? "",
          postalCode: locationData.postalCode ?? "",
          addressDetail: locationData.detail ?? "",
          latitude: locationData.latitude != null ? String(locationData.latitude) : "",
          longitude: locationData.longitude != null ? String(locationData.longitude) : "",
          placeQuery: "",

          overseerMemberId: packageData.overseerMemberId != null ? String(packageData.overseerMemberId) : "",
          tagId: "",
          facility: packageData.warning ?? "",

          startDate: toDateOnly(packageData.startDate),
          startTime: toTimeInput(packageData.startDate),
          endDate: toDateOnly(packageData.dueDate),
          endTime: toTimeInput(packageData.dueDate),
          openDate: toDateOnly(packageData.bookingOpenDate),
          openTime: toTimeInput(packageData.bookingOpenDate),
          closeDate: toDateOnly(packageData.bookingCloseDate),
          closeTime: toTimeInput(packageData.bookingCloseDate),

          capacity: packageData.capacity != null ? String(packageData.capacity) : "",
          price: packageData.price != null ? String(packageData.price) : "",
          addHomestay: !!homestayHistory,
        });

        // ตั้ง tagIds (เหมือนหน้า homestay)
        const tagsFromServer: number[] = Array.isArray(packageData?.tagPackages)
          ? packageData.tagPackages
            .map((tagPackage: any) => tagPackage?.tag?.id ?? tagPackage?.id)
            .filter((tagId: any) => typeof tagId === "number")
          : [];
        setTagIds(tagsFromServer);

        // โหลดรูปของแพ็กเกจ (เหมือน homestay: cover + gallery)
        const imagesData: any[] = Array.isArray(packageData?.packageFile) ? packageData.packageFile : [];
        const coverFetched: File[] = await Promise.all(
          imagesData
            .filter((image) => String(image.type).toUpperCase() === "COVER")
            .map((image) =>
              bestEffortUrlToFile(String(image.filePath || image.image || ""), String(image.filePath || "cover.jpg")),
            ),
        );
        const galleryFetched: File[] = await Promise.all(
          imagesData
            .filter((image) => String(image.type).toUpperCase() === "GALLERY")
            .map((image) =>
              bestEffortUrlToFile(String(image.filePath || image.image || ""), String(image.filePath || "gallery.jpg")),
            ),
        );
        const videoFetched: File[] = await Promise.all(
          imagesData
            .filter((image) => String(image.type).toUpperCase() === "VIDEO")
            .map(async (image) => {
              const rawPath = String(image.filePath || image.image || "");

              // ใช้ candidate URL เดิมที่คุณมีอยู่แล้ว
              const candidates = buildImageCandidates(rawPath);

              let lastError: unknown = null;

              for (const url of candidates) {
                try {
                  const response = await fetch(url);
                  if (!response.ok) {
                    lastError = new Error(`fetch ${url} -> ${response.status}`);
                    continue;
                  }

                  const blob = await response.blob();

                  const fixedBlob =
                    blob.type && blob.type.startsWith("video/")
                      ? blob
                      : new Blob([blob], { type: "video/mp4" });  // 👈 บังคับเป็น video/mp4

                  const filename = rawPath.split("/").pop() || "video.mp4";

                  return new File([fixedBlob], filename, { type: fixedBlob.type });
                } catch (error) {
                  lastError = error;
                }
              }

              throw lastError || new Error("no video url works");
            })
        );
        setCoverFiles(coverFetched);
        setGalleryFiles(galleryFetched);
        setVideoFiles(videoFetched);

        // ตั้ง homestay + เวลา (ถ้ามี)
        if (homestayHistory?.homestay) {
          setSelectedHomestay({
            id: Number(homestayHistory.homestay.id),
            name: homestayHistory.homestay.name ?? "",
            facility: homestayHistory.homestay.facility ?? "",
            images: homestayHistory.homestay.homestayImage ?? [],
          });
        }
        if (homestayHistory?.checkInTime) {
          const d = new Date(homestayHistory.checkInTime);
          setHsCheckInDateObj(!isNaN(d.getTime()) ? d : null);
          setHsCheckInDate(toDateOnly(homestayHistory.checkInTime));
          setHsCheckInTime(toTimeInput(homestayHistory.checkInTime));
        }
        if (homestayHistory?.checkOutTime) {
          const d = new Date(homestayHistory.checkOutTime);
          setHsCheckOutDateObj(!isNaN(d.getTime()) ? d : null);
          setHsCheckOutDate(toDateOnly(homestayHistory.checkOutTime));
          setHsCheckOutTime(toTimeInput(homestayHistory.checkOutTime));
        }
        if (homestayHistory?.bookedRoom) {
          setHsBookedRoom(String(homestayHistory.bookedRoom));
        }
      } catch (error: any) {
        console.error("Load package detail error:", error?.response?.data || error);
        setErrorMessage(error?.response?.data?.message || error?.message || "ไม่สามารถโหลดข้อมูลแพ็กเกจ");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPackageData();

    return () => {
      mounted = false;
    };
  }, [id]);

  /*
   * คำอธิบาย : (Callback) Handler เมื่อ MapPicker มีการเปลี่ยนแปลงตำแหน่ง
   * Input: [latitude, longitude] - array ของตัวเลข
   * Output : (void) - อัปเดต formState
   */
  const handleMapChange = React.useCallback(([latitude, longitude]: [number, number]) => {
    setFormField("latitude", String(latitude));
    setFormField("longitude", String(longitude));
    setPosition([latitude, longitude]);
  }, [setFormField]);


  /*
   * คำอธิบาย : Handler ที่ถูกเรียกเมื่อผู้ใช้กดยืนยันจาก Modal
   * - สร้าง FormData และส่งข้อมูล (axios.put) ไปยัง API
   * Input: -
   * Output : (void) - (async) นำทางไปยังหน้า list หากสำเร็จ, หรือแสดง error
   */
  const handleConfirmSave = async () => {
    setIsConfirmModalOpen(false); // ปิด Modal
    if (!id || isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // payload หลัก (จะถูกใส่ลง fd ใน key "data")
      const payload = {
        overseerMemberId: Number(formState.overseerMemberId),
        name: normalizeOrDefault(formState.name),
        description: normalizeOrDefault(formState.description),
        statusPackage: formState.statusPackage,
        capacity: Math.max(1, Number(formState.capacity || 0)),
        price: Math.max(0, Number(formState.price || 0)),
        warning: normalizeOrDefault(formState.facility),

        startDate: normalizeOrDefault(formState.startDate),
        dueDate: normalizeOrDefault(formState.endDate),
        ...(formState.startTime.trim() && { startTime: formState.startTime.trim() }),
        ...(formState.endTime.trim() && { endTime: formState.endTime.trim() }),

        bookingOpenDate: normalizeOrDefault(formState.openDate),
        bookingCloseDate: normalizeOrDefault(formState.closeDate),

        ...(formState.openTime.trim() && { openTime: formState.openTime.trim() }),
        ...(formState.closeTime.trim() && { closeTime: formState.closeTime.trim() }),

        ...(selectedHomestay && hsCheckInDate && { homestayCheckInDate: hsCheckInDate }),
        ...(selectedHomestay && hsCheckInTime && { homestayCheckInTime: hsCheckInTime }),
        ...(selectedHomestay && hsCheckOutDate && { homestayCheckOutDate: hsCheckOutDate }),
        ...(selectedHomestay && hsCheckOutTime && { homestayCheckOutTime: hsCheckOutTime }),
        ...(selectedHomestay && hsBookedRoom && { bookedRoom: Number(hsBookedRoom) }),

        facility: normalizeOrDefault(formState.facility),

        tagIds,

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

      // ===== ส่งแบบเดียวกับ EditHomestay =====
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      coverFiles.forEach((file: any) => formData.append("cover", file));
      galleryFiles.forEach((file: any) => formData.append("gallery", file));
      videoFiles.forEach((file: any) => formData.append("video", file));

      // NOTE: ให้ตรงกับ BE ที่รับ multipart ของ package
      await axios.put(`${apiUrl}/super/package/${id}`, formData, {
        withCredentials: true,
      });

      navigate("/super/packages/all");
    } catch (error: any) {
      console.error("Edit package (superadmin) error:", error?.response?.data);
      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "บันทึกแพ็กเกจไม่สำเร็จ",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * คำอธิบาย : Handler ที่ถูกเรียกเมื่อกด Submit ฟอร์ม
   * - ตรวจสอบความถูกต้องทั้งหมด
   * - หากถูกต้อง จะเปิด Modal ยืนยัน
   * Input: event - React FormEvent
   * Output : (void)
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || isSaving) return;

    // Validate ข้อมูลก่อนเปิด Modal
    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Validate เงื่อนไขวัน/เวลา ก่อนเปิด Modal
    if (formState.openDate && formState.closeDate && formState.openDate > formState.closeDate) {
      setErrorMessage("ช่วงเปิดจองไม่ถูกต้อง: วันที่เปิดจองต้องไม่เกินวันที่ปิดจอง");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (formState.closeDate && formState.endDate && formState.closeDate > formState.endDate) {
      setErrorMessage("วันที่ปิดจองต้องไม่ช้ากว่าวันสิ้นสุดกิจกรรม");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // เปิด Modal เพื่อยืนยัน
    setIsConfirmModalOpen(true);
  }

  return (
    <div className="w-full max-w-none px-0 lg:px-0">
      {/* Breadcrumb */}
      <div>
        พื้นที่ใส่ Breadcrumb
      </div>
      <form noValidate onSubmit={handleSubmit} className="w-full bg-white rounded-lg p-5 md:p-6 lg:p-7 shadow-sm space-y-8">
        <button
          type="button"
          onClick={() => navigate(`/super/package/${id}`)}
          className="inline-flex items-center gap-2 text-xl mb-1 group hover"
          aria-label="ย้อนกลับไปหน้ารายการแพ็กเกจ"
        >
          <Icon icon="lucide:arrow-left" width={22} />
          <span className="text-xl font-semibold ">แก้ไขแพ็กเกจ</span>
        </button>

        {/* ชื่อ/คำอธิบาย */}
        <section className="space-y-4">
          <TextField
            id="name"
            label="ชื่อแพ็กเกจ"
            required
            placeholder="ชื่อแพ็กเกจ"
            value={formState.name}
            onChange={(event) => setFormField("name", event.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
          />

          {/* สถานะเเพ็กเกจ */}
          <div className="space-y-2">
            <label className="block text-base font-semibold">
              สถานะเเพ็กเกจ <span className="text-red-600 text-base">*</span>
            </label>

            <PackageStatusDropdown
              value={formState.statusPackage}
              onChange={(status) => setFormField("statusPackage", status)}
            />
          </div>

          <div>
            <TextArea
              id="description"
              label="คำอธิบายแพ็กเกจ"
              required
              placeholder="คำอธิบายแพ็กเกจ"
              value={formState.description}
              onChange={(event) => setFormField("description", event.target.value)}
              error={!!formErrors?.description}
              helperText={formErrors?.description}
            />
            {!!formErrors.description && (
              <div className="text-red-600 text-sm mt-1">{formErrors.description}</div>
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
              onChange={(event) => setFormField("houseNumber", event.target.value)}
              error={!!formErrors.houseNumber}
              helperText={formErrors.houseNumber}
            />
            <TextField
              id="villageNumber"
              label="หมู่ที่"
              placeholder="กรอกหมู่ของชุมชน"
              value={formState.villageNumber}
              onChange={(event) => setFormField("villageNumber", event.target.value)}
              error={!!formErrors.villageNumber}
              helperText={formErrors.villageNumber}
            />

            {/* Selector ที่อยู่ */}
            <div className="md:col-span-2">
              <ThailandLocationSelector
                value={{
                  province: formState.province,
                  district: formState.district,
                  subdistrict: formState.subDistrict,
                  postalCode: formState.postalCode,
                }}
                onChange={(location: ThailandLocation) => {
                  setFormState((prev) => {
                    const newState = {
                      ...prev,
                      province: location.province ?? "",
                      district: location.district ?? "",
                      subDistrict: location.subdistrict ?? "",
                      postalCode: location.postalCode ?? "",
                    };
                    const result = packageSchema.safeParse(newState);
                    setFormErrors((prevErrors) => {
                      const newErrors = { ...prevErrors };
                      if (result.success) {
                        delete newErrors.province;
                        delete newErrors.district;
                        delete newErrors.subDistrict;
                        delete newErrors.postalCode;
                      } else {
                        newErrors.province = result.error.issues.find(
                          (issue) => issue.path[0] === "province"
                        )?.message;
                        newErrors.district = result.error.issues.find(
                          (issue) => issue.path[0] === "district"
                        )?.message;
                        newErrors.subDistrict = result.error.issues.find(
                          (issue) => issue.path[0] === "subDistrict"
                        )?.message;
                        newErrors.postalCode = result.error.issues.find(
                          (issue) => issue.path[0] === "postalCode"
                        )?.message;
                      }
                      return newErrors;
                    });
                    return newState;
                  });
                }}
              />
              {/* errors */}
              <div className="grid grid-cols-2 gap-y-[6px] gap-x-[12px] mt-2">
                <div>{!!formErrors.province && <div className="text-red-600 text-sm">{formErrors.province}</div>}</div>
                <div>{!!formErrors.district && <div className="text-red-600 text-sm">{formErrors.district}</div>}</div>
                <div>{!!formErrors.subDistrict && <div className="text-red-600 text-sm">{formErrors.subDistrict}</div>}</div>
                <div>{!!formErrors.postalCode && <div className="text-red-600 text-sm">{formErrors.postalCode}</div>}</div>
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
                onChange={(event) => setFormField("addressDetail", event.target.value)}
                error={!!formErrors?.addressDetail}
                helperText={formErrors?.addressDetail}
              />
            </div>

            {/* Map Picker */}
            <div className="md:col-span-2">
              {!loading && (
                <MapPicker
                  startingPosition={position}
                  startingZoom={13}
                  onChange={handleMapChange}
                />
              )}
              {loading && (
                <div className="w-full h-[400px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                  กำลังโหลดแผนที่...
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {!!formErrors.latitude && <div className="text-red-600 text-sm">{formErrors.latitude}</div>}
                {!!formErrors.longitude && <div className="text-red-600 text-sm">{formErrors.longitude}</div>}
              </div>
            </div>
          </div>
        </section>

        {/* ผู้ดูแล + ความจุ */}
        <section className="grid md:grid-cols-2 gap-5">
          {/* เลือกผู้ดูแล */}
          <div className="space-y-2">
            <div className="relative">
              <CommunityMemberSelector
                communityId={communityId}
                value={formState.overseerMemberId ? Number(formState.overseerMemberId) : undefined}
                member={currentOverseer}
                disabled={!communityId || loading}
                error={!!formErrors.overseerMemberId}
                helperText={formErrors.overseerMemberId}
                onChange={(newId) => {
                  setFormField("overseerMemberId", newId ? String(newId) : "");
                  setCurrentOverseer(null);
                }}
              />
              {showMemberBox && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-56 overflow-auto">
                  {memberOptions.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-green-50"
                      onClick={() => {
                        setFormField("overseerMemberId", String(member.id));
                        setMemberQuery(`${member.fname} ${member.lname}`);
                      }}
                    >
                      {member.fname} {member.lname}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!!formErrors.overseerMemberId && (
              <div className="text-red-600 text-sm">{formErrors.overseerMemberId}</div>
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
            onChange={(event) => setFormField("capacity", event.target.value)}
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
              onChange={(event) => setFormField("facility", event.target.value)}
              error={!!formErrors?.facility}
              helperText={formErrors?.facility}
            />
            {!!formErrors.facility && (
              <div className="text-red-600 text-sm mt-1">{formErrors.facility}</div>
            )}
          </div>
        </section>

        {/* วันเวลา */}
        <section className="grid md:grid-cols-4 gap-5">
          <BoxDateInput
            id="startDate"
            label="วัน/เดือน/ปี (พ.ศ.) ที่เริ่ม"
            required
            value={startDateObj}
            onChange={(date) => {
              setStartDateObj(date);
              if (date) {
                setFormField("startDate", date.toISOString().split("T")[0] as any);
              } else {
                setFormField("startDate", "" as any);
              }
            }}
            minDate={new Date("1900-01-01")}
            maxDate={new Date("2100-12-31")}
            errorText={formErrors.startDate}
          />
          <BoxTimeInput
            label="เวลาที่เริ่ม"
            value={formState.startTime}
            onChange={(time) => setFormField("startTime", time)}
            required
            errorText={formErrors.startTime}
          />
          <BoxDateInput
            id="endDate"
            label="วัน/เดือน/ปี (พ.ศ.) ที่สิ้นสุด"
            required
            value={endDateObj}
            onChange={(date) => {
              setEndDateObj(date);
              if (date) {
                setFormField("endDate", date.toISOString().split("T")[0] as any);
              } else {
                setFormField("endDate", "" as any);
              }
            }}
            minDate={new Date("1900-01-01")}
            maxDate={new Date("2100-12-31")}
            errorText={formErrors.endDate}
          />
          <BoxTimeInput
            label="เวลาที่สิ้นสุด"
            value={formState.endTime}
            onChange={(time) => setFormField("endTime", time)}
            required
            errorText={formErrors.endTime}
          />
          <BoxDateInput
            id="openDate"
            label="วัน/เดือน/ปี (พ.ศ.) ที่เปิดจอง"
            required
            value={openDateObj}
            onChange={(date) => {
              setOpenDateObj(date);
              if (date) {
                setFormField("openDate", date.toISOString().split("T")[0] as any);
              } else {
                setFormField("openDate", "" as any);
              }
            }}
            minDate={new Date("1900-01-01")}
            maxDate={new Date("2100-12-31")}
            errorText={formErrors.openDate}
          />
          <BoxTimeInput
            label="เวลาที่เปิดจอง"
            value={formState.openTime}
            onChange={(time) => setFormField("openTime", time)}
            required
            errorText={formErrors.openTime}
          />
          <BoxDateInput
            id="closeDate"
            label="วัน/เดือน/ปี (พ.ศ.) ที่ปิดจอง"
            required
            value={closeDateObj}
            onChange={(date) => {
              setCloseDateObj(date);
              if (date) {
                setFormField("closeDate", date.toISOString().split("T")[0] as any);
              } else {
                setFormField("closeDate", "" as any);
              }
            }}
            minDate={new Date("1900-01-01")}
            maxDate={new Date("2100-12-31")}
            errorText={formErrors.closeDate}
          />
          <BoxTimeInput
            label="เวลาที่ปิดจอง"
            value={formState.closeTime}
            onChange={(time) => setFormField("closeTime", time)}
            required
            errorText={formErrors.closeTime}
          />
        </section>

        {/* แท็ก / ราคา (แท็กใช้ TagSelector เหมือน EditHomestay) */}
        <section className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-1">
            <div ref={searchBoxRef}>
              <TagSelector value={tagIds} onChange={(ids) => setTagIds(ids)} />
            </div>
          </div>

          {/* ราคา */}
          <TextField
            id="price"
            label="ราคา"
            required
            type="number"
            placeholder="กรอกราคา"
            value={formState.price}
            onChange={(event) => setFormField("price", event.target.value)}
            error={!!formErrors.price}
            helperText={formErrors.price}
          />
        </section>

        {/* สื่อแพ็กเกจ: COVER + GALLERY (เหมือน EditHomestay) */}
        <section className="space-y-6">
          <div className="space-y-2">
            <label className="block text-base font-semibold">
              อัพโหลดภาพหน้าปก <span className="text-red-600">*</span>
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
              อัพโหลดรูปภาพเพิ่มเติม <span className="text-red-600">*</span>
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
              อัพโหลดวิดีโอเพิ่มเติม <span className="text-red-600">*</span>
            </label>
            <UploadCard
              max={5}
              accept="video/*"
              multiple={false}
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

          {/* ค้นหาที่พัก */}
          <div ref={homestayBoxRef} className="relative">
            <div className="flex items-center gap-3 rounded-md border border-gray-400 bg-white px-4 py-2">
              <Icon icon="mingcute:search-line" width="22" />
              <input
                type="text"
                placeholder="ค้นหาชื่อที่พัก"
                className="w-full outline-none border-none bg-transparent"
                value={homestayQuery}
                onChange={(event) => setHomestayQuery(event.target.value)}
                onFocus={() => {
                  if (homestayQuery.trim() === "") {
                    fetchHomestays("");
                  }
                  else if (homestayOptions.length > 0) {
                    setOpenHomestayBox(true);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && homestayOptions[0]) {
                    event.preventDefault();
                    chooseHomestay(homestayOptions[0]);
                  }
                  if (event.key === "Escape") setOpenHomestayBox(false);
                }}
              />
            </div>

            {openHomestayBox && homestayOptions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-56 overflow-auto">
                {homestayOptions.map((homestay) => (
                  <button
                    key={homestay.id}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-green-50"
                    onClick={() => chooseHomestay(homestay)}
                  >
                    {homestay.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* การ์ดที่พักที่เลือก + เวลาเช็กอิน/เอาท์ */}
          {selectedHomestay && (
            <>
              <div className="grid md:grid-cols-4 gap-4 mb-3">
                <BoxDateInput
                  id="hsCheckInDate"
                  label="วัน/เดือน/ปี (พ.ศ.) ที่เช็กอินพัก (หากมีที่พัก)"
                  value={hsCheckInDateObj}
                  onChange={(date) => {
                    setHsCheckInDateObj(date);
                    if (date) {
                      setHsCheckInDate(date.toISOString().split("T")[0]);
                    } else {
                      setHsCheckInDate("");
                    }
                  }}
                  minDate={new Date("1900-01-01")}
                  maxDate={new Date("2100-12-31")}
                  errorText={(formErrors as any).hsCheckInDate}
                />
                <TextField
                  id="hsCheckInTime"
                  label="เวลาเช็กอิน"
                  type="time"
                  value={hsCheckInTime}
                  onChange={(event) => setHsCheckInTime(event.target.value)}
                  error={!!(formErrors as any).hsCheckInTime}
                  helperText={(formErrors as any).hsCheckInTime}
                />
                <BoxDateInput
                  id="hsCheckOutDate"
                  label="วัน/เดือน/ปี (พ.ศ.) ที่เช็กเอาท์ (หากมีที่พัก)"
                  value={hsCheckOutDateObj}
                  onChange={(date) => {
                    setHsCheckOutDateObj(date);
                    if (date) {
                      setHsCheckOutDate(date.toISOString().split("T")[0]);
                    } else {
                      setHsCheckOutDate("");
                    }
                  }}
                  minDate={new Date("1900-01-01")}
                  maxDate={new Date("2100-12-31")}
                  errorText={(formErrors as any).hsCheckOutDate}
                />
                <TextField
                  id="hsCheckOutTime"
                  label="เวลาเช็กเอาท์"
                  type="time"
                  value={hsCheckOutTime}
                  onChange={(event) => setHsCheckOutTime(event.target.value)}
                  error={!!(formErrors as any).hsCheckOutTime}
                  helperText={(formErrors as any).hsCheckOutTime}
                />
                <BoxDateInput
                  id="startDate"
                  label="วัน/เดือน/ปี (พ.ศ.) ที่เริ่ม"
                  required
                  value={startDateObj}
                  onChange={(date) => {
                    setStartDateObj(date);
                    if (date) {
                      setFormField("startDate", date.toISOString().split("T")[0] as any);
                    } else {
                      setFormField("startDate", "" as any);
                    }
                  }}
                  minDate={new Date("1900-01-01")}
                  maxDate={new Date("2100-12-31")}
                  errorText={formErrors.startDate}
                />
                <BoxTimeInput
                  label="เวลาที่เริ่ม"
                  value={formState.startTime}
                  onChange={(time) => setFormField("startTime", time)}
                  required
                  errorText={formErrors.startTime}
                />
              </div>

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
                        selectedHomestay.images?.[0]?.image
                          ? `${new URL(apiUrl).origin}/uploads/${selectedHomestay.images[0].image}`
                          : "https://placehold.co/640x480?text=Homestay"
                      }
                      alt={selectedHomestay.name}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-8">
                    <div className="font-semibold text-lg mb-2">{selectedHomestay.name}</div>

                    {selectedHomestay.facility && (
                      <div>
                        <div className="font-semibold mb-1">สิ่งอำนวยความสะดวกที่พัก</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedHomestay.facility
                            .split(/[,•\n]/)
                            .map((line) => line.trim())
                            .filter(Boolean)
                            .slice(0, 12)
                            .map((facilityItem, index) => (
                              <li key={index} className="text-sm">
                                {facilityItem}
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
            <fieldset disabled={isSaving}>
              <Button type="confirm-admin" htmlType="submit">
                {isSaving ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </fieldset>
          </div>
        </div>
      </form>

      <Modal
        open={isConfirmModalOpen}
        title="ยืนยันการบันทึก"
        text="คุณต้องการบันทึกการแก้ไขแพ็กเกจนี้ใช่หรือไม่?"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmSave}
        onCancel={() => {
          setIsConfirmModalOpen(false);
        }}
      />

    </div>
  );
};

export default EditPackagePage;