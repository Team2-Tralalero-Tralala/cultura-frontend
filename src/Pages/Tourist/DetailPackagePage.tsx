/**
 * คำอธิบาย : หน้าสำหรับแสดงรายละเอียดของแพ็กเกจท่องเที่ยว
 * รวมถึงข้อมูลที่พัก (Homestay) และแพ็กเกจที่เกี่ยวข้อง
 */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/Libs/useAuth";

import Footer from "@/Components/Footer";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import NavbarTourist from "@/Components/NavbarTourist";
import CardPackage from "@/Components/CardPackage";
import Thumbnails, { type MediaItem } from "@/Components/Thumbnails";
import Button from "@/Components/Button";
import { Tag } from "@/Components/Tag";
import { Icon } from "@iconify/react";

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
  latitude?: number;
  longitude?: number;
}

interface HomestayImage {
  id: number;
  image: string;
  type: string;
}

interface HomestayData {
  id: number;
  communityId: number;
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
  packageFiles: PackageFile[];
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
  const { user } = useAuth();
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [bookingQuantity, setBookingQuantity] = useState<number>(1);
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const navigate = useNavigate();
  const location = useLocation();
  const lat = packageDetail?.location?.latitude;
  const lng = packageDetail?.location?.longitude;
  const delta = 0.01;

  const minLat = lat !== undefined ? lat - delta : undefined;
  const maxLat = lat !== undefined ? lat + delta : undefined;
  const minLng = lng !== undefined ? lng - delta : undefined;
  const maxLng = lng !== undefined ? lng + delta : undefined;

  const latLng = lat !== undefined && lng !== undefined ? `${lat} ${lng}` : "";

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

  /*
   * คำอธิบาย : สร้างรายการสื่อ (รูปภาพ) สำหรับใช้แสดงในแกลเลอรีของแพ็กเกจ
   * เงื่อนไข :
   *  - หากมีข้อมูล packageFiles จะทำการแปลงเป็น MediaItem[]
   *  - หากไม่มีข้อมูล จะกำหนดค่าเริ่มต้นเป็น Array ว่าง
   * Input :
   *  - packageDetail.packageFiles
   * Output :
   *  - galleryItems (MediaItem[])
   */
  const galleryItems: MediaItem[] = packageDetail?.packageFiles
    ? packageDetail.packageFiles.map((file) => ({
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
   * Output : นำทางไปที่ Route /tourist/booking/package/:packageId/summary พร้อมตรวจสอบการล็อกอิน
   */
  const handleConfirmClick = (packageId: number) => {
    // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือยัง
    if (!user) {
      // ถ้ายังไม่ล็อกอิน ให้ redirect ไปหน้า login พร้อมส่ง state เพื่อกลับมาหน้านี้
      navigate("/guest/login", {
        state: { from: location.pathname },
      });
      return;
    }

    // ถ้าล็อกอินแล้ว ให้ไปหน้าสรุปการจอง
    navigate(`/tourist/booking/package/${packageId}/summary`, {
      state: {
        numberOfPeople: bookingQuantity,
      },
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
   * คำอธิบาย : ฟังก์ชันแปลงวันที่และเวลา เป็นรูปแบบภาษาไทย (เช่น "15 เมษายน 2568 เวลา 9:00")
   * Input: dateString - ข้อความวันที่ (string หรือ null)
   * Output : ข้อความวันที่และเวลาในรูปแบบภาษาไทย หรือ "-" หากไม่มีข้อมูล
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
    if (!packageDetail) return;
    if (packageDetail.capacity && bookingQuantity >= packageDetail.capacity) {
      return;
    }
    setBookingQuantity((previousQuantity) => previousQuantity + 1);
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับลดจำนวนผู้จอง
   * Input: -
   * Output : bookingQuantity ลดลง 1
   */
  const handleDecreaseQuantity = () => {
    setBookingQuantity((previousQuantity) => Math.max(1, previousQuantity - 1));
  };

  useEffect(() => {
    /*
     * คำอธิบาย : ฟังก์ชันสำหรับการดึงข้อมูลรายละเอียดของแพ็กเกจท่องเที่ยว
     * Input: packageId
     * Output : ข้อมูลรายละเอียดของแพ็กเกจและรูปภาพที่เกี่ยวข้อง (Update State)
     */
    const fetchPackageDetail = async () => {
      try {
        setVisibleCount(4);
        setIsLoading(true);
        setErrorMessage(null);
        if (!packageId) {
          throw new Error("ไม่พบรหัสแพ็กเกจ");
        }
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const response = await axios.get<ApiResponse>(`${apiUrl}/tourist/package/${packageId}`);
        const data = response.data.data;
        if (!data) {
          throw new Error("ไม่พบข้อมูลแพ็กเกจ หรือข้อมูลไม่ถูกต้อง");
        }
        setPackageDetail(data);
        if (data.packageFiles && data.packageFiles.length > 0) {
          const coverImage = data.packageFiles.find((file) => file.type === "COVER");
          const targetImage = coverImage || data.packageFiles[0];
          const imagePath = targetImage ? targetImage.filePath : "";
          setSelectedImage(generateImageUrl(imagePath));
        } else {
          setSelectedImage("https://placehold.co/800x450?text=No+Image");
        }
      } catch (error) {
        console.error("Error fetching package detail:", error);
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } else {
          setErrorMessage(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
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
        <h2 className="text-xl font-bold text-black mb-2">ไม่พบข้อมูลแพ็กเกจ</h2>
        <p className="text-black mb-4">{errorMessage}</p>
        <Link to="/" className="text-green-600 hover:underline">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  const isActivityStarted =
    !!packageDetail.startDate && new Date(packageDetail.startDate).getTime() <= Date.now();

  const isHasHomestay =
    packageDetail.homestayHistories && packageDetail.homestayHistories.length > 0;
  const currentHistory = isHasHomestay ? packageDetail.homestayHistories[0] : null;
  const currentHomestay = currentHistory ? currentHistory.homestay : null;

  return (
    <div className="min-h-screen bg-white font-sans text-black pb-24">
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
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-4 -mt-5">
          {packageDetail.name}
        </h1>

        {/* Tags */}
        {packageDetail.tagPackages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 mt-2">
            {packageDetail.tagPackages.map((item, index) => (
              <Tag
                key={index}
                label={item.tag.name}
                sizeClass="px-3 py-1"
                className="text-black bg-white whitespace-nowrap text-xs rounded-md"
              />
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
            เปิดจองแล้ว วันที่ {formatDateWithTime(packageDetail.bookingOpenDate)} -{" "}
            {formatDateWithTime(packageDetail.bookingCloseDate)}
          </p>
        </div>

        {/* Location & Date Info Bar */}
        {lat && lng ? (
          <a
            href={`https://www.openstreetmap.org/search?${new URLSearchParams({
              query: latLng,
              ...(minLat !== undefined && { minlat: String(minLat) }),
              ...(maxLat !== undefined && { maxlat: String(maxLat) }),
              ...(minLng !== undefined && { minlon: String(minLng) }),
              ...(maxLng !== undefined && { maxlon: String(maxLng) }),
              zoom: "16",
            }).toString()}#map=16/${lat}/${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mb-4 mt-2 cursor-pointer hover:text-green-600 transition-colors"
          >
            <Icon icon="mdi:location" className="text-black text-lg" />
            <span className="text-inherit">
              อำเภอ{packageDetail.location.subDistrict} จังหวัด{packageDetail.location.province}
            </span>
          </a>
        ) : (
          /* กรณีไม่มีพิกัด แสดงเป็น div เหมือนเดิม */
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Icon icon="mdi:location" className="text-black text-lg" />
            <span className="text-black">
              อำเภอ{packageDetail.location.subDistrict} จังหวัด{packageDetail.location.province}
            </span>
          </div>
        )}

        <div className="mb-4 mt-2">
          <p className="text-black-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            จำนวนการจอง {packageDetail.capacity || "-"} คน
          </p>
        </div>

        <div className="flex items-center gap-2 mb-4 mt-2">
          <span className="font-medium text-black">วันที่เริ่ม - วันที่สิ้นสุด : </span>
          <span className="text-black">
            {formatDateWithTime(packageDetail.startDate)} -{" "}
            {formatDateWithTime(packageDetail.dueDate)}
          </span>
        </div>

        {/* Image Gallery */}
        <div className="mb-10">
          <div className="mb-10">
            {galleryItems.length > 0 ? (
              <Thumbnails items={galleryItems} />
            ) : (
              <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center text-black">
                ไม่มีรูปภาพ
              </div>
            )}
          </div>
        </div>

        {/* Detail Hometay Section */}
        {isHasHomestay && currentHomestay && currentHistory && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Icon icon="carbon:hotel" className="text-black text-2xl" />
              <h2 className="text-xl font-bold text-black">รายละเอียดที่พัก</h2>
            </div>

            <div className="border border-gray-300 rounded-xl p-6 bg-white shadow-sm">
              <div className="space-y-6">
                {/* ชื่อที่พัก */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-0.5">
                    <Icon icon="ant-design:tags-outlined" className="text-black text-lg" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-black text-base">ชื่อที่พัก :</span>
                    <span className="text-black">{currentHomestay.name}</span>
                  </div>
                </div>

                {/* ที่ตั้ง */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-0.5">
                    <Icon icon="typcn:location-outline" className="text-black text-lg" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-black text-base">ที่ตั้ง :</span>
                    <span className="text-black">
                      ตำบล{currentHomestay.location?.subDistrict || "-"} อำเภอ
                      {currentHomestay.location?.district || "-"} จังหวัด
                      {currentHomestay.location?.province || "-"}
                    </span>
                  </div>
                </div>

                {/* ประเภทที่พัก */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-0.5">
                    <Icon icon="mdi:guest-room-outline" className="text-black text-lg" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-black text-base">ประเภทที่พัก :</span>
                    <span className="text-black">{currentHomestay.type}</span>
                  </div>
                </div>

                {/* ความจุผู้เข้าพัก */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-0.5">
                    <Icon icon="mdi:account-outline" className="text-black text-lg" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-black text-base">ความจุผู้เข้าพัก :</span>
                    <span className="text-black">
                      สูงสุด {currentHomestay.guestPerRoom} คน / ห้อง
                    </span>
                  </div>
                </div>

                {/* เช็กอิน */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-0.5">
                    <Icon icon="hugeicons:calendar-check-in-01" className="text-black text-lg" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-black text-base">เช็กอิน :</span>
                    <span className="text-black">
                      {formatDateTimeToThai(currentHistory.checkInTime)}
                    </span>
                  </div>
                </div>

                {/* เช็กเอาท์ */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-0.5">
                    <Icon icon="hugeicons:calendar-check-out-01" className="text-black text-lg" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-black text-base">เช็กเอาท์ :</span>
                    <span className="text-black">
                      {formatDateTimeToThai(currentHistory.checkOutTime)}
                    </span>
                  </div>
                </div>

                {/* สิ่งอำนวยความสะดวก */}
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="w-8 flex justify-center mt-0.5">
                    <Icon icon="lucide-lab:cup-saucer" className="text-black text-lg" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4">
                    <span className="font-bold text-black text-base">สิ่งอำนวยความสะดวก :</span>
                    <span className="text-black">{currentHomestay.facility}</span>
                  </div>
                </div>

                {/* รูปภาพที่พัก */}
                <div className="mt-4 pt-2">
                  <span className="font-bold text-black block mb-3 text-lg">รูปภาพที่พัก :</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {currentHomestay.homestayImage && currentHomestay.homestayImage.length > 0 ? (
                      currentHomestay.homestayImage.slice(0, 5).map((image, index) => (
                        <div
                          key={index}
                          className="h-28 rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={generateImageUrl(image.image)}
                            alt="homestay"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-black text-sm">ไม่มีรูปภาพ</div>
                    )}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() =>
                        navigate(
                          `/tourist/community/${currentHomestay.communityId}/detail/homestay/${currentHomestay.id}`
                        )
                      }
                      className="px-4 py-1.5 border border-gray-400 rounded-lg text-black text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
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
            <Icon icon="healthicons:travel" className="text-black text-2xl" />
            <h2 className="text-xl font-bold text-black0">สิ่งอำนวยความสะดวก (สำหรับแพ็กเกจ)</h2>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            {packageDetail.facility ? (
              <ul className="space-y-2 text-sm text-black">
                {packageDetail.facility.split(",").map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    {item.trim()}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-black text-sm">ไม่มีข้อมูลระบุ</span>
            )}
          </div>
        </div>

        {/* Guidelines / Warnings */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="typcn:warning-outline" className="text-black text-2xl" />
            <h2 className="text-xl font-bold text-black">
              คำแนะนำสำหรับผู้เข้าร่วมกิจกรรม (สิ่งที่ควรทราบ & สิ่งที่ควรเตรียม)
            </h2>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            {packageDetail.warning ? (
              <ul className="space-y-2 text-sm text-black">
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
              <span className="text-black text-sm">ไม่มีคำแนะนำเพิ่มเติม</span>
            )}
          </div>
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-black">
                ราคา THB {formatPrice(packageDetail.price)}
              </span>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto mb-6 mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-black mr-2">จำนวน</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={handleDecreaseQuantity}
                    className="px-3 py-1 text-black hover:bg-gray-100"
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
                    className="px-3 py-1 text-black hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-black ml-1">คน</span>
              </div>

              {/* เปลี่ยนไปใช้ Button Component Type confirm-tourist */}
              {/* หุ้ม div เพื่อคุม Layout (flex-1 บนมือถือ / flex-none บนจอใหญ่) เนื่องจาก Button มี w-full */}
              <div className="flex-1 sm:flex-none min-w-[120px]">
                <Button
                  type="confirm-tourist"
                  onClick={() => handleConfirmClick(packageDetail.id)}
                  disabled={isActivityStarted}
                >
                  {isActivityStarted ? "กิจกรรมเริ่มแล้ว" : "จองเลย"}
                </Button>
                {isActivityStarted && (
                  <p className="mt-2 text-xs text-red-600">
                    ไม่สามารถจองได้ เนื่องจากเวลาเริ่มกิจกรรมผ่านไปแล้ว
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border-t border-gray-200 my-8"></div>

      <div className="container mx-auto px-4 mb-4">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-lg font-bold text-black">แพ็กเกจที่คุณสนใจ</span>
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
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-black font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                >
                  <span>ดูเพิ่มเติม</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-black text-center py-8">ไม่มีแพ็กเกจที่เกี่ยวข้องในขณะนี้</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
