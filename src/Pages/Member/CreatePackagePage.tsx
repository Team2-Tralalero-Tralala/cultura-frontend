// src/Pages/Member/CreatePackageMember.tsx
/**
 * คำอธิบาย (Component Header)
 * - หน้าสร้างแพ็กเกจ (บทบาท Member)
 * หน้าที่หลัก
 *   1) รับค่าจากฟอร์มเพื่อสร้างแพ็กเกจใหม่
 *   2) ตรวจสอบความครบถ้วนขั้นต่ำของฟิลด์ก่อนส่ง
 *   3) เรียก API เพื่อบันทึกข้อมูลแล้วนำผู้ใช้กลับไปยังรายการแพ็กเกจ
 * หมายเหตุ
 *   - ใช้ TextField เป็น input มาตรฐานเพื่อความสม่ำเสมอของ UI
 *   - แนบ startTime/endTime เฉพาะเมื่อผู้ใช้กรอก (เหมือน Admin)
 */

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TextField from "../../Components/TextField";
import MapPicker from "../../Components/MapPicker";
import { Icon } from "@iconify/react";
import { AdminSelector } from "@/Components/Selector/AdminSelector"; // หรือปรับ path ให้ตรงโปรเจกต์


const apiUrl = import.meta.env.VITE_API_URL;

// ===== Helpers (ชื่อ/พฤติกรรมให้ตรงกับ Admin) =====
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

export const CreatePackagePage: React.FC = () => {
    const navigate = useNavigate();

    const [formState, setFormState] = useState<PackageForm>(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    // + types ภายในไฟล์
    type TagOption = { id: number; name: string };

    // + states
    const [tagQuery, setTagQuery] = useState("");
    const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
    const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);

    // + ค้นหาแท็กแบบ debounce
    // + เพิ่ม ref และ state สำหรับควบคุม dropdown และ click-outside
    const searchBoxRef = React.useRef<HTMLDivElement | null>(null);
    const [openTagBox, setOpenTagBox] = useState(false);

    // ปิด dropdown เมื่อคลิกนอกกรอบ
    React.useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!searchBoxRef.current) return;
            if (!searchBoxRef.current.contains(e.target as Node)) setOpenTagBox(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    const MIN_TAG_QUERY_CHARS = 2;
    // เทียบข้อความแบบไม่สนตัวพิมพ์/ช่องว่าง
    const norm = (s: string) => (s ?? "").toLowerCase().normalize("NFC").trim();
    // ปรับค้นหา: กรองตัวเลือกที่ถูกเลือกแล้ว + เปิด dropdown เมื่อมีผลลัพธ์
    React.useEffect(() => {
        const q = tagQuery.trim();

        // ยังพิมพ์ไม่ถึงขั้นต่ำ ⇒ ไม่ค้นหาและปิด dropdown
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

                // กรองซ้ำฝั่ง client ให้ “ตรงกับที่พิมพ์จริง”
                const byText = opts.filter((o) => norm(o.name).includes(norm(q)));

                // ตัดตัวที่ถูกเลือกแล้วทิ้ง
                const filtered = byText.filter((o) => !selectedTags.some((s) => s.id === o.id));

                setTagOptions(filtered);
                setOpenTagBox(filtered.length > 0);
            } catch (e) {
                console.error("search tags error:", e);
            }
        }, 250);

        return () => clearTimeout(t);
    }, [tagQuery, selectedTags]);


    // ปรับ add/remove
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
    images?: { image: string }[];  // เผื่อ backend ส่งรูปมาด้วย
    };

    const [homestayQuery, setHomestayQuery] = useState("");
    const [homestayOptions, setHomestayOptions] = useState<HomestayOption[]>([]);
    const [selectedHomestay, setSelectedHomestay] = useState<HomestayOption | null>(null);

    const homestayBoxRef = React.useRef<HTMLDivElement | null>(null);
    const [openHomestayBox, setOpenHomestayBox] = useState(false);

    // click-outside สำหรับกล่องค้นหาที่พัก
    React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
        if (homestayBoxRef.current && !homestayBoxRef.current.contains(e.target as Node)) {
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
            // ✅ เปลี่ยน endpoint ให้ตรงระบบคุณ
            // แนะนำ: GET `${apiUrl}/member/community/homestays?q=${q}&limit=8`
            const res = await axios.get(`${apiUrl}/member/community/homestays`, {
                params: { q, limit: 8 },
                withCredentials: true,
            });
            const raw = res?.data?.data ?? res?.data?.items ?? res?.data ?? [];
            const opts: HomestayOption[] = (Array.isArray(raw) ? raw : []).map((h: any) => ({
                id: Number(h.id),
                name: h.name ?? "",
                facility: h.facility ?? h.description ?? "",
                images: h.homestayImage ?? h.images ?? [],
            }));
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
    // เก็บ id ลงฟอร์มไว้ส่ง
    setFormField("tagId" as any, formState.tagId); // no-op กัน TS บ่น (ไม่แก้โครงสร้าง)
    // ถ้าต้องการเก็บลง state ฟอร์มโดยตรง แนะนำเพิ่มคีย์ใหม่ในฟอร์ม:
    // setFormField("homestayId" as any, String(h.id));
    };
    const clearHomestay = () => setSelectedHomestay(null);


    const setFormField = <K extends keyof PackageForm>(key: K, value: PackageForm[K]) =>
        setFormState((prev) => ({ ...prev, [key]: value }));


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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // ให้เบราว์เซอร์ตรวจ required/ชนิด input ก่อน
        const formEl = e.currentTarget;
        if (!formEl.reportValidity()) return;

        if (!window.confirm("ยืนยันการสร้างแพ็กเกจใช่หรือไม่?")) return;

        // (คง custom validation เดิมต่อจากนี้)
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
                statusPackage: "DRAFT" as const,
                statusApprove: "PENDING" as const,
                startDate: normalizeOrDefault(formState.startDate),
                dueDate: normalizeOrDefault(formState.endDate),
                ...(formState.startTime.trim() && { startTime: formState.startTime.trim() }),
                ...(formState.endTime.trim() && { endTime: formState.endTime.trim() }),
                openBookingAt: normalizeOrDefault(formState.openDate),
                closeBookingAt: normalizeOrDefault(formState.closeDate),
                ...(formState.openTime.trim() && { openTime: formState.openTime.trim() }),
                ...(formState.closeTime.trim() && { closeTime: formState.closeTime.trim() }),
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

            await axios.post(`${apiUrl}/member/package`, payload, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            alert("สร้างแพ็กเกจสำเร็จ!");
            navigate("/member/packages/all");
        } catch (error: any) {
            console.error("Create package (member) error:", error?.response?.data);
            setErrorMessage(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "สร้างแพ็กเกจไม่สำเร็จ"
            );
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSaving(false);
        }
    }
    const startPos = React.useMemo(() => [
        Number(formState.latitude) || 13.7563,
        Number(formState.longitude) || 100.5018,
    ] as [number, number],
        [formState.latitude, formState.longitude]
    );

    return (
        <div className="w-full max-w-none px-0 lg:px-0">
            {errorMessage && <div className="text-red-600 text-sm">{errorMessage}</div>}
            {successMessage && <div className="text-emerald-700 text-sm">{successMessage}</div>}

            <form
                onSubmit={handleSubmit}
                className="w-full bg-white rounded-lg p-5 md:p-6 lg:p-7 shadow-sm space-y-8"
            >
                <label className="block text-xl mb-1">สร้างแพ็กเกจ</label>

                {/* ชื่อ/คำอธิบาย */}
                <section className="space-y-4">
                    <TextField
                        id="name"
                        label="ชื่อแพ็กเกจ"
                        required
                        placeholder="ชื่อแพ็กเกจ"
                        value={formState.name}
                        onChange={(e) => setFormField("name", e.target.value)}
                    />
                    <div>
                        <label className="block text-base font-semibold mb-1">
                            คำอธิบายแพ็กเกจ <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            className="w-full rounded-form border px-3 py-2 min-h-[120px]"
                            placeholder="คำอธิบายแพ็กเกจ"
                            value={formState.description}
                            onChange={(e) => setFormField("description", e.target.value)}
                            required
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
                            onChange={(e) => setFormField("houseNumber", e.target.value)}
                        />
                        <TextField
                            id="villageNumber"
                            label="หมู่ที่"
                            required
                            placeholder="กรอกหมู่ของชุมชน"
                            value={formState.villageNumber}
                            onChange={(e) => setFormField("villageNumber", e.target.value)}
                        />
                        <TextField
                            id="province"
                            label="จังหวัด"
                            required
                            placeholder="เลือกจังหวัด"
                            value={formState.province}
                            onChange={(e) => setFormField("province", e.target.value)}
                        />
                        <TextField
                            id="district"
                            label="อำเภอ / เขต"
                            required
                            placeholder="เลือกอำเภอ / เขต"
                            value={formState.district}
                            onChange={(e) => setFormField("district", e.target.value)}
                        />
                        <TextField
                            id="subDistrict"
                            label="ตำบล / แขวง"
                            required
                            placeholder="เลือกตำบล / แขวง"
                            value={formState.subDistrict}
                            onChange={(e) => setFormField("subDistrict", e.target.value)}
                        />
                        <TextField
                            id="postalCode"
                            label="รหัสไปรษณีย์"
                            required
                            placeholder="เลือกไปรษณีย์"
                            value={formState.postalCode}
                            onChange={(e) => setFormField("postalCode", e.target.value)}
                        />

                        {/* คำอธิบายที่อยู่ (multiline + required + 2 คอลัมน์) */}
                        <div className="md:col-span-2">
                            <label className="block text-base font-semibold mb-1">
                                คำอธิบายที่อยู่ <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                className="w-full rounded-form border px-3 py-2 min-h-[140px] resize-y"
                                placeholder="คำอธิบายที่อยู่"
                                value={formState.addressDetail}
                                onChange={(e) => setFormField("addressDetail", e.target.value)}
                                rows={6}
                                required
                            />
                        </div>

                        {/* ===== Map Picker (แทนบล็อคพิกัด+ค้นหาเดิม) ===== */}
                        <div className="md:col-span-2">

                            <MapPicker
                                startingPosition={startPos}
                                startingZoom={13}
                                onChange={([lat, lng]) => {
                                    // อัปเดตค่าในฟอร์มให้สอดคล้องกับตำแหน่งที่เลือก
                                    setFormField("latitude", String(lat));
                                    setFormField("longitude", String(lng));
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* ผู้ดูแล + ความจุ */}
                <section className="grid md:grid-cols-2 gap-5">
                    <AdminSelector
                        value={Number(formState.overseerMemberId) || undefined}
                        onChange={(adminId) => setFormField("overseerMemberId", String(adminId))}
                    />

                    <TextField
                        id="capacity"
                        label="เปิดรับจำนวน"
                        required
                        type="number"
                        placeholder="จำนวนคนที่เปิดรับ"
                        value={formState.capacity}
                        onChange={(e) => setFormField("capacity", e.target.value)}
                    />
                </section>

                {/* สิ่งอำนวยความสะดวก */}
                <section>
                    <div className="md:col-span-2">
                        <label className="block text-base font-semibold mb-1">
                            สิ่งอำนวยความสะดวก <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            className="w-full rounded-form border px-3 py-2 min-h-[140px] resize-y"
                            placeholder="คำอธิบายที่อยู่"
                            value={formState.facility}
                            onChange={(e) => setFormField("facility", e.target.value)}
                            rows={6}
                            required
                        />
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
                    />
                    <TextField
                        id="startTime"
                        label="เวลาที่เริ่ม"
                        required
                        type="time"
                        value={formState.startTime}
                        onChange={(e) => setFormField("startTime", e.target.value)}
                    />
                    <TextField
                        id="endDate"
                        label="วัน/เดือน/ปี (ค.ศ.) ที่สิ้นสุด"
                        required
                        type="date"
                        value={formState.endDate}
                        onChange={(e) => setFormField("endDate", e.target.value)}
                    />
                    <TextField
                        id="endTime"
                        label="เวลาที่สิ้นสุด"
                        required
                        type="time"
                        value={formState.endTime}
                        onChange={(e) => setFormField("endTime", e.target.value)}
                    />
                    <TextField
                        id="openDate"
                        label="วัน/เดือน/ปี (ค.ศ.) ที่เปิดจอง"
                        required
                        type="date"
                        value={formState.openDate}
                        onChange={(e) => setFormField("openDate", e.target.value)}
                    />
                    <TextField
                        id="openTime"
                        label="เวลาที่เปิดจอง"
                        required
                        type="time"
                        value={formState.openTime}
                        onChange={(e) => setFormField("openTime", e.target.value)}
                    />
                    <TextField
                        id="closeDate"
                        label="วัน/เดือน/ปี (ค.ศ.) ที่ปิดจอง"
                        required
                        type="date"
                        value={formState.closeDate}
                        onChange={(e) => setFormField("closeDate", e.target.value)}
                    />
                    <TextField
                        id="closeTime"
                        label="เวลาที่ปิดจอง"
                        required
                        type="time"
                        value={formState.closeTime}
                        onChange={(e) => setFormField("closeTime", e.target.value)}
                    />
                </section>

                {/* แท็ก / ราคา */}
                {/* แท็ก / ราคา */}
                <section className="grid md:grid-cols-2 gap-5">
                    {/* ---------- ช่องค้นหาแท็ก ---------- */}
                    <div className="space-y-2">
                        <label htmlFor="tags" className="block text-base font-semibold">
                            แท็ก <span className="text-red-600">*</span>
                        </label>

                        {/* กล่องค้นหา (มี ref ใช้ปิดเมื่อคลิกนอก) */}
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
                                        tagQuery.trim().length >= MIN_TAG_QUERY_CHARS && tagOptions.length > 0
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && tagOptions[0]) {
                                        e.preventDefault();
                                        addTag(tagOptions[0]);
                                        }
                                        if (e.key === "Escape") setOpenTagBox(false);   // ปิดเมื่อกด ESC
                                    }}
                                />
                            </div>

                            {/* รายการผลลัพธ์ (dropdown) */}
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

                        {/* ชิปแท็กที่เลือกแล้ว (สี่เหลี่ยม) */}
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

                    {/* ---------- ราคา ---------- */}
                    <TextField
                        id="price"
                        label="ราคา"
                        required
                        type="number"
                        placeholder="กรอกราคา"
                        value={formState.price}
                        onChange={(e) => setFormField("price", e.target.value)}
                    />
                </section>

                {/* ===== ที่พัก (ไม่บังคับ) ===== */}
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

                    {/* dropdown ผลลัพธ์ */}
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
                    <div className="rounded-md border p-3 grid grid-cols-12 gap-3">
                    <div className="col-span-3">
                        <img
                        className="w-full h-28 object-cover rounded-md"
                        src={
                            selectedHomestay.images?.[0]?.image ||
                            "https://placehold.co/400x300?text=Homestay"
                        }
                        alt={selectedHomestay.name}
                        />
                    </div>
                    <div className="col-span-9 flex flex-col gap-1">
                        <div className="font-semibold">{selectedHomestay.name}</div>
                        {selectedHomestay.facility && (
                        <ul className="list-disc pl-5 text-sm leading-6">
                            {selectedHomestay.facility
                            .split(/[,•\n]/)
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .slice(0, 8)
                            .map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                        )}
                        <div className="mt-1">
                        <button
                            type="button"
                            onClick={clearHomestay}
                            className="text-xs px-2 py-1 border rounded-md hover:bg-gray-50"
                            title="เอาที่พักนี้ออก"
                        >
                            เอาออก
                        </button>
                        </div>
                    </div>
                    </div>
                )}
                </section>



                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-form px-4 py-2 border"
                        disabled={isSaving}
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        className="rounded-form px-4 py-2 text-white bg-[#055035] hover:bg-[#04402a]"
                        disabled={isSaving}
                    >
                        {isSaving ? "กำลังบันทึก..." : "สร้าง"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreatePackagePage;