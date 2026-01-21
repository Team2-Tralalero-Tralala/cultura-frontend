/*
 * คำอธิบาย : Page Component สำหรับหน้าแรก (Home Page) ของระบบ
 * เป็นหน้าสาธารณะที่แสดงเมื่อผู้ใช้เข้าถึง root path (/)
 * ประกอบด้วย Navbar, Hero Carousel, และส่วนแสดงแพ็กเกจต่างๆ
 */

import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import Footer from "@/Components/Footer";
import HeroCarousel from "@/Components/HeroCarousel";
import NavbarTourist from "@/Components/NavbarTourist";
import PackageSection, { type PackageData } from "@/Components/PackageSection";
import TagsSection from "@/Components/TagsSection";
import {
  fetchHomeData,
  fetchNewestPackages,
  fetchPopularPackages,
  type CarouselImage,
  type PackageApiData,
} from "@/Libs/TouristService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/*
 * ฟังก์ชัน : Home
 * คำอธิบาย : แสดงหน้าแรกของระบบ พร้อม navigation bar, hero carousel และส่วนแสดงแพ็กเกจ
 * Input : ไม่มี
 * Output : React Component ที่ render หน้า Home พร้อม Navbar, Carousel และแพ็กเกจ
 */
export default function Home() {
  const navigate = useNavigate();

  // State สำหรับข้อมูล carousel images
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);

  // State สำหรับข้อมูล activity tags
  const [activityTags, setActivityTags] = useState<string[]>([]);

  // State สำหรับข้อมูลแพ็กเกจมาใหม่
  const [newPackages, setNewPackages] = useState<PackageData[]>([]);

  // State สำหรับข้อมูลแพ็กเกจยอดนิยม
  const [popularPackages, setPopularPackages] = useState<PackageData[]>([]);

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
   * คำอธิบาย : แปลงข้อมูล Package จาก API เป็นรูปแบบ PackageData
   * Input : packageData (PackageApiData) - ข้อมูล Package จาก API
   * Output : PackageData - ข้อมูล Package ที่แปลงแล้ว
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
   * ฟังก์ชัน : loadHomeData
   * คำอธิบาย : ดึงข้อมูลหน้าแรกจาก API และอัปเดต state
   * Input : ไม่มี
   * Output : void
   */
  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // ดึงข้อมูลทั้งหมดพร้อมกัน
      const [homeData, newestPackagesData, popularPackagesData] = await Promise.all([
        fetchHomeData(),
        fetchNewestPackages(),
        fetchPopularPackages(),
      ]);

      setCarouselImages(homeData.carouselImages);
      setActivityTags(homeData.activityTags);

      // แปลงข้อมูลแพ็กเกจ
      const transformedNewPackages = newestPackagesData.map(transformPackageData);
      const transformedPopularPackages = popularPackagesData.map(transformPackageData);

      setNewPackages(transformedNewPackages);
      setPopularPackages(transformedPopularPackages);
    } catch (error) {
      console.error("Error loading home data:", error);
      setErrorMessage("ไม่สามารถโหลดข้อมูลหน้าแรกได้ กรุณาลองใหม่อีกครั้ง");
      // ใช้ข้อมูล fallback เมื่อเกิด error
      setCarouselImages([
        {
          image: "/ViewTiwTouch.jpg",
        },
      ]);
      setActivityTags(["เดินป่า", "ปีนเขา", "แคมป์ปิ้ง", "ธรรมชาติ"]);
      setNewPackages([]);
      setPopularPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect สำหรับโหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadHomeData();
  }, []);

  /*
   * ฟังก์ชัน : handleViewMoreNew
   * คำอธิบาย : จัดการเมื่อคลิกปุ่มดูเพิ่มเติมในส่วนแพ็กเกจมาใหม่
   * Input : ไม่มี
   * Output : void
   */
  const handleViewMoreNew = () => {
    navigate("/tourist/packages?sort=new");
  };

  /*
   * ฟังก์ชัน : handleViewMorePopular
   * คำอธิบาย : จัดการเมื่อคลิกปุ่มดูเพิ่มเติมในส่วนแพ็กเกจยอดนิยม
   * Input : ไม่มี
   * Output : void
   */
  const handleViewMorePopular = () => {
    navigate("/tourist/packages?sort=popular");
  };

  /*
   * ฟังก์ชัน : handleTagClick
   * คำอธิบาย : จัดการเมื่อคลิกแท็กกิจกรรม
   * Input : tag (string) - แท็กที่ถูกคลิก
   * Output : void
   */
  const handleTagClick = (tag: string) => {
    navigate(`/tourist/search?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <NavbarTourist />

      {/* Error Message */}
      {errorMessage && (
        <div className="w-full bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="container mx-auto">
            <p className="text-yellow-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Hero Carousel */}
      <div className="w-full">
        {isLoading ? (
          <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-gray-200">
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <HeroCarousel items={carouselImages} />
        )}
      </div>

      {/* New Packages Section */}
      {!isLoading && (
        <PackageSection
          title="แพ็กเกจมาใหม่"
          isShowNewBadge={true}
          packages={newPackages}
          onViewMore={handleViewMoreNew}
        />
      )}

      {/* Popular Packages Section */}
      {!isLoading && (
        <PackageSection
          title="แพ็กเกจยอดนิยม"
          isShowNewBadge={false}
          packages={popularPackages}
          onViewMore={handleViewMorePopular}
        />
      )}

      {/* Recommended Activities Tags Section */}
      {!isLoading && (
        <TagsSection title="กิจกรรมที่แนะนำ" tags={activityTags} onTagClick={handleTagClick} />
      )}
      <div className="opacity-0 absolute top-0 left-0">
        <BreadcrumbNavigation
          current={{
            label: "หน้าแรก",
            to: `/`,
          }}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
