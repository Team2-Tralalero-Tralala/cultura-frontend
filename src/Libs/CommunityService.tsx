import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export type CommunityFormData = {
  adminId: number;
  name: string;
  alias?: string;
  type: string;
  registerNumber: string;
  registerDate: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  description: string;
  mainActivityName: string;
  mainActivityDescription: string;
  houseNumber: string;
  villageNumber: number;
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
  locationDetail: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
  urlWebsite: string;
  urlFacebook: string;
  urlLine: string;
  urlTiktok: string;
  urlOther: string;
  mainAdmin: string;
  mainAdminPhone: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  member: string[];
};

export async function createCommunity(data: CommunityFormData) {
  return await axios.post(`${apiUrl}/super/community`, data, {
    withCredentials: true,
  });
}

export async function getCommunityById(id: number) {
  const response = await axios.get(`${apiUrl}/super/community/${id}`);
  console.log("🔍 API response:", response.data); // เพิ่มบรรทัดนี้
  return response.data;
}

export async function updateCommunity(id: number, data: any) {
  return await axios.put(`${apiUrl}/super/community/${id}`, data);
}

export async function deleteCommunity(id: number) {
  return await axios.patch(`${apiUrl}/super/community/${id}`);
}
