import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export type Role = "superadmin" | "admin" | "member" | "tourist";

export type AuthUser = {
  id: number;
  username: string;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (data: any) => Promise<boolean>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/auth/me", {
          withCredentials: true,
        });
        const { id, username, role } = res.data.data;
        const authUser: AuthUser = {
          id: id,
          username: username,
          role: role,
        };
        setUser(authUser);
      } catch (err) {
        setUser(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await axios.post(
      "http://localhost:3000/api/auth/login",
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

  const register = useCallback(async (data: any) => {
    const res = await axios.post("http://localhost:3000/api/auth/signup", data);
    return res.status === 200 || res.status === 201;
  }, []);

  const logout = useCallback(async () => {
    await axios.post(
      "http://localhost:3000/api/auth/logout",
      {},
      { withCredentials: true }
    );
    setUser(null);
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{ user, accessToken: null, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
