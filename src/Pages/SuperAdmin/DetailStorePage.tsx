/**
 * คำอธิบาย : Component สำหรับเเสดงรายละเอียดร้านค้าของ Super Admin
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Edit, ArrowLeft } from "lucide-react";
import Breadcrumb from "../../Components/BreadcrumbNavigation";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BACKEND_BASE_URL = API_URL.replace(/\/api$/, "");

/*
 * คำอธิบาย : ฟังก์ชันสำหรับจัดรูปแบบ path ของรูปภาพจาก backend ให้เป็น URL ที่ถูกต้องและสามารถนำไปแสดงผลได้
 * Input : path ของรูปภาพจาก backend
 * Output : URL ของรูปภาพที่พร้อมใช้งาน
 */
const buildImageUrl = (imagePath?: string): string => {
  if (!imagePath) return "";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const cleanPath = imagePath.replace(/^\/+/, "");

  return `${BACKEND_BASE_URL}/${cleanPath}`;
};

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

/*
 * คำอธิบาย : Component สำหรับแสดงรายละเอียดร้านค้า สำหรับผู้ใช้งานบทบาท Super Admin
 * Input : รหัสร้านค้าจาก URL parameter
 * Output : แสดงข้อมูลรายละเอียดร้านค้า รูปภาพ แท็ก และตำแหน่งที่ตั้ง
 */
const StoreDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลรายละเอียดร้านค้าจาก backend
   * Input : ไม่มี (ใช้รหัสร้านค้าจาก URL)
   * Output : ตั้งค่าข้อมูลร้านค้าเข้าสู่ state เพื่อแสดงผลบนหน้าจอ
   */
  const fetchStore = async () => {
    try {
      const res = await fetch(`${API_URL}/super/store/${id}`, {
        credentials: "include",
      });

      const result = await res.json();

      if (result?.data) {
        const data = result.data;

        const images: string[] = data.storeImage?.map((img: any) =>
          img.image ? buildImageUrl(img.image) : buildImageUrl("uploads/store-main.jpg"),
        ) || [buildImageUrl("uploads/store-main.jpg")];

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

  /*
   * คำอธิบาย : เรียกใช้งานฟังก์ชันโหลดข้อมูลร้านค้า เมื่อมีการเปิดหน้า หรือเมื่อ id เปลี่ยนแปลง
   * Input : ไม่มี
   * Output : โหลดข้อมูลร้านค้าใหม่
   */
  useEffect(() => {
    fetchStore();
  }, [id]);

  if (loading) return <div className="p-6 text-gray-600">กำลังโหลดข้อมูล...</div>;
  if (!store) return <div className="p-6 text-red-500">ไม่พบข้อมูลร้านค้า</div>;

  const coverImage = store.images[0];

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับนำทางไปยังหน้าแก้ไขข้อมูลร้านค้า
   * Input : ไม่มี
   * Output : เปลี่ยนหน้าไปยังหน้าจอแก้ไขร้านค้า
   */
  const handleEditClick = () => {
    if (!id) return;
    navigate(`/super/community/${store.community?.id}/store/${id}/edit`);
  };

  return (
    <div className="font-sarabun bg-[#F0F0F0] min-h-screen">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        current={{
          label: store.name ?? "ไม่พบชื่อชุมชน",
          to: `/super/stores/${store.id}`,
        }}
      />

      {/* Main Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          {/* Back Button */}
          <div
            className="mt-1 mr-3 cursor-pointer flex items-center gap-2"
            onClick={() => navigate(`/super/community/${store.community?.id}/stores/all`)}
          >
            <ArrowLeft className="w-5 h-5" />
            <h1 className="text-[20px] font-bold">รายละเอียดร้านค้า</h1>
          </div>

          {/* Edit Button */}
          <button
            onClick={handleEditClick}
            className="flex items-center bg-[#055035] text-white px-4 py-2 rounded-lg hover:bg-green-900 transition"
          >
            <Edit size={18} className="mr-2" />
            แก้ไข
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* รูปปก */}
          {coverImage && (
            <div className="mb-6">
              <img
                src={coverImage}
                alt={store.name}
                className="w-full h-[300px] object-cover rounded-lg border-2 border-gray-400"
              />
            </div>
          )}

          {/* ข้อมูลร้าน */}
          <div>
            <h2 className="text-[20px] font-bold mt-2 mb-2">ข้อมูลร้านค้า</h2>

            <p className="text-[16px] mb-2">
              <span className="font-bold">ชื่อร้านค้า :</span> {store.name}
            </p>

            <p className="text-[16px] mb-2 leading-relaxed">
              <span className="font-bold">รายละเอียดร้านค้า :</span> {store.detail}
            </p>

            {/* Tags */}
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

        {/* Additional Images */}
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

        {/* Map */}
        <h2 className="text-[20px] font-bold mt-10 mb-3">แผนที่</h2>

        {store.location ? (
          <>
            <div className="w-full h-[300px] rounded-xl overflow-hidden mb-4">
              <iframe
                title="store-map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${store.location.longitude - 0.005},${store.location.latitude - 0.005},${store.location.longitude + 0.005},${store.location.latitude + 0.005}&layer=mapnik&marker=${store.location.latitude},${store.location.longitude}`}
                className="w-full h-full border-0"
                loading="lazy"
              ></iframe>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-gray-700 mb-6 mt-4">
              <div className="mt-6">
                <p className="mb-2">
                  <strong>ที่อยู่ :</strong> {store.location.address}
                </p>
                <p className="mb-2">
                  <strong>ละติจูด / ลองจิจูด :</strong> {store.location.latitude},{" "}
                  {store.location.longitude}
                </p>
                <p className="mb-2">
                  <strong>Google Maps URL :</strong>{" "}
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
