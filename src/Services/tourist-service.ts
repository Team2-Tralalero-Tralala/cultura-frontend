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
  src: string;
  alt: string;
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
 * ฟังก์ชัน : fetchHomeData
 * คำอธิบาย : ดึงข้อมูลหน้าแรกสำหรับ Tourist จาก API
 * Input : ไม่มี
 * Output : Promise<HomeData> - ข้อมูลหน้าแรกประกอบด้วย carouselImages และ activityTags
 */
export async function fetchHomeData(): Promise<HomeData> {
  const response = await api.get<HomeResponse>("/tourist/home");
  const data = response.data.data;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  // ลบ /api ออกจาก URL เพื่อใช้สำหรับ static files
  const backendBaseUrl = apiUrl.replace("/api", "") || "http://localhost:3000";

  // แปลง image URLs เป็น full URLs
  const transformedCarouselImages = data.carouselImages.map((image) => ({
    ...image,
    src: backendBaseUrl + image.src,
  }));

  return {
    ...data,
    carouselImages: transformedCarouselImages,
  };
}

/*
 * ฟังก์ชัน : fetchNewestPackages
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
 * ฟังก์ชัน : fetchPopularPackages
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
