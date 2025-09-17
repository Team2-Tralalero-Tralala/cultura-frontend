/*
 * คำอธิบาย : Custom Hook สำหรับใช้งาน Authentication Context
 * ใช้เพื่อเข้าถึงข้อมูลผู้ใช้ (user) และฟังก์ชันที่เกี่ยวข้องกับการยืนยันตัวตน
 * ได้แก่ login, register, และ logout
 */

import { useContext } from "react";
import { AuthContext } from "./AuthProviders";
/*
 * ฟังก์ชัน : useAuth
 * คำอธิบาย : Hook ที่ดึงค่าและ method จาก AuthContext
 * เพื่อให้ component อื่น ๆ สามารถใช้งานได้สะดวกขึ้น
 * Input : -
 * Output :
 *   - user : ข้อมูลผู้ใช้ที่ล็อกอินอยู่ (หรือ null ถ้ายังไม่ล็อกอิน)
 *   - login : ฟังก์ชันเข้าสู่ระบบ
 *   - register : ฟังก์ชันสมัครสมาชิก
 *   - logout : ฟังก์ชันออกจากระบบ
 */
export const useAuth = () => {
  const { user, login, register, logout } = useContext(AuthContext);

  return { user, login, register, logout };
};
