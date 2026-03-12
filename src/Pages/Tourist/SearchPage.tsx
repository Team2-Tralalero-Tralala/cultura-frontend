/**
 * คำอธิบาย: Page Component สำหรับหน้าค้นหาแพ็กเกจและชุมชน
 * รองรับการค้นหาจาก query parameter:
 * - ?tag=tagName - ค้นหาแพ็กเกจตามแท็ก
 * - ?q=value - ค้นหาแพ็กเกจและชุมชนตามคำค้นหา
 * ประกอบด้วย Navbar, Breadcrumb, Filter Sidebar, Search Results และ Footer
 */

import BreadcrumbNavigation from "@/Components/BreadcrumbNavigation";
import { DailyDateInput } from "@/Components/calendar/InputCalendar/DailyDateInput";
import CardPackage from "@/Components/CardPackage";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/Navbar/NavbarTourist";
import { type PackageData } from "@/Components/PackageSection";
import PriceRangeSlider from "@/Components/PriceRangeSlider";
import { fetchHomeData, fetchSearchOverview, type PackageApiData } from "@/Libs/TouristService";
import { Icon } from "@iconify/react";
import Autocomplete from "@mui/material/Autocomplete";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * ชนิดข้อมูล: CommunityData
 * คำอธิบาย: ข้อมูลชุมชนสำหรับแสดงผลในการค้นหา
 */
type CommunityData = {
  id: number;
  name: string;
  image: string;
  province: string;
  location: { province: string; district: string; subDistrict: string } | null;
};

/**
 * ชนิดข้อมูล: SearchFilters
 * คำอธิบาย: ข้อมูลตัวกรองสำหรับการค้นหา
 */
type SearchFilters = {
  activityType: "one-day" | "multi-day" | null;
  startDate: string | null;
  endDate: string | null;
  minPrice: number;
  maxPrice: number;
  tags: string[];
};

/**
 * คำอธิบาย: แสดงหน้าค้นหาแพ็กเกจและชุมชน พร้อมตัวกรองและผลการค้นหา
 * Input: -
 * Output: React Component ที่ render หน้าค้นหา
 */
export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ดึง query parameters
  const tagParam = searchParams.get("tag");
  const queryParam = searchParams.get("q");

  // State สำหรับข้อมูลแพ็กเกจ
  const [packages, setPackages] = useState<PackageData[]>([]);

  // State สำหรับข้อมูลชุมชน
  const [communities, setCommunities] = useState<CommunityData[]>([]);

  // State สำหรับตัวกรอง
  const [filters, setFilters] = useState<SearchFilters>({
    activityType: null,
    startDate: null,
    endDate: null,
    minPrice: 0,
    maxPrice: 50000,
    tags: tagParam ? [tagParam] : [],
  });

  // อัปเดต tags เมื่อ tagParam เปลี่ยน
  useEffect(() => {
    if (tagParam) {
      setFilters((prev) => ({
        ...prev,
        tags: prev.tags.includes(tagParam)
          ? prev.tags
          : [tagParam, ...prev.tags.filter((t) => t !== tagParam)],
      }));
    } else if (!tagParam && filters.tags.length > 0) {
      // ถ้าไม่มี tagParam แล้ว แต่ยังมี tags อยู่ ให้คงไว้ (ผู้ใช้อาจเพิ่มเอง)
    }
  }, [tagParam]);

  // State สำหรับการค้นหาแท็ก
  const [tagOptions, setTagOptions] = useState<string[]>([]);

  // State สำหรับสถานะการโหลดข้อมูล
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State สำหรับการเรียงลำดับ
  const [sortBy, setSortBy] = useState<string>("latest");

  // State สำหรับ pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12,
  });

  // State สำหรับการแสดงชุมชน (expandable)
  const [showAllCommunities, setShowAllCommunities] = useState<boolean>(false);
  const initialCommunitiesToShow = 5;

  // State สำหรับข้อความ error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * คำอธิบาย: จัดรูปแบบข้อมูล location จาก API เป็น string
   * Input: location ({ province: string; district: string; subDistrict: string } | null) - ข้อมูล location จาก API
   * Output: string - ข้อมูล location ที่จัดรูปแบบแล้ว
   */
  const formatLocation = (
    location: { province: string; district: string; subDistrict: string } | null,
  ): string => {
    if (!location) return "ไม่ระบุสถานที่";
    const parts = [location.subDistrict, location.district, location.province].filter(Boolean);
    return parts.join(" ");
  };

  /**
   * คำอธิบาย: แปลงข้อมูล Package จาก API เป็นรูปแบบ PackageData
   * Input: packageData (PackageApiData) - ข้อมูล Package จาก API
   * Output: PackageData - ข้อมูล Package ที่แปลงแล้ว
   */
  const transformPackageData = (packageData: PackageApiData): PackageData => {
    // ตรวจสอบว่า coverImage เป็น full URL อยู่แล้วหรือไม่
    const isFullUrl =
      packageData.coverImage?.startsWith("http://") ||
      packageData.coverImage?.startsWith("https://");

    let imageUrl: string;
    if (!packageData.coverImage) {
      imageUrl = "https://placehold.co/400x300?text=No+Image";
    } else if (isFullUrl) {
      // ถ้าเป็น full URL อยู่แล้ว ให้ใช้ตรงๆ
      imageUrl = packageData.coverImage;
    } else {
      // ถ้าเป็น relative path ให้สร้าง full URL
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      let backendBaseUrl = apiUrl.replace("/api", "") || "http://localhost:3000";

      if (!backendBaseUrl.endsWith("/")) {
        backendBaseUrl += "/";
      }

      const imagePath = packageData.coverImage.startsWith("/")
        ? packageData.coverImage.slice(1)
        : packageData.coverImage;

      imageUrl = backendBaseUrl + imagePath;
    }

    return {
      id: packageData.id,
      image: imageUrl,
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

  /**
   * คำอธิบาย: สร้างข้อมูลแพ็กเกจจำลองตามคำค้นหาหรือแท็ก (DEPRECATED - kept for reference)
   * Input: searchQuery (string | null), tag (string | null)
   * Output: PackageData[] (รายการแพ็กเกจจำลอง)
   */
  const generateMockPackages = (searchQuery: string | null, tag: string | null): PackageData[] => {
    const mockPackages: PackageData[] = [
      {
        id: 1,
        image: "https://placehold.co/400x300?text=เดินป่าศึกษาธรรมชาติ",
        title: "เดินป่าศึกษาธรรมชาติ",
        location: "อำเภอจอมทอง จังหวัดเชียงใหม่",
        bookingStart: "2025-04-15",
        bookingEnd: "2025-09-30",
        bookingStatus: "OPEN",
        booked: 0,
        capacity: 50,
        tags: ["เดินป่า", "ธรรมชาติ", "วิถีชีวิต"],
        priceTHB: 500,
      },
      {
        id: 2,
        image: "https://placehold.co/400x300?text=เดินป่าชมพระอาทิตย์ขึ้น",
        title: "เดินป่าชมพระอาทิตย์ขึ้น",
        location: "อำเภอแม่แจ่ม จังหวัดเชียงใหม่",
        bookingStart: "2025-05-01",
        bookingEnd: "2025-10-31",
        bookingStatus: "OPEN",
        booked: 5,
        capacity: 30,
        tags: ["เดินป่า", "ธรรมชาติ", "วิถีชีวิต"],
        priceTHB: 600,
      },
      {
        id: 3,
        image: "https://placehold.co/400x300?text=ล่องลำธารเดินป่าแม่กำปอง",
        title: "ล่องลำธารเดินป่าแม่กำปอง",
        location: "อำเภอแม่ริม จังหวัดเชียงใหม่",
        bookingStart: "2025-04-20",
        bookingEnd: "2025-11-30",
        bookingStatus: "OPEN",
        booked: 10,
        capacity: 40,
        tags: ["เดินป่า", "ธรรมชาติ", "วิถีชีวิต"],
        priceTHB: 450,
      },
      {
        id: 4,
        image: "https://placehold.co/400x300?text=เดินป่าศึกษาชีวิตสัตว์ป่า",
        title: "เดินป่าศึกษาชีวิตสัตว์ป่า",
        location: "อำเภอสวนผึ้ง จังหวัดราชบุรี",
        bookingStart: "2025-06-01",
        bookingEnd: "2025-12-31",
        bookingStatus: "OPEN",
        booked: 2,
        capacity: 25,
        tags: ["เดินป่า", "ธรรมชาติ", "วิถีชีวิต"],
        priceTHB: 600,
      },
      {
        id: 5,
        image: "https://placehold.co/400x300?text=พิชิตยอดภูสอยดาว",
        title: "พิชิตยอดภูสอยดาว",
        location: "อำเภอนครไทย จังหวัดพิษณุโลก",
        bookingStart: "2025-05-15",
        bookingEnd: "2025-10-15",
        bookingStatus: "OPEN",
        booked: 8,
        capacity: 20,
        tags: ["เดินป่า", "ปีนเขา", "ธรรมชาติ"],
        priceTHB: 700,
      },
      {
        id: 6,
        image: "https://placehold.co/400x300?text=เดินป่าชมหมอก+ภูทับเบิก",
        title: "เดินป่าชมหมอก ภูทับเบิก",
        location: "อำเภอหล่มเก่า จังหวัดเพชรบูรณ์",
        bookingStart: "2025-04-10",
        bookingEnd: "2025-09-20",
        bookingStatus: "OPEN",
        booked: 15,
        capacity: 35,
        tags: ["เดินป่า", "ธรรมชาติ", "วิถีชีวิต"],
        priceTHB: 400,
      },
      {
        id: 7,
        image: "https://placehold.co/400x300?text=เดินป่าชมวิวเขาหลวง",
        title: "เดินป่าชมวิวเขาหลวง",
        location: "อำเภอเมือง จังหวัดนครศรีธรรมราช",
        bookingStart: "2025-05-01",
        bookingEnd: "2025-11-30",
        bookingStatus: "OPEN",
        booked: 3,
        capacity: 30,
        tags: ["เดินป่า", "ธรรมชาติ", "วิถีชีวิต"],
        priceTHB: 550,
      },
      {
        id: 8,
        image: "https://placehold.co/400x300?text=เดินป่าเขาสก+แคมป์ริมน้ำ",
        title: "เดินป่าเขาสก แคมป์ริมน้ำ",
        location: "อำเภอพนม จังหวัดสุราษฎร์ธานี",
        bookingStart: "2025-06-01",
        bookingEnd: "2025-12-31",
        bookingStatus: "OPEN",
        booked: 12,
        capacity: 40,
        tags: ["เดินป่า", "แคมป์ปิ้ง", "ธรรมชาติ"],
        priceTHB: 650,
      },
      {
        id: 9,
        image: "https://placehold.co/400x300?text=เดินป่าตามรอยช้างป่า",
        title: "เดินป่าตามรอยช้างป่า",
        location: "อำเภอแก่งกระจาน จังหวัดเพชรบุรี",
        bookingStart: "2025-04-15",
        bookingEnd: "2025-10-31",
        bookingStatus: "OPEN",
        booked: 7,
        capacity: 25,
        tags: ["เดินป่า", "ธรรมชาติ", "วิถีชีวิต"],
        priceTHB: 550,
      },
    ];

    // กรองตามแท็ก
    if (tag) {
      return mockPackages.filter((pkg) => (pkg.tags || []).includes(tag));
    }

    // กรองตามคำค้นหา
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return mockPackages.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(query) ||
          pkg.location.toLowerCase().includes(query) ||
          (pkg.tags || []).some((t) => t.toLowerCase().includes(query)),
      );
    }

    return mockPackages;
  };

  /**
   * คำอธิบาย: โหลดผลการค้นหาจาก API
   * Input: -
   * Output: void (Update state)
   */
  const loadSearchResults = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // เรียก API พร้อมส่งตัวกรอง
      const searchData = await fetchSearchOverview(
        tagParam,
        queryParam,
        pagination.currentPage,
        pagination.limit,
        {
          priceMin: filters.minPrice,
          priceMax: filters.maxPrice,
          startDate: filters.startDate,
          endDate: filters.endDate,
          tags: filters.tags.length > 0 ? filters.tags : undefined,
          sort: sortBy,
          searchRange:
            filters.activityType === "one-day"
              ? "singleDay"
              : filters.activityType === "multi-day"
                ? "MultipleDay"
                : "MultipleDay",
        },
      );

      // แปลงข้อมูลแพ็กเกจ (packages is already an array from service)
      const transformedPackages = searchData.packages.map(transformPackageData);

      // แปลงข้อมูลชุมชน (ensure image is always a string and extract province)
      const transformedCommunities: CommunityData[] = searchData.communities.map((community) => {
        // Get image from the transformed community data (already processed in service)
        const imageUrl =
          (community as any).image ||
          `https://placehold.co/150x150?text=${encodeURIComponent(community.name)}`;
        return {
          id: community.id,
          name: community.name,
          image: imageUrl,
          province: community.location?.province || "ไม่ระบุ",
          location: community.location,
        };
      });

      setPackages(transformedPackages);
      setCommunities(transformedCommunities);

      // อัปเดต pagination จาก API response
      setPagination((prev) => ({
        ...prev,
        totalCount: searchData.pagination.totalCount,
        totalPages: searchData.pagination.totalPages,
        currentPage: searchData.pagination.currentPage,
        limit: searchData.pagination.limit,
      }));
    } catch (error) {
      console.error("Error loading search results:", error);
      setErrorMessage("ไม่สามารถโหลดข้อมูลการค้นหาได้ กรุณาลองใหม่อีกครั้ง");
      setPackages([]);
      setCommunities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // รีเซ็ตหน้าแรกเมื่อ query parameters หรือ filters เปลี่ยน
  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [
    queryParam,
    tagParam,
    filters.minPrice,
    filters.maxPrice,
    filters.activityType,
    filters.startDate,
    filters.endDate,
    filters.tags,
    sortBy,
  ]);

  // โหลดรายการแท็กทั้งหมด เพื่อให้ผู้ใช้ "ค้นหาแล้วเลือกจากแท็กที่มีอยู่"
  useEffect(() => {
    let active = true;
    fetchHomeData()
      .then((resp) => {
        if (!active) return;
        const names = (resp?.activityTags ?? [])
          .map((name) => String(name ?? "").trim())
          .filter((name) => name.length > 0);
        setTagOptions(Array.from(new Set(names)).sort((a, b) => a.localeCompare(b)));
      })
      .catch((err) => {
        console.error("Failed to load tags:", err);
        setTagOptions([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Ref สำหรับเก็บ timeout ID ของ debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // useEffect สำหรับโหลดข้อมูลเมื่อ query parameters หรือ filters เปลี่ยน (พร้อม debounce 300ms)
  useEffect(() => {
    // ล้าง timeout เก่าถ้ามี
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // ตั้ง timeout ใหม่สำหรับ debounce 300ms
    debounceTimeoutRef.current = setTimeout(() => {
      // เรียก API เฉพาะเมื่อมี tag หรือ query parameter
      if (tagParam || queryParam) {
        loadSearchResults();
      } else {
        // ถ้าไม่มีทั้ง tag และ query ให้เคลียร์ข้อมูล
        setPackages([]);
        setCommunities([]);
        setPagination((prev) => ({
          ...prev,
          totalCount: 0,
          totalPages: 0,
        }));
      }
    }, 300);

    // Cleanup function สำหรับล้าง timeout เมื่อ component unmount หรือ dependencies เปลี่ยน
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    queryParam,
    tagParam,
    pagination.limit,
    pagination.currentPage,
    filters.minPrice,
    filters.maxPrice,
    filters.activityType,
    filters.startDate,
    filters.endDate,
    filters.tags,
    sortBy,
  ]);

  /**
   * คำอธิบาย: จัดการเมื่อเปลี่ยนประเภทกิจกรรม
   * Input: type ("one-day" | "multi-day" | null) - ประเภทกิจกรรม
   * Output: void
   */
  const handleActivityTypeChange = (type: "one-day" | "multi-day" | null) => {
    setFilters((prev) => {
      const nextType = prev.activityType === type ? null : type;
      return {
        ...prev,
        activityType: nextType,
        endDate: nextType === "one-day" ? null : prev.endDate,
      };
    });
  };

  /**
   * คำอธิบาย: ลบแท็ก
   * Input: tag (string) - แท็กที่ต้องการลบ
   * Output: void
   */
  const handleTagRemove = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  /**
   * คำอธิบาย: จัดการเมื่อคลิกการ์ดแพ็กเกจ
   * Input: packageId (number) - ID ของแพ็กเกจที่ถูกคลิก
   * Output: void (Navigate to package)
   */
  const handlePackageClick = (packageId: number) => {
    navigate(`/tourist/package/${packageId}`);
  };

  /**
   * คำอธิบาย: จัดการเมื่อคลิกการ์ดชุมชน
   * Input: communityId (number) - ID ของชุมชนที่ถูกคลิก
   * Output: void (Navigate to community)
   */
  const handleCommunityClick = (communityId: number) => {
    navigate(`/tourist/community/${communityId}/detail`);
  };

  // กำหนดข้อความสำหรับ breadcrumb และ title
  const searchTitle = tagParam
    ? `ผลลัพธ์ที่ตรงกับการค้นหา "${tagParam}"`
    : queryParam
      ? `ผลลัพธ์ที่ตรงกับการค้นหา "${queryParam}"`
      : "ผลการค้นหา";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <NavbarTourist />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <BreadcrumbNavigation
            current={{
              label: "หน้าดูแพ็กเกจ",
              to: window.location.pathname + window.location.search,
            }}
          />
        </div>

        {/* Search Title */}
        <h1 className="text-2xl font-bold text-black mb-6">{searchTitle}</h1>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-700">{errorMessage}</p>
          </div>
        )}

        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-80 shrink-0">
            <div className="space-y-6">
              <div className="rounded-lg border-2 border-gray-300 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-black mb-4">ตัวเลือกแพ็กเกจ</h2>

                {/* Activity Type */}
                <div className="">
                  <div className="flex">
                    <button
                      onClick={() => handleActivityTypeChange("one-day")}
                      className={`flex-1 px-4 py-2 rounded-l-lg text-sm font-medium transition-colors border border-emerald-600 border-r-0 ${
                        filters.activityType === "one-day"
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      กิจกรรมวันเดียว
                    </button>
                    <button
                      onClick={() => handleActivityTypeChange("multi-day")}
                      className={`flex-1 px-4 py-2 rounded-r-lg text-sm font-medium transition-colors border border-emerald-600 ${
                        filters.activityType === "multi-day"
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      กิจกรรมหลายวัน
                    </button>
                  </div>
                </div>

                {/* Date Pickers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่เริ่มกิจกรรม
                  </label>
                  <div className="date-input-wrapper">
                    <DailyDateInput
                      value={filters.startDate}
                      onChange={(dateStr) =>
                        setFilters((prev) => ({ ...prev, startDate: dateStr }))
                      }
                      height={41}
                      className="m-0"
                      clearable={false}
                    />
                  </div>
                </div>

                {filters.activityType !== "one-day" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วันที่สิ้นสุดกิจกรรม
                    </label>
                    <div className="date-input-wrapper">
                      <DailyDateInput
                        value={filters.endDate}
                        onChange={(dateStr) => setFilters((prev) => ({ ...prev, endDate: dateStr }))}
                        height={41}
                        className="m-0"
                        clearable={false}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border-2 border-gray-300 p-4 space-y-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ช่วงราคา</label>
                  <PriceRangeSlider
                    min={0}
                    max={50000}
                    value={[filters.minPrice, filters.maxPrice]}
                    onChange={(range) =>
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: range[0],
                        maxPrice: range[1],
                      }))
                    }
                    step={100}
                  />
                </div>
              </div>

              {/* Tag Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ค้นหาเพื่อเพิ่มแท็ก
                </label>
                <Autocomplete
                  multiple
                  disablePortal
                  disableClearable
                  options={tagOptions}
                  value={filters.tags}
                  onChange={(_, newValue) => {
                    // newValue เป็น string[] ของแท็กที่เลือกจากรายการ
                    setFilters((prev) => ({ ...prev, tags: newValue }));
                  }}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderTags={() => null}
                  renderInput={(params) => {
                    const { InputProps, inputProps } = params;
                    const { ref: InputRef } = InputProps;
                    const { ref: InputElementRef, ...inputPropsRest } = inputProps;
                    return (
                      <div ref={InputRef} className="w-full">
                        <div className="flex items-center rounded-md border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 bg-white">
                          <div className="flex items-center flex-1 relative">
                            <Icon
                              icon="mdi:magnify"
                              className="absolute left-3 w-5 h-5 z-10 pointer-events-none"
                              style={{ color: "#00BF6A" }}
                            />
                            <input
                              {...inputPropsRest}
                              ref={InputElementRef}
                              type="text"
                              placeholder="ค้นหาแท็ก แล้วเลือกจากรายการ"
                              className="w-full pl-10 pr-3 py-2.5 border-0 focus:outline-none bg-white text-gray-700 placeholder-gray-400"
                            />
                          </div>
                          {/* ปิด endAdornment ของ MUI (กัน UI ซ้อน) */}
                          {InputProps.endAdornment && (
                            <div className="hidden">{InputProps.endAdornment}</div>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
                {/* Display Tags */}
                {filters.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {filters.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagRemove(tag)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 transition-colors"
                      >
                        <span>{tag}</span>
                        <Icon icon="mdi:close" className="w-4 h-4 text-gray-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <>
                {/* Communities Section */}
                {communities.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-black mb-4">ชุมชน</h2>
                    <div className="grid grid-cols-5 gap-4">
                      {(showAllCommunities
                        ? communities
                        : communities.slice(0, initialCommunitiesToShow)
                      ).map((community) => (
                        <div
                          key={community.id}
                          onClick={() => handleCommunityClick(community.id)}
                          className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={community.image}
                            alt={community.name}
                            className="w-32 h-32 rounded-full mx-auto mb-2 object-cover"
                          />
                          <h3 className="text-sm font-medium text-gray-800">{community.name}</h3>
                        </div>
                      ))}
                    </div>
                    {communities.length > initialCommunitiesToShow && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => setShowAllCommunities(!showAllCommunities)}
                          className="px-4 py-2 border-2 border-black rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                        >
                          {showAllCommunities ? "แสดงน้อยลง" : "ดูเพิ่มเติม"}
                        </button>
                      </div>
                    )}
                    <hr className="my-4" />
                  </div>
                )}

                {/* Sort Dropdown */}
                <div className="flex justify-end mb-8">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="latest">ล่าสุด</option>
                    <option value="price-low">ราคาต่ำ-สูง</option>
                    <option value="price-high">ราคาสูง-ต่ำ</option>
                    <option value="popular">ยอดนิยม</option>
                  </select>
                </div>

                {/* Packages Grid */}
                {packages.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
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
                          tags={pkg.tags || []}
                          priceTHB={pkg.priceTHB}
                          onClick={() => handlePackageClick(pkg.id)}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex justify-end items-center gap-2 mt-6">
                        {/* Previous Button */}
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: Math.max(1, prev.currentPage - 1),
                            }))
                          }
                          disabled={pagination.currentPage === 1}
                          className="px-3 py-2 rounded-lg border border-emerald-500 bg-white text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                          aria-label="ก่อนหน้า"
                        >
                          ‹
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
                          .filter((page) => {
                            // แสดงหน้าแรก, สุดท้าย, หน้าปัจจุบัน และหน้าข้างเคียง
                            return (
                              page === 1 ||
                              page === pagination.totalPages ||
                              Math.abs(page - pagination.currentPage) <= 1
                            );
                          })
                          .map((page, index, array) => {
                            // เพิ่ม ellipsis ถ้าจำเป็น
                            const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                            return (
                              <div key={page} className="flex items-center gap-1">
                                {showEllipsisBefore && <span className="px-2 text-black">...</span>}
                                <button
                                  onClick={() =>
                                    setPagination((prev) => ({
                                      ...prev,
                                      currentPage: page,
                                    }))
                                  }
                                  className={`px-3 py-2 rounded-lg border transition-colors ${
                                    pagination.currentPage === page
                                      ? "bg-emerald-600 text-white border-emerald-600"
                                      : "bg-white text-black border-emerald-500 hover:bg-emerald-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              </div>
                            );
                          })}

                        {/* Next Button */}
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: Math.min(prev.totalPages, prev.currentPage + 1),
                            }))
                          }
                          disabled={pagination.currentPage === pagination.totalPages}
                          className="px-3 py-2 rounded-lg border border-emerald-500 bg-white text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                          aria-label="ถัดไป"
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center py-20">
                    <p className="text-gray-600">ไม่พบข้อมูลแพ็กเกจ</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
