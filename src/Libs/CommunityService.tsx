import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

// axios instance (แนบ cookie)
const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

/**
 * ดึงรายชื่อชุมชนทั้งหมด (Superadmin)
 * Mapping: GET /super/communities
 */
export async function getCommunities(page = 1, limit = 10) {
  return api.get("/super/communities", { params: { page, limit } });
}

/**
 * ดึงรายละเอียดชุมชนตาม ID
 * Mapping: GET /super/community/detail/:communityId
 */
export async function getCommunityDetailById(id: number) {
  return api.get(`/super/community/detail/${id}`);
}


export async function deleteCommunity(id: number) {
  return await api.patch(`/super/community/${id}`);
}