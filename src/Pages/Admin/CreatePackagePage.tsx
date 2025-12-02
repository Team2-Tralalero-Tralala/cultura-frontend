/*
 * คำอธิบาย : Component หน้าสำหรับสร้างแพ็กเกจใหม่ (สำหรับ Admin)
 * - ฟอร์มกรอกข้อมูลแพ็กเกจใหม่ (หน้าตาเหมือนหน้าแก้ไข)
 * - รองรับการอัปโหลดรูปภาพ (Cover/Gallery/Video)
 * - ส่งข้อมูลแบบ multipart/form-data
 * Input: -
 * Output: หน้าฟอร์มสำหรับสร้างแพ็กเกจ
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import UploadCard from "@/Components/calendar/upload/UploadCard";
import { TagSelector } from "@/Components/Selector/TagSelector";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { PackageStatusDropdown, type PackageStatus } from "@/Components/Selector/PackageStatusDropdown";
import BoxDateInput from "@/Components/calendar/input_calendar/BoxDateInput";
import BoxTimeInput from "@/Components/calendar/input_calendar/BoxTimeInput";

const apiUrl = import.meta.env.VITE_API_URL as string;

/* -------------------- Helpers -------------------- */

/*
 * คำอธิบาย : ตัดช่องว่างและคืนค่า fallback หากสตริงว่าง
 */
function normalizeOrDefault(inputValue: string, fallback = "-") {
  const trimmed = (inputValue ?? "").toString().trim();
  return trimmed.length ? trimmed : fallback;
}

/*
 * คำอธิบาย : แปลงค่าใดๆ เป็น number หรือ null
 */
function toIntOrNull(value: any): number | null {
  const trimmed = String(value ?? "").trim();
  if (trimmed === "") return null;
  const numberValue = Number(trimmed);
  return Number.isFinite(numberValue) ? numberValue : null;
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
  statusPackage: "DRAFT", // ค่าเริ่มต้นเป็น DRAFT
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

export const CreatePackagePage = () => {
  const navigate = useNavigate();

  const [formState, setFormState] = useState<PackageForm>(initialFormState);
  const [communityId, setCommunityId] = useState<number | undefined>(undefined);

  const [currentOverseer, setCurrentOverseer] = useState<CommunityMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false); // Create ไม่ต้อง load data เริ่มต้น
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [formErrors, setFormErrors] = useState<PackageErrors>({});
  const [position, setPosition] = useState<[number, number]>([13.7563, 100.5018]);

  const [tagIds, setTagIds] = useState<number[]>([]);

  // ====== รูปภาพ ======
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([])

  // สำหรับ BoxDateInput
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);
  const [openDateObj, setOpenDateObj] = useState<Date | null>(null);
  const [closeDateObj, setCloseDateObj] = useState<Date | null>(null);

  // วันที่เช็กอิน/เอาต์ ที่พัก (optional)
  const [hsCheckInDateObj, setHsCheckInDateObj] = useState<Date | null>(null);
  const [hsCheckOutDateObj, setHsCheckOutDateObj] = useState<Date | null>(null);

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

  // ===== Member picker =====
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

  React.useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (!searchBoxRef.current) return;
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const canSubmitForm = useMemo(() => {
    // Basic check
    return true;
  }, [formState]);

  // ===== Homestay picker =====
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

  React.useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (homestayBoxRef.current && !homestayBoxRef.current.contains(event.target as Node)) {
        setOpenHomestayBox(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  // CreatePackagePage.tsx

  useEffect(() => {
    const fetchMyCommunity = async () => {
      try {
        // ✅ ใช้ API ที่มีอยู่แล้ว
        const response = await axios.get(`${apiUrl}/admin/community`, { // หรือ /admin/community/own
          withCredentials: true
        });

        // แกะเอา ID ออกมา
        // response.data.data คือ object community
        const myCommId = response.data?.data?.id;

        if (myCommId) {
          setCommunityId(Number(myCommId));
        }
      } catch (error) {
        console.error("Failed to fetch my community:", error);
      }
    };

    fetchMyCommunity();
  }, []);

  const MIN_HOMESTAY_QUERY_CHARS = 0; // ให้กดแล้วขึ้นเลยก็ได้ถ้าต้องการ

  const fetchHomestays = React.useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    try {
      // NOTE: ใช้ endpoint ของ Member เพื่อดึงที่พักในชุมชนของผู้ใช้งานปัจจุบัน (Admin)
      // หรือถ้ามี endpoint admin โดยเฉพาะก็เปลี่ยนได้เลย
      const response = await axios.get(`${apiUrl}/admin/list-homestays`, {
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
  }, []);

  React.useEffect(() => {
    const timerId = setTimeout(() => {
      // ดึงข้อมูลเมื่อมีการพิมพ์ หรือถ้า query ว่าง (อาจจะดึงทั้งหมดมาแสดงตอน focus)
      if (homestayQuery || document.activeElement === homestayBoxRef.current?.querySelector('input')) {
        fetchHomestays(homestayQuery);
      }
    }, 250);
    return () => clearTimeout(timerId);
  }, [homestayQuery, fetchHomestays]);

  const chooseHomestay = (homestay: HomestayOption) => {
    setSelectedHomestay(homestay);
    setHomestayQuery("");
    setHomestayOptions([]);
    setOpenHomestayBox(false);
    setFormField("tagId" as any, formState.tagId);
  };

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

  const handleMapChange = React.useCallback(([latitude, longitude]: [number, number]) => {
    setFormField("latitude", String(latitude));
    setFormField("longitude", String(longitude));
    setPosition([latitude, longitude]);
  }, [setFormField]);

  const handleConfirmSave = async () => {
    setIsConfirmModalOpen(false);
    if (isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
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

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      coverFiles.forEach((file: any) => formData.append("cover", file));
      galleryFiles.forEach((file: any) => formData.append("gallery", file));
      videoFiles.forEach((file: any) => formData.append("video", file));

      // NOTE: Endpoint สำหรับ Admin Create
      await axios.post(`${apiUrl}/admin/package`, formData, {
        withCredentials: true,
      });

      // นำทางกลับไปยังหน้ารายการ
      navigate("/admin/packages/all");
    } catch (error: any) {
      console.error("Create package error:", error?.response?.data);
      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "สร้างแพ็กเกจไม่สำเร็จ",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

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
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xl mb-1 group hover"
          aria-label="ย้อนกลับ"
        >
          <Icon icon="lucide:arrow-left" width={22} />
          <span className="text-xl font-semibold ">สร้างแพ็กเกจใหม่</span>
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
                    return newState;
                  });
                }}
              />
              <div className="grid grid-cols-2 gap-y-[6px] gap-x-[12px] mt-2">
                <div>{!!formErrors.province && <div className="text-red-600 text-sm">{formErrors.province}</div>}</div>
                <div>{!!formErrors.district && <div className="text-red-600 text-sm">{formErrors.district}</div>}</div>
                <div>{!!formErrors.subDistrict && <div className="text-red-600 text-sm">{formErrors.subDistrict}</div>}</div>
                <div>{!!formErrors.postalCode && <div className="text-red-600 text-sm">{formErrors.postalCode}</div>}</div>
              </div>
            </div>

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

            <div className="md:col-span-2">
              {!loading && (
                <MapPicker
                  startingPosition={position}
                  startingZoom={13}
                  onChange={handleMapChange}
                />
              )}
            </div>
          </div>
        </section>

        {/* ผู้ดูแล + ความจุ */}
        <section className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="relative">
              <CommunityMemberSelector
                communityId={communityId}
                value={formState.overseerMemberId ? Number(formState.overseerMemberId) : undefined}
                member={currentOverseer}
                disabled={loading}
                error={!!formErrors.overseerMemberId}
                helperText={formErrors.overseerMemberId}
                onChange={(newId) => {
                  setFormField("overseerMemberId", newId ? String(newId) : "");
                  setCurrentOverseer(null);
                }}
              />
            </div>
          </div>

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
              if (date) setFormField("startDate", date.toISOString().split("T")[0] as any);
              else setFormField("startDate", "" as any);
            }}
            minDate={new Date()}
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
              if (date) setFormField("endDate", date.toISOString().split("T")[0] as any);
              else setFormField("endDate", "" as any);
            }}
            minDate={new Date()}
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
              if (date) setFormField("openDate", date.toISOString().split("T")[0] as any);
              else setFormField("openDate", "" as any);
            }}
            minDate={new Date()}
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
              if (date) setFormField("closeDate", date.toISOString().split("T")[0] as any);
              else setFormField("closeDate", "" as any);
            }}
            minDate={new Date()}
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

        {/* แท็ก / ราคา */}
        <section className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-1">
            <div ref={searchBoxRef}>
              <TagSelector value={tagIds} onChange={(ids) => setTagIds(ids)} />
            </div>
          </div>

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

        {/* สื่อแพ็กเกจ */}
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
                  if (homestayQuery.trim() === "" || homestayOptions.length > 0) {
                    fetchHomestays(homestayQuery);
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

          {selectedHomestay && (
            <>
              <div className="grid md:grid-cols-4 gap-4 mb-3">
                <BoxDateInput
                  id="hsCheckInDate"
                  label="วัน/เดือน/ปี (พ.ศ.) ที่เช็กอินพัก"
                  value={hsCheckInDateObj}
                  onChange={(date) => {
                    setHsCheckInDateObj(date);
                    if (date) setHsCheckInDate(date.toISOString().split("T")[0]);
                    else setHsCheckInDate("");
                  }}
                  minDate={new Date()}
                  maxDate={new Date("2100-12-31")}
                  errorText={(formErrors as any).hsCheckInDate}
                />
                <BoxTimeInput
                  label="เวลาเช็กอิน"
                  value={hsCheckInTime}
                  onChange={(time) => setHsCheckInTime(time)}
                  required
                  errorText={(formErrors as any).hsCheckInTime}
                />
                <BoxDateInput
                  id="hsCheckOutDate"
                  label="วัน/เดือน/ปี (พ.ศ.) ที่เช็กเอาท์"
                  value={hsCheckOutDateObj}
                  onChange={(date) => {
                    setHsCheckOutDateObj(date);
                    if (date) setHsCheckOutDate(date.toISOString().split("T")[0]);
                    else setHsCheckOutDate("");
                  }}
                  minDate={new Date()}
                  maxDate={new Date("2100-12-31")}
                  errorText={(formErrors as any).hsCheckOutDate}
                />
                <BoxTimeInput
                  label="เวลาเช็กเอาท์"
                  value={hsCheckOutTime}
                  onChange={(time) => setHsCheckOutTime(time)}
                  required
                  errorText={(formErrors as any).hsCheckOutTime}
                />

              </div>

              <div className="relative rounded-xl border p-4 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={clearHomestay}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border hover:bg-red-50"
                  title="เอาที่พักนี้ออก"
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
                {isSaving ? "กำลังบันทึก..." : "สร้างแพ็กเกจ"}
              </Button>
            </fieldset>
          </div>
        </div>
      </form>

      <Modal
        open={isConfirmModalOpen}
        title="ยืนยันการสร้างแพ็กเกจ"
        text="คุณต้องการสร้างแพ็กเกจนี้ใช่หรือไม่?"
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

export default CreatePackagePage;
