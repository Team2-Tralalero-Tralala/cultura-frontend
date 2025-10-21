import type { StoreData } from "@/Types/Store";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export async function createStore(
  communityId: number,
  data: StoreData | FormData
) {
  return await axios.post(
    `${apiUrl}/shared/community/${communityId}/store`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  );
}

export async function editStore(storeId: number, data: StoreData | FormData) {
  return await axios.put(`${apiUrl}/shared/store/${storeId}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
}

export async function getStoreById(storeId: number) {
  return await axios.get(`${apiUrl}/shared/store/${storeId}`, {
    withCredentials: true,
  });
}
