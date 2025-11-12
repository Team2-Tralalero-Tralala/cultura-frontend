// File: DetailPackageRequiredPage.tsx

/*
 * คำอธิบาย : หน้าแสดงรายละเอียดแพ็กเกจที่ถูกร้องขอ (Detail Package Request)
 * ใช้สำหรับดึงข้อมูลแพ็กเกจจาก backend และแสดงข้อมูลเชิงรายละเอียด
 * รวมถึงรูปภาพ แท็ก ผู้ดูแล ช่วงวัน-เวลา ตลอดจนตำแหน่งแผนที่และที่อยู่
 * เพิ่ม: การเปลี่ยนสถานะ อนุมัติ/ปฏิเสธ (ใช้ตัวอย่างแบบหน้า SuperAdmin)
 * และเมื่อกดยืนยันในโมดัล จะ navigate ไป "/super/package-requests"
 */

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, SquarePen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "@/Components/Button";
import Thumbnails from "@/Components/Thumbnails";

import type { PackageRequestDetail } from "@/Types/package-request";
import { fetchPackageRequestDetail } from "@/Services/package-request-service";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Modal } from "@/Components/Modal/Modal";
import RejectModal from "@/Components/Modal/ModalReject";

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
 * คำอธิบาย : Base URL
 * - BACKEND_BASE_URL: สำหรับเสิร์ฟไฟล์อัปโหลด (รูปภาพ)
 * - API_BASE_URL: สำหรับเรียก approve/reject (ใช้ fetch ไม่ใช่ axios)
 */
const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

/**
 * ฟังก์ชัน: resolveBackendUploadUrl
 * คำอธิบาย : แปลงพาธไฟล์ที่เก็บจาก backend (มักขึ้นต้นด้วย uploads/) เป็น URL ดาวน์โหลดเต็ม
 */
function resolveBackendUploadUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const cleaned = fileName.replace(/^\/?uploads\//, "");
  return `${BACKEND_BASE_URL}/uploads/${cleaned}`;
}

/** แปลงวันที่เป็นรูปแบบไทย dd/mm/yyyy */
function formatDate(isoString?: string): string {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** ดึงเวลา HH:mm จาก ISO string */
function extractTimeFromISO(isoString?: string): string {
  if (!isoString) return "-";
  const timePart = isoString.split("T")[1];
  return timePart?.substring(0, 5) ?? "-";
}

/** รวมฟิลด์ address เป็นข้อความเดียว */
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

/* ---------------------------- Services ---------------------------- */
// helper: ทำ PATCH แบบรวมศูนย์ด้วย fetch
async function apiPatch<T = any>(url: string, body?: any): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  try {
    return (await res.json()) as T;
  } catch {
    // บาง API อาจไม่คืน body
    return undefined as unknown as T;
  }
}

function approvePackageRequest(packageId: number) {
  return apiPatch(`${API_BASE_URL}/super/package-requests/${packageId}/approve`);
}

function rejectPackageRequest(packageId: number, reason: string) {
  return apiPatch(`${API_BASE_URL}/super/package-requests/${packageId}/reject`, { reason });
}

/* ----------------------------- Utils ----------------------------- */
const thaiApproveStatus = (status?: string | null) => {
  switch ((status || "").toUpperCase()) {
    case "PENDING_SUPER":
      return "รออนุมัติ";
    case "APPROVE":
    case "APPROVED":
      return "อนุมัติแล้ว";
    case "REJECT":
    case "REJECTED":
      return "ถูกปฏิเสธ";
    default:
      return "-";
  }
};

/* ----------------------------- Page ------------------------------ */
export default function DetailPackageRequiredPage() {
  /* Navigation & Params */
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();

  /* Local State */
  const [packageDetail, setPackageDetail] = useState<PackageRequestDetail | null>(null);

  // สถานะโหลด + error + โมดัล
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false); // โมดัลอนุมัติ
  const [rejectOpen, setRejectOpen] = useState(false);   // โมดัลปฏิเสธ

  /* โหลดรายละเอียดครั้งแรก */
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

  // (เผื่อใช้) reload รายละเอียด
  const reloadDetail = useCallback(async () => {
    if (!requestId) return;
    const res = await fetchPackageRequestDetail(requestId);
    setPackageDetail(res);
  }, [requestId]);

  /* ค่าศูนย์กลางแผนที่ (fallback: กรุงเทพมหานคร) */
  const mapCenterLat = packageDetail?.location?.latitude ?? 13.7563;
  const mapCenterLng = packageDetail?.location?.longitude ?? 100.5018;

  // เปิด/ปิดโมดัล
  function openApproveModal() { setConfirmOpen(true); }
  function closeApproveModal() { setConfirmOpen(false); }
  function openRejectModal() { setRejectOpen(true); }
  function closeRejectModal() { setRejectOpen(false); }

  /* ดำเนินการจริง: อนุมัติ / ปฏิเสธ + กลับหน้า list หลังยืนยัน */
  async function doApprove() {
    if (!requestId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await approvePackageRequest(Number(requestId));
      navigate("/super/package-requests", { replace: true });
    } catch (e: any) {
      setErrorMessage(e?.message ?? "ไม่สามารถอนุมัติได้");
    } finally {
      setIsLoading(false);
      closeApproveModal();
    }
  }

  async function doReject(reason: string) {
    if (!requestId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await rejectPackageRequest(Number(requestId), reason);
      navigate("/super/package-requests", { replace: true });
    } catch (e: any) {
      setErrorMessage(e?.message ?? "ไม่สามารถปฏิเสธได้");
    } finally {
      setIsLoading(false);
      closeRejectModal();
    }
  }

  // ปุ่มเรียกโมดัล
  function handleApprove() { openApproveModal(); }
  function handleReject() { openRejectModal(); }

  // ถ้าอนุมัติแล้ว ซ่อนปุ่ม
  const approved =
    String((packageDetail as any)?.statusApprove || "").toUpperCase().startsWith("APPROVE");

  return (
    <section className="relative bg-white rounded-2xl shadow-sm border border-gray-200 w-full min-h-[500px] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => navigate("/super/package-requests")}
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

      {/* Error */}
      {errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      {/* สถานะคำขอ */}
      <div className="text-sm text-gray-700">
        สถานะคำขอ:{" "}
        <span className="font-medium">
          {thaiApproveStatus((packageDetail as any)?.statusApprove)}
        </span>
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

      {/* ปุ่มชิดขวา: ปฏิเสธ / อนุมัติ (บรรทัดเดียวกัน) */}
      {!approved && (
        <div className="flex justify-end gap-3">
          <div className="w-36">
            <Button type="cancel" onClick={handleReject}>
              ปฏิเสธ
            </Button>
          </div>
          <div className="w-36">
            <Button type="confirm-admin" onClick={handleApprove}>
              อนุมัติ
            </Button>
          </div>
        </div>
      )}

      {/* ----- โมดัล ----- */}
      <Modal
        open={confirmOpen}
        title="ยืนยันการอนุมัติ"
        text={
          packageDetail?.name
            ? `ต้องการอนุมัติแพ็กเกจ “${packageDetail.name}” ใช่หรือไม่`
            : "ต้องการอนุมัติแพ็กเกจนี้หรือไม่"
        }
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={doApprove}
        onCancel={closeApproveModal}
      />

      <RejectModal
        open={rejectOpen}
        title="ปฏิเสธคำขออนุมัติ"
        text="กรุณากรอกเหตุผลการปฏิเสธ เพื่อส่งให้ผู้ส่งคำขอรับทราบ"
        confirmText="ส่ง"
        cancelText="ยกเลิก"
        onConfirm={async (reason) => { await doReject(reason); }}
        onCancel={closeRejectModal}
      />
    </section>
  );
}
