/**
 * คำอธิบาย : Component สำหรับแสดงรายละเอียดของแพ็กเกจท่องเที่ยว
 * รวมถึงข้อมูลที่พัก (Homestay) และแพ็กเกจที่เกี่ยวข้อง
 */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import Footer from "@/Components/Footer";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import NavbarTourist from "@/Components/NavbarTourist";
import CardPackage from "@/Components/CardPackage";
import Thumbnails, { type MediaItem } from "@/Components/Thumbnails";

// 1. Icon Tag (ชื่อที่พัก)
const IconTagOutline = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 1024 1024" fill="currentColor" className={className}>
    <path d="M483.2 790.3L861.4 412c1.7-1.7 2.5-4 2.3-6.3l-25.5-301.4c-.7-7.8-6.8-13.9-14.6-14.6L522.2 64.3c-2.3-.2-4.7.6-6.3 2.3L137.7 444.8a8.03 8.03 0 0 0 0 11.3l334.2 334.2c3.1 3.2 8.2 3.2 11.3 0zm62.6-651.7l224.6 19l19 224.6L477.5 694L233.9 450.5l311.9-311.9zm60.16 186.23a48 48 0 1 0 67.88-67.89a48 48 0 1 0-67.88 67.89zM889.7 539.8l-39.6-39.5a8.03 8.03 0 0 0-11.3 0l-362 361.3l-237.6-237a8.03 8.03 0 0 0-11.3 0l-39.6 39.5a8.03 8.03 0 0 0 0 11.3l243.2 242.8l39.6 39.5c3.1 3.1 8.2 3.1 11.3 0l407.3-406.6c3.1-3.1 3.1-8.2 0-11.3z" />
  </svg>
);

// 2. Icon Map Pin (ที่ตั้ง)
const IconMapPinOutline = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// 3. Icon Bed (ประเภทที่พัก)
const IconBedOutline = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </svg>
);

// 4. Icon User (ความจุผู้เข้าพัก)
const IconUserOutline = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// mdi:location (ที่ตั้งด้านบน)
const IconMdiLocation = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87 3.13-7 7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

// carbon:hotel (รายละเอียดที่พัก)
const IconAntDesign = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 32 32"><path fill="#000000" d="M9.5 15A1.5 1.5 0 1 1 8 16.5A1.5 1.5 0 0 1 9.5 15m0-2a3.5 3.5 0 1 0 3.5 3.5A3.5 3.5 0 0 0 9.5 13Z" /><path fill="#000000" d="M25 14h-8a2 2 0 0 0-2 2v6H4V10.6l12-6.46l12.53 6.74l.94-1.76l-13-7a1 1 0 0 0-.94 0l-13 7A1 1 0 0 0 2 10v20h2v-6h24v6h2V19a5 5 0 0 0-5-5Zm-8 8v-6h8a3 3 0 0 1 3 3v3Z" /></svg>
);

// ant-design:tags-outlined
const IconAntTags = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor" className={className}>
    <path d="M9.5 15A1.5 1.5 0 1 1 8 16.5A1.5 1.5 0 0 1 9.5 15m0-2a3.5 3.5 0 1 0 3.5 3.5A3.5 3.5 0 0 0 9.5 13Z" />
    <path d="M25 14h-8a2 2 0 0 0-2 2v6H4V10.6l12-6.46l12.53 6.74l.94-1.76l-13-7a1 1 0 0 0-.94 0l-13 7A1 1 0 0 0 2 10v20h2v-6h24v6h2V19a5 5 0 0 0-5-5Zm-8 8v-6h8a3 3 0 0 1 3 3v3Z" />
  </svg>
);

// hugeicons:calendar-check-in-01
const IconHugeCalendarCheckIn = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" className={className}>
    <path d="M18 2v2M6 2v2m5.05 18c-4.03 0-6.046 0-7.298-1.354C2.5 19.293 2.5 17.114 2.5 12.756v-.513c0-4.357 0-6.536 1.252-7.89C5.004 3 7.02 3 11.05 3h1.9c4.03 0 6.046 0 7.298 1.354c1.179 1.274 1.248 3.28 1.252 7.146V13" />
    <path d="M13 17.5h8m-8 0c0 .7 1.994 2.009 2.5 2.5M13 17.5c0-.7 1.994-2.008 2.5-2.5M3 8h18" />
  </svg>
);

// hugeicons:calendar-check-out-01
const IconHugeCalendarCheckOut = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" className={className}>
    <path d="M11.05 22c-4.03 0-6.046 0-7.298-1.354C2.5 19.293 2.5 17.114 2.5 12.756v-.513c0-4.357 0-6.536 1.252-7.89C5.004 3 7.02 3 11.05 3h1.9c4.03 0 6.046 0 7.298 1.354c1.179 1.274 1.248 3.28 1.252 7.146V13m-.5 5.5h-8m8 0c0 .7-1.994 2.009-2.5 2.5m2.5-2.5c0-.7-1.994-2.009-2.5-2.5M18 2v2M6 2v2M3 8h18" />
  </svg>
);

// lucide-lab:cup-saucer
const IconCupSaucer = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className={className}>
    <path d="M2 18a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4ZM6 8h12v6a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4Zm12 0h1a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-1M6 4a1 1 0 0 1 1-1a1 1 0 0 0 1-1m4 2a1 1 0 0 1 1-1a1 1 0 0 0 1-1m4 2a1 1 0 0 1 1-1a1 1 0 0 0 1-1" />
  </svg>
);

// healthicons:travel
const IconHealthTravel = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 48 48" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="m24.288 28.042l6.542 1.947l5.607-3.816A1 1 0 0 1 38 27v5h-2v-3.11l-4 2.722V40c0 .768.289 1.47.764 2H15.236c.475-.53.764-1.232.764-2v-8.465l-4-2.666V32h-2v-5a1 1 0 0 1 1.555-.832l5.696 3.797l6.46-1.923A.979.979 0 0 1 24 28c.083 0 .166.01.247.031l.008.002a.892.892 0 0 1 .033.01ZM25 30.341l5 1.488V40h-5v-9.659Zm-7 1.488l5-1.488V40h-5v-8.17Z" clipRule="evenodd" />
    <path d="M37 34a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h5v-5a3 3 0 0 0-3-3h-2ZM9 34a3 3 0 0 0-3 3v5h5a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3H9Z" />
    <path d="M24 6c-4.5 0-7 1.2-7 1.2V12l-3.529 3.529c-.593.593-.236 1.588.6 1.648c2.017.143 5.434.323 9.929.323c2.206 0 4.152-.043 5.8-.104h-.017a6 6 0 1 1-11.567 0c-.74-.027-1.42-.058-2.036-.09a8 8 0 1 0 15.64 0a112.94 112.94 0 0 0 2.109-.13c.836-.06 1.193-1.054.6-1.647L30.999 12V7.2S28.5 6 24 6Z" />
  </svg>
);

// typcn:warning-outline
const IconTypcnWarning = ({ className }: { className?: string }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 5.511c.561 0 1.119.354 1.544 1.062l5.912 9.854C20.307 17.842 19.65 19 18 19H6c-1.65 0-2.307-1.159-1.456-2.573l5.912-9.854c.425-.708.983-1.062 1.544-1.062m0-2c-1.296 0-2.482.74-3.259 2.031l-5.912 9.856c-.786 1.309-.872 2.705-.235 3.83S4.473 21 6 21h12c1.527 0 2.77-.646 3.406-1.771s.551-2.521-.235-3.83l-5.912-9.854C14.482 4.251 13.296 3.511 12 3.511z" />
    <circle cx="12" cy="16" r="1.3" />
    <path d="M13.5 10c0-.83-.671-1.5-1.5-1.5a1.499 1.499 0 0 0-1.389 2.062C11.165 11.938 12 14 12 14l1.391-3.438c.068-.173.109-.363.109-.562z" />
  </svg>
);

interface PackageFile {
  id: number;
  filePath: string;
  type: "COVER" | "GALLERY" | "VIDEO";
}

interface Tag {
  id: number;
  name: string;
}

interface LocationData {
  id: number;
  subDistrict: string;
  district: string;
  province: string;
}

interface HomestayImage {
  id: number;
  image: string;
  type: string;
}

interface HomestayData {
  id: number;
  name: string;
  type: string;
  guestPerRoom: number;
  totalRoom: number;
  facility: string;
  homestayImage: HomestayImage[];
  location?: {
    subDistrict: string;
    district: string;
    province: string;
  };
}

interface HomestayHistory {
  id: number;
  checkInTime: string;
  checkOutTime: string;
  bookedRoom: number;
  homestay: HomestayData;
}

interface RelatedPackage {
  id: number;
  name: string;
  price: number;
  capacity: number;
  location: LocationData;
  coverImage: string | undefined;
  tags: string[];
}

interface PackageDetail {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  capacity: number | null;
  startDate: string | null;
  bookingOpenDate: string | null;
  bookingCloseDate: string | null;
  dueDate: string | null;
  facility: string | null;
  warning: string | null;
  location: LocationData;
  packageFile: PackageFile[];
  tagPackages: { tag: Tag }[];
  homestayHistories: HomestayHistory[];
  relatedPackages?: RelatedPackage[];
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: PackageDetail;
}

export default function DetailPackagePage() {
  const { packageId } = useParams<{ packageId: string }>();
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [bookingQuantity, setBookingQuantity] = useState<number>(1);
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const navigate = useNavigate();
  const location = useLocation();

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับการแปลง path รูปภาพให้เป็น URL ที่สมบูรณ์
   * Input: path (string)
   * Output : URL เต็มของรูปภาพ
   */
  const generateImageUrl = (path: string | undefined): string => {
    if (!path) return "https://placehold.co/800x450?text=No+Image";
    if (path.startsWith("http")) return path;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

    try {
      const origin = new URL(apiBase).origin;
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      return `${origin}/${cleanPath}`;
    } catch (error) {
      return path;
    }
  };


  const galleryItems: MediaItem[] = packageDetail?.packageFile
    ? packageDetail.packageFile.map((file) => ({
      type: "image",
      src: generateImageUrl(file.filePath),
      alt: packageDetail.name,
    }))
    : [];

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับการโหลดรายการแพ็กเกจที่เกี่ยวข้องเพิ่มเติม
   * Input: -
   * Output : เพิ่มจำนวน visibleCount
   */
  const handleLoadMore = () => {
    setVisibleCount((previousVisibleCount) => previousVisibleCount + 4);
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับการนำทางไปยังหน้ารายละเอียดแพ็กเกจ
   * Input: packageId
   * Output : นำทางไปที่ Route /tourist/package/:id
   */
  const handlePackageClick = (packageId: number) => {
    navigate(`/tourist/package/${packageId}`);
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับการนำทางไปยังหน้าสรุปการจอง
   * Input: packageId
   * Output : นำทางไปที่ Route /tourist/booking/package/:packageId/summary
   */
  const handleConfirmClick = (packageId: number) => {
    navigate(`/tourist/booking/package/${packageId}/summary`);
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับการแปลงวันที่เป็นภาษาไทย (เฉพาะวันที่)
   * Input: dateString
   * Output : วันที่ในรูปแบบ "4 ส.ค. 2568"
   */
  const formatDateToThai = (dateString: string | null): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับการแปลงวันที่และเวลาเป็นภาษาไทยแบบเต็มรูปแบบ
   * Input: isoString
   * Output : รูปแบบ "วันจันทร์ที่ 4 สิงหาคม 2568 | เวลา 14.00 น."
   */
  const formatDateTimeToThai = (isoString: string | undefined): string => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const year = date.getFullYear() + 543;
    const month = date.toLocaleDateString("th-TH", { month: "long" });
    const day = date.getDate();
    const weekday = date.toLocaleDateString("th-TH", { weekday: "long" });
    const time = date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

    return `${weekday}ที่ ${day} ${month} ${year} | เวลา ${time} น.`;
  };

  /*
   * คำอธิบาย : ฟังก์ชันแปลงวันที่และเวลา แบบ "15 เมษายน 2568 เวลา 9:00"
   */
  const formatDateWithTime = (dateString: string | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timePart = date.toLocaleTimeString("th-TH", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${datePart} เวลา ${timePart}`;
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับการแปลงราคาเป็นรูปแบบสกุลเงิน
   * Input: price
   * Output : ราคาแบบมีทศนิยมและ comma
   */
  const formatPrice = (price: number | null) => {
    return price ? price.toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "0.00";
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับเพิ่มจำนวนผู้จอง
   * Input: -
   * Output : bookingQuantity เพิ่มขึ้น 1
   */
  const handleIncreaseQuantity = () => {
    setPackageDetail((previousPackageDetail) => {
      if (
        previousPackageDetail &&
        previousPackageDetail.capacity &&
        bookingQuantity >= previousPackageDetail.capacity
      ) {
        return previousPackageDetail;
      }

      setBookingQuantity((previousQuantity) => previousQuantity + 1);
      return previousPackageDetail;
    });
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับลดจำนวนผู้จอง
   * Input: -
   * Output : bookingQuantity ลดลง 1
   */
  const handleDecreaseQuantity = () => {
    setBookingQuantity((previousQuantity) =>
      Math.max(1, previousQuantity - 1)
    );
  };

  useEffect(() => {
    const fetchPackageDetail = async () => {
      try {
        setVisibleCount(4);
        setIsLoading(true);
        setErrorMessage(null);
        if (!packageId) {
          throw new Error("ไม่พบรหัสแพ็กเกจ");
        }
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const response = await fetch(`${apiUrl}/tourist/package/${packageId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลแพ็กเกจได้");
        }

        const responseJson: ApiResponse = await response.json();
        const data = responseJson.data;
        if (!data) {
          throw new Error("ไม่พบข้อมูลแพ็กเกจ หรือข้อมูลไม่ถูกต้อง");
        }

        setPackageDetail(data);

        if (data.packageFile && data.packageFile.length > 0) {
          const coverImage = data.packageFile.find((file) => file.type === "COVER");
          const targetImage = coverImage || data.packageFile[0];
          const imagePath = targetImage ? targetImage.filePath : "";
          setSelectedImage(generateImageUrl(imagePath));
        } else {
          setSelectedImage("https://placehold.co/800x450?text=No+Image");
        }
      } catch (error) {
        console.error("Error fetching package detail:", error);
        setErrorMessage(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageDetail();
  }, [packageId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="animate-pulse text-green-600 font-medium">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (errorMessage || !packageDetail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans p-4">
        <AlertTriangle className="text-red-500 mb-2" size={48} />
        <h2 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลแพ็กเกจ</h2>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        <Link to="/" className="text-green-600 hover:underline">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  const isHasHomestay = packageDetail.homestayHistories && packageDetail.homestayHistories.length > 0;
  const currentHistory = isHasHomestay ? packageDetail.homestayHistories[0] : null;
  const currentHomestay = currentHistory ? currentHistory.homestay : null;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pb-24">
      <NavbarTourist />
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          current={{
            label: "ดูรายละเอียดแพ็กเกจ",
            to: location.pathname,
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 -mt-5">
          {packageDetail.name}
        </h1>

        {/* Tags */}
        {packageDetail.tagPackages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 mt-2">
            {packageDetail.tagPackages.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200"
              >
                {item.tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="mb-4 mt-2">
          <p className="text-black-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            {packageDetail.description || "-"}
          </p>
        </div>

        <div className="mb-4 mt-2">
          <p className="text-black-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            เปิดจองแล้ว วันที่ {formatDateWithTime(packageDetail.bookingOpenDate)} - {formatDateWithTime(packageDetail.bookingCloseDate)}
          </p>
        </div>

        {/* Location & Date Info Bar */}
        <div className="flex items-center gap-2 mb-4 mt-2">
          <IconMapPinOutline className="text-black text-lg" />
          <span className="text-gray-600">
            {packageDetail.location.subDistrict}, {packageDetail.location.province}
          </span>
        </div>

        <div className="mb-4 mt-2">
          <p className="text-black-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            จำนวนการจอง {packageDetail.capacity || "-"} คน
          </p>
        </div>

        <div className="flex items-center gap-2 mb-4 mt-2">
          <span className="font-medium text-gray-900">วันที่เริ่ม - วันที่สิ้นสุด : </span>
          <span className="text-gray-600">
            {formatDateWithTime(packageDetail.startDate)} - {formatDateWithTime(packageDetail.dueDate)}
          </span>
        </div>

        {/* Image Gallery */}
        <div className="mb-10">
          <div className="mb-10">
            {galleryItems.length > 0 ? (
              <Thumbnails items={galleryItems} />
            ) : (
              <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                ไม่มีรูปภาพ
              </div>
            )}
          </div>
        </div>

        {/* Detail Hometay Section */}
        {isHasHomestay && currentHomestay && currentHistory && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <IconAntTags className="text-gray-800 text-2xl" />
              <h2 className="text-xl font-bold text-gray-900">รายละเอียดที่พัก</h2>
            </div>

            <div className="border border-gray-300 rounded-xl p-6 bg-white shadow-sm">
              <div className="space-y-6">
                {/* ชื่อที่พัก */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-1">
                    <IconTagOutline className="text-gray-900 text-xl" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-gray-900 text-base">ชื่อที่พัก :</span>
                    <span className="text-gray-800">{currentHomestay.name}</span>
                  </div>
                </div>

                {/* ที่ตั้ง */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-1">
                    <IconMapPinOutline className="text-gray-900 text-xl" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-gray-900 text-base">ที่ตั้ง :</span>
                    <span className="text-gray-800">
                      ตำบล{currentHomestay.location?.subDistrict || "-"} อำเภอ
                      {currentHomestay.location?.district || "-"} จังหวัด
                      {currentHomestay.location?.province || "-"}
                    </span>
                  </div>
                </div>

                {/* ประเภทที่พัก */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-1">
                    <IconBedOutline className="text-gray-900 text-xl" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-gray-900 text-base">ประเภทที่พัก :</span>
                    <span className="text-gray-800">{currentHomestay.type}</span>
                  </div>
                </div>

                {/* ความจุผู้เข้าพัก */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-1">
                    <IconUserOutline className="text-gray-900 text-xl" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-gray-900 text-base">ความจุผู้เข้าพัก :</span>
                    <span className="text-gray-800">
                      สูงสุด {currentHomestay.guestPerRoom} คน / ห้อง
                    </span>
                  </div>
                </div>

                {/* เช็กอิน */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-1">
                    <IconHugeCalendarCheckIn className="text-gray-900 text-xl" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-gray-900 text-base">เช็กอิน :</span>
                    <span className="text-gray-800">
                      {formatDateTimeToThai(currentHistory.checkInTime)}
                    </span>
                  </div>
                </div>

                {/* เช็กเอาท์ */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-1">
                    <IconHugeCalendarCheckOut className="text-gray-900 text-xl" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-gray-900 text-base">เช็กเอาท์ :</span>
                    <span className="text-gray-800">
                      {formatDateTimeToThai(currentHistory.checkOutTime)}
                    </span>
                  </div>
                </div>

                {/* สิ่งอำนวยความสะดวก */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-1">
                    <IconCupSaucer className="text-gray-900 text-xl" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-gray-900 text-base">สิ่งอำนวยความสะดวก :</span>
                    <span className="text-gray-800">{currentHomestay.facility}</span>
                  </div>
                </div>

                {/* รูปภาพที่พัก */}
                <div className="mt-4 pt-2">
                  <span className="font-bold text-gray-900 block mb-3 text-lg">รูปภาพที่พัก :</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {currentHomestay.homestayImage && currentHomestay.homestayImage.length > 0 ? (
                      currentHomestay.homestayImage.slice(0, 5).map((img, idx) => (
                        <div key={idx} className="h-28 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={generateImageUrl(img.image)}
                            alt="homestay"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-gray-400 text-sm">ไม่มีรูปภาพ</div>
                    )}
                  </div>
                  <div className="mt-4">
                    <button className="px-4 py-1.5 border border-gray-400 rounded-lg text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors">
                      ดูเพิ่มเติม
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Package Facilities */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <IconHealthTravel className="text-gray-800 text-2xl" />
            <h2 className="text-xl font-bold text-gray-900">
              สิ่งอำนวยความสะดวก (สำหรับแพ็กเกจ)
            </h2>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            {packageDetail.facility ? (
              <ul className="space-y-2 text-sm text-gray-700">
                {packageDetail.facility.split(",").map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    {item.trim()}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-500 text-sm">ไม่มีข้อมูลระบุ</span>
            )}
          </div>
        </div>

        {/* Guidelines / Warnings */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <IconTypcnWarning className="text-gray-800 text-2xl" />
            <h2 className="text-xl font-bold text-gray-900">
              คำแนะนำสำหรับผู้เข้าร่วมกิจกรรม (สิ่งที่ควรทราบ & สิ่งที่ควรเตรียม)
            </h2>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            {packageDetail.warning ? (
              <ul className="space-y-2 text-sm text-gray-700">
                {packageDetail.warning.split("\n").map(
                  (line, index) =>
                    line.trim() && (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                        <span className="leading-relaxed">{line.trim()}</span>
                      </li>
                    )
                )}
              </ul>
            ) : (
              <span className="text-gray-500 text-sm">ไม่มีคำแนะนำเพิ่มเติม</span>
            )}
          </div>
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ราคา THB {formatPrice(packageDetail.price)}
              </span>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto mb-6 mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-2">จำนวน</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={handleDecreaseQuantity}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={bookingQuantity}
                    readOnly
                    className="w-10 text-center text-sm focus:outline-none text-green-600 font-bold"
                  />
                  <button
                    onClick={handleIncreaseQuantity}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600 ml-1">คน</span>
              </div>
              <button
                onClick={() => handleConfirmClick(packageDetail.id)}
                className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-8 rounded-md transition-colors shadow-sm"
              >
                จองเลย
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border-t border-gray-200 my-8"></div>

      <div className="container mx-auto px-4 mb-4">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-lg font-bold text-gray-900">แพ็กเกจที่คุณสนใจ</span>
        </div>

        {packageDetail.relatedPackages && packageDetail.relatedPackages.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {packageDetail.relatedPackages.slice(0, visibleCount).map((findPackage) => (
                <CardPackage
                  key={findPackage.id}
                  image={generateImageUrl(findPackage.coverImage)}
                  title={findPackage.name}
                  location={`${findPackage.location.subDistrict}, ${findPackage.location.province}`}
                  priceTHB={findPackage.price}
                  booked={0}
                  capacity={findPackage.capacity}
                  tags={findPackage.tags || []}
                  bookingStatus="OPEN"
                  onClick={() => handlePackageClick(findPackage.id)}
                />
              ))}
            </div>

            {visibleCount < packageDetail.relatedPackages.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                >
                  <span>ดูเพิ่มเติม</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">ไม่มีแพ็กเกจที่เกี่ยวข้องในขณะนี้</p>
        )}
      </div>
      <Footer />
    </div>
  );
}