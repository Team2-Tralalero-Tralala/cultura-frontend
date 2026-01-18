/*
 * คำอธิบาย : Service สำหรับจัดการข้อมูล Tourist
 * ใช้สำหรับเชื่อมต่อ API ฝั่ง Tourist เช่น ดึงข้อมูลหน้าแรก
 * ใช้ในฝั่ง Client (Frontend)
 */

import api from "@/Libs/api";

/*
 * Interface สำหรับข้อมูลภาพ Carousel
 */
export interface CarouselImage {
  image: string;
}

/*
 * Interface สำหรับข้อมูลหน้าแรก
 */
export interface HomeData {
  carouselImages: CarouselImage[];
  activityTags: string[];
}

/*
 * Interface สำหรับ Response จาก API
 */
export interface HomeResponse {
  status: number;
  error: boolean;
  message: string;
  data: HomeData;
}

/*
 * Interface สำหรับข้อมูล Location จาก API
 */
export interface LocationData {
  id: number;
  province: string;
  district: string;
  subDistrict: string;
}

/*
 * Interface สำหรับข้อมูล Community จาก API
 */
export interface CommunityData {
  id: number;
  name: string;
}

/*
 * Interface สำหรับข้อมูล Tag จาก API
 */
export interface TagData {
  id: number;
  name: string;
}

/*
 * Interface สำหรับข้อมูล Package จาก API
 */
export interface PackageApiData {
  id: number;
  name: string | null;
  description: string | null;
  price: number | null;
  capacity: number | null;
  startDate: string | null;
  dueDate: string | null;
  facility: string | null;
  community: CommunityData;
  location: LocationData | null;
  coverImage: string | null;
  tags: TagData[];
}

/*
 * Interface สำหรับ Response จาก Packages API
 */
export interface PackagesResponse {
  status: number;
  error: boolean;
  message: string;
  data: PackageApiData[];
}

/*
 * คำอธิบาย : ดึงข้อมูลหน้าแรกสำหรับ Tourist จาก API
 * Input : ไม่มี
 * Output : Promise<HomeData> - ข้อมูลหน้าแรกประกอบด้วย carouselImages และ activityTags
 */
export async function fetchHomeData(): Promise<HomeData> {
  const response = await api.get<HomeResponse>("/tourist/home");
  const data = response.data.data;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  // ลบ /api ออกจาก URL เพื่อใช้สำหรับ static files
  const backendBaseUrl = apiUrl.replace("/api", "/") || "http://localhost:3000/uploads/";

  // แปลง image URLs เป็น full URLs
  const transformedCarouselImages = data.carouselImages.map((image) => ({
    ...image,
    image: backendBaseUrl + image.image,
  }));

  return {
    ...data,
    carouselImages: transformedCarouselImages,
  };
}

/*
 * คำอธิบาย : ดึงรายการแพ็กเกจมาใหม่จาก API
 * Input : ไม่มี
 * Output : Promise<PackageApiData[]> - รายการแพ็กเกจมาใหม่ (สูงสุด 40 รายการ)
 */
export async function fetchNewestPackages(): Promise<PackageApiData[]> {
  const response = await api.get<PackagesResponse>("/tourist/packages", {
    params: { sort: "newest" },
  });
  return response.data.data;
}

/*
 * คำอธิบาย : ดึงรายการแพ็กเกจยอดนิยมจาก API
 * Input : ไม่มี
 * Output : Promise<PackageApiData[]> - รายการแพ็กเกจยอดนิยม (สูงสุด 40 รายการ)
 */
export async function fetchPopularPackages(): Promise<PackageApiData[]> {
  const response = await api.get<PackagesResponse>("/tourist/packages", {
    params: { sort: "popular" },
  });
  return response.data.data;
}

/*
 * Interface สำหรับข้อมูล Community Location จาก Search API
 */
export interface SearchCommunityLocation {
  id: number;
  province: string;
  district: string;
  subDistrict: string;
}

/*
 * Interface สำหรับข้อมูล Community จาก Search API
 */
export interface SearchCommunityData {
  id: number;
  name: string;
  alias: string | null;
  type: string;
  description: string | null;
  mainActivityName: string | null;
  mainActivityDescription: string | null;
  rating: number | null;
  location: SearchCommunityLocation | null;
  coverImage: string | null;
}

/*
 * Interface สำหรับข้อมูล Packages Response จาก Search API
 */
export interface SearchPackagesResponse {
  data: PackageApiData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

/*
 * Interface สำหรับข้อมูล Search Overview Response
 */
export interface SearchOverviewData {
  packages: SearchPackagesResponse;
  communities: SearchCommunityData[];
}

/*
 * Interface สำหรับข้อมูลที่แปลงแล้วจาก Search Overview
 */
export interface TransformedSearchOverviewData {
  packages: PackageApiData[];
  communities: SearchCommunityData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

/*
 * Interface สำหรับ Response จาก Search Overview API
 */
export interface SearchOverviewResponse {
  status: number;
  error: boolean;
  message: string;
  data: SearchOverviewData;
}

/*
 * คำอธิบาย : ดึงข้อมูลการค้นหาแพ็กเกจและชุมชนจาก API
 * Input :
 *   - tag (string | null) - แท็กที่ต้องการค้นหา
 *   - query (string | null) - คำค้นหา
 *   - page (number) - หน้าปัจจุบัน
 *   - limit (number) - จำนวนรายการต่อหน้า
 *   - filters (object) - ตัวกรองเพิ่มเติม (priceMin, priceMax, startDate, endDate, tags, sort)
 * Output : Promise<TransformedSearchOverviewData> - ข้อมูลการค้นหาประกอบด้วย packages, communities และ pagination
 */
export async function fetchSearchOverview(
  tag: string | null,
  query: string | null,
  page: number,
  limit: number,
  filters?: {
    priceMin?: number;
    priceMax?: number;
    startDate?: string | null;
    endDate?: string | null;
    tags?: string[];
    sort?: string;
  }
): Promise<TransformedSearchOverviewData> {
  const params: Record<string, string | number> = {
    page,
    limit,
  };

  if (query) {
    params.search = query;
  }

  // รวมแท็กจาก URL parameter และ filters เป็น comma-separated string
  const allTags: string[] = [];
  if (tag) {
    allTags.push(tag);
  }
  if (filters?.tags && filters.tags.length > 0) {
    allTags.push(...filters.tags);
  }
  // ลบ duplicates และรวมเป็น comma-separated string
  if (allTags.length > 0) {
    const uniqueTags = Array.from(new Set(allTags));
    params.tag = uniqueTags.join(",");
  }

  // เพิ่มตัวกรองราคา
  if (filters?.priceMin !== undefined) {
    params.priceMin = filters.priceMin;
  }

  if (filters?.priceMax !== undefined) {
    params.priceMax = filters.priceMax;
  }

  // เพิ่มตัวกรองวันที่
  if (filters?.startDate) {
    params.startDate = filters.startDate;
  }

  if (filters?.endDate) {
    params.endDate = filters.endDate;
  }

  // เพิ่มตัวกรองการเรียงลำดับ
  if (filters?.sort) {
    params.sort = filters.sort;
  }

  const response = await api.get<SearchOverviewResponse>("/tourist/search/overview", {
    params,
  });

  const data = response.data.data;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const backendBaseUrl = apiUrl.replace("/api", "") || "http://localhost:3000";

  // ตรวจสอบว่า packages มี structure ที่ถูกต้อง
  if (!data.packages || !data.packages.data || !Array.isArray(data.packages.data)) {
    console.error("API response error: packages.data is not an array", data);
    throw new Error("Invalid API response: packages.data is not an array");
  }

  // ตรวจสอบว่า communities เป็น array หรือไม่
  if (!Array.isArray(data.communities)) {
    console.error("API response error: communities is not an array", data);
    throw new Error("Invalid API response: communities is not an array");
  }

  // แปลง image URLs เป็น full URLs สำหรับ packages
  const transformedPackages = data.packages.data.map((packageData) => {
    if (packageData.coverImage) {
      const imagePath = packageData.coverImage.startsWith("/")
        ? packageData.coverImage.slice(1)
        : packageData.coverImage;
      return {
        ...packageData,
        coverImage: backendBaseUrl + "/" + imagePath,
      };
    }
    return packageData;
  });

  // แปลง image URLs เป็น full URLs สำหรับ communities
  const transformedCommunities = data.communities.map((community) => {
    let imageUrl = "https://placehold.co/150x150?text=" + encodeURIComponent(community.name);
    if (community.coverImage) {
      const imagePath = community.coverImage.startsWith("/")
        ? community.coverImage.slice(1)
        : community.coverImage;
      imageUrl = backendBaseUrl + "/" + imagePath;
    }
    return {
      ...community,
      image: imageUrl,
    };
  });

  // ดึง pagination จาก packages.pagination
  const pagination = data.packages.pagination || {
    currentPage: page,
    totalPages: Math.ceil(data.packages.data.length / limit),
    totalCount: data.packages.data.length,
    limit: limit,
  };

  return {
    packages: transformedPackages,
    communities: transformedCommunities,
    pagination,
  };
}
