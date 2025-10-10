// src/Pages/Admin/EditPackageAdmin.tsx
/**
 * คำอธิบาย: หน้าจอแก้ไขแพ็กเกจ (บทบาท Admin)
 * หน้าที่หลัก:
 *  - โหลดข้อมูลแพ็กเกจตาม packageId มาใส่ฟอร์ม
 *  - ส่งข้อมูลที่แก้ไขแล้วกลับไปอัปเดตผ่าน API
 * หมายเหตุ:
 *  - ใช้ TextField เป็นอินพุตมาตรฐานเพื่อความสม่ำเสมอของ UI
 *  - ตั้งชื่อตัวแปรให้สื่อความหมาย (เช่น setFormField, formState, isSaving ฯลฯ)
 */

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import TextField from "../../Components/TextField";

const apiUrl = import.meta.env.VITE_API_URL;

/* ================= Helpers ================= */
/** แปลง Date/ISO string → "yyyy-mm-dd" สำหรับ <input type="date"> */
function toDateInput(input?: string | Date | null) {
    if (!input) return "";
    const dateObject = new Date(input);
    if (isNaN(dateObject.getTime())) return "";
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/** คืนค่าสตริงที่ trim แล้ว; ถ้าว่างให้คืน fallback */
function normalizeOrDefault(value: any, fallback = "") {
    const trimmed = (value ?? "").toString().trim();
    return trimmed.length ? trimmed : fallback;
}

/* ================= Types ================= */
type EditPackageForm = {
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

const initialFormState: EditPackageForm = {
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
        villageNumber?: string;
        subDistrict: string;
        district: string;
        province: string;
        postalCode: string;
        detail?: string | null;
        latitude: number;
        longitude: number;
    };
};

const EditPackageAdmin: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const packageId = Number(id);
    const navigate = useNavigate();

    const [formState, setFormState] = React.useState<EditPackageForm>(initialFormState);
    const [communityId, setCommunityId] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

    /** อัปเดตฟิลด์ของฟอร์มแบบ key-safe */
    const setFormField = <K extends keyof EditPackageForm>(key: K, value: EditPackageForm[K]) =>
        setFormState((prev) => ({ ...prev, [key]: value }));

    /**
     * ดึงรายละเอียดแพ็กเกจ (role = admin) แล้วแม็ปลง formState
     */
    async function fetchPackageForAdmin(targetPackageId: number) {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await axios.get(`${apiUrl}/admin/package/${targetPackageId}`, {
                withCredentials: true,
            });
            const data: LoadedPackage = response.data?.data;
            if (!data) return;

            setCommunityId(Number(data.communityId));
            setFormState({
                name: normalizeOrDefault(data.name),
                description: normalizeOrDefault(data.description),

                houseNumber: normalizeOrDefault(data.location?.houseNumber),
                villageNumber: normalizeOrDefault(data.location?.villageNumber),
                province: normalizeOrDefault(data.location?.province),
                district: normalizeOrDefault(data.location?.district),
                subDistrict: normalizeOrDefault(data.location?.subDistrict),
                postalCode: normalizeOrDefault(data.location?.postalCode),
                addressDetail: normalizeOrDefault(data.location?.detail),
                latitude: String(data.location?.latitude ?? ""),
                longitude: String(data.location?.longitude ?? ""),
                placeQuery: "",

                overseerMemberId: String(data.overseerMemberId ?? ""),
                tagId: "",
                facility: normalizeOrDefault(data.facility ?? data.warning ?? ""),

                startDate: toDateInput(data.startDate),
                startTime: "",
                endDate: toDateInput(data.dueDate),
                endTime: "",
                openDate: "",
                openTime: "",
                closeDate: "",
                closeTime: "",

                capacity: String(data.capacity ?? ""),
                price: String(data.price ?? ""),
                addHomestay: false,
            });
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message ?? error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    }

    React.useEffect(() => {
        if (!Number.isFinite(packageId)) return;
        fetchPackageForAdmin(packageId);
    }, [packageId]);

    /** ตรวจเงื่อนไขก่อนส่งฟอร์ม */
    const canSubmit = React.useMemo(() => {
        const requiredFields = [
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
        return requiredFields.every((v) => String(v ?? "").trim() !== "");
    }, [formState]);

    /** ส่งฟอร์มแก้ไขไปยัง API */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!window.confirm("ยืนยันการบันทึกการแก้ไขแพ็กเกจใช่หรือไม่?")) return;
        if (!canSubmit || !communityId) return;

        setIsSaving(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const payload = {
                communityId,
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
                facility: normalizeOrDefault(formState.facility),

                location: {
                    houseNumber: normalizeOrDefault(formState.houseNumber),
                    subDistrict: normalizeOrDefault(formState.subDistrict),
                    district: normalizeOrDefault(formState.district),
                    province: normalizeOrDefault(formState.province),
                    postalCode: normalizeOrDefault(formState.postalCode),
                    detail: normalizeOrDefault(formState.addressDetail),
                    latitude: Number(formState.latitude),
                    longitude: Number(formState.longitude),
                },
            };

            await axios.put(`${apiUrl}/admin/package/${packageId}`, payload, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            setSuccessMessage("บันทึกการแก้ไขสำเร็จ");
            alert("บันทึกการแก้ไขสำเร็จ!");
            navigate("/admin/packages");
        } catch (error: any) {
            console.error("Edit package (admin) error payload:", error?.response?.data);
            setErrorMessage(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "บันทึกการแก้ไขไม่สำเร็จ"
            );
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="w-full max-w-none px-0 lg:px-0">
                <div className="bg-white rounded-lg p-6 shadow-sm">กำลังโหลด…</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-none px-0 lg:px-0">
            {errorMessage && <div className="text-red-600 text-sm">{errorMessage}</div>}
            {successMessage && <div className="text-emerald-700 text-sm">{successMessage}</div>}

            <form
                onSubmit={handleSubmit}
                className="w-full bg-white rounded-lg p-5 md:p-6 lg:p-7 shadow-sm space-y-8"
            >
                <label className="block text-xl mb-1">แก้ไขแพ็กเกจ</label>

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
                        <label className="block text-sm mb-1">
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

                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">
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

                        <TextField
                            id="latitude"
                            label="ละติจูด"
                            required
                            type="number"
                            placeholder="กรอกละติจูด"
                            value={formState.latitude}
                            onChange={(e) => setFormField("latitude", e.target.value)}
                        />
                        <TextField
                            id="longitude"
                            label="ลองจิจูด"
                            required
                            type="number"
                            placeholder="กรอกลองจิจูด"
                            value={formState.longitude}
                            onChange={(e) => setFormField("longitude", e.target.value)}
                        />
                    </div>

                    {/* ค้นหาสถานที่ + แผนที่ */}
                    <div className="space-y-2">
                        <TextField
                            id="placeQuery"
                            label="ค้นหาสถานที่"
                            placeholder="ป้อนชื่อสถานที่หรือสถานที่ใกล้เคียงเพื่อปักหมุด"
                            value={formState.placeQuery}
                            onChange={(e) => setFormField("placeQuery", e.target.value)}
                        />
                        <div className="rounded-lg border h-[300px] bg-gray-100" />
                    </div>
                </section>

                {/* ผู้ดูแล + ความจุ */}
                <section className="grid md:grid-cols-2 gap-5">
                    <TextField
                        id="overseerMemberId"
                        label="ผู้ดูแล"
                        required
                        type="number"
                        placeholder="กรอก id ผู้ดูแล"
                        value={formState.overseerMemberId}
                        onChange={(e) => setFormField("overseerMemberId", e.target.value)}
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
                    <TextField
                        id="facility"
                        label="สิ่งอำนวยความสะดวก"
                        placeholder="สิ่งอำนวยความสะดวก"
                        value={formState.facility}
                        onChange={(e) => setFormField("facility", e.target.value)}
                    />
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
                        type="time"
                        value={formState.endTime}
                        onChange={(e) => setFormField("endTime", e.target.value)}
                    />

                    <TextField
                        id="openDate"
                        label="วัน/เดือน/ปี (ค.ศ.) ที่เปิดจอง"
                        type="date"
                        value={formState.openDate}
                        onChange={(e) => setFormField("openDate", e.target.value)}
                    />
                    <TextField
                        id="openTime"
                        label="เวลาที่เปิดจอง"
                        type="time"
                        value={formState.openTime}
                        onChange={(e) => setFormField("openTime", e.target.value)}
                    />
                    <TextField
                        id="closeDate"
                        label="วัน/เดือน/ปี (ค.ศ.) ที่ปิดจอง"
                        type="date"
                        value={formState.closeDate}
                        onChange={(e) => setFormField("closeDate", e.target.value)}
                    />
                    <TextField
                        id="closeTime"
                        label="เวลาที่ปิดจอง"
                        type="time"
                        value={formState.closeTime}
                        onChange={(e) => setFormField("closeTime", e.target.value)}
                    />
                </section>

                {/* แท็ก / ราคา */}
                <section className="grid md:grid-cols-2 gap-5">
                    <TextField
                        id="tagId"
                        label="แท็ก"
                        placeholder="ค้นหาแท็ก เช่น ธรรมชาติ อาหาร ฯลฯ"
                        value={formState.tagId}
                        onChange={(e) => setFormField("tagId", e.target.value)}
                    />
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

                {/* ปุ่มล่างขวา */}
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
                        disabled={isSaving || !canSubmit}
                    >
                        {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPackageAdmin;
