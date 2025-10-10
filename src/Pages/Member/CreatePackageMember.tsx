// src/Pages/Member/CreatePackageMember.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

/* ================= Types ================= */
type Form = {
    name: string;
    description: string;

    houseNumber: string;
    villageNo: string;
    province: string;
    district: string;
    subDistrict: string;
    postalCode: string;
    addressDetail: string;
    latitude: string;
    longitude: string;
    placeQuery: string;
    overseerMemberId: string; // users.id
    tagId: string;            // เผื่อใช้ในอนาคต
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
    villageNo: "",
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

type UserRow = {
    id?: number;
    us_id?: number;
    fname?: string;
    us_fname?: string;
    lname?: string;
    us_lname?: string;
    username?: string;
    us_username?: string;
    role?: { name?: string } | null;
    re_name?: string; // เผื่อ BE คืนแบบ join แปลก ๆ
};

type Option = { id: number; name: string };

function getUserId(u: UserRow) {
    return Number(u?.id ?? u?.us_id);
}
function getFName(u: UserRow) {
    return String(u?.fname ?? u?.us_fname ?? "");
}
function getLName(u: UserRow) {
    return String(u?.lname ?? u?.us_lname ?? "");
}
function getUName(u: UserRow) {
    return String(u?.username ?? u?.us_username ?? "");
}
function getRoleName(u: UserRow) {
    return String(u?.role?.name ?? u?.re_name ?? "");
}
function displayUser(u: UserRow) {
    const full = `${getFName(u)} ${getLName(u)}`.trim();
    if (full) return full;
    const uname = getUName(u);
    return uname || `ID ${getUserId(u)}`;
}
function toISO(dateStr: string, timeStr: string) {
    if (!dateStr) return null;
    const t = timeStr || "00:00";
    return new Date(`${dateStr}T${t}:00`).toISOString();
}
function nz(s: string, fallback = "-") {
    const v = (s ?? "").toString().trim();
    return v.length ? v : fallback;
}

const CreatePackageMember: React.FC = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState<Form>(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    // dropdown options
    const [creatorOptions, setCreatorOptions] = useState<Option[]>([]);

    const setF = <K extends keyof Form>(k: K, v: Form[K]) =>
        setForm((s) => ({ ...s, [k]: v }));

    const canSubmit = useMemo(() => {
        // เช็กเฉพาะช่องที่หน้า “มีจริงและต้องกรอก”
        const requiredFields = [
            form.name,
            form.description,
            form.houseNumber,
            form.villageNo,
            form.province,
            form.district,
            form.subDistrict,
            form.postalCode,
            form.latitude,
            form.longitude,
            form.overseerMemberId,
            form.capacity,
            form.price,
        ];
        return requiredFields.every(v => String(v ?? "").trim() !== "");
    }, [form]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        // 1) ถามยืนยันก่อน
        const ok = window.confirm("ยืนยันการสร้างแพ็กเกจใช่หรือไม่?");
        if (!ok) return;

        // (ต่อไปเหมือนเดิม)
        if (!canSubmit) return;

        setSaving(true);
        setError(null);
        setOk(null);

        try {
            const payload = {
                overseerMemberId: Number(form.overseerMemberId),
                name: nz(form.name),
                description: nz(form.description),
                capacity: Math.max(1, Number(form.capacity || 0)),
                price: Math.max(0, Number(form.price || 0)),
                warning: nz(form.facility),
                statusPackage: "DRAFT" as const,
                statusApprove: "PENDING" as const,
                startDate: nz(form.startDate),
                dueDate: nz(form.endDate),
                facility: nz(form.facility),
                location: {
                    houseNumber: nz(form.houseNumber),
                    subDistrict: nz(form.subDistrict),
                    district: nz(form.district),
                    province: nz(form.province),
                    postalCode: nz(form.postalCode),
                    detail: nz(form.addressDetail),
                    latitude: Number(form.latitude),
                    longitude: Number(form.longitude),
                },
            };

            await axios.post(`${apiUrl}/member/package`, payload, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            // 2) แจ้งสำเร็จ (ถ้าต้องการ)
            alert("สร้างแพ็กเกจสำเร็จ!");

            // 3) กลับหน้า list
            navigate("/member/packages");
        } catch (err: any) {
            console.error("Create package error payload:", err?.response?.data);
            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "สร้างแพ็กเกจไม่สำเร็จ"
            );
        } finally {
            setSaving(false);
        }
    }


    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-6">
            {/* header */}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {ok && <div className="text-emerald-700 text-sm">{ok}</div>}

            <form
                onSubmit={onSubmit}
                className="bg-white rounded-lg p-5 md:p-6 lg:p-7 shadow-sm space-y-8"
            >
                {/* ชื่อแพ็กเกจ / คำอธิบายแพ็กเกจ */}
                <label className="block text-xl mb-1">สร้างแพ็กเกจ</label>
                <section className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">
                            ชื่อแพ็กเกจ <span className="text-red-600">*</span>
                        </label>
                        <input
                            className="w-full rounded-form border px-3 py-2"
                            placeholder="ชื่อแพ็กเกจ"
                            value={form.name}
                            onChange={(e) => setF("name", e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">
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
                        <div>
                            <label className="block text-sm mb-1">
                                บ้านเลขที่ <span className="text-red-600">*</span>
                            </label>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="กรอกบ้านเลขที่ของชุมชน"
                                value={form.houseNumber}
                                onChange={(e) => setF("houseNumber", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                หมู่ที่ <span className="text-red-600">*</span>
                            </label>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="กรอกหมู่ของชุมชน"
                                value={form.villageNo}
                                onChange={(e) => setF("villageNo", e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">
                                จังหวัด <span className="text-red-600">*</span>
                            </label>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="เลือกจังหวัด"
                                value={form.province}
                                onChange={(e) => setF("province", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                อำเภอ / เขต <span className="text-red-600">*</span>
                            </label>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="เลือกอำเภอ / เขต"
                                value={form.district}
                                onChange={(e) => setF("district", e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">
                                ตำบล / แขวง <span className="text-red-600">*</span>
                            </label>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="เลือกตำบล / แขวง"
                                value={form.subDistrict}
                                onChange={(e) => setF("subDistrict", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                รหัสไปรษณีย์ <span className="text-red-600">*</span>
                            </label>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="เลือกไปรษณีย์"
                                value={form.postalCode}
                                onChange={(e) => setF("postalCode", e.target.value)}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">คำอธิบายที่อยู่</label>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="คำอธิบายที่อยู่"
                                value={form.addressDetail}
                                onChange={(e) => setF("addressDetail", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">
                                ละติจูด <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="กรอกละติจูด"
                                value={form.latitude}
                                onChange={(e) => setF("latitude", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                ลองจิจูด <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="กรอกลองจิจูด"
                                value={form.longitude}
                                onChange={(e) => setF("longitude", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* ค้นหาสถานที่ + แผนที่ */}
                    <div className="space-y-2">
                        <label className="block text-sm mb-1">ค้นหาสถานที่</label>
                        <div className="flex items-center gap-2">
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="ป้อนชื่อสถานที่หรือสถานที่ใกล้เคียงเพื่อปักหมุด"
                                value={form.placeQuery}
                                onChange={(e) => setF("placeQuery", e.target.value)}
                            />
                            <button type="button" className="rounded-form px-3 py-2 border">
                                ค้นหา
                            </button>
                        </div>
                        <div className="rounded-lg border h-[300px] bg-gray-100" />
                    </div>
                </section>

                {/* ผู้ดูแล + เปิดรับจำนวน */}
                <section className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm mb-1">
                            ผู้ดูแล <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="number"
                            className="w-full rounded-form border px-3 py-2"
                            placeholder="กรอก id ผู้ดูแล"
                            value={form.overseerMemberId}
                            onChange={(e) => setF("overseerMemberId", e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">
                            เปิดรับจำนวน <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            className="w-full rounded-form border px-3 py-2"
                            placeholder="จำนวนคนที่เปิดรับ"
                            value={form.capacity}
                            onChange={(e) => setF("capacity", e.target.value)}
                            required
                        />
                    </div>
                </section>

                {/* สิ่งอำนวยความสะดวก */}
                <section>
                    <label className="block text-sm mb-1">สิ่งอำนวยความสะดวก</label>
                    <input
                        className="w-full rounded-form border px-3 py-2"
                        placeholder="สิ่งอำนวยความสะดวก"
                        value={form.facility}
                        onChange={(e) => setF("facility", e.target.value)}
                    />
                </section>

                {/* วันเวลา */}
                <section className="grid md:grid-cols-4 gap-5">
                    <div>
                        <label className="block text-sm mb-1">
                            วัน/เดือน/ปี (ค.ศ.) ที่เริ่ม <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.startDate}
                            onChange={(e) => setF("startDate", e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">เวลาที่เริ่ม</label>
                        <input
                            type="time"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.startTime}
                            onChange={(e) => setF("startTime", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">
                            วัน/เดือน/ปี (ค.ศ.) ที่สิ้นสุด <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.endDate}
                            onChange={(e) => setF("endDate", e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">เวลาที่สิ้นสุด</label>
                        <input
                            type="time"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.endTime}
                            onChange={(e) => setF("endTime", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">วัน/เดือน/ปี (ค.ศ.) ที่เปิดจอง</label>
                        <input
                            type="date"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.openDate}
                            onChange={(e) => setF("openDate", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">เวลาที่เปิดจอง</label>
                        <input
                            type="time"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.openTime}
                            onChange={(e) => setF("openTime", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">วัน/เดือน/ปี (ค.ศ.) ที่ปิดจอง</label>
                        <input
                            type="date"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.closeDate}
                            onChange={(e) => setF("closeDate", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">เวลาที่ปิดจอง</label>
                        <input
                            type="time"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.closeTime}
                            onChange={(e) => setF("closeTime", e.target.value)}
                        />
                    </div>
                </section>

                {/* แท็ก / ราคา */}
                <section className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm mb-1">แท็ก</label>
                        <input
                            className="w-full rounded-form border px-3 py-2"
                            placeholder="ค้นหาแท็ก เช่น ธรรมชาติ อาหาร ฯลฯ"
                            value={form.tagId}
                            onChange={(e) => setF("tagId", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">
                            ราคา <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="number"
                            min={0}
                            className="w-full rounded-form border px-3 py-2"
                            placeholder="กรอกราคา"
                            value={form.price}
                            onChange={(e) => setF("price", e.target.value)}
                            required
                        />
                    </div>
                </section>

                {/* ปุ่มล่างขวา */}
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-form px-4 py-2 border"
                        disabled={saving}
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        className="rounded-form px-4 py-2 text-white bg-[#055035] hover:bg-[#04402a]"
                        disabled={saving || !canSubmit}
                    >
                        {saving ? "กำลังบันทึก..." : "สร้าง"}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default CreatePackageMember;
