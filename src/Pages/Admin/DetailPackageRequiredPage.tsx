/*
 * คำอธิบาย : หน้าแสดงรายละเอียดแพ็กเกจที่ถูกร้องขอ (Detail Package Request)
 * ใช้สำหรับดึงข้อมูลแพ็กเกจจาก backend และแสดงข้อมูลเชิงรายละเอียด
 * รวมถึงรูปภาพ แท็ก ผู้ดูแล ช่วงวัน-เวลา ตลอดจนตำแหน่งแผนที่และที่อยู่
 * มีการเปลี่ยนสถานะ อนุมัติ/ปฏิเสธ
 */

import { ArrowLeft, SquarePen } from "lucide-react";
import { useEffect, useState, } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "@/Components/Button";
import Thumbnails from "@/Components/Thumbnails";

import { fetchPackageRequestDetailForAdmin } from "@/Services/package-request-service";
import type { PackageRequestDetail } from "@/Types/package-request";

import { Modal } from "@/Components/Modal/Modal";
import RejectModal from "@/Components/Modal/ModalReject";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

/*
 * ฟังก์ชัน : LeafletDefaultIconSetup
 * คำอธิบาย : ตั้งค่าไอคอนเริ่มต้นของ Leaflet (Marker) เพื่อให้ Marker แสดงผลถูกต้องเมื่อใช้ผ่าน bundler
 * Input : -
 * Output: -
 */

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


/*
 * คำอธิบาย : Base URL สำหรับฝั่ง Client
 * - BACKEND_BASE_URL: ใช้ประกอบ URL สำหรับไฟล์อัปโหลด (รูปภาพ)
 * - API_BASE_URL: ใช้เรียก approve/reject (ผ่าน fetch)
 */
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BACKEND_BASE_URL = apiUrl.replace("/api", "") || "http://localhost:3000";
const API_BASE_URL = apiUrl;

/**
 * ฟังก์ชัน : resolveBackendUploadUrl
 * คำอธิบาย : แปลงพาธไฟล์ที่เก็บจาก backend (มักขึ้นต้นด้วย uploads/) เป็น URL ดาวน์โหลดเต็ม
 * Input : fileName?: string
 * Output: string | undefined (URL สำหรับดาวน์โหลดไฟล์)
 */
function resolveBackendUploadUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const cleaned = fileName.replace(/^\/?uploads\//, "");
  return `${BACKEND_BASE_URL}/uploads/${cleaned}`;
}

/**
 * ฟังก์ชัน : formatDate
 * คำอธิบาย : แปลงวันที่ ISO เป็นรูปแบบไทย dd/mm/yyyy
 * Input : isoString?: string
 * Output: string (วันที่ในรูปแบบไทย หรือ "-")
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
 * ฟังก์ชัน : extractTimeFromISO
 * คำอธิบาย : ดึงเวลา (HH:mm) จาก ISO string
 * Input : isoString?: string
 * Output: string (เวลา HH:mm หรือ "-")
 */
function extractTimeFromISO(isoString?: string): string {
  if (!isoString) return "-";
  const timePart = isoString.split("T")[1];
  return timePart?.substring(0, 5) ?? "-";
}

/**
 * ฟังก์ชัน : buildAddressLine
 * คำอธิบาย : รวมฟิลด์ address ใน PackageRequestDetail เป็นข้อความเดียวเพื่อแสดงผล
 * Input : detail?: PackageRequestDetail | null
 * Output: string (ที่อยู่แบบบรรทัดเดียว หรือ "-")
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

/**
 * ฟังก์ชัน : apiPatch
 * คำอธิบาย : helper สำหรับส่งคำขอ PATCH แบบรวมศูนย์ด้วย fetch และรับ/ส่งข้อมูล JSON
 * Input : url: string, body?: unknown
 * Output: Promise<T> (generic ชนิดข้อมูลผลลัพธ์จาก API)
 */
async function apiPatch<T = unknown>(url: string, body?: unknown): Promise<T> {
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

/**
 * ฟังก์ชัน : approvePackageRequest
 * คำอธิบาย : เรียก API เพื่ออนุมัติคำขอแพ็กเกจด้วย packageId
 * Input : packageId: number
 * Output: Promise<unknown>
 */
function approvePackageRequest(packageId: number) {
  return apiPatch(`${API_BASE_URL}/admin/package-requests/${packageId}/approve`);
}

/**
 * ฟังก์ชัน : rejectPackageRequest
 * คำอธิบาย : เรียก API เพื่อปฏิเสธคำขอแพ็กเกจ พร้อมเหตุผล
 * Input : packageId: number, reason: string
 * Output: Promise<unknown>
 */
function rejectPackageRequest(packageId: number, reason: string) {
  return apiPatch(`${API_BASE_URL}/admin/package-requests/${packageId}/reject`, { reason });
}


/* ----------------------------- Page ------------------------------ */
/**
 * ฟังก์ชัน : DetailPackageRequiredPage
 * คำอธิบาย : React Component สำหรับแสดงรายละเอียดคำขอแพ็กเกจ พร้อมปุ่มอนุมัติ/ปฏิเสธ
 * Input : - (ใช้ useParams เพื่อรับ requestId จาก URL)
 * Output: JSX.Element (UI ของหน้าแสดงรายละเอียดแพ็กเกจ)
 */
export default function DetailPackageRequiredPage() {
  /* Navigation & Params */
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();

  /* Local State */
  const [packageRequestDetail, setPackageRequestDetail] = useState<PackageRequestDetail | null>(null);

  // สถานะโหลด + error + โมดัล
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false); // โมดัลอนุมัติ
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);   // โมดัลปฏิเสธ

  /* โหลดรายละเอียดครั้งแรก */
  /**
   * ฟังก์ชัน : useEffect(loadInitialDetail)
   * คำอธิบาย : โหลดรายละเอียดคำขอแพ็กเกจครั้งแรกตาม requestId ที่ได้จาก URL
   * Input : -
   * Output: - (อัปเดต state packageRequestDetail)
   */
  useEffect(() => {
    if (!requestId) return;
    let isMounted = true;
    fetchPackageRequestDetailForAdmin(requestId).then((response) => {
      if (isMounted) setPackageRequestDetail(response);
    });
    return () => {
      isMounted = false;
    };
  }, [requestId]);



  /* ค่าศูนย์กลางแผนที่ (fallback: กรุงเทพมหานคร) */
  const mapCenterLatitude = packageRequestDetail?.location?.latitude ?? 13.7563;
  const mapCenterLongitude = packageRequestDetail?.location?.longitude ?? 100.5018;


  /**
   * ฟังก์ชัน : openApproveModal
   * คำอธิบาย : เปิดโมดัลยืนยันการอนุมัติ
   * Input : -
   * Output: - (อัปเดต state isApproveModalOpen)
   */
  function openApproveModal() { setIsApproveModalOpen(true); }

  /**
   * ฟังก์ชัน : closeApproveModal
   * คำอธิบาย : ปิดโมดัลยืนยันการอนุมัติ
   * Input : -
   * Output: - (อัปเดต state isApproveModalOpen)
   */
  function closeApproveModal() { setIsApproveModalOpen(false); }

  /**
   * ฟังก์ชัน : openRejectModal
   * คำอธิบาย : เปิดโมดัลระบุเหตุผลการปฏิเสธ
   * Input : -
   * Output: - (อัปเดต state isRejectModalOpen)
   */
  function openRejectModal() { setIsRejectModalOpen(true); }

  /**
   * ฟังก์ชัน : closeRejectModal
   * คำอธิบาย : ปิดโมดัลระบุเหตุผลการปฏิเสธ
   * Input : -
   * Output: - (อัปเดต state isRejectModalOpen)
   */
  function closeRejectModal() { setIsRejectModalOpen(false); }

  /**
   * ฟังก์ชัน : approveCurrentRequest
   * คำอธิบาย : ดำเนินการอนุมัติคำขอ และกลับไปหน้ารายการเมื่อสำเร็จ
   * Input : -
   * Output: Promise<void>
   */
  async function approveCurrentRequest() {
    if (!requestId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await approvePackageRequest(Number(requestId));
      navigate("/admin/package-requests", { replace: true });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "ไม่สามารถอนุมัติได้";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
      closeApproveModal();
    }
  }

  /**
   * ฟังก์ชัน : rejectCurrentRequest
   * คำอธิบาย : ดำเนินการปฏิเสธคำขอ พร้อมเหตุผล และกลับไปหน้ารายการเมื่อสำเร็จ
   * Input : reason: string
   * Output: Promise<void>
   */
  async function rejectCurrentRequest(reason: string) {
    if (!requestId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await rejectPackageRequest(Number(requestId), reason);
      navigate("/admin/package-requests", { replace: true });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "ไม่สามารถปฏิเสธได้";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
      closeRejectModal();
    }
  }

  /**
   * ฟังก์ชัน : handleApproveClick
   * คำอธิบาย : เปิดโมดัลยืนยันการอนุมัติเมื่อผู้ใช้กดปุ่ม "อนุมัติ"
   * Input : -
   * Output: void
   */
  function handleApproveClick() { openApproveModal(); }

  /**
   * ฟังก์ชัน : handleRejectClick
   * คำอธิบาย : เปิดโมดัลระบุเหตุผลการปฏิเสธเมื่อผู้ใช้กดปุ่ม "ปฏิเสธ"
   * Input : -
   * Output: void
   */
  function handleRejectClick() { openRejectModal(); }

  // ถ้าอนุมัติแล้ว ซ่อนปุ่ม
  const isApproved =
    String((packageRequestDetail as any)?.statusApprove || "").toUpperCase().startsWith("APPROVE");

  return (
    <section className="relative bg-white rounded-2xl shadow-sm border border-gray-200 w-full min-h-[500px] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => navigate("/admin/package-requests")}
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

      {/* Loading State (ถ้าต้องการ) */}
      {isLoading && (
        <div className="text-sm text-gray-500">กำลังประมวลผล...</div>
      )}


      {/* ชื่อแพ็กเกจ */}
      <div className="space-y-2">
        <p className="text-base font-semibold text-gray-900">
          ชื่อแพ็กเกจ :{" "}
          <span className="font-normal">{packageRequestDetail?.name || "-"}</span>
        </p>
      </div>

      {/* คำอธิบาย */}
      <div className="space-y-2">
        <p className="text-base font-semibold text-gray-900">
          คำอธิบาย :{" "}
          <span className="font-normal">{packageRequestDetail?.description || "-"}</span>
        </p>
      </div>

      {/* จำนวนคน & ราคา */}
      <div className="grid grid-cols-2 gap-6">
        <p className="text-base font-semibold text-gray-900">
          จำนวนคนที่เปิดรับ :{" "}
          <span className="font-normal">
            {packageRequestDetail?.capacity ?? "-"} {packageRequestDetail?.capacity ? "คน" : ""}
          </span>
        </p>

        <p className="text-base font-semibold text-gray-900">
          ราคา :{" "}
          <span className="font-normal">
            {typeof packageRequestDetail?.price === "number"
              ? packageRequestDetail.price.toLocaleString("th-TH")
              : "-"}{" "}
            {typeof packageRequestDetail?.price === "number" ? "บาท" : ""}
          </span>
        </p>
      </div>

      {/* แท็ก */}
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold text-gray-900">แท็ก :</p>
        <div className="flex flex-wrap gap-2">
          {packageRequestDetail?.tagPackages?.length ? (
            packageRequestDetail.tagPackages.map((tagObj, idx) => (
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
        {packageRequestDetail?.packageFile?.length ? (
          <Thumbnails
            items={packageRequestDetail.packageFile.map((file) => ({
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
            {packageRequestDetail?.overseerPackage?.fname}{" "}
            {packageRequestDetail?.overseerPackage?.lname}
          </span>
        </p>
        <p className="text-base font-semibold text-gray-900">
          สร้างโดย :{" "}
          <span className="font-normal">
            {packageRequestDetail?.createPackage?.fname}{" "}
            {packageRequestDetail?.createPackage?.lname}
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
              {formatDate(packageRequestDetail?.startDate)} - {formatDate(packageRequestDetail?.dueDate)}
            </span>
          </p>

          <p className="text-base font-semibold text-gray-900">
            วันที่เปิด - วันที่ปิดจอง :{" "}
            <span className="font-normal">
              {formatDate(packageRequestDetail?.bookingOpenDate)} -{" "}
              {formatDate(packageRequestDetail?.bookingCloseDate)}
            </span>
          </p>
        </div>

        {/* แถวเวลา */}
        <div className="grid grid-cols-2 gap-6">
          <p className="text-base font-semibold text-gray-900">
            เวลา :{" "}
            <span className="font-normal">
              {extractTimeFromISO(packageRequestDetail?.startDate)} -{" "}
              {extractTimeFromISO(packageRequestDetail?.dueDate)}
            </span>
          </p>

          <p className="text-base font-semibold text-gray-900">
            เวลา :{" "}
            <span className="font-normal">
              {extractTimeFromISO(packageRequestDetail?.bookingOpenDate)} -{" "}
              {extractTimeFromISO(packageRequestDetail?.bookingCloseDate)}
            </span>
          </p>
        </div>
      </div>

      {/* สิ่งอำนวยความสะดวก */}
      <p className="text-base font-semibold text-gray-900">
        สิ่งอำนวยความสะดวก :{" "}
        <span className="font-normal">{packageRequestDetail?.facility ?? "-"}</span>
      </p>

      {/* แผนที่ & ที่อยู่ */}
      <div className="space-y-6">
        <p className="text-base font-semibold text-gray-900 mb-2">แผนที่ :</p>

        <div className="h-[500px] rounded-xl overflow-hidden border border-gray-200">
          <MapContainer
            center={[mapCenterLatitude, mapCenterLongitude]}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[mapCenterLatitude, mapCenterLongitude]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-medium mb-1">{packageRequestDetail?.name}</div>
                  <div className="text-gray-700">
                    {buildAddressLine(packageRequestDetail) === "-"
                      ? "พิกัดแพ็กเกจ"
                      : buildAddressLine(packageRequestDetail)}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* ที่อยู่ & คำอธิบายที่อยู่ */}
        <div className="grid grid-cols-2 gap-6">
          <p className="text-base font-semibold text-gray-900">
            ที่อยู่ : <span className="font-normal">{buildAddressLine(packageRequestDetail)}</span>
          </p>
          <p className="text-base font-semibold text-gray-900">
            คำอธิบายที่อยู่ :{" "}
            <span className="font-normal">{packageRequestDetail?.location?.detail || "-"}</span>
          </p>
        </div>

        {/* พิกัด (ละติจูด/ลองจิจูด) */}
        <div>
          <p className="text-base font-semibold text-gray-900">
            ละติจูด / ลองจิจูด :{" "}
            <span className="font-normal">
              {packageRequestDetail?.location?.latitude ?? "-"},{" "}
              {packageRequestDetail?.location?.longitude ?? "-"}
            </span>
          </p>
        </div>
      </div>

      {/* ปุ่มชิดขวา: ปฏิเสธ / อนุมัติ (บรรทัดเดียวกัน) */}
      {!isApproved && (
        <div className="flex justify-end gap-3">
          <div className="w-36">
            <Button type="cancel" onClick={handleRejectClick}>
              ปฏิเสธ
            </Button>
          </div>
          <div className="w-36">
            <Button type="confirm-admin" onClick={handleApproveClick}>
              อนุมัติ
            </Button>
          </div>
        </div>
      )}

      {/* ----- โมดัล ----- */}
      <Modal
        open={isApproveModalOpen}
        title="ยืนยันการอนุมัติ"
        text={
          packageRequestDetail?.name
            ? `ต้องการอนุมัติแพ็กเกจ “${packageRequestDetail.name}” ใช่หรือไม่`
            : "ต้องการอนุมัติแพ็กเกจนี้หรือไม่"
        }
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={approveCurrentRequest}
        onCancel={closeApproveModal}
      />

      <RejectModal
        open={isRejectModalOpen}
        title="ปฏิเสธคำขออนุมัติ"
        text="กรุณากรอกเหตุผลการปฏิเสธ เพื่อส่งให้ผู้ส่งคำขอรับทราบ"
        confirmText="ส่ง"
        cancelText="ยกเลิก"
        onConfirm={async (reason) => { await rejectCurrentRequest(reason); }}
        onCancel={closeRejectModal}
      />
    </section>
  );
}
