import { api } from "@/Libs/axios";

export async function fetchAuthenticationLog(page: number, limit: number, searchName: string, filterRole: string) {
  const url = `/shared/logs`;

  const res = await api.get(url, {
    params: { page, limit, searchName, filterRole },
    withCredentials: true,
  });

  return res.data
}