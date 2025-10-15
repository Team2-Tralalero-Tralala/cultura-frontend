/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Pages/SuperAdmin/EditPackage.tsx
/**
 * คำอธิบาย (Component Header)
 * - หน้าแก้ไขแพ็กเกจ (บทบาท SuperAdmin)
 * หน้าที่หลัก
 *   1) โหลดรายละเอียดแพ็กเกจจาก endpoint superadmin
 *   2) ให้ผู้ใช้แก้ไข แล้ว PUT กลับ (ต้องส่ง communityId ให้ BE connect)
 * หมายเหตุ
 *   - ดึงวัน/เวลาโชว์ด้วย toDateInput() + toTimeInput() แบบเดียวกับ Admin
 *   - ส่ง startTime/endTime เฉพาะเมื่อผู้ใช้กรอก
 *   - ชื่อฟิลด์และหน้าตา UI ให้เหมือน Admin (ใช้ villageNumber)
 */

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../Libs/axios";
import TextField from "../../Components/TextField";

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
function toDateInput(input?: string | Date | null) {
    if (!input) return "";
    const d = new Date(input as any);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
function toIntOrNull(v: any): number | null {
    const n = Number(String(v ?? "").trim());
    return Number.isFinite(n) ? n : null;
}
function normalizeOrDefault(value: any, fallback = "") {
    const trimmed = (value ?? "").toString().trim();
    return trimmed.length ? trimmed : fallback;
}

type Form = {
    name: string;
    description: string;

    houseNumber: string;
    villageNumber: string; // ใช้ชื่อเดียวกับ Admin
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

const initialForm: Form = {
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

type LoadedPackage = {
    id: number;
    communityId: number;
    name: string;
    description: string;
    capacity: number;
    price: number;
    warning?: string | null;
    statusPackage: "PUBLISH" | "UNPUBLISH" | "DRAFT";
    statusApprove: string;
    startDate: string;
    dueDate: string;
    facility?: string | null;
    overseerMemberId: number;
    location: {
        houseNumber: string;
        villageNumber?: string | null;
        subDistrict: string;
        district: string;
        province: string;
        postalCode: string;
        detail?: string | null;
        latitude: number;
        longitude: number;
    };
};

export default function EditPackageSuperAdmin() {
    const { id } = useParams<{ id: string }>();
    const pkgId = Number(id);
    const navigate = useNavigate();

    const [form, setForm] = React.useState<Form>(initialForm);
    const [communityId, setCommunityId] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [ok, setOk] = React.useState<string | null>(null);

    const setF = <K extends keyof Form>(k: K, v: Form[K]) =>
        setForm((s) => ({ ...s, [k]: v }));

    React.useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get(`/super/package/${pkgId}`);
                const p: LoadedPackage = res.data?.data;
                if (!p || ignore) return;

                setCommunityId(Number(p.communityId));
                setForm({
                    name: normalizeOrDefault(p.name),
                    description: normalizeOrDefault(p.description),

                    houseNumber: normalizeOrDefault(p.location?.houseNumber),
                    villageNumber: normalizeOrDefault(p.location?.villageNumber ?? ""),
                    province: normalizeOrDefault(p.location?.province),
                    district: normalizeOrDefault(p.location?.district),
                    subDistrict: normalizeOrDefault(p.location?.subDistrict),
                    postalCode: normalizeOrDefault(p.location?.postalCode),
                    addressDetail: normalizeOrDefault(p.location?.detail),
                    latitude: String(p.location?.latitude ?? ""),
                    longitude: String(p.location?.longitude ?? ""),
                    placeQuery: "",

                    overseerMemberId: String(p.overseerMemberId ?? ""),
                    tagId: "",
                    facility: normalizeOrDefault(p.facility ?? p.warning ?? ""),

                    startDate: toDateInput(p.startDate),
                    startTime: toTimeInput(p.startDate), // ดึงเวลาโชว์
                    endDate: toDateInput(p.dueDate),
                    endTime: toTimeInput(p.dueDate),     // ดึงเวลาโชว์
                    openDate: "",
                    openTime: "",
                    closeDate: "",
                    closeTime: "",

                    capacity: String(p.capacity ?? ""),
                    price: String(p.price ?? ""),
                    addHomestay: false,
                });
            } catch (e: any) {
                setError(e?.response?.data?.message ?? e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, [pkgId]);

    const canSubmit = React.useMemo(() => {
        const required = [
            form.name,
            form.description,
            form.houseNumber,
            form.villageNumber,
            form.province,
            form.district,
            form.subDistrict,
            form.postalCode,
            form.latitude,
            form.longitude,
            form.overseerMemberId,
            form.capacity,
            form.price,
            form.startDate,
            form.endDate,
        ];
        return required.every((v) => String(v ?? "").trim() !== "");
    }, [form]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!window.confirm("ยืนยันการบันทึกการแก้ไขแพ็กเกจใช่หรือไม่?")) return;
        if (!canSubmit || !communityId) return;

        setSaving(true);
        setError(null);
        setOk(null);

        try {
            const payload = {
                communityId,
                overseerMemberId: Number(form.overseerMemberId),
                name: normalizeOrDefault(form.name),
                description: normalizeOrDefault(form.description),
                capacity: Math.max(1, Number(form.capacity || 0)),
                price: Math.max(0, Number(form.price || 0)),
                warning: normalizeOrDefault(form.facility),
                statusPackage: "DRAFT" as const,
                statusApprove: "PENDING" as const,
                startDate: normalizeOrDefault(form.startDate),
                dueDate: normalizeOrDefault(form.endDate),
                ...(form.startTime.trim() && { startTime: form.startTime.trim() }),
                ...(form.endTime.trim() && { endTime: form.endTime.trim() }),
                facility: normalizeOrDefault(form.facility),
                location: {
                    houseNumber: normalizeOrDefault(form.houseNumber),
                    villageNumber: toIntOrNull(form.villageNumber),
                    subDistrict: normalizeOrDefault(form.subDistrict),
                    district: normalizeOrDefault(form.district),
                    province: normalizeOrDefault(form.province),
                    postalCode: normalizeOrDefault(form.postalCode),
                    detail: normalizeOrDefault(form.addressDetail),
                    latitude: Number(form.latitude),
                    longitude: Number(form.longitude),
                },
            };

            await api.put(`/super/package/${pkgId}`, payload);
            alert("บันทึกการแก้ไขสำเร็จ!");
            navigate("/super/packages");
        } catch (err: any) {
            console.error("Edit package (superadmin) error:", err?.response?.data);
            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "บันทึกการแก้ไขไม่สำเร็จ"
            );
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="w-full max-w-none px-0 lg:px-0">
                <div className="bg-white rounded-lg p-6 shadow-sm">กำลังโหลด…</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-none px-0 lg:px-0">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {ok && <div className="text-emerald-700 text-sm">{ok}</div>}

            <form onSubmit={onSubmit} className="w-full bg-white rounded-lg p-5 md:p-6 lg:p-7 shadow-sm space-y-8">
                <label className="block text-xl mb-1">แก้ไขแพ็กเกจ</label>

                {/* ชื่อ/คำอธิบาย */}
                <section className="space-y-4">
                    <TextField id="name" label="ชื่อแพ็กเกจ" required placeholder="ชื่อแพ็กเกจ" value={form.name} onChange={(e) => setF("name", e.target.value)} />
                    <div>
                        <label className="block text-base font-semibold mb-1">
                            คำอธิบายแพ็กเกจ <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            className="w-full rounded-form border px-3 py-2 min-h-[120px]"
                            placeholder="คำอธิบายแพ็กเกจ"
                            value={form.description}
                            onChange={(e) => setF("description", e.target.value)}
                            required
                        />
                    </div>
                </section>

                {/* ที่อยู่ */}
                <section className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-5">
                        <TextField id="houseNumber" label="บ้านเลขที่" required placeholder="กรอกบ้านเลขที่ของชุมชน" value={form.houseNumber} onChange={(e) => setF("houseNumber", e.target.value)} />
                        <TextField id="villageNumber" label="หมู่ที่" placeholder="กรอกหมู่ของชุมชน" value={form.villageNumber} onChange={(e) => setF("villageNumber", e.target.value)} />
                        <TextField id="province" label="จังหวัด" required placeholder="เลือกจังหวัด" value={form.province} onChange={(e) => setF("province", e.target.value)} />
                        <TextField id="district" label="อำเภอ / เขต" required placeholder="เลือกอำเภอ / เขต" value={form.district} onChange={(e) => setF("district", e.target.value)} />
                        <TextField id="subDistrict" label="ตำบล / แขวง" required placeholder="เลือกตำบล / แขวง" value={form.subDistrict} onChange={(e) => setF("subDistrict", e.target.value)} />
                        <TextField id="postalCode" label="รหัสไปรษณีย์" required placeholder="เลือกไปรษณีย์" value={form.postalCode} onChange={(e) => setF("postalCode", e.target.value)} />

                        <div className="md:col-span-2">
                            <label className="block text-base font-semibold mb-1">
                                คำอธิบายที่อยู่ <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                className="w-full rounded-form border px-3 py-2 min-h-[140px] resize-y"
                                placeholder="คำอธิบายที่อยู่"
                                value={form.addressDetail}
                                onChange={(e) => setF("addressDetail", e.target.value)}
                                rows={6}
                                required
                            />
                        </div>

                        <TextField id="latitude" label="ละติจูด" required type="number" placeholder="กรอกละติจูด" value={form.latitude} onChange={(e) => setF("latitude", e.target.value)} />
                        <TextField id="longitude" label="ลองจิจูด" required type="number" placeholder="กรอกลองจิจูด" value={form.longitude} onChange={(e) => setF("longitude", e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <TextField id="placeQuery" label="ค้นหาสถานที่" placeholder="ป้อนชื่อสถานที่หรือสถานที่ใกล้เคียงเพื่อปักหมุด" value={form.placeQuery} onChange={(e) => setF("placeQuery", e.target.value)} />
                        <div className="rounded-lg border h-[300px] bg-gray-100" />
                    </div>
                </section>

                {/* ผู้ดูแล + เปิดรับจำนวน */}
                <section className="grid md:grid-cols-2 gap-5">
                    <TextField id="overseerMemberId" label="ผู้ดูแล" required type="number" placeholder="กรอก id ผู้ดูแล" value={form.overseerMemberId} onChange={(e) => setF("overseerMemberId", e.target.value)} />
                    <TextField id="capacity" label="เปิดรับจำนวน" required type="number" placeholder="จำนวนคนที่เปิดรับ" value={form.capacity} onChange={(e) => setF("capacity", e.target.value)} />
                </section>

                {/* สิ่งอำนวยความสะดวก */}
                <section>
                    <TextField id="facility" label="สิ่งอำนวยความสะดวก" placeholder="สิ่งอำนวยความสะดวก" value={form.facility} onChange={(e) => setF("facility", e.target.value)} />
                </section>

                {/* วันเวลา */}
                <section className="grid md:grid-cols-4 gap-5">
                    <TextField id="startDate" label="วัน/เดือน/ปี (ค.ศ.) ที่เริ่ม" required type="date" value={form.startDate} onChange={(e) => setF("startDate", e.target.value)} />
                    <TextField id="startTime" label="เวลาที่เริ่ม" type="time" value={form.startTime} onChange={(e) => setF("startTime", e.target.value)} />
                    <TextField id="endDate" label="วัน/เดือน/ปี (ค.ศ.) ที่สิ้นสุด" required type="date" value={form.endDate} onChange={(e) => setF("endDate", e.target.value)} />
                    <TextField id="endTime" label="เวลาที่สิ้นสุด" type="time" value={form.endTime} onChange={(e) => setF("endTime", e.target.value)} />
                    <TextField id="openDate" label="วัน/เดือน/ปี (ค.ศ.) ที่เปิดจอง" type="date" value={form.openDate} onChange={(e) => setF("openDate", e.target.value)} />
                    <TextField id="openTime" label="เวลาที่เปิดจอง" type="time" value={form.openTime} onChange={(e) => setF("openTime", e.target.value)} />
                    <TextField id="closeDate" label="วัน/เดือน/ปี (ค.ศ.) ที่ปิดจอง" type="date" value={form.closeDate} onChange={(e) => setF("closeDate", e.target.value)} />
                    <TextField id="closeTime" label="เวลาที่ปิดจอง" type="time" value={form.closeTime} onChange={(e) => setF("closeTime", e.target.value)} />
                </section>

                {/* แท็ก / ราคา */}
                <section className="grid md:grid-cols-2 gap-5">
                    <TextField id="tagId" label="แท็ก" placeholder="ค้นหาแท็ก เช่น ธรรมชาติ อาหาร ฯลฯ" value={form.tagId} onChange={(e) => setF("tagId", e.target.value)} />
                    <TextField id="price" label="ราคา" required type="number" placeholder="กรอกราคา" value={form.price} onChange={(e) => setF("price", e.target.value)} />
                </section>

                <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => navigate(-1)} className="rounded-form px-4 py-2 border" disabled={saving}>
                        ยกเลิก
                    </button>
                    <button type="submit" className="rounded-form px-4 py-2 text-white bg-[#055035] hover:bg-[#04402a]" disabled={saving || !canSubmit}>
                        {saving ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
            </form>
        </div>
    );
}
