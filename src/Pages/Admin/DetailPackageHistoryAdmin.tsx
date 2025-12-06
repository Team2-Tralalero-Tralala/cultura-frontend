/**
 * Component : DetailPackageHistoryAdmin
 * คำอธิบาย :
 *   หน้ารายละเอียดแพ็กเกจ (สำหรับผู้ดูแลระบบระดับ Admin)
 *   ใช้สำหรับแสดงข้อมูลแพ็กเกจท่องเที่ยวแต่ละรายการที่อยู่ในระบบของชุมชน
 *   สามารถกดแก้ไขข้อมูลได้ และแสดงข้อมูลผู้สร้าง, ผู้ดูแล, วันที่เปิด-ปิดจอง,
 *   สิ่งอำนวยความสะดวก, และแผนที่ตำแหน่งสถานที่จากข้อมูลใน backend
 * Input :
 *   - id : หมายเลขรหัสแพ็กเกจ (จาก useParams)
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
import type { JSX } from "react/jsx-runtime";

/**
 * ค่าคงที่ : apiUrl
 * คำอธิบาย : ใช้เก็บ base URL ของ API ที่ดึงมาจาก environment variable
 * Input  : -
 * Output : string | undefined (ค่าของ VITE_API_URL)
 */
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

interface HomestayData {
  id: number;
  name: string;
  roomType: string;
  capacity: number;
  detail: string;
  facility?: string;
  images: { id: number; path: string; type: string }[];
  location?:
    | {
        subDistrict?: string;
        district?: string;
        province?: string;
        latitude?: number;
        longitude?: number;
      }
    | null;
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
  type: string;
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

// ================== Helper Functions ==================

/**
 * ฟังก์ชัน : formatDateTH
 * คำอธิบาย : แปลงวันที่รูปแบบ ISO (string) ให้เป็นรูปแบบไทย dd/mm/yyyy
 * Input  : dateStr: string | null (ข้อความวันที่ในรูปแบบ ISO หรือ null)
 * Output : string (วันที่ในรูปแบบ dd/mm/yyyy หรือ "-" ถ้าไม่มีข้อมูล)
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
 * ฟังก์ชัน : extractDateTime
 * คำอธิบาย : แยกวันที่และเวลาออกจาก ISO string (เช่น "2025-01-01T08:30:00.000Z")
 * Input  : isoString?: string | null (ข้อความวันที่-เวลาในรูปแบบ ISO หรือ null)
 * Output : วัตถุที่ประกอบด้วยวันที่ (date) และเวลา (time) เช่น { date: "2025-01-01", time: "08:30" }
 */
function extractDateTime(isoString?: string | null): DateTimeField {
  if (!isoString) return { date: null, time: null };
  const dateObject = new Date(isoString);
  const date = dateObject.toISOString().split("T")[0];
  const time = dateObject.toTimeString().split(" ")[0].slice(0, 5);
  return { date, time };
}

// ================== Main Component ==================

export default function DetailPackageHistoryAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackage() {
      try {
        setLoading(true);
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
            ? packageRawData.tagPackages.map(
                (tagItem: any) => tagItem.tag.name
              )
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
            ? packageRawData.packageFile.map(
                (fileItem: any): PackageFile => ({
                  id: fileItem.pf_id ?? fileItem.id,
                  path: fileItem.pf_image,
                  type: fileItem.pf_type,
                })
              )
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
                        ).map(
                          (imageItem: any, imageIndex: number) => ({
                            id: imageItem.id ?? imageIndex,
                            path:
                              imageItem.image ??
                              imageItem.filePath ??
                              imageItem.path ??
                              "",
                            type: imageItem.type ?? "GALLERY",
                          })
                        ),
                        location: homestayHistoryItem.homestay.location
                          ? {
                              subDistrict:
                                homestayHistoryItem.homestay.location
                                  .subDistrict,
                              district:
                                homestayHistoryItem.homestay.location.district,
                              province:
                                homestayHistoryItem.homestay.location.province,
                              latitude:
                                homestayHistoryItem.homestay.location.latitude,
                              longitude:
                                homestayHistoryItem.homestay.location.longitude,
                            }
                          : null,
                      }
                    : null,
                })
              )
            : [],
        };

        setPkg(mappedPackageDetail);
      } catch (err) {
        console.error("Error fetching package:", err);
        setError("ไม่สามารถโหลดข้อมูลแพ็กเกจได้");
      } finally {
        setLoading(false);
      }
    }

    fetchPackage();
  }, [id]);

  // ================== Loading / Error ==================
  if (loading) return <div className="p-6 text-gray-500">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!pkg) return <div className="p-6 text-gray-500">ไม่พบข้อมูลแพ็กเกจ</div>;

  const mainImage = pkg.files?.find((img: any) => img.type === "COVER");
  const extraImages = pkg.files?.filter((img: any) => img.type === "GALLERY");

  let homestaySection: JSX.Element | null = null;

  if (pkg.homestayHistories && pkg.homestayHistories.length > 0) {
    const firstHistory = pkg.homestayHistories[0];
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

          <div className="flex justify-between text-md text-gray-700 mb-4">
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
                    ? `${new URL(apiUrl).origin}/uploads/${homestayImage.path}`
                    : "https://placehold.co/640x480?text=Homestay"
                }
                alt={homestay.name}
              />
            </div>

            <div className="flex-1 text-gray-800">
              <div className="font-semibold text-lg mb-2">{homestay.name}</div>

              {facilityItems.length > 0 && (
                <div>
                  <div className="font-semibold mb-1">สิ่งอำนวยความสะดวกที่พัก</div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {facilityItems.map((item, index) => (
                      <li key={index}>{item}</li>
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

  /* ----------------------------- จากตรงนี้ลงไปห้ามแก้ ----------------------------- */

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
          <p className="text-md text-gray-800">
            <strong>ชื่อแพ็กเกจ : </strong>
            {pkg.name}
          </p>
        </div>

        {/* สถานะแพ็กเกจ */}
        <div className="mb-6">
          <div className="flex flex-row items-center gap-2">
            <p className="text-md text-gray-800 font-semibold">สถานะแพ็กเกจ :</p>

            {/* Badge สถานะ */}
            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold
        ${pkg.statusPackage === "PUBLISH" ? "bg-green-200 text-green-700" : ""}
        ${pkg.statusPackage === "DRAFT" ? "bg-yellow-200 text-yellow-700" : ""}
        ${pkg.statusPackage === "UNPUBLISH" ? "bg-red-200 text-red-700" : ""}
        `}
            >
              {pkg.statusPackage === "PUBLISH" && "เผยแพร่"}
              {pkg.statusPackage === "DRAFT" && "ฉบับร่าง"}
              {pkg.statusPackage === "UNPUBLISH" && "ไม่เผยแพร่"}
            </span>
          </div>
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
        <div className="grid md:grid-cols-2 gap-6 text-gray-700 mb-6">
          <div>
            <p>
              <strong>จำนวนคนที่เปิดรับ : </strong>
              {pkg.capacity} คน
            </p>
          </div>
          <div>
            <p>
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

        {/* ===== รูปหลัก ===== */}
        <div className="grid grid-cols-1 md:grid-cols-[55%_auto] gap-10 items-start">
          {mainImage ? (
            <img
              src={`${apiUrl}/uploads${mainImage.path}`}
              alt="package-main"
              className="w-full h-[400px] object-cover rounded-xl shadow mb-6"
            />
          ) : (
            <img
              src="https://placehold.co/600x400?text=No+Image"
              alt="package-main"
              className="w-full h-[400px] object-cover rounded-xl shadow mb-6"
            />
          )}
        </div>

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
        {/* ที่พักในแพ็กเกจ (ถ้ามี) */}
        {homestaySection}
      </div>
    </div>
  );
}
