// File: DetailPackageRequiredPage.tsx

/*
 * คำอธิบาย : หน้าแสดงรายละเอียดแพ็กเกจที่ถูกร้องขอ (Detail Package Request)
 * ใช้สำหรับดึงข้อมูลแพ็กเกจจาก backend และแสดงข้อมูลเชิงรายละเอียด
 * รวมถึงรูปภาพ แท็ก ผู้ดูแล ช่วงวัน-เวลา ตลอดจนตำแหน่งแผนที่และที่อยู่
 */

import { useEffect, useState } from "react";
import { ArrowLeft, SquarePen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "@/Components/Button";
import Thumbnails from "@/Components/Thumbnails";

import type { PackageRequestDetail } from "@/Types/package-request";
import { fetchPackageRequestDetail } from "@/Services/package-request-service";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/*
 * คำอธิบาย : ตั้งค่าไอคอนเริ่มต้นของ Leaflet (Marker)
 * เหตุผล : เพื่อให้ Marker แสดงผลได้ถูกต้องเมื่อใช้ผ่าน bundler
 */
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/*
 * คำอธิบาย : Base URL ของ Backend
 * ใช้ค่าในไฟล์ .env (VITE_BACKEND_URL) และ fallback เป็น localhost หากไม่พบค่า
 */
const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";


/**
 * ฟังก์ชัน: resolveBackendUploadUrl
 * คำอธิบาย : แปลงพาธไฟล์ที่เก็บจาก backend (มักขึ้นต้นด้วย uploads/) เป็น URL ดาวน์โหลดเต็ม
 * Input : fileName - ชื่อไฟล์หรือพาธไฟล์จาก backend
 * Output : string | undefined - URL ที่พร้อมใช้งาน หรือ undefined หากไม่พบค่า
 */
function resolveBackendUploadUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const cleaned = fileName.replace(/^\/?uploads\//, "");
  return `${BACKEND_BASE_URL}/uploads/${cleaned}`;
}

/**
 * ฟังก์ชัน: formatDate
 * คำอธิบาย : แปลงวันที่ ISO string ให้เป็นรูปแบบไทย dd/mm/yyyy
 * Input : isoString - วันที่รูปแบบ ISO (เช่น 2025-01-31T12:30:00Z)
 * Output : string - ข้อความวันที่ หรือ "-" เมื่อไม่มีค่า
 */
function formatDate(isoString?: string): string {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * ฟังก์ชัน: extractTimeFromISO
 * คำอธิบาย : แยกเวลา (HH:mm) จาก ISO string
 * Input : isoString - วันที่รูปแบบ ISO
 * Output : string - เวลา HH:mm หรือ "-"
 */
function extractTimeFromISO(isoString?: string): string {
  if (!isoString) return "-";
  const timePart = isoString.split("T")[1];
  return timePart?.substring(0, 5) ?? "-";
}

/**
 * ฟังก์ชัน: buildAddressLine
 * คำอธิบาย : รวมข้อมูล address ใน PackageRequestDetail ให้เป็นข้อความที่อ่านง่าย
 * Input : detail - ข้อมูลแพ็กเกจทั้งหมด (ใช้เฉพาะฟิลด์ location)
 * Output : string - ที่อยู่แบบบรรทัดเดียว หรือ "-"
 */
function buildAddressLine(detail?: PackageRequestDetail | null): string {
  const text = [
    detail?.location?.houseNumber,
    detail?.location?.villageNumber ? `หมู่ ${detail?.location?.villageNumber}` : "",
    detail?.location?.alley,
    detail?.location?.subDistrict ? `ตำบล${detail?.location?.subDistrict}` : "",
    detail?.location?.district ? `อำเภอ${detail?.location?.district}` : "",
    detail?.location?.province ? `จังหวัด${detail?.location?.province}` : "",
    detail?.location?.postalCode,
  ]
    .filter(Boolean)
    .join(" ");
  return text || "-";
}

/*
 * คำอธิบาย : รายละเอียดแพ็กเกจที่ถูกร้องขอ
 * หน้าที่ : ดึงข้อมูลด้วย requestId จากพารามิเตอร์ และแสดงผลทุกส่วนในหน้าเดียว
 */
export default function DetailPackageRequiredPage() {
  /* Navigation & Params */
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();

  /* Local State */
  const [packageDetail, setPackageDetail] = useState<PackageRequestDetail | null>(null);

  /*
   * คำอธิบาย : โหลดข้อมูลแพ็กเกจเมื่อมี requestId
   * หมายเหตุ : ป้องกัน setState หลัง unmount ด้วย flag isMounted
   */
  useEffect(() => {
    if (!requestId) return;

    let isMounted = true;
    fetchPackageRequestDetail(requestId).then((res) => {
      if (isMounted) setPackageDetail(res);
    });

    return () => {
      isMounted = false;
    };
  }, [requestId]);

  /* ค่าศูนย์กลางเริ่มต้นของแผนที่ (fallback: กรุงเทพมหานคร) */
  const mapCenterLat = packageDetail?.location?.latitude ?? 13.7563;
  const mapCenterLng = packageDetail?.location?.longitude ?? 100.5018;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full min-h-[500px] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => navigate("/package-requests")}
          aria-label="ย้อนกลับไปยังรายการคำร้องแพ็กเกจ"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
          <h1 className="text-lg font-medium text-gray-800">รายละเอียดแพ็กเกจ</h1>
        </button>

        <div>
          <Button type="confirm-admin">
            <div className="flex items-center gap-2">
              <SquarePen className="w-5 h-5" />
              <span>แก้ไขรายละเอียดแพ็กเกจ</span>
            </div>
          </Button>
        </div>
      </div>

      {/* ชื่อแพ็กเกจ */}
      <div className="space-y-2">
        <p className="text-base font-semibold text-gray-900">
          ชื่อแพ็กเกจ :{" "}
          <span className="font-normal">{packageDetail?.name || "-"}</span>
        </p>
      </div>

      {/* คำอธิบาย */}
      <div className="space-y-2">
        <p className="text-base font-semibold text-gray-900">
          คำอธิบาย :{" "}
          <span className="font-normal">{packageDetail?.description || "-"}</span>
        </p>
      </div>

      {/* จำนวนคน & ราคา */}
      <div className="grid grid-cols-2 gap-6">
        <p className="text-base font-semibold text-gray-900">
          จำนวนคนที่เปิดรับ :{" "}
          <span className="font-normal">
            {packageDetail?.capacity ?? "-"} {packageDetail?.capacity ? "คน" : ""}
          </span>
        </p>

        <p className="text-base font-semibold text-gray-900">
          ราคา :{" "}
          <span className="font-normal">
            {typeof packageDetail?.price === "number"
              ? packageDetail.price.toLocaleString("th-TH")
              : "-"}{" "}
            {typeof packageDetail?.price === "number" ? "บาท" : ""}
          </span>
        </p>
      </div>

      {/* แท็ก */}
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold text-gray-900">แท็ก :</p>
        <div className="flex flex-wrap gap-2">
          {packageDetail?.tagPackages?.length ? (
            packageDetail.tagPackages.map((tagObj, idx) => (
              <span
                key={`${tagObj.tag?.name ?? "tag"}-${idx}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
              >
                {tagObj.tag?.name}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">ไม่มีแท็ก</span>
          )}
        </div>
      </div>

      {/* รูปภาพ */}
      <div>
        {packageDetail?.packageFile?.length ? (
          <Thumbnails
            items={packageDetail.packageFile.map((file) => ({
              type: "image" as const,
              src:
                resolveBackendUploadUrl(file.filePath) ??
                "https://placehold.co/600x400?text=No+Image",
            }))}
          />
        ) : (
          <p className="text-gray-500 text-sm">ไม่มีรูปภาพ</p>
        )}
      </div>

      {/* ผู้ดูแล & ผู้สร้าง */}
      <div className="grid grid-cols-2 gap-6">
        <p className="text-base font-semibold text-gray-900">
          ผู้ดูแล :{" "}
          <span className="font-normal">
            {packageDetail?.overseerPackage?.fname}{" "}
            {packageDetail?.overseerPackage?.lname}
          </span>
        </p>
        <p className="text-base font-semibold text-gray-900">
          สร้างโดย :{" "}
          <span className="font-normal">
            {packageDetail?.createPackage?.fname}{" "}
            {packageDetail?.createPackage?.lname}
          </span>
        </p>
      </div>

      {/* ช่วงวัน-เวลา (แพ็กเกจ / การจอง) */}
      <div className="space-y-3">
        {/* แถววันที่ */}
        <div className="grid grid-cols-2 gap-6">
          <p className="text-base font-semibold text-gray-900">
            วันที่เริ่ม - วันที่สิ้นสุดแพ็กเกจ :{" "}
            <span className="font-normal">
              {formatDate(packageDetail?.startDate)} - {formatDate(packageDetail?.dueDate)}
            </span>
          </p>

          <p className="text-base font-semibold text-gray-900">
            วันที่เปิด - วันที่ปิดจอง :{" "}
            <span className="font-normal">
              {formatDate(packageDetail?.bookingOpenDate)} -{" "}
              {formatDate(packageDetail?.bookingCloseDate)}
            </span>
          </p>
        </div>

        {/* แถวเวลา */}
        <div className="grid grid-cols-2 gap-6">
          <p className="text-base font-semibold text-gray-900">
            เวลา :{" "}
            <span className="font-normal">
              {extractTimeFromISO(packageDetail?.startDate)} -{" "}
              {extractTimeFromISO(packageDetail?.dueDate)}
            </span>
          </p>

          <p className="text-base font-semibold text-gray-900">
            เวลา :{" "}
            <span className="font-normal">
              {extractTimeFromISO(packageDetail?.bookingOpenDate)} -{" "}
              {extractTimeFromISO(packageDetail?.bookingCloseDate)}
            </span>
          </p>
        </div>
      </div>

      {/* สิ่งอำนวยความสะดวก */}
      <p className="text-base font-semibold text-gray-900">
        สิ่งอำนวยความสะดวก :{" "}
        <span className="font-normal">{packageDetail?.facility ?? "-"}</span>
      </p>

      {/* แผนที่ & ที่อยู่ */}
      <div className="space-y-6">
        <p className="text-base font-semibold text-gray-900 mb-2">แผนที่ :</p>

        <div className="h-[500px] rounded-xl overflow-hidden border border-gray-200">
          <MapContainer
            center={[mapCenterLat, mapCenterLng]}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[mapCenterLat, mapCenterLng]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-medium mb-1">{packageDetail?.name}</div>
                  <div className="text-gray-700">
                    {buildAddressLine(packageDetail) === "-"
                      ? "พิกัดแพ็กเกจ"
                      : buildAddressLine(packageDetail)}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* ที่อยู่ & คำอธิบายที่อยู่ */}
        <div className="grid grid-cols-2 gap-6">
          <p className="text-base font-semibold text-gray-900">
            ที่อยู่ : <span className="font-normal">{buildAddressLine(packageDetail)}</span>
          </p>
          <p className="text-base font-semibold text-gray-900">
            คำอธิบายที่อยู่ :{" "}
            <span className="font-normal">{packageDetail?.location?.detail || "-"}</span>
          </p>
        </div>

        {/* พิกัด (ละติจูด/ลองจิจูด) */}
        <div>
          <p className="text-base font-semibold text-gray-900">
            ละติจูด / ลองจิจูด :{" "}
            <span className="font-normal">
              {packageDetail?.location?.latitude ?? "-"},{" "}
              {packageDetail?.location?.longitude ?? "-"}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
