/**
 * คำอธิบาย :
 *   หน้ารายละเอียดแพ็กเกจ (สำหรับผู้ดูแลระบบระดับ Admin)
 *   ใช้สำหรับแสดงข้อมูลแพ็กเกจท่องเที่ยวแต่ละรายการที่อยู่ในระบบของชุมชน
 *   แสดงข้อมูลผู้สร้าง, ผู้ดูแล, วันที่เปิด-ปิดการจอง, สิ่งอำนวยความสะดวก,
 *   แผนที่ตำแหน่งสถานที่ และข้อมูลที่พักในแพ็กเกจ (ถ้ามี)
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Tag from "@/Components/Tag";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { Icon } from "@iconify/react";
import type { JSX } from "react/jsx-runtime";
import DetailPackageGallery from "@/Components/DetailPackageGallery";

/**
 * คำอธิบาย: URL ของ Backend สำหรับติดต่อ API
 */
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BACKEND_BASE_URL = apiUrl.replace(/\/api$/, "");
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
  facility?: string;
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
  bookedRoom?: number;
  homestay?: HomestayData | null;
}

interface PackageFile {
  id: number;
  path: string;
  type: "GALLERY" | "COVER" | "VIDEO";
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
  files: PackageFile[];
  homestayHistories: HomestayHistory[];
}

/**
 * คำอธิบาย: ฟังก์ชันสำหรับจัดรูปแบบ path ของรูปภาพจาก backend ให้เป็น URL ที่ถูกต้อง
 * Input: imagePath (string | undefined) - path ของรูปภาพจาก backend
 * Output: string - URL ของรูปภาพที่พร้อมใช้งาน
 */
const buildImageUrl = (imagePath?: string): string => {
  if (!imagePath) return "";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const cleanPath = imagePath.replace(/^\/+/, "");

  return `${BACKEND_BASE_URL}/${cleanPath}`;
};

/**
 * คำอธิบาย: แปลงวันที่รูปแบบ ISO เป็นรูปแบบไทย (dd/mm/yyyy)
 * Input: dateStr (ISO Date String)
 * Output: วันที่รูปแบบไทย หรือ "-" หากไม่มีข้อมูล
 */
function formatDateTH(dateStr: string | null): string {
  if (!dateStr) return "-";
  const dateObject = new Date(dateStr);
  const day = String(dateObject.getDate()).padStart(2, "0");
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const year = dateObject.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * คำอธิบาย: แยกวันที่และเวลาออกจาก ISO string
 * Input: isoString (ISO Date String)
 * Output: Object { date, time }
 */
function extractDateTime(isoString?: string | null): DateTimeField {
  if (!isoString) return { date: null, time: null };
  const dateObject = new Date(isoString);
  const date = dateObject.toISOString().split("T")[0];
  const time = dateObject.toTimeString().split(" ")[0].slice(0, 5);
  return { date, time };
}

/**
 * คำอธิบาย: Component หน้าแสดงรายละเอียดแพ็กเกจสำหรับ Admin
 */
export default function DetailPackageHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [packageDetail, setPackageDetail] = useState<PackageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * คำอธิบาย: ดึงข้อมูลรายละเอียดแพ็กเกจ
   * Input: - (ใช้ id จาก URL params)
   * Output: - (อัปเดต state packageDetail)
   */
  useEffect(() => {
    async function fetchPackageDetail() {
      try {
        setIsLoading(true);
        const response = await axios.get(`${apiUrl}/admin/package/${id}`, {
          withCredentials: true,
        });

        const packageRawData = response.data.data;

        const mappedPackageDetail: PackageData = {
          id: packageRawData.id,
          name: packageRawData.name,
          description: packageRawData.description ?? "-",
          capacity: packageRawData.capacity ?? 0,
          price: packageRawData.price ?? 0,
          facility: packageRawData.facility ?? "-",
          warning: packageRawData.warning ?? "-",
          statusPackage: packageRawData.statusPackage ?? "-",
          statusApprove: packageRawData.statusApprove ?? null,
          rejectReason: packageRawData.rejectReason ?? null,
          createdBy: packageRawData.createPackage
            ? {
                id: packageRawData.createPackage.id,
                name: `${packageRawData.createPackage.fname} ${packageRawData.createPackage.lname}`,
              }
            : null,
          overseer: packageRawData.overseerPackage
            ? {
                id: packageRawData.overseerPackage.id,
                name: `${packageRawData.overseerPackage.fname} ${packageRawData.overseerPackage.lname}`,
              }
            : null,
          tags: packageRawData.tagPackages
            ? packageRawData.tagPackages.map((tagItem: any) => tagItem.tag.name)
            : [],
          startDate: extractDateTime(packageRawData.startDate),
          dueDate: extractDateTime(packageRawData.dueDate),
          openBookingAt: extractDateTime(packageRawData.bookingOpenDate),
          closeBookingAt: extractDateTime(packageRawData.bookingCloseDate),
          location: packageRawData.location
            ? {
                address: packageRawData.location.houseNumber ?? "-",
                detail: packageRawData.location.detail ?? "-",
                subDistrict: packageRawData.location.subDistrict,
                district: packageRawData.location.district,
                province: packageRawData.location.province,
                postalCode: packageRawData.location.postalCode,
                latitude: packageRawData.location.latitude,
                longitude: packageRawData.location.longitude,
              }
            : null,
          files: packageRawData.packageFile
            ? packageRawData.packageFile.map((fileItem: any) => ({
                id: fileItem.id,
                path: buildImageUrl(fileItem.filePath),
                type: fileItem.type,
              }))
            : [],
          homestayHistories: packageRawData.homestayHistories
            ? packageRawData.homestayHistories.map(
                (homestayHistoryItem: any): HomestayHistory => ({
                  id: homestayHistoryItem.id,
                  guestAmount: homestayHistoryItem.guestAmount ?? 0,
                  checkInTime: homestayHistoryItem.checkInTime ?? "",
                  checkOutTime: homestayHistoryItem.checkOutTime ?? "",
                  bookedRoom: homestayHistoryItem.bookedRoom ?? undefined,
                  homestay: homestayHistoryItem.homestay
                    ? {
                        id: homestayHistoryItem.homestay.id,
                        name: homestayHistoryItem.homestay.name ?? "",
                        roomType: homestayHistoryItem.homestay.roomType ?? "",
                        capacity: homestayHistoryItem.homestay.capacity ?? 0,
                        detail:
                          homestayHistoryItem.homestay.description ??
                          homestayHistoryItem.homestay.detail ??
                          "-",
                        facility: homestayHistoryItem.homestay.facility ?? "",
                        images: (
                          homestayHistoryItem.homestay.homestayImage ??
                          homestayHistoryItem.homestay.images ??
                          []
                        ).map((imageItem: any, imageIndex: number) => ({
                          id: imageItem.id ?? imageIndex,
                          path: imageItem.image ?? imageItem.filePath ?? imageItem.path ?? "",
                          type: imageItem.type ?? "GALLERY",
                        })),
                        location: homestayHistoryItem.homestay.location
                          ? {
                              subDistrict: homestayHistoryItem.homestay.location.subDistrict,
                              district: homestayHistoryItem.homestay.location.district,
                              province: homestayHistoryItem.homestay.location.province,
                              latitude: homestayHistoryItem.homestay.location.latitude,
                              longitude: homestayHistoryItem.homestay.location.longitude,
                            }
                          : null,
                      }
                    : null,
                }),
              )
            : [],
        };

        setPackageDetail(mappedPackageDetail);
      } catch (err) {
        console.error("Error fetching package:", err);
        setErrorMessage("ไม่สามารถโหลดข้อมูลแพ็กเกจได้");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPackageDetail();
  }, [id]);

  if (isLoading) {
    return <div className="p-6 text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  if (errorMessage) {
    return <div className="p-6 text-red-500">{errorMessage}</div>;
  }

  if (!packageDetail) {
    return <div className="p-6 text-gray-500">ไม่พบข้อมูลแพ็กเกจ</div>;
  }

  let homestaySection: JSX.Element | null = null;

  if (packageDetail.homestayHistories && packageDetail.homestayHistories.length > 0) {
    const firstHistory = packageDetail.homestayHistories[0];
    const homestay = firstHistory.homestay;

    if (homestay) {
      const checkIn = extractDateTime(firstHistory.checkInTime);
      const checkOut = extractDateTime(firstHistory.checkOutTime);
      const homestayImage = homestay.images?.[0];

      const facilityItems =
        homestay.facility
          ?.split(/[,•\n]/)
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 12) ?? [];

      homestaySection = (
        <div className="mt-8">
          <h2 className="font-semibold text-lg mb-2">ที่พักในแพ็กเกจ</h2>

          <div className="flex justify-between text-md text-black mb-4">
            <p>
              <strong>เช็กอิน :</strong>{" "}
              {checkIn.date ? `${formatDateTH(checkIn.date)} เวลา ${checkIn.time ?? "-"}` : "-"}
            </p>
            <p>
              <strong>เช็กเอาท์ :</strong>{" "}
              {checkOut.date ? `${formatDateTH(checkOut.date)} เวลา ${checkOut.time ?? "-"}` : "-"}
            </p>
          </div>

          <div className="border rounded-2xl p-6 flex gap-6 bg-white shadow-sm">
            <div className="w-64 h-40 flex-shrink-0 overflow-hidden rounded-xl border">
              <img
                className="w-full h-full object-cover"
                src={
                  homestayImage?.path
                    ? `${apiUrl}/uploads/${homestayImage.path}`
                    : "https://placehold.co/640x480?text=Homestay"
                }
                alt={homestay.name}
              />
            </div>

            <div className="flex-1 text-black">
              <div className="font-semibold text-lg mb-2">{homestay.name}</div>

              {facilityItems.length > 0 && (
                <div>
                  <div className="font-semibold mb-1">สิ่งอำนวยความสะดวกที่พัก</div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {facilityItems.map((facilityItem, facilityIndex) => (
                      <li key={facilityIndex}>{facilityItem}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Breadcrumb */}
      <div>
        <Breadcrumb
          current={{
            label: "รายละเอียดแพ็กเกจ",
            to: `/admin/packages/history/${id}`,
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
              onClick={() => navigate(`/admin/packages/histories`)}
            >
              <Icon icon="lucide:arrow-left" className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold mb-10">รายละเอียดแพ็กเกจ</h1>
          </div>
        </div>
        {/* ชื่อแพ็กเกจ */}
        <div className="mb-6 flex flex-row">
          <p className="text-md text-black">
            <strong>ชื่อแพ็กเกจ : </strong>
            {packageDetail.name}
          </p>
        </div>

        {/* สถานะแพ็กเกจ */}
        <div className="mb-6">
          <div className="flex flex-row items-center gap-5">
            <p className="text-md text-black">
              <strong>สถานะแพ็กเกจ :</strong>
            </p>

            {/* Badge สถานะ */}
            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold
        ${packageDetail.statusPackage === "PUBLISH" ? "bg-green-200 text-green-700" : ""}
        ${packageDetail.statusPackage === "DRAFT" ? "bg-yellow-200 text-yellow-700" : ""}
        ${packageDetail.statusPackage === "UNPUBLISH" ? "bg-red-200 text-red-700" : ""}
        `}
            >
              {packageDetail.statusPackage === "PUBLISH" && "เผยแพร่"}
              {packageDetail.statusPackage === "DRAFT" && "ฉบับร่าง"}
              {packageDetail.statusPackage === "UNPUBLISH" && "ไม่เผยแพร่"}
            </span>
          </div>
        </div>

        {/* คำอธิบาย */}
        <div className="mb-6">
          <div className="flex flex-row">
            <p className="text-md text-black">
              <strong>คำอธิบาย : </strong>
              {packageDetail.description}
            </p>
          </div>
        </div>

        {/* จำนวนคน / ราคา */}
        <div className="grid md:grid-cols-2 gap-6 text-black text-md mb-6">
          <div>
            <p>
              <strong>จำนวนคนที่เปิดรับ : </strong>
              {packageDetail.capacity} คน
            </p>
          </div>
          <div>
            <p>
              <strong>ราคา : </strong>
              {packageDetail.price.toLocaleString()} บาท
            </p>
          </div>
        </div>

        {/* แท็ก */}
        {packageDetail.tags?.length > 0 && (
          <p className="mb-6 flex gap-2 flex-row text-black text-md items-center">
            <strong>แท็ก :</strong>{" "}
            {packageDetail.tags.map((tagLabel, tagIndex) => (
              <Tag
                key={tagIndex}
                label={tagLabel}
                sizeClass="h-8 px-4"
                className="text-black bg-white whitespace-nowrap"
              />
            ))}
          </p>
        )}

        {/* รูปหลัก */}
        <div className="grid grid-cols-1 mb-6 md:grid-cols-[55%_auto] gap-10 items-start">
          <DetailPackageGallery packageDetail={packageDetail} />
        </div>

        {/* ข้อมูลผู้ดูแล */}
        <div className="grid md:grid-cols-2 gap-6 text-black text-md mb-6">
          <div>
            <p className="mb-6">
              <strong>ผู้ดูแล : </strong> {packageDetail.overseer?.name || "-"}
            </p>
            <p className="mb-6">
              <strong>วันที่เริ่ม - วันที่สิ้นสุดแพ็กเกจ : </strong>{" "}
              {formatDateTH(packageDetail.startDate?.date)} -{" "}
              {formatDateTH(packageDetail.dueDate?.date)}
              <br />
              <strong>เวลา : </strong> {packageDetail.startDate?.time || "-"} -{" "}
              {packageDetail.dueDate?.time || "-"}
            </p>
          </div>

          <div>
            <p className="mb-6">
              <strong>สร้างโดย : </strong> {packageDetail.createdBy?.name || "-"}
            </p>
            <p className="mb-6">
              <strong>วันที่เปิด - วันที่ปิดการจอง : </strong>{" "}
              {formatDateTH(packageDetail.openBookingAt?.date)} -{" "}
              {formatDateTH(packageDetail.closeBookingAt?.date)}
              <br />
              <strong>เวลา : </strong> {packageDetail.openBookingAt?.time || "-"} -{" "}
              {packageDetail.closeBookingAt?.time || "-"}
            </p>
          </div>
        </div>

        {/* สิ่งอำนวยความสะดวก */}
        <div className="mb-6">
          <p className="text-black text-md">
            <strong>สิ่งอำนวยความสะดวกแพ็กเกจ : </strong> {packageDetail.facility || "-"}
          </p>
        </div>

        {/* แผนที่ */}
        {packageDetail.location && (
          <div className="mt-8">
            <h2 className="font-bold text-xl mb-6">แผนที่</h2>
            <iframe
              title="map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                packageDetail.location.longitude - 0.01
              },${packageDetail.location.latitude - 0.01},${
                packageDetail.location.longitude + 0.01
              },${
                packageDetail.location.latitude + 0.01
              }&layer=mapnik&marker=${packageDetail.location.latitude},${packageDetail.location.longitude}`}
              className="w-full h-96 rounded-xl border"
            ></iframe>
            <div className="grid md:grid-cols-2 gap-6 text-black text-md mb-6">
              <div className="mt-6">
                <p className="mb-4">
                  <strong>ที่อยู่ :</strong> {packageDetail.location.address}{" "}
                  {packageDetail.location.subDistrict} {packageDetail.location.district}{" "}
                  {packageDetail.location.province} {packageDetail.location.postalCode}
                </p>
                <p>
                  <strong>ละติจูด / ลองจิจูด : </strong> {packageDetail.location.latitude},{" "}
                  {packageDetail.location.longitude}
                </p>
              </div>
              <div className="mt-6">
                <p className="mb-4">
                  <strong>คำอธิบายที่อยู่ :</strong> {packageDetail.location.detail}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* ที่พักในแพ็กเกจ (ถ้ามี) */}
        {homestaySection}
      </div>
    </div>
  );
}
