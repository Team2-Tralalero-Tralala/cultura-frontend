// src/Pages/Member/CreatePackageMember.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TextField from "../../Components/TextField";

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

    const setF = <K extends keyof Form>(k: K, v: Form[K]) =>
        setForm((s) => ({ ...s, [k]: v }));

    const canSubmit = useMemo(() => {
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
        return requiredFields.every((v) => String(v ?? "").trim() !== "");
    }, [form]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!window.confirm("ยืนยันการสร้างแพ็กเกจใช่หรือไม่?")) return;
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

            alert("สร้างแพ็กเกจสำเร็จ!");
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
        <div className="w-full max-w-none px-0 lg:px-0">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {ok && <div className="text-emerald-700 text-sm">{ok}</div>}

            <form
                onSubmit={onSubmit}
                className="w-full bg-white rounded-lg p-5 md:p-6 lg:p-7 shadow-sm space-y-8"
            >
                <label className="block text-xl mb-1">สร้างแพ็กเกจ</label>

                {/* ชื่อแพ็กเกจ / คำอธิบาย */}
                <section className="space-y-4">
                    <TextField
                        id="name"
                        label="ชื่อแพ็กเกจ"
                        required
                        placeholder="ชื่อแพ็กเกจ"
                        value={form.name}
                        onChange={(e) => setF("name", e.target.value)}
                    />

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
                        <TextField
                            id="houseNumber"
                            label="บ้านเลขที่"
                            required
                            placeholder="กรอกบ้านเลขที่ของชุมชน"
                            value={form.houseNumber}
                            onChange={(e) => setF("houseNumber", e.target.value)}
                        />
                        <TextField
                            id="villageNo"
                            label="หมู่ที่"
                            required
                            placeholder="กรอกหมู่ของชุมชน"
                            value={form.villageNo}
                            onChange={(e) => setF("villageNo", e.target.value)}
                        />

                        <TextField
                            id="province"
                            label="จังหวัด"
                            required
                            placeholder="เลือกจังหวัด"
                            value={form.province}
                            onChange={(e) => setF("province", e.target.value)}
                        />
                        <TextField
                            id="district"
                            label="อำเภอ / เขต"
                            required
                            placeholder="เลือกอำเภอ / เขต"
                            value={form.district}
                            onChange={(e) => setF("district", e.target.value)}
                        />

                        <TextField
                            id="subDistrict"
                            label="ตำบล / แขวง"
                            required
                            placeholder="เลือกตำบล / แขวง"
                            value={form.subDistrict}
                            onChange={(e) => setF("subDistrict", e.target.value)}
                        />
                        <TextField
                            id="postalCode"
                            label="รหัสไปรษณีย์"
                            required
                            placeholder="เลือกไปรษณีย์"
                            value={form.postalCode}
                            onChange={(e) => setF("postalCode", e.target.value)}
                        />

                        <TextField
                            id="addressDetail"
                            label="คำอธิบายที่อยู่"
                            placeholder="คำอธิบายที่อยู่"
                            value={form.addressDetail}
                            onChange={(e) => setF("addressDetail", e.target.value)}
                        />

                        <TextField
                            id="latitude"
                            label="ละติจูด"
                            required
                            type="number"
                            placeholder="กรอกละติจูด"
                            value={form.latitude}
                            onChange={(e) => setF("latitude", e.target.value)}
                        />
                        <TextField
                            id="longitude"
                            label="ลองจิจูด"
                            required
                            type="number"
                            placeholder="กรอกลองจิจูด"
                            value={form.longitude}
                            onChange={(e) => setF("longitude", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <TextField
                            id="placeQuery"
                            label="ค้นหาสถานที่"
                            placeholder="ป้อนชื่อสถานที่หรือสถานที่ใกล้เคียงเพื่อปักหมุด"
                            value={form.placeQuery}
                            onChange={(e) => setF("placeQuery", e.target.value)}
                        />
                        <div className="rounded-lg border h-[300px] bg-gray-100" />
                    </div>
                </section>

                {/* ผู้ดูแล + เปิดรับจำนวน */}
                <section className="grid md:grid-cols-2 gap-5">
                    <TextField
                        id="overseerMemberId"
                        label="ผู้ดูแล"
                        required
                        type="number"
                        placeholder="กรอก id ผู้ดูแล"
                        value={form.overseerMemberId}
                        onChange={(e) => setF("overseerMemberId", e.target.value)}
                    />
                    <TextField
                        id="capacity"
                        label="เปิดรับจำนวน"
                        required
                        type="number"
                        placeholder="จำนวนคนที่เปิดรับ"
                        value={form.capacity}
                        onChange={(e) => setF("capacity", e.target.value)}
                    />
                </section>

                {/* สิ่งอำนวยความสะดวก */}
                <section>
                    <TextField
                        id="facility"
                        label="สิ่งอำนวยความสะดวก"
                        placeholder="สิ่งอำนวยความสะดวก"
                        value={form.facility}
                        onChange={(e) => setF("facility", e.target.value)}
                    />
                </section>

                {/* วันเวลา */}
                <section className="grid md:grid-cols-4 gap-5">
                    <TextField
                        id="startDate"
                        label="วัน/เดือน/ปี (ค.ศ.) ที่เริ่ม"
                        required
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setF("startDate", e.target.value)}
                    />
                    <TextField
                        id="startTime"
                        label="เวลาที่เริ่ม"
                        type="time"
                        value={form.startTime}
                        onChange={(e) => setF("startTime", e.target.value)}
                    />
                    <TextField
                        id="endDate"
                        label="วัน/เดือน/ปี (ค.ศ.) ที่สิ้นสุด"
                        required
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setF("endDate", e.target.value)}
                    />
                    <TextField
                        id="endTime"
                        label="เวลาที่สิ้นสุด"
                        type="time"
                        value={form.endTime}
                        onChange={(e) => setF("endTime", e.target.value)}
                    />

                    <TextField
                        id="openDate"
                        label="วัน/เดือน/ปี (ค.ศ.) ที่เปิดจอง"
                        type="date"
                        value={form.openDate}
                        onChange={(e) => setF("openDate", e.target.value)}
                    />
                    <TextField
                        id="openTime"
                        label="เวลาที่เปิดจอง"
                        type="time"
                        value={form.openTime}
                        onChange={(e) => setF("openTime", e.target.value)}
                    />
                    <TextField
                        id="closeDate"
                        label="วัน/เดือน/ปี (ค.ศ.) ที่ปิดจอง"
                        type="date"
                        value={form.closeDate}
                        onChange={(e) => setF("closeDate", e.target.value)}
                    />
                    <TextField
                        id="closeTime"
                        label="เวลาที่ปิดจอง"
                        type="time"
                        value={form.closeTime}
                        onChange={(e) => setF("closeTime", e.target.value)}
                    />
                </section>

                {/* แท็ก / ราคา */}
                <section className="grid md:grid-cols-2 gap-5">
                    <TextField
                        id="tagId"
                        label="แท็ก"
                        placeholder="ค้นหาแท็ก เช่น ธรรมชาติ อาหาร ฯลฯ"
                        value={form.tagId}
                        onChange={(e) => setF("tagId", e.target.value)}
                    />
                    <TextField
                        id="price"
                        label="ราคา"
                        required
                        type="number"
                        placeholder="กรอกราคา"
                        value={form.price}
                        onChange={(e) => setF("price", e.target.value)}
                    />
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
