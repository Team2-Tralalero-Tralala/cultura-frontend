import React, { createContext, useState, useCallback } from "react";
import { api, setAuthToken } from "@/Libs/axios";

export type Role = "superadmin" | "admin" | "member" | "tourist";

export type RegisterData = {
  username: string;
  password: string;
  email: string;
  fname: string;
  lname: string;
  phone: string;
  role: string;
};

export type AuthUser = { id: number; username: string; role: Role };

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  accessToken: null,
  login: async () => {
    throw new Error("login not implemented");
  },
  register: async () => false,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post("/auth/login", { username, password });
    const payload = res.data?.data ?? res.data;
    const u = payload?.user ?? payload;
    const token = payload?.token;

    if (token) {
      localStorage.setItem("accessToken", token);
      setAuthToken(token);
    }

    const roleLower = (u?.role?.name ?? u?.role ?? "").toString().toLowerCase();
    const authUser: AuthUser = {
      id: Number(u.id),
      username: u.username ?? u.email ?? "",
      role: roleLower as Role,
    };
    setUser(authUser);
    return authUser;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const res = await api.post("/auth/signup", data);
      return res.status === 201 || res.status === 200;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {});
    } finally {
      localStorage.removeItem("accessToken");
      setAuthToken(undefined);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken: localStorage.getItem("accessToken"), login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
