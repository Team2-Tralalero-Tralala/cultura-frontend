/**
 * คำอธิบาย: Component สำหรับแสดงสื่อของแพ็กเกจ (รูปภาพ/วิดีโอ) ในรูปแบบแกลเลอรี
 */

import { useEffect, useMemo, useState } from "react";

const apiBaseUrl = import.meta.env.VITE_API_URL;
const baseUrl = new URL(apiBaseUrl).origin;

type MediaType = "COVER" | "GALLERY" | "VIDEO";

interface PackageMedia {
  id: number;
  path: string;
  type: MediaType;
}

interface PackageDetailData {
  files: PackageMedia[];
}

/**
 * คำอธิบาย: แปลง path ของไฟล์ให้เป็น URL ที่เรียกดูได้ในเบราว์เซอร์
 * Input: rawPath (string)
 * Output: URL ที่สมบูรณ์ (string)
 */
const buildFileUrl = (rawPath?: string): string => {
  if (!rawPath) return "";

  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath;
  }

  const cleanPath = rawPath.replace(/^\/+/, "");
  return `${baseUrl}/${cleanPath}`;
};

/**
 * คำอธิบาย: Component สำหรับแสดงสื่อของแพ็กเกจ (ภาพ / วิดีโอ)
 * Input: packageDetail
 * Output: JSX Element
 */
export default function DetailPackageGallery({
  packageDetail,
}: {
  packageDetail: PackageDetailData;
}) {
  const [activeMediaItem, setActiveMediaItem] = useState<PackageMedia | null>(null);

  const sortedMediaFiles = useMemo(() => {
    const mediaFiles = (packageDetail.files || []).filter(
      (mediaItem) => !!mediaItem.path && mediaItem.path.trim() !== "",
    );

    const videoMediaFiles = mediaFiles.filter((fileItem) => fileItem.type === "VIDEO");
    const coverMediaFiles = mediaFiles.filter((fileItem) => fileItem.type === "COVER");
    const galleryMediaFiles = mediaFiles.filter((fileItem) => fileItem.type === "GALLERY");

    return [...videoMediaFiles, ...coverMediaFiles, ...galleryMediaFiles];
  }, [packageDetail.files]);

  useEffect(() => {
    const mediaFiles = (packageDetail.files || []).filter(
      (mediaItem) => !!mediaItem.path && mediaItem.path.trim() !== "",
    );

    const coverMedia = mediaFiles.find((fileItem) => fileItem.type === "COVER");
    const videoMedia = mediaFiles.find((fileItem) => fileItem.type === "VIDEO");
    const galleryMedia = mediaFiles.find((fileItem) => fileItem.type === "GALLERY");

    setActiveMediaItem(coverMedia || videoMedia || galleryMedia || null);
  }, [packageDetail.files]);

  const buildMediaUrl = (media?: PackageMedia | null): string =>
    media ? buildFileUrl(media.path) : "";

  const activeMediaUrl = buildMediaUrl(activeMediaItem);

  return (
    <div className="space-y-4">
      <div className="w-full">
        {activeMediaItem && activeMediaUrl ? (
          activeMediaItem.type === "VIDEO" ? (
            <video
              src={activeMediaUrl}
              controls
              className="w-full h-[400px] object-cover rounded-xl shadow mb-2 bg-black"
            />
          ) : (
            <img
              src={activeMediaUrl}
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

      {sortedMediaFiles.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-full">
            {sortedMediaFiles.map((mediaItem) => {
              const mediaUrl = buildMediaUrl(mediaItem);
              if (!mediaUrl) return null;

              const isActive = activeMediaItem?.id === mediaItem.id;

              return (
                <button
                  key={mediaItem.id}
                  type="button"
                  onClick={() => setActiveMediaItem(mediaItem)}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    isActive ? "border-emerald-600" : "border-gray-200"
                  }`}
                >
                  {mediaItem.type === "VIDEO" ? (
                    <div className="relative w-[120px] h-[80px]">
                      <video
                        src={mediaUrl}
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                          <span className="ml-1 border-l-8 border-y-[8px] border-y-transparent border-l-emerald-600" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={mediaItem.type}
                      className="w-[120px] h-[80px] object-cover"
                    />
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
