import React, { createContext, useState, useCallback } from "react";
import axios from "axios";

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

export type AuthUser = {
  id: number;
  username: string;
  role: Role;
};

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
const apiUrl = import.meta.env.VITE_API_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const res = await axios.post(
      `${apiUrl}/auth/login`,
      { username, password },
      { withCredentials: true }
    );
    const { user: u } = res.data.data;
    const authUser: AuthUser = {
      id: u.id,
      username: u.username,
      role: u.role.toLowerCase(),
    };
    setUser(authUser);
    return authUser;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const res = await axios.post(`${apiUrl}/auth/signup`, data);
      return res.status === 201 || res.status === 200;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken: null, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
