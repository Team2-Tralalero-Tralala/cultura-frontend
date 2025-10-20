import React, { useEffect, useState } from "react";
import { ArrowLeft, SquarePen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/Components/Button";
import type { PackageRequestDetail } from "@/Types/package-request";
import { fetchPackageRequestDetail } from "@/Services/package-request-service";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ===== เพิ่มตัวช่วยต่อ URL รูปจาก backend =====
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const resolveImageUrl = (filePath?: string) => {
  if (!filePath) return undefined;
  // รองรับทั้ง "pkg1.jpg", "uploads/pkg1.jpg", "/uploads/pkg1.jpg"
  const clean = filePath.replace(/^\/?uploads\//, "");
  return `${BACKEND_URL}/uploads/${clean}`;
};

export default function DetailPackageRequriedPage() {
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();
  const [data, setData] = useState<PackageRequestDetail | null>(null);

  useEffect(() => {
    fetchPackageRequestDetail(requestId ?? "").then((res) => setData(res));
  }, [requestId]);

  const fmtDate = (s?: string) =>
    s
      ? new Date(s).toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";

  const extractTime = (s?: string) =>
    s ? s.split("T")[1]?.substring(0, 5) || "-" : "-";

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full min-h-[500px] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => navigate("/package-requests")}
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
          <h1 className="text-lg font-medium text-gray-800">รายละเอียดแพ็กเกจ</h1>
        </div>
        <div>
          <Button type="confirm-admin">
            <div className="flex items-center gap-2">
              <SquarePen className="w-5 h-5" />
              <span>แก้ไขรายละเอียดแพ็กเกจ</span>
            </div>
          </Button>
        </div>
      </div>

      {/* ชื่อแพ็กเกจ */}
      <div className="space-y-2">
        <p className="text-base font-semibold text-gray-900">
          ชื่อแพ็กเกจ : <span className="font-normal">{data?.name}</span>
        </p>
        <p className="text-base font-semibold text-gray-900">
          คำอธิบาย : <span className="font-normal">{data?.description}</span>
        </p>
      </div>

      {/* จำนวนคน | ราคา */}
      <div className="grid grid-cols-2 gap-6">
        <p className="text-base font-semibold text-gray-900">
          จำนวนคนที่เปิดรับ :{" "}
          <span className="font-normal">{data?.capacity} คน</span>
        </p>
        <p className="text-base font-semibold text-gray-900">
          ราคา :{" "}
          <span className="font-normal">
            {data?.price?.toLocaleString("th-TH")} บาท
          </span>
        </p>
      </div>

      {/* แท็ก */}
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold text-gray-900">แท็ก :</p>
        <div className="flex flex-wrap gap-2">
          {data?.tagPackages?.length ? (
            data.tagPackages.map((tagObj, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
              >
                {tagObj.tag?.name}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">ไม่มีแท็ก</span>
          )}
        </div>
      </div>

      {/* ✅ รูปภาพ (เพิ่มใหม่) */}
      <div>
        {data?.packageFile?.length ? (
          <div className="flex flex-wrap gap-4">
            {data.packageFile.map((file, index) => {
              const url = resolveImageUrl(file.filePath);
              return (
                <img
                  key={index}
                  src={url}
                  alt={`package-image-${index}`}
                  className="rounded-xl border border-gray-200 shadow-sm object-cover w-full max-w-2xl"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/600x400?text=No+Image";
                  }}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">ไม่มีรูปภาพ</p>
        )}
      </div>

      {/* ผู้ดูแล | ผู้สร้าง */}
      <div className="grid grid-cols-2 gap-6">
        <p className="text-base font-semibold text-gray-900">
          ผู้ดูแล :{" "}
          <span className="font-normal">
            {data?.overseerPackage?.fname} {data?.overseerPackage?.lname}
          </span>
        </p>
        <p className="text-base font-semibold text-gray-900">
          ผู้สร้าง :{" "}
          <span className="font-normal">
            {data?.createPackage?.fname} {data?.createPackage?.lname}
          </span>
        </p>
      </div>

      {/* วันที่เริ่ม - เปิดจอง */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-900">
            วันที่เริ่ม - วันที่สิ้นสุดแพ็กเกจ :{" "}
            <span className="font-normal">
              {fmtDate(data?.startDate)} - {fmtDate(data?.dueDate)}
            </span>
          </p>
          <p className="text-base font-semibold text-gray-900">
            เวลา :{" "}
            <span className="font-normal">
              {extractTime(data?.startDate)} - {extractTime(data?.dueDate)}
            </span>
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-900">
            วันที่เปิด - วันที่ปิดจอง :{" "}
            <span className="font-normal">
              {fmtDate(data?.bookingOpenDate)} - {fmtDate(data?.bookingCloseDate)}
            </span>
          </p>
          <p className="text-base font-semibold text-gray-900">
            เวลา :{" "}
            <span className="font-normal">
              {extractTime(data?.bookingOpenDate)} - {extractTime(data?.bookingCloseDate)}
            </span>
          </p>
        </div>
      </div>

      {/* สิ่งอำนวยความสะดวก */}
      <p className="text-base font-semibold text-gray-900">
        สิ่งอำนวยความสะดวก :{" "}
        <span className="font-normal">{data?.facility}</span>
      </p>

      {/* แผนที่ */}
      <div>
        <p className="text-base font-semibold text-gray-900 mb-2">แผนที่ :</p>
        {(() => {
          const lat = data?.location?.latitude ?? 13.7563;
          const lng = data?.location?.longitude ?? 100.5018;
          const address = [
            data?.location?.houseNumber,
            data?.location?.alley,
            data?.location?.subDistrict,
            data?.location?.district,
            data?.location?.province,
            data?.location?.postalCode,
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <div className="h-80 rounded-xl overflow-hidden border border-gray-200">
              <MapContainer
                center={[lat, lng]}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={[lat, lng]}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-medium mb-1">{data?.name}</div>
                      <div className="text-gray-700">{address || "พิกัดแพ็กเกจ"}</div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          );
        })()}
      </div>

      {/* ที่อยู่ | คำอธิบาย */}
      <div className="grid grid-cols-2 gap-6">
        {(() => {
          const addr = [
            data?.location?.houseNumber,
            data?.location?.villageNumber ? `หมู่ ${data?.location?.villageNumber}` : "",
            data?.location?.alley,
            data?.location?.subDistrict ? `ตำบล${data?.location?.subDistrict}` : "",
            data?.location?.district ? `อำเภอ${data?.location?.district}` : "",
            data?.location?.province ? `จังหวัด${data?.location?.province}` : "",
            data?.location?.postalCode,
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <>
              <p className="text-base font-semibold text-gray-900">
                ที่อยู่ : <span className="font-normal">{addr || "-"}</span>
              </p>
              <p className="text-base font-semibold text-gray-900">
                คำอธิบายที่อยู่ :{" "}
                <span className="font-normal">{data?.location?.detail || "-"}</span>
              </p>
            </>
          );
        })()}
      </div>

      {/* พิกัด */}
      <p className="text-base font-semibold text-gray-900">
        ละติจูด / ลองจิจูด :{" "}
        <span className="font-normal">
          {data?.location?.latitude ?? "-"}, {data?.location?.longitude ?? "-"}
        </span>
      </p>
    </section>
  );
}
