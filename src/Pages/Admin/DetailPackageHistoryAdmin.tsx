/**
 * Component : DetailPackageHistoryAdmin
 * คำอธิบาย :
 *   หน้ารายละเอียดแพ็กเกจ (สำหรับผู้ดูแลระบบระดับ Admin)
 *   ใช้สำหรับแสดงข้อมูลแพ็กเกจท่องเที่ยวแต่ละรายการที่อยู่ในระบบของชุมชน
 *   สามารถกดแก้ไขข้อมูลได้ และแสดงข้อมูลผู้สร้าง, ผู้ดูแล, วันที่เปิด-ปิดจอง,
 *   สิ่งอำนวยความสะดวก, และแผนที่ตำแหน่งสถานที่จากข้อมูลใน backend
 * Input :
 *   - packageId : หมายเลขรหัสแพ็กเกจ (จาก useParams)
 * Output :
 *   - แสดงหน้า UI รายละเอียดแพ็กเกจ หรือข้อความ error หากไม่พบข้อมูล
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../../Components/Button";
import { Backward, EditIcon } from "../../Icon/MaterialSymbolsLight";
import { Tag } from "../../Components/Tag";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { Icon } from "@iconify/react";

const apiUrl = import.meta.env.VITE_API_URL;

// ================== Helper Interfaces ==================

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
}

// ================== Helper Functions ==================

function formatDateTH(dateStr: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * แยกวันที่และเวลาออกจาก ISO string
 */
function extractDateTime(isoString?: string | null) {
  if (!isoString) return { date: null, time: null };
  const d = new Date(isoString);
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0].slice(0, 5);
  return { date, time };
}

// ================== Main Component ==================

export default function DetailPackageHistoryAdmin() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackage() {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/admin/package/${packageId}`, {
          withCredentials: true,
        });

        const raw = res.data.data;

        const mapped: PackageData = {
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
          tags: raw.tagPackages ? raw.tagPackages.map((t: any) => t.tag.name) : [],
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
        };

        setPkg(mapped);
      } catch (err) {
        console.error("Error fetching package:", err);
        setError("ไม่สามารถโหลดข้อมูลแพ็กเกจได้");
      } finally {
        setLoading(false);
      }
    }

    fetchPackage();
  }, [packageId]);

  // ================== Loading / Error ==================
  if (loading) return <div className="p-6 text-gray-500">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!pkg) return <div className="p-6 text-gray-500">ไม่พบข้อมูลแพ็กเกจ</div>;

  const coverImage = pkg.files?.find((f) => f.type === "COVER");

  /* ----------------------------- จากตรงนี้ลงไปห้ามแก้ ----------------------------- */
  // ตอนนี้ขาด Navigation page ที่มันบอกว่าหน้านี้อยู่ที่ไหน เช่น จัดการแพ็กเกจ / รายละเอียดแพ็กเกจ
  // อาจจะเพิ่มทีหลัง
  // Main container
  return (
    <div className="w-full space-y-4">
      {/* Breadcrumb */}
            {/* <div className="-ml-6 pt-1 pb-1">
              <Breadcrumb
                items={[
                  { label: "ประวัติแพ็กเกจ", to: "/admin/packages/histories" },
                  { label: pkg?.name || "แพ็กเกจ" },
                ]}
              />
            </div> */}
      <div className="max-w-8xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}

        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-row">
            {/* ปุ่มย้อนกลับ */}
            <div
              className="mt-1 mr-3 cursor-pointer"
              onClick={() => navigate(`/admin/packages/histories`)}
            >
              <Icon icon="lucide:arrow-left" className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold mb-10">รายละเอียดแพ็กเกจ</h1>
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
          <div className="flex flex-row mr-100">
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
              <Tag key={i} label={t} sizeClass="w-20 h-8" className="text-black bg-white" />
            ))}
          </p>
        )}

        {/* ภาพหลัก */}
        {coverImage && (
          <div className="mb-6">
            <img
              src={`${apiUrl}/files/${coverImage.path}`}
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
              {formatDateTH(pkg.startDate?.date)} - {formatDateTH(pkg.dueDate?.date)}
              <br />
              <strong>เวลา : </strong> {pkg.startDate?.time || "-"} - {pkg.dueDate?.time || "-"}
            </p>
          </div>

          <div>
            <p className="mb-6">
              <strong>สร้างโดย : </strong> {pkg.createdBy?.name || "-"}
            </p>
            <p className="mb-6">
              <strong>วันที่เปิด - วันที่ปิดการจอง : </strong>{" "}
              {formatDateTH(pkg.openBookingAt?.date)} - {formatDateTH(pkg.closeBookingAt?.date)}
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
              },${pkg.location.latitude - 0.01},${pkg.location.longitude + 0.01},${
                pkg.location.latitude + 0.01
              }&layer=mapnik&marker=${pkg.location.latitude},${pkg.location.longitude}`}
              className="w-full h-96 rounded-xl border"
            ></iframe>
            <div className="grid md:grid-cols-2 gap-6 text-gray-700 mb-6">
              <div className="mt-6">
                <p className="mb-4">
                  <strong>ที่อยู่ :</strong> {pkg.location.address} {pkg.location.subDistrict}{" "}
                  {pkg.location.district} {pkg.location.province} {pkg.location.postalCode}
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
