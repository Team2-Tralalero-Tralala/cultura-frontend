import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronRight, Edit } from "lucide-react";

interface Store {
  id: number;
  name: string;
  detail: string;
  tags: string[];
  images: string[];
  location?: {
    address: string;
    detail: string;
    latitude: number;
    longitude: number;
  };
}

const StoreDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStore = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/stores/${id}`, {
        credentials: "include",
      });
      const result = await res.json();

      if (result?.data) {
        const data = result.data;
        const backendUrl = "http://localhost:3000/uploads"; // URL ของ static folder

        // แปลง path ของรูปให้เป็น URL เต็ม พร้อม fallback
        const images: string[] =
          data.storeImage?.map((img: any) =>
            img.image
              ? img.image.startsWith("http")
                ? img.image
                : `${backendUrl}/${img.image}`
              : `${backendUrl}/store-main.jpg`
          ) || [`${backendUrl}/store-main.jpg`];

        const formatted: Store = {
          id: data.id,
          name: data.name ?? "-",
          detail: data.detail ?? "-",
          tags: data.tagStores?.map((t: any) => t.tag?.name) || [],
          images,
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

  useEffect(() => {
    if (id) fetchStore();
  }, [id]);

  if (loading) return <div className="p-6 text-gray-600">กำลังโหลดข้อมูล...</div>;
  if (!store) return <div className="p-6 text-red-500">ไม่พบข้อมูลร้านค้า</div>;

  const coverImage = store.images[0];

  return (
    <div className="font-sarabun bg-[#F0F0F0] min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center text-[14px] text-black mb-4 font-medium">
        <span>จัดการชุมชน</span>
        <ChevronRight size={18} className="mx-1" />
        <span>ชุมชนแสนสุข</span>
        <ChevronRight size={18} className="mx-1" />
        <span>จัดการร้านค้า</span>
        <ChevronRight size={18} className="mx-1" />
        <span className="text-[#494949]">{store.name}</span>
      </div>

      {/* Main Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[20px] font-medium">รายละเอียดร้านค้า</h1>
          <button className="flex items-center bg-[#055035] text-white px-4 py-2 rounded-lg hover:bg-green-900 transition">
            <Edit size={18} className="mr-2" />
            แก้ไข
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Cover Image */}
          {coverImage && (
            <div className="mb-6">
              <img
                src={coverImage}
                alt={store.name}
                className="w-full h-[300px] object-cover rounded-lg border-2 border-gray-400"
              />
            </div>
          )}

          {/* Right: Store Info */}
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

        {/* Additional Images */}
        {store.images.length > 1 && (
          <div className="mt-6">
            <h2 className="text-[18px] font-semibold mb-3">รูปภาพเพิ่มเติม</h2>
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
        <h2 className="text-[18px] font-semibold mt-10 mb-3">แผนที่</h2>
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