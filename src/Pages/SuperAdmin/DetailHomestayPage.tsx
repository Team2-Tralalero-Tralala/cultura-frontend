/**
 * Component : HomestayDetailPage (Super Admin)
 * Description : แสดงรายละเอียดของที่พัก (Homestay) พร้อมภาพ แท็ก และแผนที่
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SquarePen, ArrowLeft } from "lucide-react";
import type { HomestayDetail } from "@/Types/HomestayDetail";

import { fetchHomestayDetail } from "@/Services/homestay-services";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/";
/* ===========================================================
 * Function : resolveBackendUploadUrl
 * Description : แปลงพาธไฟล์ให้เป็น URL ดาวน์โหลดจาก Backend
 * Input : fileName (string | undefined)
 * Output : string | undefined
 * =========================================================== */
function resolveBackendUploadUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;

  const cleaned = fileName.replace(/^\/+/, "");
  const finalPath = cleaned.startsWith("uploads/") ? cleaned : `uploads/${cleaned}`;

  const fullUrl = `${BACKEND_BASE_URL}${finalPath}`;

  return fullUrl;
}
/* ===========================================================
 * Component : HomestayDetailPage
 * =========================================================== */
export default function HomestayDetailPage() {
  const { homestayId } = useParams<{ homestayId: string }>();
  const [homestay, setHomestay] = useState<HomestayDetail | null>(null);

  // โหลดข้อมูลจาก backend
  useEffect(() => {
    if (!homestayId) return;
    fetchHomestayDetail(Number(homestayId))
      .then((res) => {
        console.log("📦 Homestay Data:", res);
        setHomestay(res);
      })
      .catch((err) => console.error(err));
  }, [homestayId]);


  if (!homestay)
    return <div className="p-8 text-gray-500">กำลังโหลดข้อมูลที่พัก...</div>;

  const show = (v: any) => (v ? v : "-");
  const googleMapLink = `https://maps.google.com/?q=${homestay.location?.latitude},${homestay.location?.longitude}`;

  // ดึงรูปหลักและรูปเพิ่มเติมจาก type
  const mainImage = homestay.homestayImage?.find(
    (img: any) => img.type === "COVER"
  );
  const extraImages = homestay.homestayImage?.filter(
    (img: any) => img.type === "GALLERY"
  );

  return (
    <div className="px-1 space-y-3">
      {/* ===== Breadcrumb ===== */}
      <div className="text-sm text-gray-900">
        <Link
          to="/super/communities"
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          จัดการชุมชน
        </Link>
        ›
        <Link
          to={`/super/community/detail/${homestay.community.id}`}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          {homestay.community.name}
        </Link>
        ›
        <Link
          to="/super/homestays"
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          จัดการที่พัก
        </Link>
        › <span className="text-gray-600">รายละเอียดที่พัก</span>
      </div>

      {/* ===== การ์ดหลัก ===== */}
      <div className="bg-white rounded-2xl shadow-sm px-10 py-8">
        {/* ===== หัวข้อบนสุด + ปุ่มแก้ไข ===== */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Link
              to="/super/homestays"
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ArrowLeft size={22} strokeWidth={2.2} />
            </Link>
            <h2 className="text-xl font-semibold text-gray-800">
              รายละเอียดที่พัก
            </h2>
          </div>

          {/* ปุ่มแก้ไข */}
          <Link
            to={`/super/homestay/edit/${homestay.id}`}
            className="flex items-center gap-2 bg-[#055035] hover:bg-[#155849] text-white px-6 py-2.5 rounded-lg transition text-sm font-medium shadow-sm"
          >
            <SquarePen size={18} />
            <span>แก้ไข</span>
          </Link>
        </div>

        {/* ===== รูปหลัก + ข้อมูลที่พัก ===== */}
        <div className="grid grid-cols-1 md:grid-cols-[55%_auto] gap-10 items-start">
          {/* ===== รูปหลัก ===== */}
          {mainImage ? (
            (() => {
              const url =
                resolveBackendUploadUrl(mainImage.image) ??
                "https://placehold.co/600x400?text=No+Image";
              console.log("🖼️ mainImage URL:", url);
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

          {/* ===== ข้อมูลที่พัก ===== */}
          <div className="text-[16px] leading-relaxed text-gray-800 pl-2">
            <h3 className="text-[20px] font-semibold mb-4">ข้อมูลที่พัก</h3>

            {/* ชื่อ + ประเภท */}
            <div className="flex flex-wrap items-center mb-5 mr-6">
              <p className="mr-10">
                <strong>ชื่อที่พัก :</strong> {show(homestay.name)}
              </p>
              <p className="ml-30">
                <strong>ประเภทที่พัก :</strong> {show(homestay.type)}
              </p>
            </div>

            {/* สิ่งอำนวยความสะดวก */}
            <div className="flex items-start flex-wrap mt-1 mb-5">
              <p className="font-semibold mb-1">สิ่งอำนวยความสะดวก :</p>
              {homestay.facility ? (
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {homestay.facility
                    .split(",")
                    .map((item: string, i: number) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                </ul>
              ) : (
                <p>-</p>
              )}
            </div>

            {/* จำนวนห้องและผู้เข้าพัก */}
            <div className="mb-5">
              <p>
                <strong>จำนวนห้องพักทั้งหมด :</strong>{" "}
                {show(homestay.totalRoom)} ห้อง
              </p>
              <p className="mt-3">
                <strong>จำนวนผู้เข้าพักต่อห้อง :</strong>{" "}
                {show(homestay.guestPerRoom)} คน / ห้อง
              </p>
            </div>

            {/* แท็ก */}
            <div className="flex items-start flex-wrap mt-1">
              <p className="font-semibold mt-1 mr-2">แท็ก :</p>
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
                  <span>-</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== รูปภาพเพิ่มเติม ===== */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-3">รูปภาพเพิ่มเติม</h3>
          {extraImages?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {extraImages.map((img: any, i: number) => {
                const url =
                  resolveBackendUploadUrl(img.image) ??
                  "https://placehold.co/400x300?text=No+Image";
                console.log(`🖼️ extraImage[${i}] URL:`, url);
                return (
                  <img
                    key={i}
                    src={url}
                    alt={`extra-${i}`}
                    className="rounded-xl object-cover w-full h-44 hover:scale-[1.03] transition-transform duration-200"
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">- ไม่มีรูปภาพเพิ่มเติม -</p>
          )}
        </div>

        {/* ===== แผนที่ ===== */}
        {homestay.location && (
          <div className="mt-10 space-y-3">
            <h3 className="text-lg font-semibold">แผนที่</h3>

            <iframe
              title="homestay-map"
              width="100%"
              height="400"
              className="border border-gray-200"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                homestay.location.longitude - 0.01
              }%2C${homestay.location.latitude - 0.01}%2C${
                homestay.location.longitude + 0.01
              }%2C${
                homestay.location.latitude + 0.01
              }&layer=mapnik&marker=${homestay.location.latitude}%2C${homestay.location.longitude}`}
            ></iframe>

            <div className="text-[15px] leading-relaxed text-gray-700 grid md:grid-cols-2 gap-x-8">
              <div className="space-y-1">
                <p>
                  <strong>ที่อยู่ :</strong>{" "}
                  {homestay.location.houseNumber}{" "}
                  {homestay.location.villageNumber}{" "}
                  {homestay.location.subDistrict}{" "}
                  {homestay.location.district}{" "}
                  {homestay.location.province}{" "}
                  {homestay.location.postalCode}
                </p>
                <p>
                  <strong>ละติจูด / ลองจิจูด :</strong>{" "}
                  {homestay.location.latitude}, {homestay.location.longitude}
                </p>
                <p>
                  <strong>Google Maps :</strong>{" "}
                  <a
                    href={googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    
                  >
                    {googleMapLink}
                  </a>
                </p>
              </div>

              <div>
                <p>
                  <strong>คำอธิบายที่อยู่ :</strong>{" "}
                  {show(homestay.location.detail || "-")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
