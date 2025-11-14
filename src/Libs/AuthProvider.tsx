import axios from "axios";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

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
  login: (
    username: string,
    password: string
  ) => Promise<{ user: AuthUser; navigateToFirstPage: () => void }>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const res = await axios.get(`${apiUrl}/auth/me`, {
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

  const login = useCallback(
    async (username: string, password: string) => {
      console.log('login', 1)
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
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

        const navigateToFirstPage = () => {
          switch (authUser.role) {
            case "superadmin":
              navigate("super/communities", { replace: true });
              break;
            case "admin":
              navigate("/admin/home", { replace: true });
              break;
            case "member":
              navigate("/member/home", { replace: true });
              break;
            case "tourist":
              navigate("/tourist/home", { replace: true });
              break;
            default:
              navigate("/", { replace: true });
              break;
          }
        };

        return {
          user: authUser,
          navigateToFirstPage: navigateToFirstPage,
        };
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [navigate]
  );

  /*
   * ฟังก์ชัน : register
   * คำอธิบาย : เรียก API /auth/signup เพื่อสมัครสมาชิกใหม่
   */
  const register = useCallback(async (data: RegisterData) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const backendUrl = apiUrl.replace("/api", "");
      const res = await axios.post(`${backendUrl}/auth/signup`, data);
      return res.status === 201 || res.status === 200;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!user?.role) return;
      const currentRole = user.role.toLowerCase();
      switch (currentRole) {
        case "tourist":
          navigate("/guest/home", { replace: true });
          break;
        default:
          navigate("/guest/partner/login", { replace: true });
          break;
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
    await new Promise((r) => setTimeout(r, 50));

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true });

    setUser(null);

    // redirect ตาม role
  }, [navigate, user]);


  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, accessToken: null, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
