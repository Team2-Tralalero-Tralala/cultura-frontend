/*
 * คำอธิบาย : หน้าแสดงรายละเอียดแพ็กเกจที่ถูกร้องขอ (Detail Package Request)
 * ใช้สำหรับดึงข้อมูลแพ็กเกจจาก backend และแสดงข้อมูลเชิงรายละเอียด
 * รวมถึงรูปภาพ แท็ก ผู้ดูแล ช่วงวัน-เวลา ตลอดจนตำแหน่งแผนที่และที่อยู่
 * สามารถปลี่ยนสถานะ อนุมัติ/ปฏิเสธ
 */

import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, SquarePen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/Components/Button";
import Thumbnails from "@/Components/Thumbnails";
import type { PackageRequestDetail } from "@/Types/package-request";
import { fetchPackageRequestDetail } from "@/Services/package-request-service";
import MapPicker from "@/Components/MapPicker";
import "leaflet/dist/leaflet.css";
import { Modal } from "@/Components/Modal/Modal";
import RejectModal from "@/Components/Modal/ModalReject";
import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";

/**
 * ฟังก์ชัน : - (ค่าคงที่)
 * คำอธิบาย : Base URL สำหรับไฟล์อัปโหลด (BACKEND_BASE_URL) และ API (API_BASE_URL)
 * Input : -
 * Output: -
 */
const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

/* ----------------------------- Utilities ----------------------------- */
/**
 * ฟังก์ชัน : resolveBackendUploadUrl
 * คำอธิบาย : แปลงพาธไฟล์ที่เก็บจาก backend เป็น URL ดาวน์โหลดเต็ม
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
 * ฟังก์ชัน : patchJson
 * คำอธิบาย : helper สำหรับส่งคำขอ PATCH แบบรวมศูนย์ด้วย fetch และรับ/ส่งข้อมูล JSON
 * Input : url: string, body?: unknown
 * Output: Promise<T> (generic ชนิดข้อมูลผลลัพธ์จาก API)
 */
async function patchJson<T = unknown>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }
  try {
    return (await response.json()) as T;
  } catch {
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
  return patchJson(`${API_BASE_URL}/super/package-requests/${packageId}/approve`);
}

/**
 * ฟังก์ชัน : rejectPackageRequest
 * คำอธิบาย : เรียก API เพื่อปฏิเสธคำขอแพ็กเกจ พร้อมเหตุผล
 * Input : packageId: number, reason: string
 * Output: Promise<unknown>
 */
function rejectPackageRequest(packageId: number, reason: string) {
  return patchJson(`${API_BASE_URL}/super/package-requests/${packageId}/reject`, { reason });
}

/**
 * ฟังก์ชัน : getThaiApproveStatus
 * คำอธิบาย : แปลงสถานะการอนุมัติ (อังกฤษ) เป็นคำอธิบายภาษาไทยที่อ่านง่าย
 * Input : status?: string | null
 * Output: string (คำอธิบายสถานะภาษาไทย)
 */
function getThaiApproveStatus(status?: string | null) {
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
}

/**
 * ฟังก์ชัน : DetailPackageRequiredPage
 * คำอธิบาย : React Component สำหรับแสดงรายละเอียดคำขอแพ็กเกจ พร้อมปุ่มอนุมัติ/ปฏิเสธ
 * Input : - (ใช้ useParams รับ requestId จาก URL)
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
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  /**
   * ฟังก์ชัน : useEffect(loadInitialDetail)
   * คำอธิบาย : โหลดรายละเอียดคำขอแพ็กเกจครั้งแรกตาม requestId ที่ได้จาก URL
   * Input : -
   * Output: - (อัปเดต state packageRequestDetail)
   */
  useEffect(() => {
    if (!requestId) return;
    let isMounted = true;
    fetchPackageRequestDetail(requestId).then((response) => {
      if (isMounted) setPackageRequestDetail(response);
    });
    return () => {
      isMounted = false;
    };
  }, [requestId]);

  /**
   * ฟังก์ชัน : mapCenter (useMemo)
   * คำอธิบาย : คำนวณพิกัดศูนย์กลางแผนที่จากข้อมูลแพ็กเกจ หรือใช้ fallback เป็นกรุงเทพฯ
   * Input : - (อิง state packageRequestDetail)
   * Output: [number, number] (ละติจูด, ลองจิจูด)
   */
  const mapCenter = useMemo<[number, number]>(() => {
    const lat = packageRequestDetail?.location?.latitude ?? 13.7563;
    const lng = packageRequestDetail?.location?.longitude ?? 100.5018;
    return [lat, lng];
  }, [packageRequestDetail?.location?.latitude, packageRequestDetail?.location?.longitude]);

  /**
   * ฟังก์ชัน : mapKey
   * คำอธิบาย : คีย์สำหรับบังคับรีเรนเดอร์ MapPicker เมื่อพิกัดเปลี่ยน
   * Input : -
   * Output: string ("lat,lng")
   */
  const mapKey = `${mapCenter[0]},${mapCenter[1]}`;

  /** ฟังก์ชัน : openApproveModal — เปิดโมดัลยืนยันการอนุมัติ */
  function openApproveModal() { setIsApproveModalOpen(true); }
  /** ฟังก์ชัน : closeApproveModal — ปิดโมดัลยืนยันการอนุมัติ */
  function closeApproveModal() { setIsApproveModalOpen(false); }
  /** ฟังก์ชัน : openRejectModal — เปิดโมดัลระบุเหตุผลการปฏิเสธ */
  function openRejectModal() { setIsRejectModalOpen(true); }
  /** ฟังก์ชัน : closeRejectModal — ปิดโมดัลระบุเหตุผลการปฏิเสธ */
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
      navigate("/super/package-requests", { replace: true });
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
      navigate("/super/package-requests", { replace: true });
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

  /**
   * ฟังก์ชัน : isApproved
   * คำอธิบาย : ตรวจว่าสถานะอนุมัติแล้วหรือไม่เพื่อซ่อนปุ่ม
   * Input : -
   * Output: boolean
   */
  const isApproved =
    String((packageRequestDetail as any)?.statusApprove || "").toUpperCase().startsWith("APPROVE");


  return (
    <div className="w-full">
      <div className="mb-2 text-[14px] font-medium [&_a]:text-black  [&_span:last-child]:text-[#494949] ">
        <BreadcrumbNavigation
          items={[
            { label: "คำขออนุมัติ", to: "/super/package-requests" },
            { label: packageRequestDetail?.name || "รายละเอียดแพ็กเกจ" },
          ]}
        />
      </div>
      {/* การ์ดรายละเอียด */}
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
            <h1 className="text-[20px] font-bold text-gray-800">
              รายละเอียดแพ็กเกจ
            </h1>
          </button>

          <div>
            <Button type="confirm-admin">
              <div className="flex items-center gap-2 text-[16px]">
                <SquarePen className="w-5 h-5" />
                <span>แก้ไขรายละเอียดแพ็กเกจ</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="text-[16px] text-red-600">{errorMessage}</div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-[16px] text-gray-500">กำลังประมวลผล...</div>
        )}

        {/* ชื่อแพ็กเกจ */}
        <div className="space-y-2">
          <p className="text-[16px] text-gray-900">
            <span className="font-semibold">ชื่อแพ็กเกจ :</span>{" "}
            <span className="font-normal">
              {packageRequestDetail?.name || "-"}
            </span>
          </p>
        </div>

        {/* สถานะแพ็กเกจ */}
        <div className="space-y-2">
          <p className="text-[16px] text-gray-900 flex items-center">
            <span className="font-semibold">สถานะแพ็กเกจ :</span>
            {packageRequestDetail?.statusPackage === "UNPUBLISH" ? (
              <span className="ml-2 px-3 py-1 rounded-full bg-red-100 text-red-500 text-[14px]">
                ไม่เผยแพร่
              </span>
            ) : (
              <span className="ml-2 text-gray-700 text-[16px]">-</span>
            )}
          </p>
        </div>

        {/* คำอธิบาย */}
        <div className="space-y-2">
          <p className="text-[16px] text-gray-900">
            <span className="font-semibold">คำอธิบาย :</span>{" "}
            <span className="font-normal">
              {packageRequestDetail?.description || "-"}
            </span>
          </p>
        </div>

        {/* จำนวนคน & ราคา */}
        <div className="grid grid-cols-2 gap-6">
          <p className="text-[16px] text-gray-900">
            <span className="font-semibold">จำนวนคนที่เปิดรับ :</span>{" "}
            <span className="font-normal">
              {packageRequestDetail?.capacity ?? "-"}{" "}
              {packageRequestDetail?.capacity ? "คน" : ""}
            </span>
          </p>
          <p className="text-[16px] text-gray-900">
            <span className="font-semibold">ราคา :</span>{" "}
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
          <p className="text-[16px] text-gray-900">
            <span className="font-semibold">แท็ก :</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {packageRequestDetail?.tagPackages?.length ? (
              packageRequestDetail.tagPackages.map((tagObj, idx) => (
                <span
                  key={`${tagObj.tag?.name ?? "tag"}-${idx}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-[16px]"
                >
                  {tagObj.tag?.name}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-[16px]">ไม่มีแท็ก</span>
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
            <p className="text-gray-500 text-[16px]">ไม่มีรูปภาพ</p>
          )}
        </div>

        {/* ผู้ดูแล & ผู้สร้าง */}
        <div className="grid grid-cols-2 gap-6">
          <p className="text-[16px] text-gray-900">
            <span className="font-semibold">ผู้ดูแล :</span>{" "}
            <span className="font-normal">
              {packageRequestDetail?.overseerPackage?.fname}{" "}
              {packageRequestDetail?.overseerPackage?.lname}
            </span>
          </p>
          <p className="text-[16px] text-gray-900">
            <span className="font-semibold">สร้างโดย :</span>{" "}
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
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">
                วันที่เริ่ม - วันที่สิ้นสุดแพ็กเกจ :
              </span>{" "}
              <span className="font-normal">
                {formatDate(packageRequestDetail?.startDate)} -{" "}
                {formatDate(packageRequestDetail?.dueDate)}
              </span>
            </p>
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">
                วันที่เปิด - วันที่ปิดจอง :
              </span>{" "}
              <span className="font-normal">
                {formatDate(packageRequestDetail?.bookingOpenDate)} -{" "}
                {formatDate(packageRequestDetail?.bookingCloseDate)}
              </span>
            </p>
          </div>

          {/* แถวเวลา */}
          <div className="grid grid-cols-2 gap-6">
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">เวลา :</span>{" "}
              <span className="font-normal">
                {extractTimeFromISO(packageRequestDetail?.startDate)} -{" "}
                {extractTimeFromISO(packageRequestDetail?.dueDate)}
              </span>
            </p>
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">เวลา :</span>{" "}
              <span className="font-normal">
                {extractTimeFromISO(packageRequestDetail?.bookingOpenDate)} -{" "}
                {extractTimeFromISO(packageRequestDetail?.bookingCloseDate)}
              </span>
            </p>
          </div>
        </div>

        {/* สิ่งอำนวยความสะดวก */}
        <p className="text-[16px] text-gray-900">
          <span className="font-semibold">สิ่งอำนวยความสะดวก :</span>{" "}
          <span className="font-normal">
            {packageRequestDetail?.facility ?? "-"}
          </span>
        </p>

        {/* แผนที่ & ที่อยู่ */}
        <div className="space-y-6">
          <p className="text-[16px] text-gray-900 mb-2">
            <span className="font-semibold">แผนที่ :</span>
          </p>

          {/* ใช้ MapPicker */}
          <div className="w-full h-full">
            <MapPicker
              key={mapKey}
              mapOnly
              startingPosition={mapCenter}
              startingZoom={13}
              onChange={(_latlng) => {
                /* read-only viewer */
              }}
            />
          </div>

          {/* ที่อยู่ & คำอธิบายที่อยู่ */}
          <div className="grid grid-cols-2 gap-6">
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">ที่อยู่ :</span>{" "}
              <span className="font-normal">
                {buildAddressLine(packageRequestDetail)}
              </span>
            </p>
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">คำอธิบายที่อยู่ :</span>{" "}
              <span className="font-normal">
                {packageRequestDetail?.location?.detail || "-"}
              </span>
            </p>
          </div>

          {/* พิกัด (ละติจูด/ลองจิจูด) */}
          <div>
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">ละติจูด / ลองจิจูด :</span>{" "}
              <span className="font-normal">
                {packageRequestDetail?.location?.latitude ?? "-"},{" "}
                {packageRequestDetail?.location?.longitude ?? "-"}
              </span>
            </p>
          </div>
        </div>
      </section>



      {/* ปุ่มอนุมัติ/ปฏิเสธ — ย้ายออกนอกการ์ด */}
      {!isApproved && (
        <div className="flex justify-end gap-3 mt-4">
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

      {/* โมดัล */}
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
    </div>
  );
}
