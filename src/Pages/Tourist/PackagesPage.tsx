/*
 * คำอธิบาย : Page Component สำหรับหน้าแสดงรายการแพ็กเกจ (Packages)
 * เป็นหน้าสาธารณะที่แสดงรายการแพ็กเกจมาใหม่หรือแพ็กเกจยอดนิยมตาม query parameter
 * ประกอบด้วย Navbar, Breadcrumb, และส่วนแสดงแพ็กเกจในรูปแบบ grid
 */

import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import CardPackage from "@/Components/CardPackage";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/NavbarTourist";
import { type PackageData } from "@/Components/PackageSection";
import {
  fetchNewestPackages,
  fetchPopularPackages,
  type PackageApiData,
} from "@/Libs/TouristService";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/*
 * ฟังก์ชัน : PackagesPage
 * คำอธิบาย : แสดงหน้าแสดงรายการแพ็กเกจมาใหม่หรือแพ็กเกจยอดนิยมตาม query parameter sort
 * Input : ไม่มี
 * Output : React Component ที่ render หน้าแสดงรายการแพ็กเกจตาม sort parameter
 */
export default function PackagesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sort = searchParams.get("sort");

  // กำหนดว่าเป็นหน้าแพ็กเกจยอดนิยมหรือไม่
  const isPopular = sort === "popular";

  // State สำหรับข้อมูลแพ็กเกจ
  const [packages, setPackages] = useState<PackageData[]>([]);

  // State สำหรับสถานะการโหลดข้อมูล
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State สำหรับข้อความ error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /*
   * ฟังก์ชัน : formatLocation
   * คำอธิบาย : จัดรูปแบบข้อมูล location จาก API เป็น string
   * Input : location (LocationData | null) - ข้อมูล location จาก API
   * Output : string - ข้อมูล location ที่จัดรูปแบบแล้ว
   */
  const formatLocation = (
    location: { province: string; district: string; subDistrict: string } | null,
  ): string => {
    if (!location) return "ไม่ระบุสถานที่";
    const parts = [location.subDistrict, location.district, location.province].filter(Boolean);
    return parts.join(" ");
  };

  /*
   * ฟังก์ชัน : transformPackageData
   * คำอธิบาย : แปลงข้อมูล Package จาก API เป็นรูปแบบ PackageData พร้อมเก็บ ID
   * Input : packageData (PackageApiData) - ข้อมูล Package จาก API
   * Output : PackageData - ข้อมูล Package ที่แปลงแล้วพร้อม ID
   */
  const transformPackageData = (packageData: PackageApiData): PackageData => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    let backendBaseUrl = apiUrl.replace("/api", "") || "http://localhost:3000";

    if (!backendBaseUrl.endsWith("/")) {
      backendBaseUrl += "/";
    }

    const imagePath = packageData.coverImage?.startsWith("/")
      ? packageData.coverImage.slice(1)
      : packageData.coverImage;

    return {
      id: packageData.id,
      image: packageData.coverImage
        ? backendBaseUrl + imagePath
        : "https://placehold.co/400x300?text=No+Image",
      title: packageData.name || "ไม่มีชื่อ",
      location: formatLocation(packageData.location),
      bookingStart: packageData.startDate || null,
      bookingEnd: packageData.dueDate || null,
      bookingStatus: "OPEN" as const,
      booked: 0,
      capacity: packageData.capacity || undefined,
      tags: packageData.tags.map((tag) => tag.name),
      priceTHB: packageData.price || undefined,
    };
  };

  /*
   * ฟังก์ชัน : loadPackages
   * คำอธิบาย : ดึงข้อมูลแพ็กเกจจาก API ตาม sort parameter และอัปเดต state
   * Input : ไม่มี
   * Output : void
   */
  const loadPackages = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // เรียก API ตาม sort parameter
      const packagesData = isPopular ? await fetchPopularPackages() : await fetchNewestPackages();
      const transformedPackages = packagesData.map(transformPackageData);

      setPackages(transformedPackages);
    } catch (error) {
      console.error("Error loading packages:", error);
      setErrorMessage("ไม่สามารถโหลดข้อมูลแพ็กเกจได้ กรุณาลองใหม่อีกครั้ง");
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  }, [isPopular]);

  // useEffect สำหรับโหลดข้อมูลเมื่อ component mount หรือ sort parameter เปลี่ยน
  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  /*
   * ฟังก์ชัน : handlePackageClick
   * คำอธิบาย : จัดการเมื่อคลิกการ์ดแพ็กเกจ
   * Input : packageId (number) - ID ของแพ็กเกจที่ถูกคลิก
   * Output : void
   */
  const handlePackageClick = (packageId: number) => {
    // TODO: Navigate to package detail page
    navigate(`/tourist/package/${packageId}`);
  };

  // กำหนดข้อความสำหรับ breadcrumb และ title
  const breadcrumbLabel = isPopular ? "แพ็กเกจยอดนิยมเพิ่มเติม" : "แพ็กเกจใหม่เพิ่มเติม";
  const pageTitle = isPopular ? "แพ็กเกจยอดนิยม" : "แพ็กเกจมาใหม่";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <NavbarTourist />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <BreadcrumbNavigation
            current={{
              label: breadcrumbLabel,
              to: `/tourist/packages` + (isPopular ? "?sort=popular" : "?sort=new"),
            }}
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-700">{errorMessage}</p>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold text-black">{pageTitle}</h1>
          {!isPopular && (
            <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              New
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Packages Grid */}
            {packages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {packages.map((pkg) => (
                  <CardPackage
                    key={pkg.id}
                    image={pkg.image}
                    title={pkg.title}
                    location={pkg.location}
                    bookingStart={pkg.bookingStart}
                    bookingEnd={pkg.bookingEnd}
                    bookingStatus={pkg.bookingStatus}
                    booked={pkg.booked}
                    capacity={pkg.capacity}
                    tags={pkg.tags}
                    priceTHB={pkg.priceTHB}
                    onClick={() => handlePackageClick(pkg.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-600">ไม่พบข้อมูลแพ็กเกจ</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
