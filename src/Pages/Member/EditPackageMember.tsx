// src/Pages/SuperAdmin/EditPackage.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../Libs/axios";

type FormState = {
    // package main
    name: string;
    description: string;
    capacity: string; // เก็บเป็น string ในฟอร์ม แล้วค่อย Number() ตอนส่ง
    price: string;
    warning: string;
    statusPackage: "PUBLISH" | "DRAFT";
    statusApprove: "APPROVE" | "PENDING" | "REJECT" | null;
    startDate: string; // yyyy-mm-dd
    dueDate: string;   // yyyy-mm-dd
    facility: string;

    // relations / owner
    communityId: string;
    overseerMemberId: string;
    createById: string; // จำเป็นตาม service editPackage ของคุณ

    // location
    houseNumber: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
    detail: string;
    latitude: string;
    longitude: string;
};

const initialState: FormState = {
    name: "",
    description: "",
    capacity: "",
    price: "",
    warning: "",
    statusPackage: "DRAFT",
    statusApprove: "PENDING",
    startDate: "",
    dueDate: "",
    facility: "",

    communityId: "",
    overseerMemberId: "",
    createById: "",

    houseNumber: "",
    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
    detail: "",
    latitude: "",
    longitude: "",
};

export default function EditPackage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form, setForm] = React.useState<FormState>(initialState);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [ok, setOk] = React.useState<string | null>(null);

    // TODO: preload รายละเอียดเดิมเมื่อมี GET /super/package/:id
    // React.useEffect(() => { ... }, [id])

    function set<K extends keyof FormState>(key: K, val: FormState[K]) {
        setForm((s) => ({ ...s, [key]: val }));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setOk(null);

        try {
            if (!id) throw new Error("ไม่พบรหัสแพ็กเกจ");

            const payload = {
                // ตามโครง editPackage ของคุณ
                communityId: Number(form.communityId),
                overseerMemberId: Number(form.overseerMemberId),
                createById: Number(form.createById),

                name: form.name,
                description: form.description,
                capacity: Number(form.capacity || 0),
                price: Number(form.price || 0),
                warning: form.warning,
                statusPackage: form.statusPackage,
                statusApprove: form.statusApprove, // อนุมัติ/รอ/ปฏิเสธ
                startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
                dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
                facility: form.facility, // ถ้าฐานข้อมูลเป็น JSON/array ค่อยแปลงภายหลัง

                location: {
                    houseNumber: form.houseNumber,
                    subDistrict: form.subDistrict,
                    district: form.district,
                    province: form.province,
                    postalCode: form.postalCode,
                    detail: form.detail,
                    latitude: Number(form.latitude || 0),
                    longitude: Number(form.longitude || 0),
                },
            };

            await api.put(`/super/package/${id}`, payload);
            setOk("บันทึกสำเร็จ");
            // กลับไปหน้าก่อนหน้าหรือคงหน้าเดิมก็ได้
            // navigate("/super/packages");
        } catch (err: any) {
            setError(err?.message ?? "บันทึกไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-form px-3 py-2 border text-sm"
                >
                    ← ย้อนกลับ
                </button>
                <h1 className="text-2xl">แก้ไขแพ็กเกจ #{id}</h1>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {ok && <div className="text-emerald-700 text-sm">{ok}</div>}

            <form onSubmit={onSubmit} className="bg-white rounded-lg p-4 space-y-6">
                {/* ข้อมูลหลักของแพ็กเกจ */}
                <section className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">ชื่อแพ็กเกจ *</label>
                        <input
                            className="w-full rounded-form border px-3 py-2"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="เช่น เที่ยวทะเล 3 วัน 2 คืน"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">คำอธิบาย *</label>
                        <textarea
                            className="w-full rounded-form border px-3 py-2 min-h-[100px]"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            placeholder="รายละเอียดแพ็กเกจ..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">ความจุ (คน) *</label>
                        <input
                            type="number"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.capacity}
                            onChange={(e) => set("capacity", e.target.value)}
                            min={0}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">ราคา (บาท) *</label>
                        <input
                            type="number"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.price}
                            onChange={(e) => set("price", e.target.value)}
                            min={0}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">สถานะแพ็กเกจ *</label>
                        <select
                            className="w-full rounded-form border px-3 py-2"
                            value={form.statusPackage}
                            onChange={(e) =>
                                set("statusPackage", e.target.value as FormState["statusPackage"])
                            }
                        >
                            <option value="DRAFT">DRAFT (ยังไม่เผยแพร่)</option>
                            <option value="PUBLISH">PUBLISH (เผยแพร่)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">สถานะการอนุมัติ</label>
                        <select
                            className="w-full rounded-form border px-3 py-2"
                            value={form.statusApprove ?? "PENDING"}
                            onChange={(e) =>
                                set("statusApprove", e.target.value as FormState["statusApprove"])
                            }
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="APPROVE">APPROVE</option>
                            <option value="REJECT">REJECT</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">วันที่เริ่มแพ็กเกจ</label>
                        <input
                            type="date"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.startDate}
                            onChange={(e) => set("startDate", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">วันที่สิ้นสุดแพ็กเกจ</label>
                        <input
                            type="date"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.dueDate}
                            onChange={(e) => set("dueDate", e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">สิ่งอำนวยความสะดวก / หมายเหตุ</label>
                        <input
                            className="w-full rounded-form border px-3 py-2"
                            value={form.facility}
                            onChange={(e) => set("facility", e.target.value)}
                            placeholder="รายการสิ่งอำนวยความสะดวก หรือข้อความอื่น ๆ"
                        />
                    </div>
                </section>

                {/* ความสัมพันธ์ / ผู้รับผิดชอบ */}
                <section className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm mb-1">ชุมชน (communityId) *</label>
                        <input
                            type="number"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.communityId}
                            onChange={(e) => set("communityId", e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">ผู้ดูแล (overseerMemberId) *</label>
                        <input
                            type="number"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.overseerMemberId}
                            onChange={(e) => set("overseerMemberId", e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">ผู้แก้ไข (createById) *</label>
                        <input
                            type="number"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.createById}
                            onChange={(e) => set("createById", e.target.value)}
                            required
                        />
                    </div>
                </section>

                {/* ที่อยู่/พิกัด */}
                <section className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1">เลขที่บ้าน</label>
                        <input
                            className="w-full rounded-form border px-3 py-2"
                            value={form.houseNumber}
                            onChange={(e) => set("houseNumber", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">ตำบล/แขวง</label>
                        <input
                            className="w-full rounded-form border px-3 py-2"
                            value={form.subDistrict}
                            onChange={(e) => set("subDistrict", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">อำเภอ/เขต</label>
                        <input
                            className="w-full rounded-form border px-3 py-2"
                            value={form.district}
                            onChange={(e) => set("district", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">จังหวัด</label>
                        <input
                            className="w-full rounded-form border px-3 py-2"
                            value={form.province}
                            onChange={(e) => set("province", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">รหัสไปรษณีย์</label>
                        <input
                            className="w-full rounded-form border px-3 py-2"
                            value={form.postalCode}
                            onChange={(e) => set("postalCode", e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">รายละเอียดที่อยู่</label>
                        <input
                            className="w-full rounded-form border px-3 py-2"
                            value={form.detail}
                            onChange={(e) => set("detail", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">ละติจูด</label>
                        <input
                            type="number"
                            step="any"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.latitude}
                            onChange={(e) => set("latitude", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">ลองจิจูด</label>
                        <input
                            type="number"
                            step="any"
                            className="w-full rounded-form border px-3 py-2"
                            value={form.longitude}
                            onChange={(e) => set("longitude", e.target.value)}
                        />
                    </div>
                </section>

                <div className="flex items-center gap-2 justify-end pt-2">
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
                        disabled={saving}
                    >
                        {saving ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
            </form>
        </div>
    );
}
