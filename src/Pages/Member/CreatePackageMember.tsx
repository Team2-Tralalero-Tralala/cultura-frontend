import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../Libs/axios";

/* ================= Types ================= */
type UserMe = {
    id: number;
    role?: { name: string };
    memberOfCommunity?: number | null;
};

type OverseerOption = { id: number; name: string };
type TagOption = { id: number; name: string };

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

    overseerMemberId: string; // users.us_id
    tagId: string;            // tags.tg_id (ใช้แทน “ประเภท”)

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

/* ================ Utils ================ */
function toISO(dateStr: string, timeStr: string) {
    if (!dateStr) return null;
    const t = timeStr || "00:00";
    return new Date(`${dateStr}T${t}:00`).toISOString();
}

/** รองรับทั้ง key แบบปกติและแบบ us_* จาก phpMyAdmin */
function getUserId(u: any): number {
    return Number(
        u?.id ??
        u?.us_id
    );
}
function getUserFirstName(u: any): string {
    return String(u?.fname ?? u?.us_fname ?? "");
}
function getUserLastName(u: any): string {
    return String(u?.lname ?? u?.us_lname ?? "");
}
function getUserUsername(u: any): string {
    return String(u?.username ?? u?.us_username ?? "");
}
function displayNameFromUser(u: any): string {
    const fname = getUserFirstName(u);
    const lname = getUserLastName(u);
    const full = `${fname} ${lname}`.trim();
    if (full.length > 0) return full;
    const uname = getUserUsername(u);
    if (uname.length > 0) return uname;
    return "ไม่ระบุชื่อ";
}

/** รองรับทั้ง key แบบปกติและ tg_* */
function getTagId(t: any): number {
    return Number(t?.id ?? t?.tg_id);
}
function getTagName(t: any): string {
    return String(t?.name ?? t?.tg_name ?? "ไม่ทราบชื่อ");
}

/* ================ Page ================ */
const CreatePackageMember: React.FC = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState<Form>(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const [me, setMe] = useState<UserMe | null>(null);
    const [overseers, setOverseers] = useState<OverseerOption[]>([]);
    const [tags, setTags] = useState<TagOption[]>([]);

    const setF = <K extends keyof Form>(k: K, v: Form[K]) =>
        setForm((s) => ({ ...s, [k]: v }));

    /* ---------- Load me + dropdowns ---------- */
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                // me
                try {
                    const meRes = await api.get("/auth/me");
                    const d = meRes?.data?.data ?? meRes?.data;
                    if (alive && d) {
                        const memberOfCommunity =
                            d?.memberOfCommunity ??
                            d?.memberOf?.id ??
                            d?.us_member_of_community ??
                            null;

                        setMe({
                            id: Number(d?.id ?? d?.us_id),
                            role: d?.role ? { name: d.role.name } : undefined,
                            memberOfCommunity,
                        });
                    }
                } catch {
                    /* ไม่มี /auth/me ก็ข้าม */
                }

                // Overseers: users role MEMBER (และถ้าได้ communityId ก็กรอง)
                try {
                    const params: any = { role: "MEMBER" };
                    if (me?.memberOfCommunity) params.communityId = me.memberOfCommunity;
                    const res = await api.get("/users", { params });
                    const list = res?.data?.data ?? res?.data ?? [];
                    const mapped: OverseerOption[] = Array.isArray(list)
                        ? list.map((u: any) => ({
                            id: getUserId(u),
                            name: displayNameFromUser(u),
                        }))
                        : [];
                    if (alive) setOverseers(mapped);
                } catch {
                    // fallback เส้นทางสำรอง
                    try {
                        const res2 = await api.get("/member/overseers");
                        const list = res2?.data?.data ?? res2?.data ?? [];
                        const mapped: OverseerOption[] = Array.isArray(list)
                            ? list.map((u: any) => ({
                                id: getUserId(u),
                                name: displayNameFromUser(u),
                            }))
                            : [];
                        if (alive) setOverseers(mapped);
                    } catch { /* ignore */ }
                }

                // Tags (ประเภท)
                try {
                    const tRes = await api.get("/tags", { params: { isDeleted: false } });
                    const list = tRes?.data?.data ?? tRes?.data ?? [];
                    const mapped: TagOption[] = Array.isArray(list)
                        ? list.map((t: any) => ({
                            id: getTagId(t),
                            name: getTagName(t),
                        }))
                        : [];
                    if (alive) setTags(mapped);
                } catch { /* ignore */ }
            } catch { /* ignore */ }
        })();
        return () => {
            alive = false;
        };
    }, [me?.memberOfCommunity]);

    const canSubmit = useMemo(() => {
        return (
            form.name.trim() &&
            form.description.trim() &&
            form.houseNumber.trim() &&
            form.villageNo.trim() &&
            form.province.trim() &&
            form.district.trim() &&
            form.subDistrict.trim() &&
            form.postalCode.trim() &&
            form.latitude.trim() &&
            form.longitude.trim() &&
            form.overseerMemberId &&
            form.tagId &&
            form.startDate &&
            form.endDate &&
            form.openDate &&
            form.closeDate &&
            form.capacity &&
            form.price
        );
    }, [form]);

    /* ---------- Submit ---------- */
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;

        setSaving(true);
        setError(null);
        setOk(null);

        try {
            const payload = {
                communityId: me?.memberOfCommunity ?? undefined,   // infer จาก /auth/me
                overseerMemberId: Number(form.overseerMemberId),
                createById: me?.id ?? undefined,

                name: form.name.trim(),
                description: form.description.trim(),
                capacity: Number(form.capacity),
                price: Number(form.price),
                warning: " ", // schema บังคับ ไม่ให้ค่าว่าง
                statusPackage: "DRAFT",   // PackagePublishStatus
                statusApprove: "PENDING", // PackageApproveStatus

                startDate: toISO(form.startDate, form.startTime),
                dueDate: toISO(form.endDate, form.endTime),

                facility: form.facility.trim(),

                location: {
                    houseNumber: form.houseNumber.trim(),
                    subDistrict: form.subDistrict.trim(),
                    district: form.district.trim(),
                    province: form.province.trim(),
                    postalCode: form.postalCode.trim(),
                    detail: form.addressDetail.trim() || null,
                    latitude: Number(form.latitude),
                    longitude: Number(form.longitude),
                    villageNumber: form.villageNo ? Number(form.villageNo) : null, // lt_village_number
                },

                // “ประเภท” ใช้ tags → ให้ backend map ไปตาราง tags_packages
                tagIds: [Number(form.tagId)],
            };

            await api.post("/member/package", payload);
            setOk("สร้างแพ็กเกจสำเร็จ");
            // navigate("/member/packages");
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? "สร้างแพ็กเกจไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    }

    /* ---------- UI ตรงตามภาพ ---------- */
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded-form px-3 py-2 border text-sm"
                >
                    ← ย้อนกลับ
                </button>
                <h1 className="text-2xl">สร้างแพ็กเกจ</h1>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {ok && <div className="text-emerald-700 text-sm">{ok}</div>}

            <form onSubmit={onSubmit} className="bg-white rounded-lg p-4 space-y-8 shadow-sm">
                {/* ชื่อแพ็กเกจ / คำอธิบายแพ็กเกจ */}
                <section className="space-y-4">
                    <div className="grid gap-4">
                        <label className="block">
                            <span className="block text-sm mb-1">ชื่อแพ็กเกจ <span className="text-red-600">*</span></span>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="ชื่อแพ็กเกจ"
                                value={form.name}
                                onChange={(e) => setF("name", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">คำอธิบายแพ็กเกจ <span className="text-red-600">*</span></span>
                            <textarea
                                className="w-full rounded-form border px-3 py-2 min-h-[110px]"
                                placeholder="คำอธิบายแพ็กเกจ"
                                value={form.description}
                                onChange={(e) => setF("description", e.target.value)}
                                required
                            />
                        </label>
                    </div>
                </section>

                {/* ที่อยู่ */}
                <section className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="block text-sm mb-1">บ้านเลขที่ <span className="text-red-600">*</span></span>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="ป้อนบ้านเลขที่ของชุมชน"
                                value={form.houseNumber}
                                onChange={(e) => setF("houseNumber", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">หมู่ที่ <span className="text-red-600">*</span></span>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="ป้อนหมู่ของชุมชน"
                                value={form.villageNo}
                                onChange={(e) => setF("villageNo", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">จังหวัด <span className="text-red-600">*</span></span>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="เลือกจังหวัด"
                                value={form.province}
                                onChange={(e) => setF("province", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">อำเภอ / เขต <span className="text-red-600">*</span></span>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="เลือกอำเภอ / เขต"
                                value={form.district}
                                onChange={(e) => setF("district", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">ตำบล / แขวง <span className="text-red-600">*</span></span>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="เลือกตำบล / แขวง"
                                value={form.subDistrict}
                                onChange={(e) => setF("subDistrict", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">รหัสไปรษณีย์ <span className="text-red-600">*</span></span>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="ป้อนรหัสไปรษณีย์ของชุมชน"
                                value={form.postalCode}
                                onChange={(e) => setF("postalCode", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block md:col-span-2">
                            <span className="block text-sm mb-1">คำอธิบายที่อยู่</span>
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="คำอธิบายที่อยู่"
                                value={form.addressDetail}
                                onChange={(e) => setF("addressDetail", e.target.value)}
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">ละติจูด <span className="text-red-600">*</span></span>
                            <input
                                type="number"
                                step="any"
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="ป้อนละติจูดของที่ตั้ง"
                                value={form.latitude}
                                onChange={(e) => setF("latitude", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">ลองจิจูด <span className="text-red-600">*</span></span>
                            <input
                                type="number"
                                step="any"
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="ป้อนลองจิจูดของที่ตั้ง"
                                value={form.longitude}
                                onChange={(e) => setF("longitude", e.target.value)}
                                required
                            />
                        </label>
                    </div>

                    {/* ช่องค้นหาสถานที่ + กล่องแผนที่เทา */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="ป้อนชื่อสถานที่หรือสถานที่ใกล้เคียงเพื่อปักหมุด"
                                value={form.placeQuery}
                                onChange={(e) => setF("placeQuery", e.target.value)}
                            />
                            <button type="button" className="rounded-form px-3 py-2 border">ค้นหา</button>
                        </div>
                        <div className="rounded-lg border h-[280px] bg-gray-100" />
                    </div>
                </section>

                {/* ผู้ดูแล / ประเภท / สิ่งอำนวยความสะดวก */}
                <section className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="block text-sm mb-1">ผู้ดูแล <span className="text-red-600">*</span></span>
                            <select
                                className="w-full rounded-form border px-3 py-2"
                                value={form.overseerMemberId}
                                onChange={(e) => setF("overseerMemberId", e.target.value)}
                                required
                            >
                                <option value="">เลือกผู้ดูแล</option>
                                {overseers.map((o) => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">ประเภท <span className="text-red-600">*</span></span>
                            <select
                                className="w-full rounded-form border px-3 py-2"
                                value={form.tagId}
                                onChange={(e) => setF("tagId", e.target.value)}
                                required
                            >
                                <option value="">เลือกประเภท</option>
                                {tags.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="block">
                        <span className="block text-sm mb-1">สิ่งอำนวยความสะดวก</span>
                        <input
                            className="w-full rounded-form border px-3 py-2"
                            placeholder="สิ่งอำนวยความสะดวก"
                            value={form.facility}
                            onChange={(e) => setF("facility", e.target.value)}
                        />
                    </label>
                </section>

                {/* วันเวลา / จำนวน / ราคา */}
                <section className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="block text-sm mb-1">วัน/เดือน/ปี (ค.ศ.) ที่เริ่ม <span className="text-red-600">*</span></span>
                            <input
                                type="date"
                                className="w-full rounded-form border px-3 py-2"
                                value={form.startDate}
                                onChange={(e) => setF("startDate", e.target.value)}
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="block text-sm mb-1">เวลาที่เริ่ม <span className="text-red-600">*</span></span>
                            <input
                                type="time"
                                className="w-full rounded-form border px-3 py-2"
                                value={form.startTime}
                                onChange={(e) => setF("startTime", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">วัน/เดือน/ปี (ค.ศ.) ที่สิ้นสุด <span className="text-red-600">*</span></span>
                            <input
                                type="date"
                                className="w-full rounded-form border px-3 py-2"
                                value={form.endDate}
                                onChange={(e) => setF("endDate", e.target.value)}
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="block text-sm mb-1">เวลาที่สิ้นสุด <span className="text-red-600">*</span></span>
                            <input
                                type="time"
                                className="w-full rounded-form border px-3 py-2"
                                value={form.endTime}
                                onChange={(e) => setF("endTime", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">วัน/เดือน/ปี (ค.ศ.) ที่เปิดจอง <span className="text-red-600">*</span></span>
                            <input
                                type="date"
                                className="w-full rounded-form border px-3 py-2"
                                value={form.openDate}
                                onChange={(e) => setF("openDate", e.target.value)}
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="block text-sm mb-1">เวลาที่เปิดจอง <span className="text-red-600">*</span></span>
                            <input
                                type="time"
                                className="w-full rounded-form border px-3 py-2"
                                value={form.openTime}
                                onChange={(e) => setF("openTime", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">วัน/เดือน/ปี (ค.ศ.) ที่ปิดจอง <span className="text-red-600">*</span></span>
                            <input
                                type="date"
                                className="w-full rounded-form border px-3 py-2"
                                value={form.closeDate}
                                onChange={(e) => setF("closeDate", e.target.value)}
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="block text-sm mb-1">เวลาที่ปิดจอง <span className="text-red-600">*</span></span>
                            <input
                                type="time"
                                className="w-full rounded-form border px-3 py-2"
                                value={form.closeTime}
                                onChange={(e) => setF("closeTime", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">เปิดรับจำนวน <span className="text-red-600">*</span></span>
                            <input
                                type="number"
                                min={0}
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="ป้อนจำนวนคนที่เปิดรับ"
                                value={form.capacity}
                                onChange={(e) => setF("capacity", e.target.value)}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm mb-1">ราคา <span className="text-red-600">*</span></span>
                            <input
                                type="number"
                                min={0}
                                className="w-full rounded-form border px-3 py-2"
                                placeholder="ป้อนราคา"
                                value={form.price}
                                onChange={(e) => setF("price", e.target.value)}
                                required
                            />
                        </label>
                    </div>
                </section>

                {/* เพิ่มที่พัก (ไม่บังคับ) */}
                <section className="space-y-2">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setF("addHomestay", true)}
                            className={`rounded-form px-3 py-2 border ${form.addHomestay ? "bg-emerald-600 text-white border-emerald-600" : ""}`}
                        >
                            เพิ่มที่พัก
                        </button>
                        <button
                            type="button"
                            onClick={() => setF("addHomestay", false)}
                            className={`rounded-form px-3 py-2 border ${!form.addHomestay ? "bg-gray-700 text-white border-gray-700" : ""}`}
                        >
                            ไม่เพิ่มที่พัก
                        </button>
                    </div>
                </section>

                {/* ปุ่มบันทึก */}
                <div className="flex items-center gap-2 justify-end">
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
                        {saving ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePackageMember;
