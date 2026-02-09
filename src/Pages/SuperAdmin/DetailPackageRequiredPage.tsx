/**
 * คำอธิบาย: Component สำหรับแสดงรายละเอียดคำขอแพ็กเกจทั้งหมด
 * แสดงข้อมูลแพ็กเกจ ที่อยู่ สิ่งอำนวยความสะดวก แผนที่ ที่พักในแพ็กเกจ ภาพประกอบ และสถานะการอนุมัติ/ปฏิเสธ
 */
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, SquarePen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/Components/Button";
import Thumbnails from "@/Components/Thumbnails";
import type { PackageRequestDetail } from "@/Types/Package";
import * as PackageRequestService from "@/Libs/PackageService";
import MapPicker from "@/Components/MapPicker";
import "leaflet/dist/leaflet.css";
import { Modal } from "@/Components/Modal/Modal";
import ModalReject from "@/Components/Modal/ModalReject";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BACKEND_BASE_URL = apiUrl.replace("/api", "") || "http://localhost:3000";

/**
 * คำอธิบาย: แปลงชื่อไฟล์ที่อยู่ใน uploads ให้กลายเป็น URL เต็มของ backend
 * Input: fileName (string | undefined) - ชื่อไฟล์หรือพาธไฟล์
 * Output: string | undefined - URL เต็มของไฟล์บน backend หรือ undefined หากไม่มีข้อมูล
 */
function resolveBackendUploadUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const cleaned = fileName.replace(/^\/?uploads\//, "");
  return `${BACKEND_BASE_URL}/uploads/${cleaned}`;
}

/**
 * คำอธิบาย: แปลง ISO date string เป็นวันที่แบบไทย (dd/mm/yyyy)
 * Input: isoString (string | undefined) - วันที่แบบ ISO
 * Output: string - วันที่ในรูปแบบ "dd/mm/yyyy" หรือ "-"
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
 * คำอธิบาย: แปลง ISO date string หรือ date string เป็นวันที่แบบไทยเต็ม (รวมชื่อวัน เดือน ปีพุทธศักราช)
 * Input: dateString (string) - วันที่แบบ ISO
 * Output: string - วันที่ในรูปแบบ "วันจันทร์ ที่ 22 ธันวาคม พ.ศ. 2568" หรือ "-"
 */
export function formatThaiDate(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  const days = [
    "วันอาทิตย์",
    "วันจันทร์",
    "วันอังคาร",
    "วันพุธ",
    "วันพฤหัสบดี",
    "วันศุกร์",
    "วันเสาร์",
  ];

  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear() + 543;

  return `${dayName} ที่ ${day} ${monthName} พ.ศ. ${year}`;
}

/**
 * คำอธิบาย: แยกข้อความ facilities ที่เป็น string ออกเป็น array ของ string
 * Input: text (string | undefined) - ข้อความ facilities
 * Output: string[] - Array ของ facilities
 */
function parseFacilityText(text?: string): string[] {
  if (!text) return [];

  return text
    .split(/\r?\n|,|•/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * คำอธิบาย: ดึงเวลา (ชั่วโมง:นาที) จาก ISO date string
 * Input: isoString (string | undefined)
 * Output: string - เวลาในรูปแบบ "HH:MM" หรือ "-"
 */
function extractTimeFromISO(isoString?: string): string {
  if (!isoString) return "-";
  const timePart = isoString.split("T")[1];
  return timePart?.substring(0, 5) ?? "-";
}

/**
 * คำอธิบาย: รวมข้อมูลที่อยู่จาก PackageRequestDetail เป็นบรรทัดเดียว
 * Input: detail (PackageRequestDetail | null | undefined)
 * Output: string - ข้อมูลที่อยู่รวมเป็นบรรทัดเดียว หรือ "-"
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
 * คำอธิบาย :
 *   - โหลดรายละเอียดแพ็กเกจจาก requestId (useEffect)
 *   - คำนวณพิกัดศูนย์กลางแผนที่ (useMemo)
 *   - เปิด/ปิด modal สำหรับอนุมัติและปฏิเสธ
 *   - ดำเนินการอนุมัติคำขอ (approveCurrentRequest)
 *   - ดำเนินการปฏิเสธคำขอพร้อมเหตุผล (rejectCurrentRequest)
 *   - ตรวจสอบสถานะอนุมัติเพื่อตัดสินใจแสดงปุ่ม
 *   - แสดงข้อมูลแพ็กเกจ เช่น ชื่อ, คำอธิบาย, ราคา, จำนวนคน, แท็ก, รูปภาพ
 *   - แสดงข้อมูลที่อยู่, แผนที่, สิ่งอำนวยความสะดวก
 *   - แสดงที่พักในแพ็กเกจ พร้อมรูปและสิ่งอำนวยความสะดวก
 * Input :
 *   - requestId (จาก useParams)
 * Output :
 *   - แสดงรายละเอียดแพ็กเกจบนหน้า UI
 *   - รองรับการอนุมัติและปฏิเสธคำขอผ่าน modal
 */
export default function DetailPackageRequiredPage() {
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();
  const [packageRequestDetail, setPackageRequestDetail] = useState<PackageRequestDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    let isMounted = true;
    PackageRequestService.fetchPackageRequestDetail(requestId).then((response) => {
      if (isMounted) setPackageRequestDetail(response);
    });
    return () => {
      isMounted = false;
    };
  }, [requestId]);

  /**
   * คำอธิบาย : คำนวณพิกัดศูนย์กลางสำหรับแสดงแผนที่
   * โดยใช้ latitude และ longitude จาก location ของ packageRequestDetail
   * หากไม่มีข้อมูลพิกัด จะใช้ค่าเริ่มต้นเป็นกรุงเทพฯ
   * Input :
   *   - packageRequestDetail.location.latitude
   *   - packageRequestDetail.location.longitude
   * Output :
   *   - [latitude, longitude] สำหรับใช้เป็น center ของ Map
   */
  const mapCenter = useMemo<[number, number]>(() => {
    const lat = packageRequestDetail?.location?.latitude ?? 13.7563;
    const lng = packageRequestDetail?.location?.longitude ?? 100.5018;
    return [lat, lng];
  }, [packageRequestDetail?.location?.latitude, packageRequestDetail?.location?.longitude]);

  const mapKey = `${mapCenter[0]},${mapCenter[1]}`;

  /**
   * คำอธิบาย: เปิด Modal สำหรับยืนยันการอนุมัติคำขอแพ็กเกจ
   */
  function openApproveModal() {
    setIsApproveModalOpen(true);
  }
  /**
   * คำอธิบาย: ปิด Modal ยืนยันการอนุมัติคำขอแพ็กเกจ
   */
  function closeApproveModal() {
    setIsApproveModalOpen(false);
  }
  /**
   * คำอธิบาย: เปิด Modal สำหรับกรอกเหตุผลในการปฏิเสธคำขอแพ็กเกจ
   */
  function openRejectModal() {
    setIsRejectModalOpen(true);
  }
  /**
   * คำอธิบาย: ปิด Modal ปฏิเสธคำขอแพ็กเกจ
   */
  function closeRejectModal() {
    setIsRejectModalOpen(false);
  }

  const [approveClicked, setApproveClicked] = useState(false);

  /**
   * คำอธิบาย: ดำเนินการอนุมัติคำขอแพ็กเกจตาม requestId
   */
  async function approveCurrentRequest() {
    if (approveClicked) return;
    setApproveClicked(true);

    if (!requestId) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      await PackageRequestService.approvePackageRequest(Number(requestId));

      setIsApproveModalOpen(false);

      navigate("/super/package-requests", { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถอนุมัติได้";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
      setApproveClicked(false);
    }
  }

  /**
   * คำอธิบาย: ดำเนินการปฏิเสธคำขอ พร้อมเหตุผล และกลับไปหน้ารายการเมื่อสำเร็จ
   * Input: reason (string)
   * Output: Promise<void>
   */
  async function rejectCurrentRequest(reason: string) {
    if (!requestId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await PackageRequestService.rejectPackageRequest(Number(requestId), reason);
      navigate("/super/package-requests", { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถปฏิเสธได้";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
      closeRejectModal();
    }
  }

  /**
   * คำอธิบาย: เปิดโมดัลยืนยันการอนุมัติเมื่อผู้ใช้กดปุ่ม "อนุมัติ"
   */
  function handleApproveClick() {
    openApproveModal();
  }

  /**
   * คำอธิบาย: เปิดโมดัลระบุเหตุผลการปฏิเสธเมื่อผู้ใช้กดปุ่ม "ปฏิเสธ"
   */
  function handleRejectClick() {
    openRejectModal();
  }

  /**
   * คำอธิบาย: ตรวจว่าสถานะอนุมัติแล้วหรือไม่เพื่อซ่อนปุ่ม
   */
  const isApproved = String((packageRequestDetail as any)?.statusApprove || "")
    .toUpperCase()
    .startsWith("APPROVE");

  return (
    <div className="w-full">
      <Breadcrumb
        current={{
          label: packageRequestDetail?.name || "-",
          to: `package-requests/:requestId`,
        }}
      />

      <section className="relative bg-white rounded-2xl shadow-sm border border-gray-200 w-full min-h-[500px] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => navigate("/super/package-requests")}
            aria-label="ย้อนกลับไปยังรายการคำร้องแพ็กเกจ"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
            <h1 className="text-[20px] font-bold text-gray-800">รายละเอียดแพ็กเกจ</h1>
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

        <div className="space-y-2">
          <p className="text-[16px] text-gray-900">
            <span className="font-semibold">ชื่อแพ็กเกจ :</span>{" "}
            <span className="font-normal">{packageRequestDetail?.name || "-"}</span>
          </p>
        </div>

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

        <div className="space-y-2">
          <p className="text-[16px] text-gray-900">
            <span className="font-semibold">คำอธิบาย :</span>{" "}
            <span className="font-normal">{packageRequestDetail?.description || "-"}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <p className="text-[16px] text-gray-900">
            <span className="font-semibold">จำนวนคนที่เปิดรับ :</span>{" "}
            <span className="font-normal">
              {packageRequestDetail?.capacity ?? "-"} {packageRequestDetail?.capacity ? "คน" : ""}
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

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-6">
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">วันที่เริ่ม - วันที่สิ้นสุดแพ็กเกจ :</span>{" "}
              <span className="font-normal">
                {formatDate(packageRequestDetail?.startDate)} -{" "}
                {formatDate(packageRequestDetail?.dueDate)}
              </span>
            </p>
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">วันที่เปิด - วันที่ปิดจอง :</span>{" "}
              <span className="font-normal">
                {formatDate(packageRequestDetail?.bookingOpenDate)} -{" "}
                {formatDate(packageRequestDetail?.bookingCloseDate)}
              </span>
            </p>
          </div>

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

        <p className="text-[16px] text-gray-900">
          <span className="font-semibold">สิ่งอำนวยความสะดวก :</span>{" "}
          <span className="font-normal">{packageRequestDetail?.facility ?? "-"}</span>
        </p>

        <div className="space-y-6">
          <p className="text-[16px] text-gray-900 mb-2">
            <span className="font-semibold">แผนที่ :</span>
          </p>

          <div className="w-full h-full">
            <MapPicker
              key={mapKey}
              mapOnly
              startingPosition={mapCenter}
              startingZoom={13}
              onChange={(_latlng) => {}}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">ที่อยู่ :</span>{" "}
              <span className="font-normal">{buildAddressLine(packageRequestDetail)}</span>
            </p>
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">คำอธิบายที่อยู่ :</span>{" "}
              <span className="font-normal">{packageRequestDetail?.location?.detail || "-"}</span>
            </p>
          </div>

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
        <p className="text-[16px] text-gray-900">
          <span className="font-semibold">ที่พักในแพ็กเกจ</span>{" "}
        </p>

        {packageRequestDetail?.homestayHistories?.length ? (
          <div className="grid grid-cols-2 gap-6">
            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">เช็คอิน :</span>{" "}
              <span className="font-normal">
                {formatThaiDate(packageRequestDetail.homestayHistories[0].checkInTime)} เวลา{" "}
                {extractTimeFromISO(packageRequestDetail.homestayHistories[0].checkInTime)}
              </span>
            </p>

            <p className="text-[16px] text-gray-900">
              <span className="font-semibold">เช็คเอาท์ :</span>{" "}
              <span className="font-normal">
                {formatThaiDate(packageRequestDetail.homestayHistories[0].checkOutTime)} เวลา{" "}
                {extractTimeFromISO(packageRequestDetail.homestayHistories[0].checkOutTime)}
              </span>
            </p>

            <div className="col-span-2 w-full min-h-[200px] border border-gray-300 rounded-xl p-4 shadow-sm bg-white mt-2 flex items-start gap-16">
              {packageRequestDetail?.homestayHistories?.[0]?.homestay?.homestayImage?.length ? (
                <img
                  src={resolveBackendUploadUrl(
                    packageRequestDetail.homestayHistories[0].homestay.homestayImage[0].image,
                  )}
                  alt="homestay"
                  className="w-[356px] h-[183px] object-cover rounded-lg"
                />
              ) : (
                <div className="w-[356px] h-[183px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                  ไม่มีรูปภาพ
                </div>
              )}

              <div className="flex-1">
                <p className="text-[16px] font-semibold text-gray-900">
                  {packageRequestDetail?.homestayHistories?.[0]?.homestay?.name ?? "-"}
                </p>

                <p className="text-[16px] font-semibold mt-2">สิ่งอำนวยความสะดวก</p>

                <ul className="list-disc ml-6 text-[16px] text-gray-800 mt-1">
                  {parseFacilityText(
                    packageRequestDetail?.homestayHistories?.[0]?.homestay?.facility,
                  ).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </section>

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

      <Modal
        isOpen={isApproveModalOpen}
        title="ยืนยันการอนุมัติ"
        text={
          packageRequestDetail?.name
            ? `ต้องการอนุมัติแพ็กเกจ “${packageRequestDetail.name}” ใช่หรือไม่`
            : "ต้องการอนุมัติแพ็กเกจนี้หรือไม่"
        }
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          setIsApproveModalOpen(false);
          approveCurrentRequest();
        }}
        onCancel={closeApproveModal}
      />

      <ModalReject
        isOpen={isRejectModalOpen}
        title="ปฏิเสธคำขออนุมัติ"
        text="กรุณากรอกเหตุผลการปฏิเสธ เพื่อส่งให้ผู้ส่งคำขอรับทราบ"
        confirmText="ส่ง"
        cancelText="ยกเลิก"
        onConfirm={async (reason) => {
          await rejectCurrentRequest(reason);
        }}
        onCancel={closeRejectModal}
      />
    </div>
  );
}
