//import type { StoreData } from "@/Types/Store";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;


  export async function getAllStore(communityId: number, page: number, limit: number) {
  const params = { page, limit };
  return axios.get(`${apiUrl}/super/community/${communityId}/store`, { params, withCredentials: true });
}
