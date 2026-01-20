/**
 * หน้า : ดูรายละเอียดที่พัก (Admin)
 * Page : DetailHomestayAdmin
 * Description : แสดงรายละเอียดของที่พัก (Homestay) สำหรับแอดมินของชุมชนนั้น ๆ
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SquarePen, ArrowLeft } from "lucide-react";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { Link } from "react-router-dom";
import { Tag } from "@/Components/Tag";
import type { HomestayDetail } from "@/Types/HomestayDetail";
import { fetchHomestayDetailByAdmin } from "@/Services/homestay-services";

const apiUrl = import.meta.env.VITE_API_URL || "";
const backendBaseUrl = apiUrl.replace(/\/api$/, "");

/*
 * คำอธิบาย : แปลงชื่อไฟล์หรือพาธจาก backend ให้เป็น URL เต็มสำหรับใช้งานบน frontend
 * Input : fileName (string | undefined)
 * Output : string | undefined (URL เต็ม)
 */
function resolveBackendUploadUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;

  const cleanedPath = fileName.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");

  if (cleanedPath.startsWith("http")) return cleanedPath;

  if (!cleanedPath.startsWith("uploads/")) {
    return `${backendBaseUrl}/uploads/${cleanedPath}`;
  }

  return `${backendBaseUrl}/${cleanedPath}`;
}

/*
 * คำอธิบาย : ใช้แสดงค่าที่ส่งเข้ามา หากไม่มีค่าหรือเป็น falsy จะแสดงเป็น "-"
 * Input : textValue (any)
 * Output : any (คืนค่าต้นฉบับถ้ามีค่า หรือ "-" หากไม่มีค่า)
 */
const displayText = (textValue: any) => (textValue ? textValue : "-");

/*
 * คำอธิบาย : หน้าสำหรับแสดงรายละเอียดของที่พัก (Homestay) สำหรับผู้ดูแลระบบ (Admin)
 */
export default function DetailHomestayAdmin() {
  const navigate = useNavigate();
  const { homestayId } = useParams<{ homestayId: string }>();

  /* State เก็บข้อมูลรายละเอียดที่พัก */
  const [homestayDetail, setHomestayDetail] = useState<HomestayDetail | null>(null);

  /* State เก็บ URL รูปภาพสำหรับแสดงใน Modal (Preview) */
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  /*
   * คำอธิบาย : โหลดข้อมูลรายละเอียดที่พักจาก backend เมื่อ homestayId เปลี่ยนแปลง
   */
  useEffect(() => {
    if (!homestayId) return;
    fetchHomestayDetailByAdmin(Number(homestayId))
      .then((response) => setHomestayDetail(response))
      .catch((error) => console.error(error));
  }, [homestayId]);

  if (!homestayDetail)
    return <div className="p-8 text-gray-500">กำลังโหลดข้อมูลที่พัก...</div>;

  const googleMapLink = `https://maps.google.com/?q=${homestayDetail.location?.latitude},${homestayDetail.location?.longitude}`;

  const coverImage = homestayDetail.homestayImage?.find(
    (imageItem: any) => imageItem.type === "COVER"
  );

  const galleryImageLists = homestayDetail.homestayImage?.filter(
    (imageItem: any) => imageItem.type === "GALLERY"
  );

  return (
    <div className="px-1 space-y-3">
      <div>
        <Breadcrumb
          current={{
            label: homestayDetail?.name || "รายละเอียดที่พัก",
            to: `/admin/community/homestay/${homestayId}`,
          }}
        />
      </div>

      {/* การ์ดหลัก */}
      <div className="bg-white rounded-2xl shadow-sm px-10 py-8">
        <div className="flex justify-between items-center mb-5">
          {/* หัวข้อ + ปุ่มย้อนกลับ */}
          <h1 className="flex items-center gap-2 text-[20px] font-bold text-black">
            <ArrowLeft
              className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors"
              onClick={() => navigate("/admin/community/homestays")}
            />
            รายละเอียดที่พัก
          </h1>

          {/* ปุ่มแก้ไข */}
          <Link
            to={`/admin/community/homestay/${homestayDetail.id}/edit`}
              className="bg-[#055035] hover:bg-green-900 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <SquarePen size={18} />
            <span>แก้ไข</span>
          </Link>
        </div>

        {/* รูปหลัก + ข้อมูลที่พัก */}
        <div className="grid grid-cols-1 md:grid-cols-[55%_auto] gap-10 items-start">
          {/* รูปหลัก */}
          {coverImage ? (
            (() => {
              const fullImageUrl =
                resolveBackendUploadUrl(coverImage.image) ??
                "https://placehold.co/600x400?text=No+Image";
              return (
                <img
                  src={fullImageUrl}
                  alt="homestay-main"
                  className="w-full h-[400px] object-cover rounded-xl shadow"
                />
              );
            })()
          ) : (
            <div className="w-full h-[400px] bg-gray-100 rounded-xl grid place-items-center text-gray-500">
              ไม่มีรูปภาพ
            </div>
          )}

          {/* ข้อมูลที่พัก */}
          <div className="text-[16px] leading-relaxed pl-2">
            <h3 className="text-[20px] font-bold text-black mb-4">
              ข้อมูลที่พัก
            </h3>

            <div className="space-y-4">
              {/* ชื่อที่พัก */}
              <div className="grid grid-cols-[160px_16px_1fr] items-start">
                <span className="font-bold text-black">ชื่อที่พัก</span>
                <span className="font-bold text-black">:</span>
                <span className="whitespace-pre-line text-black">
                  {displayText(homestayDetail.name)}
                </span>
              </div>

              {/* ประเภทที่พัก */}
              <div className="grid grid-cols-[160px_16px_1fr] items-start">
                <span className="font-bold text-black">ประเภทที่พัก</span>
                <span className="font-bold text-black">:</span>
                <span className="text-black">
                  {displayText(homestayDetail.type)}
                </span>
              </div>

              {/* สิ่งอำนวยความสะดวก */}
              <div className="grid grid-cols-[160px_16px_1fr] items-start">
                <span className="font-bold text-black">
                  สิ่งอำนวยความสะดวก
                </span>
                <span className="font-bold text-black">:</span>
                {homestayDetail.facility ? (
                  <ul className="list-disc list-inside space-y-1 text-black">
                    {homestayDetail.facility
                      .split(",")
                      .map((facilityItem: string, index: number) => (
                        <li key={index}>{facilityItem.trim()}</li>
                      ))}
                  </ul>
                ) : (
                  <span className="text-black">-</span>
                )}
              </div>

              {/* จำนวนห้องพักทั้งหมด */}
              <div className="grid grid-cols-[160px_16px_1fr] items-start">
                <span className="font-bold text-black">
                  จำนวนห้องพักทั้งหมด
                </span>
                <span className="font-bold text-black">:</span>
                <span className="text-black">
                  {displayText(homestayDetail.totalRoom)} ห้อง
                </span>
              </div>

              {/* จำนวนผู้เข้าพักต่อห้อง */}
              <div className="grid grid-cols-[160px_16px_1fr] items-start">
                <span className="font-bold text-black">
                  จำนวนผู้เข้าพักต่อห้อง
                </span>
                <span className="font-bold text-black">:</span>
                <span className="text-black">
                  {displayText(homestayDetail.guestPerRoom)} คน ต่อ ห้อง
                </span>
              </div>

              {/* แท็ก */}
              <div className="grid grid-cols-[160px_16px_1fr] items-start">
                <span className="font-bold text-black">แท็ก</span>
                <span className="font-bold text-black">:</span>

                <div className="flex flex-wrap gap-2 text-black">
                  {homestayDetail.tagHomestays && homestayDetail.tagHomestays.length > 0 ? (
                    homestayDetail.tagHomestays.map(
                      (tagItem: any, index: number) => (
                        <Tag
                          key={index}
                          label={tagItem.tag.name}
                          sizeClass="px-3 h-8"
                          className="border-gray-300 text-black"
                          title={tagItem.tag.name}
                        />
                      )
                    )
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* รูปภาพเพิ่มเติม */}
        <div className="mt-10">
          <h3 className="text-[20px] font-bold text-black mb-3">
            รูปภาพเพิ่มเติม
          </h3>

          {galleryImageLists && galleryImageLists.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {galleryImageLists.slice(0, 5).map((imageItem: any, index: number) => {
                const fullImageUrl =
                  resolveBackendUploadUrl(imageItem.image) ??
                  "https://placehold.co/400x300?text=No+Image";

                return (
                  /*
                   * กล่องรูปเพิ่มเติมแต่ละใบ
                   * - ฟิกสัดส่วน 4:3
                   * - คลิกแล้วเปิด Modal แสดงรูปใหญ่ (ผ่าน state previewImageUrl)
                   */
                  <div
                    key={index}
                    className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => setPreviewImageUrl(fullImageUrl)}
                  >
                    <img
                      src={fullImageUrl}
                      alt={`gallery-${index}`}
                      className="w-full h-full object-cover hover:scale-[1.02] transition"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">- ไม่มีรูปภาพเพิ่มเติม -</p>
          )}
        </div>

        {/* แผนที่ */}
        {homestayDetail.location?.latitude && homestayDetail.location?.longitude && (
          <div className="mt-10 space-y-3">
            <h3 className="text-[20px] font-bold text-black">แผนที่</h3>

            {/* แผนที่ตำแหน่งที่พัก (OpenStreetMap) */}
            <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
              {(() => {
                // ค่าพิกัดจากที่พัก
                const latitude = homestayDetail.location!.latitude;
                const longitude = homestayDetail.location!.longitude;

                // ค่าระยะซูมของ bbox (ยิ่งน้อยยิ่งซูมเข้าใกล้)
                const zoomDelta = 0.0025;

                // สร้าง URL สำหรับฝัง OpenStreetMap
                const openStreetMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - zoomDelta
                  }%2C${latitude - zoomDelta}%2C${longitude + zoomDelta}%2C${latitude + zoomDelta
                  }&layer=mapnik&marker=${latitude}%2C${longitude}`;

                return (
                  <iframe
                    title="homestay-openstreetmap"
                    src={openStreetMapUrl}
                    width="100%"
                    height="400"
                    frameBorder={0}
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    className="block w-full"
                  />
                );
              })()}
            </div>

            {/* ข้อมูลรายละเอียดที่อยู่ + พิกัด + ลิงก์ Google Maps */}
            <div className="text-[16px] leading-relaxed text-gray-700 grid md:grid-cols-2 gap-x-10 gap-y-6">
              {/* คอลัมน์ซ้าย */}
              <div className="space-y-4">
                {/* ที่อยู่ */}
                <div className="grid grid-cols-[160px_16px_1fr] items-start">
                  <span className="font-bold text-black">ที่อยู่</span>
                  <span className="font-bold text-black">:</span>
                  <span className="text-black">
                    {homestayDetail.location.houseNumber}{" "}
                    {homestayDetail.location.villageNumber}{" "}
                    {homestayDetail.location.subDistrict}{" "}
                    {homestayDetail.location.district}{" "}
                    {homestayDetail.location.province}{" "}
                    {homestayDetail.location.postalCode}
                  </span>
                </div>

                {/* ละติจูด / ลองจิจูด */}
                <div className="grid grid-cols-[160px_16px_1fr] items-start">
                  <span className="font-bold text-black">ละติจูด / ลองจิจูด</span>
                  <span className="font-bold text-black">:</span>
                  <span className="text-black">
                    {homestayDetail.location.latitude}, {homestayDetail.location.longitude}
                  </span>
                </div>

                {/* Google Maps */}
                <div className="grid grid-cols-[160px_16px_1fr] items-start">
                  <span className="font-bold text-black">Google Maps</span>
                  <span className="font-bold text-black">:</span>
                  <a
                    href={googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#055035] underline break-all"
                  >
                    {googleMapLink}
                  </a>
                </div>
              </div>

              {/* คอลัมน์ขวา */}
              <div className="space-y-4">
                {/* คำอธิบายที่อยู่ */}
                <div className="grid grid-cols-[160px_16px_1fr] items-start">
                  <span className="font-bold text-black">คำอธิบายที่อยู่</span>
                  <span className="font-bold text-black">:</span>
                  <span className="text-black whitespace-pre-line">
                    {displayText(homestayDetail.location.detail || "-")}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Modal : แสดงรูปภาพขนาดใหญ่เมื่อคลิกรูปใน "รูปภาพเพิ่มเติม" */}
        {previewImageUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setPreviewImageUrl(null)}
          >
            <div
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(event) => event.stopPropagation()} // กันไม่ให้คลิกในกล่องแล้วปิด modal
            >
              {/* ปุ่มปิด Modal */}
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="absolute -top-4 -right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-800"
              >
                ✕
              </button>

              {/* รูปใหญ่ */}
              <img
                src={previewImageUrl}
                alt="preview"
                className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain bg-black"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
