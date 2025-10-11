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

const CreatePackageMember: React.FC = () => {
    const navigate = useNavigate();

    const [formState, setFormState] = useState<PackageForm>(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const setFormField = <K extends keyof PackageForm>(key: K, value: PackageForm[K]) =>
        setFormState((prev) => ({ ...prev, [key]: value }));

    // ให้เหมือน Admin: startDate/endDate เป็นฟิลด์จำเป็น
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
        ];
        return required.every((v) => String(v ?? "").trim() !== "");
    }, [formState]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!window.confirm("ยืนยันการสร้างแพ็กเกจใช่หรือไม่?")) return;
        if (!canSubmitForm) return;

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
                facility: normalizeOrDefault(formState.facility),

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
            navigate("/member/packages");
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

    return (
        <div className="w-full max-w-none px-0 lg:px-0">
            {errorMessage && <div className="text-red-600 text-sm">{errorMessage}</div>}
            {successMessage && <div className="text-emerald-700 text-sm">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="w-full bg-white rounded-lg p-5 md:p-6 lg:p-7 shadow-sm space-y-8">
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
                        <TextField id="houseNumber" label="บ้านเลขที่" required placeholder="กรอกบ้านเลขที่ของชุมชน" value={formState.houseNumber} onChange={(e) => setFormField("houseNumber", e.target.value)} />
                        <TextField id="villageNumber" label="หมู่ที่" required placeholder="กรอกหมู่ของชุมชน" value={formState.villageNumber} onChange={(e) => setFormField("villageNumber", e.target.value)} />
                        <TextField id="province" label="จังหวัด" required placeholder="เลือกจังหวัด" value={formState.province} onChange={(e) => setFormField("province", e.target.value)} />
                        <TextField id="district" label="อำเภอ / เขต" required placeholder="เลือกอำเภอ / เขต" value={formState.district} onChange={(e) => setFormField("district", e.target.value)} />
                        <TextField id="subDistrict" label="ตำบล / แขวง" required placeholder="เลือกตำบล / แขวง" value={formState.subDistrict} onChange={(e) => setFormField("subDistrict", e.target.value)} />
                        <TextField id="postalCode" label="รหัสไปรษณีย์" required placeholder="เลือกไปรษณีย์" value={formState.postalCode} onChange={(e) => setFormField("postalCode", e.target.value)} />

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

                        <TextField id="latitude" label="ละติจูด" required type="number" placeholder="กรอกละติจูด" value={formState.latitude} onChange={(e) => setFormField("latitude", e.target.value)} />
                        <TextField id="longitude" label="ลองจิจูด" required type="number" placeholder="กรอกลองจิจูด" value={formState.longitude} onChange={(e) => setFormField("longitude", e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <TextField id="placeQuery" label="ค้นหาสถานที่" placeholder="ป้อนชื่อสถานที่หรือสถานที่ใกล้เคียงเพื่อปักหมุด" value={formState.placeQuery} onChange={(e) => setFormField("placeQuery", e.target.value)} />
                        <div className="rounded-lg border h-[300px] bg-gray-100" />
                    </div>
                </section>

                {/* ผู้ดูแล + ความจุ */}
                <section className="grid md:grid-cols-2 gap-5">
                    <TextField id="overseerMemberId" label="ผู้ดูแล" required type="number" placeholder="กรอก id ผู้ดูแล" value={formState.overseerMemberId} onChange={(e) => setFormField("overseerMemberId", e.target.value)} />
                    <TextField id="capacity" label="เปิดรับจำนวน" required type="number" placeholder="จำนวนคนที่เปิดรับ" value={formState.capacity} onChange={(e) => setFormField("capacity", e.target.value)} />
                </section>

                {/* สิ่งอำนวยความสะดวก */}
                <section>
                    <TextField id="facility" label="สิ่งอำนวยความสะดวก" placeholder="สิ่งอำนวยความสะดวก" value={formState.facility} onChange={(e) => setFormField("facility", e.target.value)} />
                </section>

                {/* วันเวลา */}
                <section className="grid md:grid-cols-4 gap-5">
                    <TextField id="startDate" label="วัน/เดือน/ปี (ค.ศ.) ที่เริ่ม" required type="date" value={formState.startDate} onChange={(e) => setFormField("startDate", e.target.value)} />
                    <TextField id="startTime" label="เวลาที่เริ่ม" type="time" value={formState.startTime} onChange={(e) => setFormField("startTime", e.target.value)} />
                    <TextField id="endDate" label="วัน/เดือน/ปี (ค.ศ.) ที่สิ้นสุด" required type="date" value={formState.endDate} onChange={(e) => setFormField("endDate", e.target.value)} />
                    <TextField id="endTime" label="เวลาที่สิ้นสุด" type="time" value={formState.endTime} onChange={(e) => setFormField("endTime", e.target.value)} />
                    <TextField id="openDate" label="วัน/เดือน/ปี (ค.ศ.) ที่เปิดจอง" type="date" value={formState.openDate} onChange={(e) => setFormField("openDate", e.target.value)} />
                    <TextField id="openTime" label="เวลาที่เปิดจอง" type="time" value={formState.openTime} onChange={(e) => setFormField("openTime", e.target.value)} />
                    <TextField id="closeDate" label="วัน/เดือน/ปี (ค.ศ.) ที่ปิดจอง" type="date" value={formState.closeDate} onChange={(e) => setFormField("closeDate", e.target.value)} />
                    <TextField id="closeTime" label="เวลาที่ปิดจอง" type="time" value={formState.closeTime} onChange={(e) => setFormField("closeTime", e.target.value)} />
                </section>

                {/* แท็ก / ราคา */}
                <section className="grid md:grid-cols-2 gap-5">
                    <TextField id="tagId" label="แท็ก" placeholder="ค้นหาแท็ก เช่น ธรรมชาติ อาหาร ฯลฯ" value={formState.tagId} onChange={(e) => setFormField("tagId", e.target.value)} />
                    <TextField id="price" label="ราคา" required type="number" placeholder="กรอกราคา" value={formState.price} onChange={(e) => setFormField("price", e.target.value)} />
                </section>

                <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => navigate(-1)} className="rounded-form px-4 py-2 border" disabled={isSaving}>
                        ยกเลิก
                    </button>
                    <button type="submit" className="rounded-form px-4 py-2 text-white bg-[#055035] hover:bg-[#04402a]" disabled={isSaving || !canSubmitForm}>
                        {isSaving ? "กำลังบันทึก..." : "สร้าง"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePackageMember;
