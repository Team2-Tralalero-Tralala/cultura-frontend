/**
 * คำอธิบาย: Component สำหรับแสดงรายละเอียดร้านค้า (Admin)
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

interface Community {
  id: number;
  name: string;
}

interface Store {
  id: number;
  name: string;
  detail: string;
  tags: string[];
  images: string[];
  community?: Community;
  location?: {
    address: string;
    detail: string;
    latitude: number;
    longitude: number;
  };
}

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * คำอธิบาย: สร้าง URL สำหรับรูปภาพจาก Backend
 * Input: imagePath (path ของรูปภาพ)
 * Output: URL ของรูปภาพ
 */
const buildImageUrl = (imagePath?: string): string => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;

  const backend = apiUrl.replace("/api", "");
  const cleanPath = imagePath.replace(/^\/+/, "");
  return `${backend}/${cleanPath}`;
};

/**
 * คำอธิบาย: Component หน้าแสดงรายละเอียดร้านค้า
 */
export default function DetailStorePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * คำอธิบาย: ดึงข้อมูลรายละเอียดร้านค้า
   * Input: - (ใช้ id จาก URL params)
   * Output: - (อัปเดต state store)
   */
  const fetchStore = async () => {
    if (!id) {
      console.error("ID is undefined");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/admin/store/${id}`, { credentials: "include" });
      const result = await res.json();

      if (result?.data) {
        const data = result.data;

        const images = data.storeImage?.map((img: any) => buildImageUrl(img.image)) || [
          buildImageUrl("uploads/store-main.jpg"),
        ];

        const formatted: Store = {
          id: data.id,
          name: data.name ?? "-",
          detail: data.detail ?? "-",
          tags: data.tagStores?.map((t: any) => t.tag?.name) || [],
          images,
          community: data.community
            ? {
                id: data.community.id,
                name: data.community.name,
              }
            : undefined,
          location: data.location
            ? {
                address: [
                  data.location.houseNumber,
                  data.location.villageNumber ? `หมู่ ${data.location.villageNumber}` : null,
                  data.location.alley ? `ซอย ${data.location.alley}` : null,
                  data.location.subDistrict,
                  data.location.district,
                  data.location.province,
                  data.location.postalCode,
                ]
                  .filter(Boolean)
                  .join(" "),
                detail: data.location.detail ?? "-",
                latitude: data.location.latitude ?? 0,
                longitude: data.location.longitude ?? 0,
              }
            : undefined,
        };

        setStore(formatted);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * คำอธิบาย: โหลดข้อมูลเมื่อ Component mount
   */
  useEffect(() => {
    fetchStore();
  }, [id]);

  if (isLoading) return <div className="p-6 text-gray-600">กำลังโหลดข้อมูล...</div>;
  if (!store) return <div className="p-6 text-red-500">ไม่พบข้อมูลร้านค้า</div>;

  const coverImage = store.images[0];

  /**
   * คำอธิบาย: นำทางไปหน้าแก้ไขร้านค้า
   */
  const handleEditClick = () => {
    navigate(`/admin/community/store/${id}/edit`);
  };

  /**
   * คำอธิบาย: นำทางกลับหน้ารายการร้านค้า
   */
  const handleBackClick = () => {
    navigate("/admin/community/stores");
  };

  return (
    <div className="font-sarabun bg-[#F0F0F0] min-h-screen">
      <Breadcrumb
        current={{
          label: store.name ?? "ร้านค้า",
          to: `/admin/community/stores/${store.id}`,
        }}
      />

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div
            className="mt-1 mr-3 cursor-pointer flex items-center gap-2"
            onClick={handleBackClick}
          >
            <ArrowLeft className="w-5 h-5" />
            <h1 className="text-[20px] font-bold">รายละเอียดร้านค้า</h1>
          </div>

          <button
            onClick={handleEditClick}
            className="flex items-center bg-[#055035] text-white px-4 py-2 rounded-lg hover:bg-green-900 transition"
          >
            <Edit size={18} className="mr-2" />
            แก้ไข
          </button>
        </div>

        {/* รูป + รายละเอียด */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coverImage && (
            <img
              src={coverImage}
              className="w-full h-[300px] object-cover rounded-lg border-2 border-gray-400"
            />
          )}

          <div>
            <h2 className="text-[20px] font-bold mt-2 mb-2">ข้อมูลร้านค้า</h2>

            <p className="text-[16px] mb-2">
              <span className="font-bold">ชื่อร้านค้า:</span> {store.name}
            </p>

            <p className="text-[16px] mb-2">
              <span className="font-bold">รายละเอียด:</span> {store.detail}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="font-bold text-[16px]">แท็ก:</span>
              {store.tags.length > 0 ? (
                store.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-white text-black px-3 py-1 rounded-lg text-[14px] border"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">ไม่มีแท็ก</span>
              )}
            </div>
          </div>
        </div>

        {/* รูปภาพเพิ่มเติม */}
        {store.images.length > 1 && (
          <div className="mt-6">
            <h2 className="text-[20px] font-bold mb-3">รูปภาพเพิ่มเติม</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {store.images.slice(1).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="w-full h-[150px] object-cover rounded-lg border"
                />
              ))}
            </div>
          </div>
        )}

        {/* แผนที่ */}
        <h2 className="text-[20px] font-bold mt-10 mb-3">แผนที่</h2>

        {store.location ? (
          <>
            <div className="w-full h-[300px] rounded-xl overflow-hidden mb-4">
              <iframe
                title="store-map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  store.location.longitude - 0.005
                },${store.location.latitude - 0.005},${store.location.longitude + 0.005},${
                  store.location.latitude + 0.005
                }&layer=mapnik&marker=${store.location.latitude},${store.location.longitude}`}
                className="w-full h-full border-0"
              ></iframe>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-gray-700 mb-6 mt-4">
              <div>
                <p>
                  <strong>ที่อยู่:</strong> {store.location.address}
                </p>
                <p>
                  <strong>พิกัด:</strong> {store.location.latitude}, {store.location.longitude}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${store.location.latitude},${store.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  เปิดใน Google Maps
                </a>
              </div>

              <div>
                <p>
                  <strong>รายละเอียดที่อยู่:</strong> {store.location.detail}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">ไม่มีข้อมูลตำแหน่งร้านค้า</p>
        )}
      </div>
    </div>
  );
}
