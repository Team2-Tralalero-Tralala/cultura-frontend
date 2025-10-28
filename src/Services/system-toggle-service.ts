import api from "@/Libs/api";

export interface SystemToggleResponse {
  success: boolean;
  message: string;
  data: {
    serverOnline: boolean;
  }
}

export async function enableSystem(): Promise<SystemToggleResponse> {
  const url = `/super/server/enable`;

  const res = await api.post(url, {}, {
    withCredentials: true,
  });

  return res.data;
}

export async function disableSystem(): Promise<SystemToggleResponse> {
  const url = `/super/server/disable`;

  const res = await api.post(url, {}, {
    withCredentials: true,
  });

  return res.data;
}

export async function getSystemStatus(): Promise<{ serverStatus: boolean }> {
  const url = `/shared/system/status`;

  const res = await api.get(url, {
    withCredentials: true,
  });

  return res.data;
}
