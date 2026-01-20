/**
 * คำอธิบาย: Component หน้าสำหรับสร้างแพ็กเกจใหม่ (สำหรับ Admin) รองรับการกรอกข้อมูลแพ็กเกจ อัปโหลดรูปภาพ/วิดีโอ และเลือกที่พัก
 */
import React, { useEffect, useState } from "react";
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
import UploadCard from "@/Components/upload/UploadCard";
import { TagSelector } from "@/Components/Selector/TagSelector";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import {
  PackageStatusDropdown,
  type PackageStatus,
} from "@/Components/Selector/PackageStatusDropdown";
import BoxDateInput from "@/Components/calendar/InputCalendar/BoxDateInput";
import BoxTimeInput from "@/Components/calendar/InputCalendar/BoxTimeInput";

const apiUrl = import.meta.env.VITE_API_URL as string;

/**
 * คำอธิบาย: ตัดช่องว่างและคืนค่า fallback หากสตริงว่าง
 * Input: inputValue (ค่าที่ต้องการตรวจสอบ), fallback (ค่าที่จะคืนกลับถ้าว่าง)
 * Output: ค่า string ที่ตัดช่องว่างแล้ว หรือค่า fallback
 */
function normalizeOrDefault(inputValue: string, fallback = "-") {
  const trimmed = (inputValue ?? "").toString().trim();
  return trimmed.length ? trimmed : fallback;
}

/**
 * คำอธิบาย: แปลงค่าใดๆ เป็น number หรือ null
 * Input: value (ค่าที่ต้องการแปลง)
 * Output: ค่าตัวเลข หรือ null หากแปลงไม่ได้
 */
function toIntOrNull(value: any): number | null {
  const trimmed = String(value ?? "").trim();
  if (trimmed === "") return null;
  const numberValue = Number(trimmed);
  return Number.isFinite(numberValue) ? numberValue : null;
}

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
  isAddHomestay: boolean;
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
  isAddHomestay: false,
};

const packageSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อแพ็กเกจ"),
  description: z.string().min(1, "กรุณากรอกรายละเอียดแพ็กเกจ"),
  statusPackage: z.enum(["DRAFT", "PUBLISH", "UNPUBLISH"]),
  houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล/แขวง"),
  addressDetail: z.string().min(1, "กรุณากรอกรายละเอียดที่อยู่"),
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

/**
 * คำอธิบาย: Component หน้าสำหรับสร้างแพ็กเกจใหม่ (สำหรับ Admin)
 * หน้าที่:
 * - จัดการ state ฟอร์มแพ็กเกจ
 * - ตรวจสอบข้อมูล (Validation)
 * - ค้นหาและเลือกที่พัก (Homestay) เพื่อผูกกับแพ็กเกจ
 * - บันทึกข้อมูลแพ็กเกจลงฐานข้อมูล
 */
export const CreatePackagePage = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<PackageForm>(initialFormState);
  const [communityId, setCommunityId] = useState<number | undefined>(undefined);
  const [currentOverseer, setCurrentOverseer] = useState<CommunityMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<PackageErrors>({});
  const [position, setPosition] = useState<[number, number]>([13.7563, 100.5018]);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);
  const [openDateObj, setOpenDateObj] = useState<Date | null>(null);
  const [closeDateObj, setCloseDateObj] = useState<Date | null>(null);
  const [homestayCheckInDateObject, setHomestayCheckInDateObject] = useState<Date | null>(null);
  const [homestayCheckOutDateObject, setHomestayCheckOutDateObject] = useState<Date | null>(null);

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูลราย Field
   * Input: field (ชื่อ Field), value (ค่าของ Field), newState (ข้อมูลฟอร์มใหม่)
   * Output: -
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
    [],
  );

  /**
   * คำอธิบาย: ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลทั้งหมดในฟอร์มก่อนบันทึก
   * Input: -
   * Output: สถานะความถูกต้อง (Boolean)
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
      if (!homestayCheckInDate) {
        (setFormErrors as any)((prev: any) => ({
          ...prev,
          homestayCheckInDate: "กรุณาเลือกวันที่เช็กอิน",
        }));
        isValid = false;
      }
      if (!homestayCheckInTime) {
        (setFormErrors as any)((prev: any) => ({
          ...prev,
          homestayCheckInTime: "กรุณาเลือกเวลาเช็กอิน",
        }));
        isValid = false;
      }
      if (!homestayCheckOutDate) {
        (setFormErrors as any)((prev: any) => ({
          ...prev,
          homestayCheckOutDate: "กรุณาเลือกวันที่เช็กเอาท์",
        }));
        isValid = false;
      }
      if (!homestayCheckOutTime) {
        (setFormErrors as any)((prev: any) => ({
          ...prev,
          homestayCheckOutTime: "กรุณาเลือกเวลาเช็กเอาท์",
        }));
        isValid = false;
      }
    }
    return isValid;
  };

  type MemberOption = { id: number; fname: string; lname: string };
  const [memberQuery, setMemberQuery] = useState("");
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const isShowMemberBox = memberQuery.trim().length >= 1 && memberOptions.length > 0;

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
  const [isOpenHomestayBox, setOpenHomestayBox] = useState(false);

  React.useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (homestayBoxRef.current && !homestayBoxRef.current.contains(event.target as Node)) {
        setOpenHomestayBox(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const fetchMyCommunity = async () => {
      try {
        const response = await axios.get(`${apiUrl}/admin/community`, {
          withCredentials: true,
        });
        const myCommunityId = response.data?.data?.id;
        if (myCommunityId) {
          setCommunityId(Number(myCommunityId));
        }
      } catch (error) {
        console.error("Failed to fetch my community:", error);
      }
    };

    fetchMyCommunity();
  }, []);

  /**
   * คำอธิบาย: ฟังก์ชันดึงข้อมูลรายการที่พักจาก Server ตามคำค้นหา
   * Input: query (คำค้นหา)
   * Output: -
   */
  const fetchHomestays = React.useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    try {
      const response = await axios.get(`${apiUrl}/admin/list-homestays`, {
        params: { q: trimmedQuery, limit: 8 },
        withCredentials: true,
      });
      const rawData = response?.data?.data ?? response?.data?.items ?? response?.data ?? [];
      const options: HomestayOption[] = (Array.isArray(rawData) ? rawData : []).map(
        (homestay: any) => ({
          id: Number(homestay.id),
          name: homestay.name ?? "",
          facility: homestay.facility ?? homestay.description ?? "",
          images: homestay.homestayImage ?? homestay.images ?? [],
        }),
      );
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
      if (
        homestayQuery ||
        document.activeElement === homestayBoxRef.current?.querySelector("input")
      ) {
        fetchHomestays(homestayQuery);
      }
    }, 250);
    return () => clearTimeout(timerId);
  }, [homestayQuery, fetchHomestays]);

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับเลือกที่พักจากรายการค้นหา
   * Input: homestay (ข้อมูลที่พักที่เลือก)
   * Output: -
   */
  const chooseHomestay = (homestay: HomestayOption) => {
    setSelectedHomestay(homestay);
    setHomestayQuery("");
    setHomestayOptions([]);
    setOpenHomestayBox(false);
    setFormField("tagId" as any, formState.tagId);
  };

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับอัปเดตค่าในฟอร์มและตรวจสอบความถูกต้องทันที
   * Input: key (ชื่อ Field), value (ค่าใหม่)
   * Output: -
   */
  const setFormField = React.useCallback(
    <KeyValue extends keyof PackageForm>(key: KeyValue, value: PackageForm[KeyValue]) => {
      setFormState((prev) => {
        const newState = { ...prev, [key]: value };
        validateField(key, value, newState);
        return newState;
      });
    },
    [validateField],
  );

  const [homestayCheckInDate, setHomestayCheckInDate] = useState("");
  const [homestayCheckInTime, setHomestayCheckInTime] = useState("");
  const [homestayCheckOutDate, setHomestayCheckOutDate] = useState("");
  const [homestayCheckOutTime, setHomestayCheckOutTime] = useState("");
  const [homestayBookedRoom, setHomestayBookedRoom] = useState<string>("1");

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับล้างข้อมูลที่พักที่เลือกไว้
   * Input: -
   * Output: -
   */
  const clearHomestay = () => {
    setSelectedHomestay(null);
    setHomestayCheckInDateObject(null);
    setHomestayCheckInDate("");
    setHomestayCheckInTime("");
    setHomestayCheckOutDateObject(null);
    setHomestayCheckOutDate("");
    setHomestayCheckOutTime("");
    setHomestayBookedRoom("1");
  };

  /**
   * คำอธิบาย: ฟังก์ชันจัดการเมื่อมีการเปลี่ยนตำแหน่งบนแผนที่
   * Input: [latitude, longitude] (พิกัดละติจูดและลองจิจูด)
   * Output: - (อัปเดต state ในฟอร์ม)
   */
  const handleMapChange = React.useCallback(
    ([latitude, longitude]: [number, number]) => {
      setFormField("latitude", String(latitude));
      setFormField("longitude", String(longitude));
      setPosition([latitude, longitude]);
    },
    [setFormField],
  );

  /**
   * คำอธิบาย: ฟังก์ชันยืนยันการบันทึกข้อมูลและส่งข้อมูลไปยัง Server
   * Input: -
   * Output: -
   */
  const handleConfirmSave = async () => {
    setIsConfirmModalOpen(false);
    if (isSaving) return;
    setIsSaving(true);

    try {
      const overseerIdVal = Number(formState.overseerMemberId);
      const safeOverseerId = overseerIdVal > 0 ? overseerIdVal : null;

      const payload = {
        overseerMemberId: safeOverseerId,

        name: normalizeOrDefault(formState.name),
        description: formState.description || "", // Draft อนุญาตให้ว่าง
        statusPackage: formState.statusPackage,

        capacity: Math.max(1, Number(formState.capacity || 0)),
        price: Math.max(0, Number(formState.price || 0)),
        warning: formState.facility || "",

        // วันที่ต้องส่งเป็น null ถ้าไม่มีค่า (ห้ามส่ง "-")
        startDate: formState.startDate || null,
        dueDate: formState.endDate || null,
        bookingOpenDate: formState.openDate || null,
        bookingCloseDate: formState.closeDate || null,

        // ... (เวลา คงเดิม) ...
        ...(formState.startTime.trim() && { startTime: formState.startTime.trim() }),
        ...(formState.endTime.trim() && { endTime: formState.endTime.trim() }),
        ...(formState.openTime.trim() && { openTime: formState.openTime.trim() }),
        ...(formState.closeTime.trim() && { closeTime: formState.closeTime.trim() }),

        // Homestay
        ...(selectedHomestay &&
          homestayCheckInDate && { homestayCheckInDate: homestayCheckInDate }),
        ...(selectedHomestay &&
          homestayCheckInTime && { homestayCheckInTime: homestayCheckInTime }),
        ...(selectedHomestay &&
          homestayCheckOutDate && { homestayCheckOutDate: homestayCheckOutDate }),
        ...(selectedHomestay &&
          homestayCheckOutTime && { homestayCheckOutTime: homestayCheckOutTime }),
        ...(selectedHomestay && homestayBookedRoom && { bookedRoom: Number(homestayBookedRoom) }),

        facility: formState.facility || "",

        // [จุดสำคัญ] ต้องแปลง tagIds เป็น number array ไม่งั้นจะ Error 400
        tagIds: tagIds.map((tagIdValue) => Number(tagIdValue)),

        ...(selectedHomestay ? { homestayId: selectedHomestay.id } : {}),

        location: {
          houseNumber: formState.houseNumber || "",
          villageNumber: toIntOrNull(formState.villageNumber),
          subDistrict: formState.subDistrict || "",
          district: formState.district || "",
          province: formState.province || "",
          postalCode: formState.postalCode || "",
          detail: formState.addressDetail || "",
          latitude: Number(formState.latitude) || 0,
          longitude: Number(formState.longitude) || 0,
        },
      };
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      coverFiles.forEach((file: any) => formData.append("cover", file));
      galleryFiles.forEach((file: any) => formData.append("gallery", file));
      videoFiles.forEach((file: any) => formData.append("video", file));
      await axios.post(`${apiUrl}/admin/package`, formData, {
        withCredentials: true,
      });
      navigate("/admin/packages/all");
    } catch (error: any) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * คำอธิบาย: ฟังก์ชันจัดการเมื่อมีการกดปุ่ม Submit ฟอร์ม
   * Input: event (เหตุการณ์จากฟอร์ม)
   * Output: - (เปิด Modal ยืนยัน หรือแสดง Error)
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    if (formState.statusPackage === "DRAFT") {
      if (!formState.name.trim()) {
        setFormErrors((prev) => ({ ...prev, name: "กรุณากรอกชื่อแพ็กเกจ" }));
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setFormErrors({});
    } else {
      if (!validateAll()) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setIsConfirmModalOpen(true);
  }

  return (
    <div className="w-full max-w-none px-0 lg:px-0">
      {/* Breadcrumb */}
      <div>
        <Breadcrumb
          current={{
            label: "เพิ่มแพ็กเกจ",
            to: `/admin/package/create`,
          }}
        />
      </div>
      <form
        noValidate
        onSubmit={handleSubmit}
        className="w-full bg-white rounded-lg p-5 md:p-6 lg:p-7 shadow-sm space-y-8"
      >
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

            <div className="md:col-span-2 relative">
              <ThailandLocationSelector
                value={{
                  province: formState.province,
                  district: formState.district,
                  subdistrict: formState.subDistrict,
                  postalCode: formState.postalCode,
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
                onChange={(location: ThailandLocation) => {
                  setFormState((prev) => {
                    const newState = {
                      ...prev,
                      province: location.province ?? "",
                      district: location.district ?? "",
                      subDistrict: location.subdistrict ?? "",
                      postalCode: location.postalCode ? String(location.postalCode) : "",
                    };
                    setFormErrors((prevErrors) => ({
                      ...prevErrors,
                      province: location.province ? undefined : prevErrors.province,
                      district: location.district ? undefined : prevErrors.district,
                      subDistrict: location.subdistrict ? undefined : prevErrors.subDistrict,
                      postalCode: location.postalCode ? undefined : prevErrors.postalCode,
                    }));
                    return newState;
                  });
                }}
              />
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
              {!isLoading && (
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
                disabled={isLoading}
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
          </div>
        </section>

        {/* วันเวลา */}
        <div className="space-y-8">
          <div>
            <p className="text-base font-bold mb-4">
              กำหนดการจัดกิจกรรม <span className="text-red-500">*</span>
            </p>
            <section className="grid md:grid-cols-4 gap-5">
              <BoxDateInput
                id="startDate"
                label="วัน/เดือน/ปี (พ.ศ.) ที่เริ่มแพ็กเกจ"
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
                errorText={formErrors.startTime}
              />
              <BoxDateInput
                id="endDate"
                label="วัน/เดือน/ปี (พ.ศ.) ที่สิ้นสุดแพ็กเกจ"
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
                errorText={formErrors.endTime}
              />
            </section>
          </div>

          {/* ส่วนที่ 2: กำหนดการเปิดจองแพ็กเกจ */}
          <div>
            <p className="text-base font-bold mb-4">
              กำหนดการเปิดจองแพ็กเกจ <span className="text-red-500">*</span>
            </p>
            <section className="grid md:grid-cols-4 gap-5">
              <BoxDateInput
                id="openDate"
                label="วัน/เดือน/ปี (พ.ศ.) ที่เริ่มเปิดจอง"
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
                label="เวลาที่เริ่ม"
                value={formState.openTime}
                onChange={(time) => setFormField("openTime", time)}
                errorText={formErrors.openTime}
              />
              <BoxDateInput
                id="closeDate"
                label="วัน/เดือน/ปี (พ.ศ.) ที่สิ้นสุดการปิดจอง"
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
                label="เวลาที่สิ้นสุด"
                value={formState.closeTime}
                onChange={(time) => setFormField("closeTime", time)}
                errorText={formErrors.closeTime}
              />
            </section>
          </div>
        </div>

        {/* แท็ก / ราคา */}
        <section className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-1">
            <div ref={searchBoxRef}>
              <TagSelector
                value={tagIds}
                onChange={(selectedTagIds) => setTagIds(selectedTagIds)}
              />
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

            {isOpenHomestayBox && homestayOptions.length > 0 && (
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
                  value={homestayCheckInDateObject}
                  onChange={(date) => {
                    setHomestayCheckInDateObject(date);
                    if (date) setHomestayCheckInDate(date.toISOString().split("T")[0]);
                    else setHomestayCheckInDate("");
                  }}
                  minDate={new Date()}
                  maxDate={new Date("2100-12-31")}
                  errorText={(formErrors as any).homestayCheckInDate}
                />
                <BoxTimeInput
                  label="เวลาเช็กอิน"
                  value={homestayCheckInTime}
                  onChange={(time) => setHomestayCheckInTime(time)}
                  required
                  errorText={(formErrors as any).homestayCheckInTime}
                />
                <BoxDateInput
                  id="hsCheckOutDate"
                  label="วัน/เดือน/ปี (พ.ศ.) ที่เช็กเอาท์"
                  value={homestayCheckOutDateObject}
                  onChange={(date) => {
                    setHomestayCheckOutDateObject(date);
                    if (date) setHomestayCheckOutDate(date.toISOString().split("T")[0]);
                    else setHomestayCheckOutDate("");
                  }}
                  minDate={new Date()}
                  maxDate={new Date("2100-12-31")}
                  errorText={(formErrors as any).homestayCheckOutDate}
                />
                <BoxTimeInput
                  label="เวลาเช็กเอาท์"
                  value={homestayCheckOutTime}
                  onChange={(time) => setHomestayCheckOutTime(time)}
                  required
                  errorText={(formErrors as any).homestayCheckOutTime}
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
