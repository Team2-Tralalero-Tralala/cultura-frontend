/**
 * Component: StoreDetailPage (Admin)
 * Description: หน้าสำหรับดูรายละเอียดร้านค้าตาม ID (Read-only)
 * ใช้โดยแอดมินเพื่อดูข้อมูลร้านค้า เช่น ชื่อร้าน รายละเอียด รูปภาพ แท็ก และตำแหน่งแผนที่
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import Breadcrumb from "../../Components/BreadcrumbNavigation";

/**
 * Interface: Community
 * อธิบายข้อมูลชุมชนที่ร้านค้าสังกัดอยู่
 */
interface Community {
  id: number;
  name: string;
}

/**
 * Interface: Store
 * โครงสร้างข้อมูลร้านค้าที่ผ่านการจัดรูปแบบก่อนนำไปแสดง
 */
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

const StoreDetailPage = () => {
  /** รับ ID ร้านค้าจาก URL */
  const { id } = useParams<{ id: string }>();  

  /** ตัวช่วยในการนำทางไปหน้าอื่น */
  const navigate = useNavigate();

  /** state: ข้อมูลร้านค้าที่นำมาแสดง */
  const [store, setStore] = useState<Store | null>(null);

  /** state: โหลดข้อมูลหรือไม่ */
  const [loading, setLoading] = useState(true);

  /**
   * Function: fetchStore
   * วัตถุประสงค์: ดึงข้อมูลร้านค้าจาก API และแปลงให้อยู่ในรูปแบบที่ UI ใช้
   */
  const fetchStore = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/stores/${id}`, {
        credentials: "include",
      });
      const result = await res.json();

      if (result?.data) {
        const data = result.data;
        const backendUrl = "http://localhost:3000/uploads";

        /** จัดการรูปภาพ ถ้าไม่มี → ใช้รูป default */
        const images: string[] =
          data.storeImage?.map((img: any) =>
            img.image
              ? img.image.startsWith("http")
                ? img.image
                : `${backendUrl}/${img.image}`
              : `${backendUrl}/store-main.jpg`
          ) || [`${backendUrl}/store-main.jpg`];

        /** จัดรูปแบบข้อมูลร้านค้าให้อยู่ในรูปแบบที่ UI ใช้ */
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
      setLoading(false);
    }
  };

  /**
   * Effect: เรียก fetchStore เมื่อเปิดหน้า หรือเมื่อ id เปลี่ยน
   */
  useEffect(() => {
    fetchStore();
  }, [id]);

  /** Loading state */
  if (loading) return <div className="p-6 text-gray-600">กำลังโหลดข้อมูล...</div>;

  /** ถ้าหาไม่เจอ */
  if (!store) return <div className="p-6 text-red-500">ไม่พบข้อมูลร้านค้า</div>;

  /** เลือกรูปแรกเป็นรูปหลัก */
  const coverImage = store.images[0];

  /**
   * Function: handleEditClick
   * วัตถุประสงค์: นำทางไปหน้าแก้ไขร้านค้า
   */
  const handleEditClick = () => {
    if (!id) return;
    navigate(`/admin/community/store/${id}/edit/`);
  };

  return (
    <div className="font-sarabun bg-[#F0F0F0] min-h-screen">

      

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        current={{
          label: store.name ?? "ไม่พบชื่อชุมชน",
          to: `/admin/stores/${store.id}`,
        }}
      />
 
      {/* Main Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Header + ปุ่มแก้ไข */}
        <div className="flex justify-between items-start mb-3">
         {/* Back Button Section */}
          <div className="mt-1 mr-3 cursor-pointer flex items-center gap-2" onClick={() => navigate("/admin/community/stores")}>
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

        {/* Section: รูปปก + ข้อมูลร้าน */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coverImage && (
            <div className="mb-6">
              <img
                src={coverImage}
                alt={store.name}
                className="w-full h-[300px] object-cover rounded-lg border-2 border-gray-400"
              />
            </div>
          )}

          {/* ข้อมูลร้านค้า */}
          <div>
            <h2 className="text-[20px] font-bold mt-2 mb-2">ข้อมูลร้านค้า</h2>

            <p className="text-[16px] mb-2">
              <span className="font-bold">ชื่อร้านค้า :</span> {store.name}
            </p>

            <p className="text-[16px] mb-2 leading-relaxed">
              <span className="font-bold">รายละเอียดร้านค้า :</span> {store.detail}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="font-bold text-[16px]">แท็ก :</span>
              {store.tags.length > 0 ? (
                store.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-white text-black px-3 py-1 rounded-lg text-[14px] border border-gray-300"
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

        {/* Section: รูปภาพเพิ่มเติม */}
        {store.images.length > 1 && (
          <div className="mt-6">
            <h2 className="text-[20px] font-bold mb-3">รูปภาพเพิ่มเติม</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {store.images.slice(1).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`store-img-${i + 1}`}
                  className="w-full h-[150px] object-cover rounded-lg border-2 border-gray-400"
                />
              ))}
            </div>
          </div>
        )}

        {/* Section: แผนที่ร้านค้า */}
        <h2 className="text-[20px] font-bold mt-10 mb-3">แผนที่</h2>

        {store.location ? (
          <>
            {/* แผนที่ OSM */}
            <div className="w-full h-[300px] rounded-xl overflow-hidden mb-4">
              <iframe
                title="store-map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${store.location.longitude - 0.005},${store.location.latitude - 0.005},${store.location.longitude + 0.005},${store.location.latitude + 0.005}&layer=mapnik&marker=${store.location.latitude},${store.location.longitude}`}
                className="w-full h-full border-0"
                loading="lazy"
              ></iframe>
            </div>

            {/* ข้อมูลตำแหน่ง */}
            <div className="grid md:grid-cols-2 gap-6 text-gray-700 mb-6 mt-4">
              <div className="mt-6">
                <p className="mb-2">
                  <strong>ที่อยู่ :</strong> {store.location.address}
                </p>
                <p className="mb-2">
                  <strong>ละติจูด / ลองจิจูด :</strong> {store.location.latitude}, {store.location.longitude}
                </p>
                <p className="mb-2">
                  <strong>OpenStreetMap URL :</strong>{" "}
                  <a
                    href={`https://www.google.com/maps?q=${store.location.latitude},${store.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {`https://www.google.com/maps?q=${store.location.latitude},${store.location.longitude}`}
                  </a>
                </p>
              </div>

              <div className="mt-6">
                <p className="mb-2">
                  <strong>คำอธิบายที่อยู่ :</strong> {store.location.detail}
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
};

export default StoreDetailPage;
