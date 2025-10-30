// src/Pages/Admin/CreateHomestayPage.tsx

/**
 * หน้าที่: หน้า "เพิ่มที่พัก (รายการเดียว)" สำหรับ Admin (เจ้าของชุมชน)
 * คุณสมบัติ:
 * - ตรวจความถูกต้องด้วย zod
 * - ยืนยันก่อนบันทึกผ่าน Modal
 * - แนบไฟล์รูป (cover / gallery)
 * - ส่งข้อมูลแบบ multipart/form-data:
 * { data: JSON(HomestayDto + tagHomestays), cover[], gallery[] }
 * - Backend จะดึง communityId จาก user ที่ล็อกอินอยู่เอง
 * - เมื่อสำเร็จ กลับไปหน้า list
 */

import React from "react";
import * as z from "zod";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom"; // ลบ useParams

// Components
import Button from "@/Components/Button";
import TextField from "@/Components/TextField";
import TextArea from "@/Components/TextArea";
import MapPicker from "@/Components/MapPicker";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import ThailandLocationSelector, {
    type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import { TagSelector } from "@/Components/Selector/TagSelector";
import { Modal } from "@/Components/Modal/Modal";

// Config
const apiUrl = import.meta.env.VITE_API_URL as string;

/** ประเภทไฟล์ที่แนบมากับฟอร์ม */
type FileLike = File;

/** โครงสร้างข้อมูลฟอร์มของที่พักหนึ่งรายการ */
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

/** ค่าเริ่มต้นของฟอร์มที่พัก */
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

/** schema ตรวจสอบข้อมูลฟอร์มของแต่ละรายการ */
const homestaySchema = z.object({
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
    province: z.string().min(1, "กรุณาเลือกจังหวัด"),
    district: z.string().min(1, "กรุณาเลือกอำเภอ/เขต"),
    subDistrict: z.string().min(1, "กรุณาเลือกตำบล/แขวง"),
    postalCode: z.any(),
    addressDetail: z.string().optional().default(""),
    placeQuery: z.string().optional().default(""),
});

/** type ของ error ต่อฟิลด์ในหนึ่งรายการ */
type HSFormErrors = Partial<Record<keyof HomestayForm, string>>;

/** ตัดช่องว่างและคืน fallback หากว่าง */
function normalizeOrDefault(value: string, fallback = "") {
    const trimmed = (value ?? "").toString().trim();
    return trimmed.length ? trimmed : fallback;
}

/**
 * Component: CreateHomestayPageAdmin
 * หน้าที่:
 * - จัดการ state ของฟอร์มที่พัก 1 ชุด
 * - ตรวจสอบข้อมูล
 * - รวม payload และส่งขึ้น API (สำหรับ Admin)
 */
export default function CreateHomestayPageAdmin() {
    // const { communityId } = useParams(); // (Admin ไม่จำเป็นต้องใช้)
    const navigate = useNavigate();

    // State หลักของหน้า (สำหรับฟอร์มเดียว)
    const [form, setForm] = React.useState<HomestayForm>(initialHomestay);
    const [errors, setErrors] = React.useState<HSFormErrors>({});
    const [coverFiles, setCoverFiles] = React.useState<FileLike[]>([]);
    const [galleryFiles, setGalleryFiles] = React.useState<FileLike[]>([]);
    const [tagIds, setTagIds] = React.useState<number[]>([]);

    // State สำหรับการยืนยันและการส่ง
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [pendingPayloads, setPendingPayloads] = React.useState<any[] | null>(
        null
    );
    const [isSaving, setIsSaving] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(
        null
    );

    /**
     * คำอธิบาย: อัปเดตฟิลด์ในฟอร์ม และ validate ฟิลด์นั้นทันที
     * (เหมือนเดิม)
     */
    function setField(key: keyof HomestayForm, value: any) {
        setForm((prevForm) => {
            if (prevForm[key] === value) return prevForm;
            const nextForm = { ...prevForm, [key]: value };
            const parsed = homestaySchema.safeParse(nextForm);
            setErrors((prevErrors) => {
                const nextErrors = { ...prevErrors };
                if (parsed.success) {
                    delete nextErrors[key];
                } else {
                    const found = parsed.error.issues.find((i) => i.path[0] === key);
                    if (found) nextErrors[key] = found.message;
                    else delete nextErrors[key];
                }
                return nextErrors;
            });
            return nextForm;
        });
    }

    /**
     * คำอธิบาย: ตรวจสอบข้อมูลฟอร์มทั้งหมด
     * (เหมือนเดิม)
     */
    function validateAll(): boolean {
        const result = homestaySchema.safeParse(form);
        if (!result.success) {
            const errs: HSFormErrors = {};
            for (const issue of result.error.issues) {
                errs[issue.path[0] as keyof HomestayForm] = issue.message;
            }
            setErrors(errs);
            return false;
        }
        setErrors({});
        return true;
    }

    /**
     * คำอธิบาย: เมื่อกดบันทึก (Submit)
     * (เหมือนเดิม)
     */
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isSaving) return;

        setErrorMessage(null);
        setSuccessMessage(null);

        if (!validateAll()) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        const latStr = (form.latitude ?? "").trim();
        const lngStr = (form.longitude ?? "").trim();
        const latNum = latStr === "" ? null : Number(latStr);
        const lngNum = lngStr === "" ? null : Number(lngStr);

        const singlePayload = {
            base: {
                name: normalizeOrDefault(form.name),
                type: normalizeOrDefault(form.type),
                guestPerRoom: Math.max(1, Number(form.guestPerRoom || 0)),
                totalRoom: Math.max(1, Number(form.totalRoom || 0)),
                facility: normalizeOrDefault(form.facility),
                location: {
                    houseNumber: normalizeOrDefault(form.houseNumber),
                    villageNumber: Number(form.villageNumber) || null,
                    subDistrict: normalizeOrDefault(form.subDistrict),
                    district: normalizeOrDefault(form.district),
                    province: normalizeOrDefault(form.province),
                    postalCode: normalizeOrDefault(String(form.postalCode ?? "")),
                    detail: normalizeOrDefault(form.addressDetail),
                    latitude: latNum,
                    longitude: lngNum,
                },
                tagHomestays: Array.isArray(tagIds) ? tagIds : [],
            },
            coverFiles: coverFiles,
            galleryFiles: galleryFiles,
        };

        setPendingPayloads([singlePayload]);
        setIsConfirmOpen(true);
    }

    /**
     * คำอธิบาย: handler สำหรับ MapPicker
     * (เหมือนเดิม)
     */
    const onMapChange = React.useCallback(
        (pos: [number, number]) => {
            const [lat, lng] = pos;
            setForm((prev) => ({
                ...prev,
                latitude: String(lat),
                longitude: String(lng),
            }));
        },
        []
    );

    /**
     * คำอธิบาย: เมื่อยืนยันบันทึกใน Modal (ปรับปรุง API Endpoint)
     */
    const onConfirmSave = async () => {
        setIsConfirmOpen(false);
        if (!pendingPayloads || pendingPayloads.length === 0) return;

        try {
            setIsSaving(true);
            setErrorMessage(null);
            setSuccessMessage(null);

            // (Admin ไม่จำเป็นต้องใช้ communityId จาก param)
            // const cid = Number(communityId);
            // if (!cid) throw new Error("communityId ไม่ถูกต้อง");

            for (const pendingPayload of pendingPayloads) {
                const dataPayload = { ...pendingPayload.base };
                const formData = new FormData();
                formData.append("data", JSON.stringify(dataPayload));

                if (pendingPayload.coverFiles?.length) {
                    formData.append("cover", pendingPayload.coverFiles[0]);
                }
                if (Array.isArray(pendingPayload.galleryFiles)) {
                    for (const gf of pendingPayload.galleryFiles) {
                        formData.append("gallery", gf);
                    }
                }

                // *** เปลี่ยน Endpoint เป็นของ Admin (ไม่ต้องระบุ communityId) ***
                await axios.post(`${apiUrl}/admin/community/homestay`, formData, {
                    withCredentials: true,
                });
            }

            setSuccessMessage("บันทึกที่พักสำเร็จ");
            // *** เปลี่ยนเส้นทางกลับไปหน้า List ของ Admin ***
            navigate(`/admin/homestays/all`);

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

    // Memoize ค่าสำหรับ MapPicker (เหมือนเดิม)
    const startingPosition = React.useMemo<[number, number]>(() => {
        const numberLat = Number(form.latitude);
        const numberLng = Number(form.longitude);
        return [
            !Number.isNaN(numberLat) && form.latitude !== "" ? numberLat : 13.7563,
            !Number.isNaN(numberLng) && form.longitude !== "" ? numberLng : 100.5018,
        ];
    }, [form.latitude, form.longitude]);

    // ===== Render (ปรับปรุง Header/Back button) =====
    return (
        <div className="w-full max-w-none px-8">
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

            {/* Header (ปรับปรุง Back button) */}
            <div className="flex items-center justify-between mb-3">
                <div
                    className="flex items-center gap-2 text-xl cursor-pointer"
                    // *** เปลี่ยนเส้นทางกลับไปหน้า List ของ Admin ***
                    onClick={() => navigate(`/admin/homestays/all`)}
                >
                    <Icon icon="mingcute:arrow-left-line" width={22} />
                    <span>เพิ่มที่พัก</span>
                </div>
            </div>

            {/* Form (เหมือนเดิม) */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm border">
                    <h2 className="text-lg font-semibold mb-4">ข้อมูลที่พัก</h2>
                    <div className="space-y-6">
                        {/* ชื่อ/ประเภท/สิ่งอำนวยความสะดวก */}
                        <div className="grid md:grid-cols-2 gap-5">
                            <TextField
                                id="name"
                                label="ชื่อที่พัก"
                                required
                                placeholder="พิมพ์ชื่อที่พัก"
                                value={form.name}
                                onChange={(e) => setField("name", e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                            <TextField
                                id="type"
                                label="ประเภทที่พัก"
                                required
                                placeholder="พิมพ์ประเภทของที่พัก"
                                value={form.type}
                                onChange={(e) => setField("type", e.target.value)}
                                error={!!errors.type}
                                helperText={errors.type}
                            />
                            <div className="md:col-span-2">
                                <TextArea
                                    id="facility"
                                    label="สิ่งอำนวยความสะดวก"
                                    required
                                    placeholder="ใส่รายละเอียดความสะดวกสบายของที่พัก"
                                    value={form.facility}
                                    onChange={(e) => setField("facility", e.target.value)}
                                    error={!!errors.facility}
                                    helperText={errors.facility}
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
                                error={!!errors.totalRoom}
                                helperText={errors.totalRoom}
                            />
                            <TextField
                                id="guestPerRoom"
                                label="จำนวนผู้เข้าพักต่อห้อง"
                                required
                                type="number"
                                placeholder="กรอกจำนวนผู้เข้าพักต่อห้อง"
                                value={form.guestPerRoom}
                                onChange={(e) => setField("guestPerRoom", e.target.value)}
                                error={!!errors.guestPerRoom}
                                helperText={errors.guestPerRoom}
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
                                error={!!errors.houseNumber}
                                helperText={errors.houseNumber}
                            />
                            <TextField
                                id="villageNumber"
                                label="หมู่ที่"
                                placeholder="หมู่ที่"
                                value={form.villageNumber}
                                onChange={(e) => setField("villageNumber", e.target.value)}
                                error={!!errors.villageNumber}
                                helperText={errors.villageNumber}
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
                                        setField("province", loc.province ?? "");
                                        setField("district", loc.district ?? "");
                                        setField("subDistrict", loc.subdistrict ?? "");
                                        setField(
                                            "postalCode",
                                            (loc.postalCode ?? "").toString()
                                        );
                                    }}
                                />
                                <div className="grid grid-cols-2 gap-y-[6px] gap-x-[12px] mt-2">
                                    <div>
                                        {!!errors.province && (
                                            <div className="text-red-600 text-sm">
                                                {errors.province}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        {!!errors.district && (
                                            <div className="text-red-600 text-sm">
                                                {errors.district}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        {!!errors.subDistrict && (
                                            <div className="text-red-600 text-sm">
                                                {errors.subDistrict}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        {!!errors.postalCode && (
                                            <div className="text-red-600 text-sm">
                                                {errors.postalCode}
                                            </div>
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
                                    error={!!errors.addressDetail}
                                    helperText={errors.addressDetail}
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
                                {!!errors.latitude && (
                                    <div className="text-red-600 text-sm">
                                        {errors.latitude}
                                    </div>
                                )}
                                {!!errors.longitude && (
                                    <div className="text-red-600 text-sm">
                                        {errors.longitude}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* แท็ก */}
                        <div className="md:col-span-2">
                            <TagSelector
                                value={tagIds}
                                onChange={setTagIds}
                            />
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
                                    อัปโหลดรูปภาพเพิ่มเติม{" "}
                                    <span className="text-red-600">*</span>
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
                </section>

                {/* Action Buttons (ปรับปรุง Cancel button) */}
                <div className="flex justify-end gap-2 pt-2">
                    <div className="w-36">
                        {/* *** เปลี่ยนเป็น navigate ไปหน้า list ของ Admin *** */}
                        <Button type="cancel" onClick={() => navigate('/admin/homestays/all')}>
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

            {/* Modal ยืนยัน (เหมือนเดิม) */}
            <Modal
                open={isConfirmOpen}
                title="ยืนยันการบันทึกที่พัก"
                text={`คุณต้องการบันทึกที่พักจำนวน ${pendingPayloads?.length ?? 0
                    } รายการหรือไม่`}
                confirmText="ยืนยัน"
                cancelText="ยกเลิก"
                onConfirm={onConfirmSave}
                onCancel={() => {
                    setIsConfirmOpen(false);
                    setPendingPayloads(null);
                }}
            />
        </div>
    );
}
