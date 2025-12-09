import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL; // http://localhost:3000/api
const BASE_URL = new URL(API_BASE_URL).origin; // http://localhost:3000

type MediaType = "COVER" | "GALLERY" | "VIDEO";

interface PackageMedia {
  id: number;
  path: string;
  type: MediaType;
}

interface PackageDetailData {
  // ... field อื่น ๆ ของคุณ
  files: PackageMedia[];
}

function DetailPackageGallery({ packageDetail }: { packageDetail: PackageDetailData }) {
  const [activeMedia, setActiveMedia] = useState<PackageMedia | null>(null);

  // เรียงไฟล์สำหรับ thumbnail
  const sortedMedia = useMemo(() => {
    const files = packageDetail.files || [];

    const videos = files.filter((f) => f.type === "VIDEO");
    const covers = files.filter((f) => f.type === "COVER");
    const galleries = files.filter((f) => f.type === "GALLERY");

    return [...videos, ...covers, ...galleries]; // วิดีโอมาซ้ายสุดก่อน
  }, [packageDetail.files]);

  // เลือก media หลักตอนโหลดครั้งแรก / เปลี่ยน package
  useEffect(() => {
    const files = packageDetail.files || [];

    const cover = files.find((f) => f.type === "COVER");
    const video = files.find((f) => f.type === "VIDEO");
    const gallery = files.find((f) => f.type === "GALLERY");

    setActiveMedia(cover || video || gallery || null);
  }, [packageDetail.files]);

  const buildUrl = (media?: PackageMedia | null) =>
    media ? `${BASE_URL}/uploads${media.path}` : "";

  return (
    <div className="space-y-4">
      {/* ===== รูป/วิดีโอหลัก ===== */}
      <div className="w-full">
        {activeMedia ? (
          activeMedia.type === "VIDEO" ? (
            <video
              src={buildUrl(activeMedia)}
              controls
              className="w-full h-[400px] object-cover rounded-xl shadow mb-2 bg-black"
            />
          ) : (
            <img
              src={buildUrl(activeMedia)}
              alt="package-main"
              className="w-full h-[400px] object-cover rounded-xl shadow mb-2"
            />
          )
        ) : (
          <img
            src="https://placehold.co/800x400?text=No+Image"
            alt="no-image"
            className="w-full h-[400px] object-cover rounded-xl shadow mb-2"
          />
        )}
      </div>

      {/* ===== แถว Thumbnail (เลื่อนแนวนอนได้) ===== */}
      {sortedMedia.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-full">
            {sortedMedia.map((media) => {
              const isActive = activeMedia?.id === media.id;
              const url = buildUrl(media);

              return (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => setActiveMedia(media)}
                  className={`relative flex-shrink-0 border rounded-lg overflow-hidden border-2
                    ${isActive ? "border-emerald-600" : "border-gray-200"}`}
                >
                  {/* ถ้าเป็น VIDEO ให้โชว์พื้นหลังเทา + icon เล่น */}
                  {media.type === "VIDEO" ? (
                    <div className="relative w-[120px] h-[80px]">
                      <video
                        src={url}
                        preload="metadata"
                        className="w-full h-full object-cover rounded"
                      />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                          <span className="ml-1 border-l-8 border-y-[8px] border-y-transparent border-l-emerald-600"></span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img src={url} alt={media.type} className="w-[120px] h-[80px] object-cover" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export default DetailPackageGallery;
