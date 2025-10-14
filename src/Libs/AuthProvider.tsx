import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router";

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
  const navigate = useNavigate();

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

  const login = useCallback(
    async (username: string, password: string) => {
      try {
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

        switch (authUser.role) {
          case "superadmin":
            navigate("/super/home", { replace: true });
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

        return authUser;
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [navigate]
  );

  const register = useCallback(async (data: any) => {
    const res = await axios.post("http://localhost:3000/api/auth/signup", data);
    return res.status === 200 || res.status === 201;
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

    await axios.post(
      "http://localhost:3000/api/auth/logout",
      {},
      { withCredentials: true }
    );

    setUser(null);

    // redirect ตาม role
  }, [navigate, user]);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{ user, accessToken: null, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
