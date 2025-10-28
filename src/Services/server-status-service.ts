import api from "@/Libs/api";

export interface ServerStatusResponse {
  serverOnline: boolean;
}

export async function fetchServerStatus(): Promise<ServerStatusResponse> {
  const url = `/shared/server-status`;

  const res = await api.get(url, {
    withCredentials: true,
  });

  return res.data;
}
