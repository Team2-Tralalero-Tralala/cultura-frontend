// src/Pages/SuperAdmin/EditHomestayPage.tsx

/**
 * คำอธิบาย : หน้าแก้ไขข้อมูลที่พัก (Super Admin)
 * หน้าที่หลัก:
 *   - โหลดข้อมูลที่พักจาก homestayId
 *   - ตรวจความถูกต้องด้วย zod (สอดคล้อง UI: postalCode เป็น string)
 *   - แสดงฟอร์มให้แก้ไข + ยืนยันผ่าน Modal แล้ว PATCH ไปยัง API
 * Input:
 *   - useParams(): homestayId
 *   - สถานะภายใน: form, formErrors, loading/saving state, communityId
 * Output:
 *   - PATCH ข้อมูลสำเร็จ → แจ้งข้อความและนำทางกลับหน้าแก้ชุมชน
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
import ThailandLocationSelector, { type ThailandLocation } from "@/Components/Selector/ThailandLocationSelector";
import { Modal } from "@/Components/Modal/Modal";

const API_URL = import.meta.env.VITE_API_URL as string; // เดิม: apiUrl

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
        .refine((v) => Number(v) >= 1 && Number.isInteger(Number(v)), "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"),
    totalRoom: z
        .string()
        .min(1)
        .refine((v) => Number(v) >= 1 && Number.isInteger(Number(v)), "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"),
    houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
    villageNumber: z.string().min(1, "กรุณากรอกหมู่ที่"),
    // province: z.string().min(1, "กรุณาเลือกจังหวัด"),
    // district: z.string().min(1, "กรุณาเลือกอำเภอ/เขต"),
    // subDistrict: z.string().min(1, "กรุณาเลือกตำบล/แขวง"),
    // postalCode: z.number().min(1, "กรุณาเลือกรหัสไปรษณีย์"),
    addressDetail: z.string().optional().default(""),
    placeQuery: z.string().optional().default(""),
});

type FormErrors = Partial<Record<keyof HomestayForm, string>>;

export default function EditHomestayPage() {
    const { homestayId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = React.useState<HomestayForm>(initialForm);
    const [formErrors, setFormErrors] = React.useState<FormErrors>({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [communityId, setCommunityId] = React.useState<number | null>(null);

    // ❗ ทำให้เหมือน Edit Store: ใช้ position เป็น source of truth
    const [position, setPosition] = React.useState<[number, number]>([0, 0]);
    const startingZoom = 12;

    /**
     * โหลดข้อมูลที่พักจาก homestayId แล้วแมปใส่ฟอร์ม + ตั้ง position
     */
    React.useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const id = Number(homestayId);
                if (!id) throw new Error("homestayId ไม่ถูกต้อง");

                const res = await axios.get(`${API_URL}/super/homestays/${id}`, { withCredentials: true });
                const hs = res?.data?.data ?? res?.data;
                if (!hs) throw new Error("ไม่พบข้อมูลที่พัก");

                setCommunityId(hs.community?.id ?? null);

                const lat = Number(hs.location?.latitude ?? 13.7563);
                const lng = Number(hs.location?.longitude ?? 100.5018);

                setPosition([lat, lng]); // ✅ ใช้ position เป็นจริง
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

                    // เก็บไว้แสดงเฉย ๆ (ไม่ใช้เป็น source of truth)
                    latitude: String(lat),
                    longitude: String(lng),

                    placeQuery: "",
                });
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
     * ตรวจ field เดี่ยวด้วย zod
     */
    const validateField = (key: keyof HomestayForm, val: any) => {
        const base = { ...form, [key]: val };
        const r = schema.safeParse(base);
        setFormErrors((prev) => ({
            ...prev,
            [key]: r.success ? undefined : r.error.issues.find((i) => i.path[0] === key)?.message,
        }));
    };

    /**
     * ตรวจทั้งฟอร์ม
     */
    const validateAll = () => {
        const r = schema.safeParse(form);
        if (r.success) {
            setFormErrors({});
            return true;
        }
        const errs: FormErrors = {};
        for (const issue of r.error.issues) {
            errs[issue.path[0] as keyof HomestayForm] = issue.message;
        }
        setFormErrors(errs);
        return false;
    };

    /**
     * setField พร้อม validate ตามคีย์
     */
    const setField = <K extends keyof HomestayForm>(key: K, value: HomestayForm[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        validateField(key, value);
    };

    const normalizeOrDefault = (v: string, fallback = "") => {
        const t = (v ?? "").toString().trim();
        return t.length ? t : fallback;
    };

    /**
     * 👉 ป้องกันลูป: onChange ของแผนที่ที่ "ไม่ set ซ้ำเมื่อค่าเดิมเท่าเดิม"
     *    และมี identity คงที่ด้วย useCallback
     */
    const handleMapChange = React.useCallback((pos: [number, number]) => {
        setPosition((prev) =>
            prev[0] === pos[0] && prev[1] === pos[1] ? prev : pos
        );
    }, []);

    /**
     * กด "บันทึก" → validate → เปิด Modal
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
     * ยืนยันบันทึก → สร้าง payload สดจากฟอร์ม + ใช้ position เป็นแหล่ง lat/lng
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
                location: {
                    houseNumber: normalizeOrDefault(form.houseNumber),
                    villageNumber: Number(form.villageNumber) || null,
                    subDistrict: normalizeOrDefault(form.subDistrict),
                    district: normalizeOrDefault(form.district),
                    province: normalizeOrDefault(form.province),
                    postalCode: normalizeOrDefault(form.postalCode),
                    detail: normalizeOrDefault(form.addressDetail),

                    // ✅ ใช้ตำแหน่งจาก state position (source of truth)
                    latitude: position[0],
                    longitude: position[1],
                },
            };

            await axios.put(`${API_URL}/super/homestay/edit/${id}`, payload, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            setSuccessMessage("อัปเดตที่พักสำเร็จ");
            if (communityId) navigate(`/super/community/edit/${communityId}`);
            else navigate(-1);
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
                <button
                    type="button"
                    className="flex items-center gap-2 text-xl"
                    onClick={() =>
                        communityId
                            ? navigate(`/super/community/edit/${communityId}`)
                            : navigate(-1)
                    }
                >
                    <Icon icon="mingcute:arrow-left-line" width={22} />
                    <span>แก้ไขที่พัก</span>
                </button>
            </div>

            {/* Loading */}
            {isLoading ? (
                <div className="rounded-lg bg-white p-5 shadow-sm border">กำลังโหลดข้อมูล...</div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm border">
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
                                    required
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
                                        placeholder="คำอธิบายที่อยู่"
                                        value={form.addressDetail}
                                        onChange={(e) => setField("addressDetail", e.target.value)}
                                        error={!!formErrors.addressDetail}
                                        helperText={formErrors.addressDetail}
                                    />
                                </div>
                            </div>

                            {/* ค้นหาสถานที่ + แผนที่ */}
                            <div className="space-y-3">
                                {/* ✅ แสดงแผนที่เมื่อมีพิกัดแล้ว */}
                                {position[0] !== 0 && position[1] !== 0 && (
                                    <MapPicker
                                        startingPosition={position}
                                        startingZoom={startingZoom}
                                        onChange={handleMapChange}
                                    />
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-2 pt-2">
                        <div className="w-36">
                            <Button type="cancel" onClick={() => (communityId ? navigate(`/super/community/edit/${communityId}`) : navigate(-1))}>
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

            {/* Modal ยืนยัน */}
            <Modal
                open={confirmOpen}
                title="ยืนยันการบันทึกข้อมูลที่พัก"
                text="คุณต้องการอัปเดตข้อมูลที่พักนี้หรือไม่"
                confirmText="ยืนยัน"
                cancelText="ยกเลิก"
                onConfirm={onConfirmSave}
                onCancel={() => {
                    setConfirmOpen(false);
                }}
            />
        </div>
    );
}
