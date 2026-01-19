/*
 * คำอธิบาย : Component สำหรับแสดงรายละเอียดที่พักโฮมสเตย์ของผู้ใช้ทั่วไป (Tourist)
 * แสดงรายละเอียดต่าง ๆ เช่น ชื่อที่พัก, ประเภท, สิ่งอำนวยความสะดวก, ที่อยู่, คำอธิบาย, แกลเลอรีรูปภาพ
 * รวมถึงแสดงที่พักอื่น ๆ ในชุมชนเดียวกัน พร้อมระบบ Pagination
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHomestayDetailAndOtherHomestay } from "@/Libs/HomestayService";
import type { HomestayDetail } from "@/Types/HomestayDetail";
import NavbarTourist from "@/Components/NavbarTourist";
import Footer from "@/Components/Footer";
import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import { Tag } from "@/Components/Tag";
import { Icon } from "@iconify/react";
import Thumbnails, { type MediaItem } from "@/Components/Thumbnails";
import Pagination from "@/Components/Pagination/PaginationRoundedForCardPackage";
import LocalServiceCard from "@/Components/LocalServiceCard";

const apiUrl = import.meta.env.VITE_API_URL;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแปลงชื่อไฟล์จาก backend เป็น URL ใช้งานได้
 * Input : fileName ชื่อไฟล์ที่ได้จาก backend
 * Output : string - URL ของไฟล์ภาพ
 */
function resolveBackendUploadUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const cleaned = fileName.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!cleaned.startsWith("uploads/")) {
    return `${apiUrl}/uploads/${cleaned}`;
  }
  return `${apiUrl}/${cleaned}`;
}

interface OtherHomestay {
  id: number;
  name: string;
  homestayImage: { image: string; type: string }[];
}

/*
 * คำอธิบาย : Component สำหรับหน้า "รายละเอียดที่พักโฮมสเตย์ของผู้ใช้ทั่วไป (Tourist)"
 * แสดงรายละเอียดที่พักโฮมสเตย์ รวมถึงที่พักอื่น ๆ ในชุมชนเดียวกัน
 * มีการจัดการสถานะการโหลดข้อมูลและการแสดงผลข้อมูลต่าง ๆ
 */
export default function DetailHomestayTourist() {
  const { communityId, homestayId } = useParams<{ communityId: string; homestayId: string }>();
  const [homestay, setHomestay] = useState<HomestayDetail | null>(null);
  const [otherHomestays, setOtherHomestays] = useState<OtherHomestay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalOtherHomestays, setTotalOtherHomestays] = useState(0);
  const limit = 12;

  /*
   * คำอธิบาย : สำหรับเลื่อนหน้าจอไปด้านบนเมื่อมีการเปลี่ยนแปลง homestayId หรือ communityId
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [homestayId, communityId]);

  /*
   * คำอธิบาย : สำหรับดึงข้อมูลรายละเอียดที่พักและที่พักอื่นๆในชุมชน
   * เมื่อ component ถูก mount หรือเมื่อ homestayId, communityId, page เปลี่ยนแปลง
   */
  useEffect(() => {
    const loadData = async () => {
      if (!homestayId || !communityId) return;
      try {
        setIsLoading(true);

        const data = await getHomestayDetailAndOtherHomestay(
          Number(communityId),
          Number(homestayId),
          page,
          limit,
        );

        if (data && data.homestay) {
          const fullHomestay: HomestayDetail = {
            ...data.homestay,
            community: data.community,
            location: data.location,
          };
          setHomestay(fullHomestay);
        }

        if (data && data.otherHomestays) {
          if (Array.isArray(data.otherHomestays)) {
            setOtherHomestays(data.otherHomestays);
            setTotalOtherHomestays(data.otherHomestays.length);
          } else {
            setOtherHomestays(data.otherHomestays.data || []);
            setTotalOtherHomestays(data.otherHomestays.pagination?.totalCount || 0);
          }
        }
      } catch (error) {
        console.error("Error loading homestay data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [homestayId, communityId, page]);

  if (isLoading && !homestay)
    return <div className="p-10 text-center min-h-screen content-center">กำลังโหลดข้อมูล...</div>;
  if (!homestay)
    return <div className="p-10 text-center min-h-screen content-center">ไม่พบข้อมูลที่พัก</div>;

  const images = homestay.homestayImage || [];
  const sortedImages = [...images].sort((imageA) => (imageA.type === "COVER" ? -1 : 1));

  const galleryItems: MediaItem[] = sortedImages.map((img) => ({
    type: "image",
    src: resolveBackendUploadUrl(img.image) ?? "https://placehold.co/600x400?text=No+Image",
    alt: homestay.name,
  }));

  if (galleryItems.length === 0) {
    galleryItems.push({
      type: "image",
      src: "https://placehold.co/600x400?text=No+Image",
      alt: "No Image",
    });
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-prompt">
      <NavbarTourist />
      <div className="container mx-auto py-2">
        <BreadcrumbNavigation
          current={{
            label: homestay.name,
            to: `/tourist/community/${communityId}/detail/homestay/${homestayId}`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl pb-2 mt-6">
        <h1 className="text-xl font-bold text-black mb-6">{homestay.name}</h1>
        {homestay.tagHomestays && homestay.tagHomestays.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {homestay.tagHomestays.map((tag, index) => (
              <Tag
                key={index}
                label={tag.tag.name}
                className="border-gray-200 bg-white text-gray-600 px-4 py-1"
              />
            ))}
          </div>
        )}
        <div className="mb-12 text-base text-gray-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="font-bold min-w-[180px]">ประเภทที่พัก :</span>
            <span>{homestay.type || "โฮมสเตย์"}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="font-bold min-w-[180px]">สิ่งอำนวยความสะดวก :</span>
            <div className="flex-1">
              {homestay.facility ? (
                <div className="flex flex-col gap-1">
                  {homestay.facility.split(",").map((facility, index) => (
                    <div key={index} className="text-gray-700">
                      {facility.trim()}
                    </div>
                  ))}
                </div>
              ) : (
                "-"
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="font-bold min-w-[180px]">ที่อยู่ :</span>
            <span className="font-medium">
              {homestay.location.houseNumber}{" "}
              {homestay.location.villageNumber ? `หมู่ ${homestay.location.villageNumber}` : ""} ต.
              {homestay.location.subDistrict} อ.{homestay.location.district} จ.
              {homestay.location.province} {homestay.location.postalCode}
            </span>
          </div>

          <button
            onClick={() => {
              if (homestay?.location?.latitude && homestay?.location?.longitude) {
                const destLat = homestay.location.latitude;
                const destLng = homestay.location.longitude;
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const originLat = position.coords.latitude;
                      const originLng = position.coords.longitude;
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`,
                        "_blank",
                      );
                    },
                    (error) => {
                      console.error("Error getting location:", error);
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`,
                        "_blank",
                      );
                    },
                  );
                } else {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`,
                    "_blank",
                  );
                }
              }
            }}
            className="flex items-start mt-2 hover:text-[#00BF6A] transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
          >
            <Icon
              icon="mdi:map-marker-radius-outline"
              className="w-5 h-5 text-black mr-2 mt-0.5 flex-shrink-0"
            />
            <span className="font-medium">ระบบนำทาง</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start gap-2 mt-4">
            <span className="font-bold min-w-[180px]">คำอธิบายที่อยู่ :</span>
            <span className="whitespace-pre-line">
              {homestay.location.detail ||
                "ที่พักตรงข้ามร้านค้าอย่างสุขภาพดี และห่างจากไร้ปันสุข 200 เมตร"}
            </span>
          </div>
        </div>

        <div className="mb-16">
          <Thumbnails items={galleryItems} className="!max-w-6xl" />
        </div>

        <div className="h-px bg-gray-200 w-full mb-10 text-[#00BF6A]"></div>

        {otherHomestays.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-black mb-8">ที่พักอื่นของชุมชน</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {otherHomestays.map((item) => {
                const cover =
                  item.homestayImage?.find((img: any) => img.type === "COVER") ||
                  item.homestayImage?.[0];
                const imgUrl = resolveBackendUploadUrl(cover?.image);

                return (
                  <LocalServiceCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    imageUrl={imgUrl}
                    to={`/tourist/community/${communityId}/detail/homestay/${item.id}`}
                    onClick={() => setPage(1)}
                  />
                );
              })}
            </div>

            <div className="flex justify-end mt-6">
              <Pagination
                totalData={totalOtherHomestays}
                onQueryChange={({ page }) => setPage(page)}
              />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
