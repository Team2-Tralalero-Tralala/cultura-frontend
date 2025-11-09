import { api } from "@/Libs/axios"; // ✅ ใช้ instance ที่มี withCredentials แล้ว

// ✅ ดึงร้านค้าทั้งหมด
export async function getAllStore(communityId: number, page: number, limit: number) {
  const params = { page, limit };
  return api.get(`/super/community/${communityId}/store`, { params });
}

// ✅ ลบร้านค้า (Soft Delete)
export async function deleteStore(storeId: number) {
  return api.delete(`/shared/store/${storeId}/delete`);
}
