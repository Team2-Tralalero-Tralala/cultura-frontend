/*
 * คำอธิบาย : Context สำหรับการจัดการ Authentication ในฝั่ง Client
 * ประกอบด้วย AuthProvider ที่ห่อหุ้ม React tree และ AuthContext สำหรับแชร์ข้อมูลผู้ใช้
 * ฟังก์ชันที่ให้บริการ ได้แก่ login, register, logout โดยเชื่อมต่อกับ Backend API
 */
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

/*
 * ฟังก์ชัน : AuthProvider
 * คำอธิบาย : Component ที่ห่อหุ้ม React tree เพื่อให้ component ลูกใช้ AuthContext ได้
 * Input : children (ReactNode)
 * Output : <AuthContext.Provider> พร้อมค่าของ user, accessToken และ method ต่าง ๆ
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  /*
   * ฟังก์ชัน : login
   * คำอธิบาย : เรียก API /auth/login เพื่อตรวจสอบผู้ใช้และบันทึก user ไว้ใน state
   * Input : username, password
   * Output : AuthUser (id, username, role)
   */
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
  /*
   * ฟังก์ชัน : register
   * คำอธิบาย : เรียก API /auth/signup เพื่อสมัครสมาชิกใหม่
   * Input : RegisterData (username, password, email, fname, lname, phone, role)
   * Output : boolean (true ถ้าสมัครสำเร็จ, false ถ้าล้มเหลว)
   */
  const register = useCallback(async (data: RegisterData) => {
    try {
      const res = await axios.post(`${apiUrl}/auth/signup`, data);
      return res.status === 201 || res.status === 200;
    } catch {
      return false;
    }
  }, []);
  /*
   * ฟังก์ชัน : logout
   * คำอธิบาย : เรียก API /auth/logout เพื่อลบ session และเคลียร์ user ใน state
   * Input : -
   * Output : void
   */
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
