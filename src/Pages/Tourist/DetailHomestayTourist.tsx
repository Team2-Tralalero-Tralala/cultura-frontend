/*
 * คำอธิบาย : Component สำหรับแสดงรายละเอียดที่พักโฮมสเตย์ของผู้ใช้ทั่วไป (Tourist)
 * แสดงรายละเอียดต่าง ๆ เช่น ชื่อที่พัก, ประเภท, สิ่งอำนวยความสะดวก, ที่อยู่, คำอธิบาย, แกลเลอรีรูปภาพ
 * รวมถึงแสดงที่พักอื่น ๆ ในชุมชนเดียวกัน พร้อมระบบ Pagination
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getHomestayDetailAndOtherHomestay } from "@/Services/homestay-services";
import type { HomestayDetail } from "@/Types/HomestayDetail";
import NavbarTourist from "@/Components/NavbarTourist";
import Footer from "@/Components/Footer";
import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import { Tag } from "@/Components/Tag";
import { Icon } from "@iconify/react";
import Thumbnails, { type MediaItem } from "@/Components/Thumbnails";
import Pagination from "@/Components/Pagination/PaginationRoundedForCardPackage";

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

export default function DetailHomestayTourist() {
  const { communityId, homestayId } = useParams<{ communityId: string; homestayId: string }>();

  const [homestay, setHomestay] = useState<HomestayDetail | null>(null);
  const [otherHomestays, setOtherHomestays] = useState<OtherHomestay[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalOtherHomestays, setTotalOtherHomestays] = useState(0);
  const LIMIT = 12;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [homestayId, communityId]);

  useEffect(() => {
    const loadData = async () => {
      if (!homestayId || !communityId) return;
      try {
        setLoading(true);
        const hId = Number(homestayId);
        const cId = Number(communityId);

        const data = await getHomestayDetailAndOtherHomestay(cId, hId, page, LIMIT);

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
        setLoading(false);
      }
    };
    loadData();
  }, [homestayId, communityId, page]); 

  if (loading && !homestay) return <div className="p-10 text-center min-h-screen content-center">กำลังโหลดข้อมูล...</div>;
  if (!homestay) return <div className="p-10 text-center min-h-screen content-center">ไม่พบข้อมูลที่พัก</div>;

  const images = homestay.homestayImage || [];
  const sortedImages = [...images].sort((a, b) => (a.type === 'COVER' ? -1 : 1));

  const galleryItems: MediaItem[] = sortedImages.map(img => ({
    type: 'image',
    src: resolveBackendUploadUrl(img.image) ?? "https://placehold.co/600x400?text=No+Image",
    alt: homestay.name
  }));

  if (galleryItems.length === 0) {
    galleryItems.push({
      type: 'image',
      src: "https://placehold.co/600x400?text=No+Image",
      alt: "No Image"
    });
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-prompt">
      <NavbarTourist />

      {/* Breadcrumb Section */}
      <div className="container mx-auto py-2">
        <BreadcrumbNavigation
          current={{
            label: homestay.name,
            to: `/tourist/community/${communityId}/detail/homestay/${homestayId}`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl pb-2 mt-6">
        {/* Title */}
        <h1 className="text-xl font-bold text-black mb-6">{homestay.name}</h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-3 mb-8">
          {homestay.tagHomestays?.map((t, i) => (
            <Tag
              key={i}
              label={t.tag.name}
              className="border-gray-200 bg-white text-gray-600 px-4 py-1"
            />
          ))}
        </div>

        {/* Info Section */}
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
                  {homestay.facility.split(",").map((f, idx) => (
                    <div key={idx} className="text-gray-700">
                      {f.trim()}
                    </div>
                  ))}
                </div>
              ) : "-"}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start mt-4 pt-2">
            <Icon icon="mdi:location" className="w-5 h-5 text-black mr-2 mt-0.5 flex-shrink-0" />
            <span className="font-medium">
              {homestay.location.houseNumber} {homestay.location.villageNumber ? `หมู่ ${homestay.location.villageNumber}` : ''} {homestay.location.subDistrict} {homestay.location.district} จ.{homestay.location.province} {homestay.location.postalCode}
            </span>
          </div>

          {/* Description */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 mt-4">
            <span className="font-bold min-w-[180px]">คำอธิบายที่อยู่ :</span>
            <span className="whitespace-pre-line">{homestay.location.detail || "ที่พักตรงข้ามร้านค้าอย่างสุขภาพดี และห่างจากไร้ปันสุข 200 เมตร"}</span>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-16">
          <Thumbnails items={galleryItems} className="!max-w-6xl" />
        </div>

        {/* Line Separator */}
        <div className="h-px bg-gray-200 w-full mb-10 text-[#00BF6A]"></div>

        {/* Other Homestays Section */}
        {otherHomestays.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-black mb-8">ที่พักอื่นของชุมชน</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {otherHomestays.map((item) => {
                const cover = item.homestayImage?.find((img: any) => img.type === 'COVER') || item.homestayImage?.[0];
                const imgUrl = resolveBackendUploadUrl(cover?.image);

                return (
                  <Link
                    to={`/tourist/community/${communityId}/detail/homestay/${item.id}`}
                    key={item.id}
                    className="group block"
                    onClick={() => {
                        setPage(1);
                    }}
                  >
                    <div className="bg-white overflow-hidden rounded-lg transition-all duration-300">
                      <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative rounded-lg border border-gray-200">
                        <img
                          src={imgUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <h3 className="font-bold text-black text-base group-hover:text-[#055035] transition">{item.name}</h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
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