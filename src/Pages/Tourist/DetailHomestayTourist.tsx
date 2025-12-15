
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Tag } from "@/Components/Tag";
import { getHomestayDetailAndOtherHomestay, fetchHomestayDetail } from "@/Services/homestay-services";
import type { HomestayDetail } from "@/Types/HomestayDetail";
import { MapPin, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Helper for image URL
const resolveBackendUploadUrl = (path?: string) => {
  if (!path) return "https://placehold.co/600x400?text=No+Image";
  if (path.startsWith("http")) return path;
  return path;
};

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
  // Gallery state
  const [mainImage, setMainImage] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!homestayId || !communityId) return;
      try {
        setLoading(true);
        const hId = Number(homestayId);
        const cId = Number(communityId);

        // Fetch data using the shared public endpoint
        const data = await getHomestayDetailAndOtherHomestay(cId, hId);

        if (data && data.homestay) {
          // Reconstruct the full HomestayDetail object
          // The backend splits homestay, community, and location at the top level of the response
          const fullHomestay: HomestayDetail = {
            ...data.homestay,
            community: data.community,
            location: data.location,
          };
          setHomestay(fullHomestay);

          // Set initial main image
          const cover = fullHomestay.homestayImage?.find((i: any) => i.type === "COVER") || fullHomestay.homestayImage?.[0];
          if (cover) setMainImage(resolveBackendUploadUrl(cover.image));
        }

        if (data && data.otherHomestays && data.otherHomestays.data) {
          setOtherHomestays(data.otherHomestays.data);
        } else if (Array.isArray(data.otherHomestays)) {
          setOtherHomestays(data.otherHomestays);
        }
      } catch (error) {
        console.error("Error loading homestay data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [homestayId, communityId]);

  if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;
  if (!homestay) return <div className="p-10 text-center">ไม่พบข้อมูลที่พัก</div>;

  const images = homestay.homestayImage || [];
  const galleryImages = images.filter(img => img.type === 'GALLERY');
  // If we have a cover, put it first, then gallery?
  // Strategy: All images in one list for selection.
  const allImages = images.sort((a, b) => (a.type === 'COVER' ? -1 : 1));

  // Handlers for "Other places" scrolling?
  // Simple grid for now.

  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4 text-sm text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-[#055035]">หน้าแรก</Link>
        <span>&gt;</span>
        <span>(ผลการค้นหา)</span>
        <span>&gt;</span>
        <span>รายละเอียดชุมชน</span>
        <span>&gt;</span>
        <span className="text-[#055035] font-medium">รายละเอียดที่พัก</span>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Title */}
        <h1 className="text-3xl font-bold text-[#055035] mb-4">{homestay.name}</h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {homestay.tagHomestays?.map((t, i) => (
            <span key={i} className="px-3 py-1 rounded-full border border-gray-300 text-sm text-gray-600">
              {t.tag.name}
            </span>
          ))}
          {!homestay.tagHomestays?.length && <span className="text-gray-400">-</span>}
        </div>

        {/* Details Section */}
        <div className="mb-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-8">
            <div className="space-y-4 text-gray-700">
              <div className="flex">
                <span className="font-bold min-w-[150px]">ประเภทที่พัก :</span>
                <span>{homestay.type || "โฮมสเตย์"}</span>
              </div>
              <div className="flex">
                <span className="font-bold min-w-[150px]">สิ่งอำนวยความสะดวก :</span>
                <div className="flex-1">
                  {homestay.facility ? (
                    <ul className="list-inside grid grid-cols-2 gap-x-4 gap-y-1">
                      {homestay.facility.split(",").map((f, idx) => (
                        <li key={idx} className="list-disc">{f.trim()}</li>
                      ))}
                    </ul>
                  ) : "-"}
                </div>
              </div>

              {/* Address block with Icon */}
              <div className="flex items-start mt-4">
                <MapPin className="w-5 h-5 text-black mr-2 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    {homestay.location.houseNumber} {homestay.location.villageNumber ? `หมู่ ${homestay.location.villageNumber}` : ''} {homestay.location.district} จ.{homestay.location.province} {homestay.location.postalCode}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <p className="font-bold mb-1">คำอธิบายที่อยู่ :</p>
                <p>{homestay.location.detail || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-16">
          {/* Main Image */}
          <div className="w-full h-[500px] mb-4 overflow-hidden rounded-xl bg-gray-100 cursor-pointer" onClick={() => setPreviewImage(mainImage)}>
            {mainImage ? (
              <img src={mainImage} className="w-full h-full object-cover" alt="Main" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-4">
            {allImages.slice(0, 4).map((img, i) => {
              const url = resolveBackendUploadUrl(img.image);
              return (
                <div key={i} className="h-[120px] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition"
                  onClick={() => setMainImage(url)}>
                  <img src={url} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Other Places (Items of community) */}
        {otherHomestays.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-black mb-6 border-b pb-2">ที่พักอื่นของชุมชน</h2>
            <div className="grid grid-cols-1 sc-sm:grid-cols-2 md:grid-cols-4 gap-6">
              {otherHomestays.map((item) => {
                const cover = item.homestayImage?.find((img: any) => img.type === 'COVER') || item.homestayImage?.[0];
                const imgUrl = resolveBackendUploadUrl(cover?.image);
                return (
                  <Link to={`/homestay/${item.id}`} key={item.id} className="group block">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                      <div className="aspect-[4/3] bg-gray-200 overflow-hidden">
                        <img src={imgUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#055035] transition">{item.name}</h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-4 -right-4 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold"
            >
              ✕
            </button>
            <img
              src={previewImage}
              alt="preview"
              className="max-w-full max-h-[90vh] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}