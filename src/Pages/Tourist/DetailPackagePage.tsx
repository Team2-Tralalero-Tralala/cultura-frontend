import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Home,
  Users,
  Bed,
  Wifi,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Footer from "@/Components/Footer";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import NavbarTourist from "@/Components/NavbarTourist";

// --- Interfaces ---

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
    province: string;
  };
}

interface HomestayHistory {
  id: number;
  homestay: HomestayData;
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
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: PackageDetail;
}

export default function DetailPackagePage() {
  const { packageId } = useParams<{ packageId: string }>();

  // State Management
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [bookingQuantity, setBookingQuantity] = useState<number>(1);

  // Helper: สร้าง URL รูปภาพให้ถูกต้อง (ชี้ไปที่ Backend)
  const getImageUrl = (path: string | undefined) => {
    if (!path) return "https://placehold.co/800x450?text=No+Image";
    if (path.startsWith("http")) return path; // ถ้าเป็น link เต็มอยู่แล้ว

    // ดึง URL Backend จาก env หรือใช้ default
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

    try {
      // ดึงเฉพาะ Domain (Origin) เช่น http://localhost:3000
      const origin = new URL(apiBase).origin;

      // ตัด / ตัวหน้าออกถ้ามี เพื่อไม่ให้เป็น //uploads
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;

      return `${origin}/${cleanPath}`;
    } catch (e) {
      return path;
    }
  };

  useEffect(() => {
    const fetchPackageDetail = async () => {
      try {
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

        // ✅ [แก้ไข] เพิ่มการตรวจสอบว่า data มีอยู่จริงหรือไม่
        if (!data) {
          throw new Error("ไม่พบข้อมูลแพ็กเกจ หรือข้อมูลไม่ถูกต้อง");
        }

        setPackageDetail(data);

        // ✅ [แก้ไข] ตรวจสอบ data ก่อนเรียกใช้ packageFile (ป้องกัน Error)
        if (data.packageFile && data.packageFile.length > 0) {
          const coverImage = data.packageFile.find((file) => file.type === "COVER");
          // ใช้ fallback ไปภาพแรกถ้าหา cover ไม่เจอ
          const targetImage = coverImage || data.packageFile[0];
          const imagePath = targetImage ? targetImage.filePath : "";
          setSelectedImage(getImageUrl(imagePath));
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

  // Utility Functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number | null) => {
    return price ? price.toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "0.00";
  };

  const handleIncreaseQuantity = () => {
    setPackageDetail((prev) => {
      if (prev && prev.capacity && bookingQuantity >= prev.capacity) return prev;
      setBookingQuantity((count) => count + 1);
      return prev;
    });
  };

  const handleDecreaseQuantity = () => {
    setBookingQuantity((prev) => Math.max(1, prev - 1));
  };

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
        <Link to="/" className="text-green-600 hover:underline">กลับสู่หน้าหลัก</Link>
      </div>
    );
  }

  const hasHomestay = packageDetail.homestayHistories && packageDetail.homestayHistories.length > 0;
  const currentHomestay = hasHomestay ? packageDetail.homestayHistories[0].homestay : null;

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

      <div className="container mx-auto px-4 max-w-6xl ">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 mt-2">
          {packageDetail.name}
        </h1>

        {/* Tags */}
        {packageDetail.tagPackages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {packageDetail.tagPackages.map((item, idx) => (
              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">
                {item.tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <p className="text-black-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            {packageDetail.description || "-"}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-black-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            เปิดจองแล้ว {packageDetail.bookingOpenDate || "-"} ถึง {packageDetail.bookingCloseDate || "-"}
          </p>
        </div>

        {/* Location & Date Info Bar */}
        <div className="flex items-center gap-2">
          <MapPin className="text-black w-4 h-4" />
          <span className="text-gray-600">
            {packageDetail.location.subDistrict}, {packageDetail.location.province}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-black-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            จำนวนการจอง {packageDetail.capacity || "-"} คน
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">วันที่เริ่ม - วันที่สิ้นสุด - เวลา : </span>
          <span className="text-gray-600">
            {formatDate(packageDetail.startDate)} - {formatDate(packageDetail.dueDate)}
          </span>
        </div>



        {/* Image Gallery */}
        <div className="mb-10">
          <div className="w-full h-[300px] md:h-[500px] bg-gray-100 rounded-lg overflow-hidden mb-2 relative group">
            <img
              src={selectedImage}
              alt={packageDetail.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {/* Slider Arrows */}
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="bg-white/80 p-2 rounded-full hover:bg-white text-gray-800"><ChevronLeft size={20} /></button>
              <button className="bg-white/80 p-2 rounded-full hover:bg-white text-gray-800"><ChevronRight size={20} /></button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
            {packageDetail.packageFile.slice(0, 5).map((file, index) => {
              const imgUrl = getImageUrl(file.filePath);
              return (
                <div
                  key={index}
                  className={`h-20 md:h-24 cursor-pointer rounded-md overflow-hidden border-2 ${selectedImage === imgUrl ? 'border-green-500' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(imgUrl)}
                >
                  <img src={imgUrl} alt="thumb" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                </div>
              );
            })}
          </div>
        </div>

        {/* --- Accommodation Section (Conditional) --- */}
        {hasHomestay && currentHomestay && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Home className="text-gray-800" size={20} />
              <h2 className="text-xl font-bold text-gray-900">รายละเอียดที่พัก</h2>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Info List */}
                <div className="space-y-4 text-sm">
                  <div className="flex gap-4">
                    <div className="w-6 flex justify-center"><MapPin size={18} className="text-gray-500" /></div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 block">ชื่อที่พัก:</span>
                      <span className="text-gray-600">{currentHomestay.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 flex justify-center"><MapPin size={18} className="text-gray-500" /></div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 block">ที่ตั้ง:</span>
                      <span className="text-gray-600">
                        {currentHomestay.location?.subDistrict || '-'}, {currentHomestay.location?.province || '-'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 flex justify-center"><Home size={18} className="text-gray-500" /></div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 block">ประเภทที่พัก:</span>
                      <span className="text-gray-600">{currentHomestay.type}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 flex justify-center"><Users size={18} className="text-gray-500" /></div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 block">ความจุผู้เข้าพัก:</span>
                      <span className="text-gray-600">{currentHomestay.guestPerRoom} ท่าน/ห้อง</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 flex justify-center"><Bed size={18} className="text-gray-500" /></div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 block">ปริมาณ:</span>
                      <span className="text-gray-600">รองรับได้ทั้งหมด {currentHomestay.totalRoom} ห้อง (รวม {currentHomestay.totalRoom * currentHomestay.guestPerRoom} ท่าน)</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 flex justify-center"><Wifi size={18} className="text-gray-500" /></div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 block">สิ่งอำนวยความสะดวก:</span>
                      <span className="text-gray-600">{currentHomestay.facility}</span>
                    </div>
                  </div>
                </div>

                {/* Homestay Images */}
                <div>
                  <span className="font-bold text-gray-900 block mb-3 text-sm">รูปภาพที่พัก:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {currentHomestay.homestayImage && currentHomestay.homestayImage.length > 0 ? (
                      currentHomestay.homestayImage.slice(0, 4).map((img, idx) => (
                        <div key={idx} className="h-24 rounded-lg overflow-hidden border border-gray-100">
                          {/* เรียกใช้ getImageUrl กับรูปที่พักด้วย */}
                          <img src={getImageUrl(img.image)} alt="homestay" className="w-full h-full object-cover" />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-4 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">ไม่มีรูปภาพ</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Package Facilities --- */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-gray-800" size={20} />
            <h2 className="text-xl font-bold text-gray-900">สิ่งอำนวยความสะดวก (สำหรับแพ็กเกจ)</h2>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            {packageDetail.facility ? (
              <ul className="space-y-2 text-sm text-gray-700">
                {packageDetail.facility.split(',').map((item, index) => (
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

        {/* --- Guidelines / Warnings --- */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-gray-800" size={20} />
            <h2 className="text-xl font-bold text-gray-900">คำแนะนำสำหรับผู้เข้าร่วมกิจกรรม (สิ่งที่ควรทราบ & สิ่งที่ควรเตรียม)</h2>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            {packageDetail.warning ? (
              <ul className="space-y-2 text-sm text-gray-700">
                {packageDetail.warning.split('\n').map((line, index) => (
                  line.trim() && (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                      <span className="leading-relaxed">{line.trim()}</span>
                    </li>
                  )
                ))}
              </ul>
            ) : (
              <span className="text-gray-500 text-sm">ไม่มีคำแนะนำเพิ่มเติม</span>
            )}
          </div>
          <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">ราคา THB {formatPrice(packageDetail.price)}</span>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
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

              <button className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-8 rounded-md transition-colors shadow-sm">
                จองเลย
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">แพ็กเกจที่คุณสนใจ</span>
            </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
