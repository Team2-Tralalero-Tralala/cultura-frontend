import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../../Components/Button";
import { Backward, EditIcon } from "../../Icon/MaterialSymbolsLight";
import { Tag } from "../../Components/Tag";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const apiUrl = import.meta.env.VITE_API_URL;

interface DateTimeField {
  date: string | null;
  time: string | null;
}

interface UserRef {
  id: number;
  name: string;
}

interface LocationData {
  address: string;
  detail: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
}

interface HomestayData {
  id: number;
  name: string;
  roomType: string;
  capacity: number;
  detail: string;
  images: { id: number; path: string; type: string }[];
  location?: {
    subDistrict?: string;
    district?: string;
    province?: string;
    latitude?: number;
    longitude?: number;
  } | null;
}

interface HomestayHistory {
  id: number;
  guestAmount: number;
  checkInTime: string;
  checkOutTime: string;
  homestay?: HomestayData | null;
}

interface PackageData {
  id: number;
  name: string;
  description: string;
  capacity: number;
  price: number;
  facility: string;
  warning: string;
  statusPackage: string;
  statusApprove?: string | null;
  rejectReason?: string | null;
  createdBy?: UserRef | null;
  overseer?: UserRef | null;
  tags: string[];
  startDate: DateTimeField;
  dueDate: DateTimeField;
  openBookingAt: DateTimeField;
  closeBookingAt: DateTimeField;
  location?: LocationData | null;
  files: { id: number; path: string; type: string }[];
  homestayHistories: HomestayHistory[];
}

/**
 * Componant สำหรับแปลงวันที่เป็นรูปแบบ dd/mm/yyyy (ใช้ในกรณีที่ต้องการแสดงผล)
 */
function formatDateTH(dateStr: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/*
 * คำอธิบาย : ฟังก์ชันแยกวันที่และเวลาออกจากข้อมูลรูปแบบ ISO String (เช่น "2025-01-01T08:30:00.000Z")
 * Input  : isoString (ข้อความวันที่-เวลาในรูปแบบ ISO 8601 หรือ null)
 * Output : วัตถุ (Object) ที่ประกอบด้วยวันที่ (date) และเวลา (time) ในรูปแบบที่อ่านง่าย เช่น { date: "2025-01-01", time: "08:30" }
 * การทำงาน :
 *   1. ตรวจสอบว่าค่าที่รับเข้ามามีข้อมูลหรือไม่ (ถ้าไม่มีจะคืนค่า { date: null, time: null })
 *   2. แปลงข้อความ isoString ให้เป็นวัตถุ Date ของ JavaScript
 *   3. แยกส่วนวันที่ (YYYY-MM-DD) และเวลาชั่วโมง-นาที (HH:MM) ออกจากวัตถุ Date
 *   4. คืนค่าผลลัพธ์เป็น Object ที่มี key 'date' และ 'time'
 */
function extractDateTime(isoString?: string | null) {
  if (!isoString) return { date: null, time: null };
  const d = new Date(isoString);
  const date = d.toISOString().split("T")[0]; // YYYY-MM-DD
  const time = d.toTimeString().split(" ")[0].slice(0, 5); // HH:MM
  return { date, time };
}



export default function DetailPackageSuperAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  async function fetchPackage() {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/packages/${id}`, {
        withCredentials: true,
      });

      const raw = res.data.data;

      // Map โครงสร้างข้อมูลให้ตรงกับ interface
      const mappedData: PackageData = {
        id: raw.id,
        name: raw.name,
        description: raw.description ?? "-",
        capacity: raw.capacity ?? 0,
        price: raw.price ?? 0,
        facility: raw.facility ?? "-",
        warning: raw.warning ?? "-",
        statusPackage: raw.statusPackage ?? "-",
        statusApprove: raw.statusApprove ?? null,
        rejectReason: raw.rejectReason ?? null,
        createdBy: raw.createPackage
          ? {
              id: raw.createPackage.id,
              name: `${raw.createPackage.fname} ${raw.createPackage.lname}`,
            }
          : null,
        overseer: raw.overseerPackage
          ? {
              id: raw.overseerPackage.id,
              name: `${raw.overseerPackage.fname} ${raw.overseerPackage.lname}`,
            }
          : null,
        tags: raw.tagPackages
          ? raw.tagPackages.map((t: any) => t.tag.name)
          : [],
        startDate: extractDateTime(raw.startDate),
        dueDate: extractDateTime(raw.dueDate),
        openBookingAt: extractDateTime(raw.bookingOpenDate),
        closeBookingAt: extractDateTime(raw.bookingCloseDate),
        location: raw.location
          ? {
              address: raw.location.houseNumber ?? "-",
              detail: raw.location.detail ?? "-",
              subDistrict: raw.location.subDistrict,
              district: raw.location.district,
              province: raw.location.province,
              postalCode: raw.location.postalCode,
              latitude: raw.location.latitude,
              longitude: raw.location.longitude,
            }
          : null,
        files: raw.packageFile
          ? raw.packageFile.map((f: any) => ({
              id: f.id,
              path: f.filePath,
              type: f.type,
            }))
          : [],
        homestayHistories: [],
      };

      setPkg(mappedData);
      console.log("Mapped package data:", mappedData);
    } catch (err) {
      console.error("Error fetching package:", err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }

  fetchPackage();
}, [id]);

  if (loading)
    return <div className="p-6 text-gray-500">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!pkg) return <div className="p-6 text-gray-500">ไม่พบข้อมูลแพ็กเกจ</div>;

  const coverImage = pkg.files?.find((f) => f.type === "COVER");

  return (
<div className="max-w-8xl mx-auto">

    {/* Breadcrumb อยู่นอกกรอบ */}
    <div className="mb-4 text-sm">
      <Breadcrumb
        current={{
          label: pkg.name,
          to: `/super/package/${pkg.id}`,
        }}
      />
    </div>
    <div className="max-w-8xl mx-auto bg-white rounded-2xl shadow-sm p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-row">
          {/* ปุ่มย้อนกลับ */}
          <div
            className="mt-1 mr-3 cursor-pointer"
            onClick={() => navigate(`/super/packages/all`)}
          >
            <Backward></Backward>
          </div>
          <h1 className="text-xl font-bold mb-10">รายละเอียดแพ็กเกจ</h1>
        </div>
        <div className="w-60">
          {/* ปุ่มแก้ไขรายละเอียดแพ็กเกจ */}
          <Button onClick={() => navigate(`/super/package/${id}/edit`)}>
            <EditIcon></EditIcon>แก้ไขรายละเอียดแพ็กเกจ
          </Button>
        </div>
      </div>
      {/* ชื่อแพ็กเกจ */}
      <div className="mb-6 flex flex-row">
        <p className="text-md text-gray-800">
          <strong>ชื่อแพ็กเกจ : </strong>
          {pkg.name}
        </p>
      </div>

      {/* คำอธิบาย */}
      <div className="mb-6">
        <div className="flex flex-row">
          <p className="text-md text-gray-800">
            <strong>คำอธิบาย : </strong>
            {pkg.description}
          </p>
        </div>
      </div>

      {/* จำนวนคน / ราคา */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex flex-row mr-30">
          <p className="text-md text-gray-800">
            <strong>จำนวนคนที่เปิดรับ : </strong>
            {pkg.capacity} คน
          </p>
        </div>
        <div className="flex flex-row">
          <p className="text-md ml-5 text-gray-800">
            <strong>ราคา : </strong>
            {pkg.price.toLocaleString()} บาท
          </p>
        </div>
      </div>

      {/* แท็ก */}
      {pkg.tags?.length > 0 && (
        <p className="mb-6 flex gap-2 flex-row">
          <strong>แท็ก :</strong>{" "}
          {pkg.tags.map((t, i) => (
            <Tag
              key={i}
              label={t}
              sizeClass="w-20 h-8"
              className="text-black bg-white"
            />
          ))}
        </p>
      )}

      {/* ภาพหลัก (ไม่รู้ว่ามี Componant ของรูปภาพ) */}
      {coverImage && (
        <div className="mb-6">
          <img
            //src={coverImage} //ใช้ในกรณีที่เก็บภาพในเครื่อง
            src={`${apiUrl}/files/${coverImage.path}`} //ใช้ในกรณีที่เก็บภาพบน Backend
            //src="/public/ViewTiwTouch.jpg" //ใช้ในกรณีที่เก็บภาพในโฟลเดอร์ public ของ Frontend
            alt="package cover"
            className="w-160 h-90 object-cover rounded-xl rounded-lg border-gray-400 border-2"
          />
        </div>
      )}

      {/* ข้อมูลผู้ดูแล */}
      <div className="grid md:grid-cols-2 gap-6 text-gray-700 mb-6">
        <div>
          <p className="mb-6">
            <strong>ผู้ดูแล : </strong> {pkg.overseer?.name || "-"}
          </p>
          <p className="mb-6">
            <strong>วันที่เริ่ม - วันที่สิ้นสุดแพ็กเกจ : </strong>{" "}
            {formatDateTH(pkg.startDate?.date)} -{" "}
            {formatDateTH(pkg.dueDate?.date)}
            <br />
            <strong>เวลา : </strong> {pkg.startDate?.time || "-"} -{" "}
            {pkg.dueDate?.time || "-"}
          </p>
        </div>

        <div>
          <p className="mb-6">
            <strong>สร้างโดย : </strong> {pkg.createdBy?.name || "-"}
          </p>
          <p className="mb-6">
            <strong>วันที่เปิด - วันที่ปิดการจอง : </strong>{" "}
            {formatDateTH(pkg.openBookingAt?.date)} -{" "}
            {formatDateTH(pkg.closeBookingAt?.date)}
            <br />
            <strong>เวลา : </strong> {pkg.openBookingAt?.time || "-"} -{" "}
            {pkg.closeBookingAt?.time || "-"}
          </p>
        </div>
      </div>

      {/* สิ่งอำนวยความสะดวก */}
      <div className="mb-6">
        <p>
          <strong>สิ่งอำนวยความสะดวกแพ็กเกจ : </strong> {pkg.facility || "-"}
        </p>
      </div>

      {/* แผนที่ */}
      {pkg.location && (
        <div className="mt-8">
          <h2 className="font-semibold text-lg mb-6">แผนที่</h2>
          <iframe
            title="map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
              pkg.location.longitude - 0.01
            },${pkg.location.latitude - 0.01},${
              pkg.location.longitude + 0.01
            },${pkg.location.latitude + 0.01}&layer=mapnik&marker=${
              pkg.location.latitude
            },${pkg.location.longitude}`}
            className="w-full h-96 rounded-xl border"
          ></iframe>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700 mb-6">
            <div className="mt-6">
              <p className="mb-4">
                <strong>ที่อยู่ :</strong> {pkg.location.address}{" "}
                                        {pkg.location.subDistrict}{" "}
                                        {pkg.location.district}{" "}
                                        {pkg.location.province}{" "}
                                        {pkg.location.postalCode}
              </p>
              <p>
                <strong>ละติจูด / ลองจิจูด : </strong> {pkg.location.latitude},{" "}
                {pkg.location.longitude}
              </p>
            </div>
            <div className="mt-6">
              <p className="mb-4">
                <strong>คำอธิบายที่อยู่ :</strong> {pkg.location.detail}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
        </div>

  );
}
