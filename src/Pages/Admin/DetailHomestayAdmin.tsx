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

import Button from "@/Components/Button";

import type { HomestayDetail } from "@/Types/HomestayDetail";
import { fetchHomestayDetailByAdmin } from "@/Services/homestay-services";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BACKEND_BASE_URL = apiUrl.replace("/api", "") || "http://localhost:3000";

/**
 * ฟังก์ชัน: resolveBackendUploadUrl
 * ป้องกันไม่ให้เกิด "//" ซ้ำ
 */
function resolveBackendUploadUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const cleaned = fileName.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!cleaned.startsWith("uploads/")) {
    return `${BACKEND_BASE_URL}/uploads/${cleaned}`;
  }
  return `${BACKEND_BASE_URL}/${cleaned}`;
}

/* Component : DetailHomestayAdmin */
export default function DetailHomestayAdmin() {
  const navigate = useNavigate();
  const { homestayId } = useParams<{ homestayId: string }>();
  const [homestay, setHomestay] = useState<HomestayDetail | null>(null);

  // โหลดข้อมูลจาก backend (สำหรับ Admin)
  useEffect(() => {
    if (!homestayId) return;
    fetchHomestayDetailByAdmin(Number(homestayId))
      .then((res) => setHomestay(res))
      .catch((err) => console.error(err));
  }, [homestayId]);

  if (!homestay)
    return <div className="p-8 text-gray-500">กำลังโหลดข้อมูลที่พัก...</div>;

  const show = (v: any) => (v ? v : "-");
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

          {/* ปุ่มแก้ไข (ใช้ Button แบบเดียวกับ Super)
          <div className="w-32">
            <Button
              type="confirm-admin"
              onClick={() =>
                navigate(`/admin/community/homestay/${homestay.id}/edit`)
              }
            >
              <div className="flex items-center gap-2">
                <SquarePen className="h-5 w-5" strokeWidth={2.1} />
                <span className="text-base">แก้ไข</span>
              </div>
            </Button>
          </div> */}
          
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
          <div className="text-[16px] leading-relaxed text-gray-800 pl-2">
            <h3 className="text-[20px] font-bold text-black mb-4">
              ข้อมูลที่พัก
            </h3>

            {/* ชื่อ + ประเภท */}
            <div className="flex flex-wrap items-center mb-5 mr-6">
              <p className="mr-10 flex items-baseline">
                <span className="text-[16px] font-bold text-black">
                  ชื่อที่พัก :
                </span>
                <span className="text-[16px] font-normal text-black ml-2">
                  {show(homestay.name)}
                </span>
              </p>

              <p className="flex items-baseline">
                <span className="text-[16px] font-bold text-black">
                  ประเภทที่พัก :
                </span>
                <span className="text-[16px] font-normal text-black ml-2">
                  {show(homestay.type)}
                </span>
              </p>
            </div>

            {/* สิ่งอำนวยความสะดวก */}
            <div className="flex items-start flex-wrap mt-1 mb-5">
              <p className="font-bold mb-1">สิ่งอำนวยความสะดวก :</p>
              {homestay.facility ? (
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {homestay.facility
                    .split(",")
                    .map((item: string, i: number) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                </ul>
              ) : (
                <p className="font-normal ml-2">-</p>
              )}
            </div>

            {/* จำนวนห้องและผู้เข้าพัก */}
            <div className="mb-5">
              <p className="flex items-baseline">
                <span className="font-bold">จำนวนห้องพักทั้งหมด :</span>
                <span className="font-normal ml-2">
                  {show(homestay.totalRoom)} ห้อง
                </span>
              </p>

              <p className="mt-3 flex items-baseline">
                <span className="font-bold">จำนวนผู้เข้าพักต่อห้อง :</span>
                <span className="font-normal ml-2">
                  {show(homestay.guestPerRoom)} คน ต่อ ห้อง
                </span>
              </p>
            </div>

            {/* แท็ก */}
            <div className="flex items-start flex-wrap mt-1">
              <p className="font-bold mt-1 mr-2">แท็ก :</p>
              <div className="flex flex-wrap gap-2">
                {homestay.tagHomestays && homestay.tagHomestays.length > 0 ? (
                  homestay.tagHomestays.map((t: any, i: number) => (
                    <span
                      key={i}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-[14px]"
                    >
                      {t.tag.name}
                    </span>
                  ))
                ) : (
                  <span className="font-normal">-</span>
                )}
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
            <div className="flex overflow-x-auto gap-9 pb-2">
              {extraImages.slice(0, 5).map((img: any, i: number) => {
                const url =
                  resolveBackendUploadUrl(img.image) ??
                  "https://placehold.co/400x300?text=No+Image";
                return (
                  <img
                    key={i}
                    src={url}
                    alt={`extra-${i}`}
                    className="rounded-xl w-75 h-45"
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">- ไม่มีรูปภาพเพิ่มเติม -</p>
          )}
        </div>

        {/* แผนที่ */}
        {homestay.location && (
          <div className="mt-10 space-y-3">
            <h3 className="text-[20px] font-bold text-black">แผนที่</h3>

            <iframe
              title="homestay-map"
              width="100%"
              height="400"
              className="border border-gray-200"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${homestay.location.longitude - 0.01
                }%2C${homestay.location.latitude - 0.01}%2C${homestay.location.longitude + 0.01
                }%2C${homestay.location.latitude + 0.01
                }&layer=mapnik&marker=${homestay.location.latitude}%2C${homestay.location.longitude
                }`}
            ></iframe>

            <div className="text-[16px] leading-relaxed text-gray-700 grid md:grid-cols-2 gap-x-8">
              <div className="space-y-3">
                {/* ที่อยู่ */}
                <p className="flex items-baseline">
                  <span className="font-bold">ที่อยู่ :</span>
                  <span className="font-normal ml-2">
                    {homestay.location.houseNumber}{" "}
                    {homestay.location.villageNumber}{" "}
                    {homestay.location.subDistrict}{" "}
                    {homestay.location.district}{" "}
                    {homestay.location.province}{" "}
                    {homestay.location.postalCode}
                  </span>
                </p>

                {/* ละติจูด / ลองจิจูด */}
                <p className="flex items-baseline">
                  <span className="font-bold">ละติจูด / ลองจิจูด :</span>
                  <span className="font-normal ml-2">
                    {homestay.location.latitude},{" "}
                    {homestay.location.longitude}
                  </span>
                </p>

                {/* Google Maps */}
                <p className="flex items-baseline">
                  <span className="font-bold">Google Maps :</span>
                  <span className="font-normal ml-2">
                    <a
                      href={googleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {googleMapLink}
                    </a>
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                {/* คำอธิบายที่อยู่ */}
                <p className="flex items-baseline">
                  <span className="font-bold">คำอธิบายที่อยู่ :</span>
                  <span className="font-normal ml-2">
                    {show(homestay.location.detail || "-")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
