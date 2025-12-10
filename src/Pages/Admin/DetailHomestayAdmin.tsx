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

const apiUrl = import.meta.env.VITE_API_URL;

/*
 * ฟังก์ชัน : resolveBackendUploadUrl
 * คำอธิบาย : แปลงชื่อไฟล์หรือพาธจาก backend ให้เป็น URL เต็มสำหรับใช้งานบน frontend
 *              โดยตัดเครื่องหมาย "/" ส่วนเกิน และป้องกันไม่ให้เกิด "//" ซ้อนกัน
 * Input :
 *   - fileName (string | undefined) : ชื่อไฟล์หรือพาธไฟล์จาก backend (เช่น "uploads/xxx.jpg")
 * Output :
 *   - string | undefined : URL เต็ม (เช่น "http://.../uploads/xxx.jpg") หรือ undefined หากไม่มีค่า
 */
function resolveBackendUploadUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const cleaned = fileName.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!cleaned.startsWith("uploads/")) {
    return `${apiUrl}/uploads/${cleaned}`;
  }
  return `${apiUrl}/${cleaned}`;
}

/*
 * ฟังก์ชัน : DetailHomestayAdmin
 * คำอธิบาย : หน้าสำหรับแสดงรายละเอียดของที่พัก (Homestay) สำหรับผู้ดูแลระบบ (Admin)
 * การทำงาน :
 *   - ดึงข้อมูลรายละเอียดที่พักจาก backend ตาม homestayId
 *   - แสดงข้อมูลที่พัก รูปภาพ แท็ก สิ่งอำนวยความสะดวก และตำแหน่งบนแผนที่
 *   - รองรับการนำทางไปยังหน้าแก้ไขข้อมูลที่พัก
 */
export default function DetailHomestayAdmin() {
  const navigate = useNavigate();
  const { homestayId } = useParams<{ homestayId: string }>();
  const [homestay, setHomestay] = useState<HomestayDetail | null>(null);

  /*
   * State : previewImage
   * คำอธิบาย : เก็บ URL รูปที่ผู้ใช้คลิกจาก "รูปภาพเพิ่มเติม"
   *            เพื่อนำไปแสดงบน Modal เป็นรูปขนาดใหญ่
   */
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // โหลดข้อมูลจาก backend (สำหรับ Admin)
  useEffect(() => {
    if (!homestayId) return;
    fetchHomestayDetailByAdmin(Number(homestayId))
      .then((res) => setHomestay(res))
      .catch((err) => console.error(err));
  }, [homestayId]);

  if (!homestay)
    return <div className="p-8 text-gray-500">กำลังโหลดข้อมูลที่พัก...</div>;

  /*
   * ฟังก์ชัน : displayText
   * คำอธิบาย : ใช้แสดงค่าที่ส่งเข้ามา หากไม่มีค่าหรือเป็น falsy จะแสดงเป็น "-"
   * Input :
   *   - value (any) : ค่าที่ต้องการนำมาแสดงผล เช่น string, number หรือค่าอื่น ๆ
   * Output :
   *   - any : คืนค่าต้นฉบับถ้ามีค่า หรือ "-" หากไม่มีค่า
   */
  const displayText = (value: any) => (value ? value : "-");

  const googleMapLink = `https://maps.google.com/?q=${homestay.location?.latitude},${homestay.location?.longitude}`;

  const mainImage = homestay.homestayImage?.find(
    (img: any) => img.type === "COVER"
  );
  const extraImages = homestay.homestayImage?.filter(
    (img: any) => img.type === "GALLERY"
  );

  return (
    <div className="px-1 space-y-3">
      <div>
        <Breadcrumb
          current={{
            label: homestay?.name || "รายละเอียดที่พัก",
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
            to={`/admin/community/homestay/${homestay.id}/edit`}
            className="flex items-center gap-2 bg-[#055035] hover:bg-[#155849] text-white px-6 py-2.5 rounded-lg transition text-sm font-medium shadow-sm"
          >
            <SquarePen size={18} />
            <span>แก้ไข</span>
          </Link>
        </div>

        {/* รูปหลัก + ข้อมูลที่พัก */}
        <div className="grid grid-cols-1 md:grid-cols-[55%_auto] gap-10 items-start">
          {/* รูปหลัก */}
          {mainImage ? (
            (() => {
              const url =
                resolveBackendUploadUrl(mainImage.image) ??
                "https://placehold.co/600x400?text=No+Image";
              return (
                <img
                  src={url}
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
                  {displayText(homestay.name)}
                </span>
              </div>

              {/* ประเภทที่พัก */}
              <div className="grid grid-cols-[160px_16px_1fr] items-start">
                <span className="font-bold text-black">ประเภทที่พัก</span>
                <span className="font-bold text-black">:</span>
                <span className="text-black">
                  {displayText(homestay.type)}
                </span>
              </div>

              {/* สิ่งอำนวยความสะดวก */}
              <div className="grid grid-cols-[160px_16px_1fr] items-start">
                <span className="font-bold text-black">
                  สิ่งอำนวยความสะดวก
                </span>
                <span className="font-bold text-black">:</span>
                {homestay.facility ? (
                  <ul className="list-disc list-inside space-y-1 text-black">
                    {homestay.facility
                      .split(",")
                      .map((item: string, i: number) => (
                        <li key={i}>{item.trim()}</li>
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
                  {displayText(homestay.totalRoom)} ห้อง
                </span>
              </div>

              {/* จำนวนผู้เข้าพักต่อห้อง */}
              <div className="grid grid-cols-[160px_16px_1fr] items-start">
                <span className="font-bold text-black">
                  จำนวนผู้เข้าพักต่อห้อง
                </span>
                <span className="font-bold text-black">:</span>
                <span className="text-black">
                  {displayText(homestay.guestPerRoom)} คน ต่อ ห้อง
                </span>
              </div>

              {/* แท็ก */}
              <div className="grid grid-cols-[160px_16px_1fr] items-start">
                <span className="font-bold text-black">แท็ก</span>
                <span className="font-bold text-black">:</span>

                <div className="flex flex-wrap gap-2 text-black">
                  {homestay.tagHomestays && homestay.tagHomestays.length > 0 ? (
                    homestay.tagHomestays.map(
                      (tagItem: any, i: number) => (
                        <Tag
                          key={i}
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

          {extraImages?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {extraImages.slice(0, 5).map((img: any, i: number) => {
                const url =
                  resolveBackendUploadUrl(img.image) ??
                  "https://placehold.co/400x300?text=No+Image";

                return (
                  /*
                   * กล่องรูปเพิ่มเติมแต่ละใบ
                   * - ฟิกสัดส่วน 4:3
                   * - คลิกแล้วเปิด Modal แสดงรูปใหญ่ (ผ่าน state previewImage)
                   */
                  <div
                    key={i}
                    className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => setPreviewImage(url)}
                  >
                    <img
                      src={url}
                      alt={`extra-${i}`}
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
        {homestay.location?.latitude && homestay.location?.longitude && (
          <div className="mt-10 space-y-3">
            <h3 className="text-[20px] font-bold text-black">แผนที่</h3>

            {/* แผนที่ตำแหน่งที่พัก (OpenStreetMap) */}
            <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
              {(() => {
                // ค่าพิกัดจากที่พัก
                const lat = homestay.location!.latitude;
                const lng = homestay.location!.longitude;

                // ค่าระยะซูมของ bbox (ยิ่งน้อยยิ่งซูมเข้าใกล้)
                const zoomDelta = 0.0025;

                // สร้าง URL สำหรับฝัง OpenStreetMap
                const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - zoomDelta
                  }%2C${lat - zoomDelta}%2C${lng + zoomDelta}%2C${lat + zoomDelta
                  }&layer=mapnik&marker=${lat}%2C${lng}`;

                return (
                  <iframe
                    title="homestay-openstreetmap"
                    src={osmUrl}
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
                    {homestay.location.houseNumber}{" "}
                    {homestay.location.villageNumber}{" "}
                    {homestay.location.subDistrict}{" "}
                    {homestay.location.district}{" "}
                    {homestay.location.province}{" "}
                    {homestay.location.postalCode}
                  </span>
                </div>

                {/* ละติจูด / ลองจิจูด */}
                <div className="grid grid-cols-[160px_16px_1fr] items-start">
                  <span className="font-bold text-black">ละติจูด / ลองจิจูด</span>
                  <span className="font-bold text-black">:</span>
                  <span className="text-black">
                    {homestay.location.latitude}, {homestay.location.longitude}
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
                    {displayText(homestay.location.detail || "-")}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Modal : แสดงรูปภาพขนาดใหญ่เมื่อคลิกรูปใน "รูปภาพเพิ่มเติม" */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()} // กันไม่ให้คลิกในกล่องแล้วปิด modal
            >
              {/* ปุ่มปิด Modal */}
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-4 -right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-800"
              >
                ✕
              </button>

              {/* รูปใหญ่ */}
              <img
                src={previewImage}
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
