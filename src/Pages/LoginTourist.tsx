/*
 * คำอธิบาย : Page Component สำหรับหน้าเข้าสู่ระบบของ "นักท่องเที่ยว (Tourist)"
 * ใช้ AuthLayout ในการจัด Layout ของหน้า (โลโก้, สีพื้นหลัง, ปุ่มไปยังหน้าสมัครสมาชิก)
 * และใช้ LoginTouristCard เป็นฟอร์มเข้าสู่ระบบ
 */

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import { LoginTouristCard } from "../Components/LoginTouristCard";
import ServerMaintenanceModal from "../Components/Modal/ServerMaintenanceModal";
import AuthLayout from "../Layouts/AuthLayout";
import { fetchServerStatus } from "@/Services/server-service";
/*
 * ฟังก์ชัน : LoginTourist
 * คำอธิบาย : แสดงหน้าเข้าสู่ระบบสำหรับ Tourist
 * โดยประกอบด้วย:
 *   - Layout พื้นฐานจาก AuthLayout
 *   - ปุ่ม "ลงทะเบียน" สำหรับไปยังหน้าสมัครสมาชิก
 *   - ฟอร์มเข้าสู่ระบบ (LoginTouristCard)
 * Input : -
 * Output : React Component ที่ render หน้า Login ของ Tourist
 */
export default function LoginTourist() {
  const navigate = useNavigate();
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(true);

  /*
   * คำอธิบาย : ตรวจสอบสถานะเซิร์ฟเวอร์
   * Input : ไม่มี
   * Output :
   *   - ถ้า login แล้ว → เปิด modal
   *   - ถ้ายังไม่ login (guest) → แสดง banner (ไม่บล็อกการกด login)
   */
  const checkServerStatus = async () => {
    try {
      const statusResponse = await fetchServerStatus();
      const isOffline = !statusResponse.data.serverOnline;

      if (!isOffline) {
        setIsMaintenanceModalOpen(false);
        return;
      }

      // server offline
      setIsMaintenanceModalOpen(true);
    } catch (error) {
      console.error("Error checking server status:", error);
      // ถ้าเกิด error อาจเป็นเพราะ server offline:
      // - guest → banner
      setIsMaintenanceModalOpen(true);
    }
  };

  // useEffect สำหรับโหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    // ตรวจสอบสถานะเซิร์ฟเวอร์เสมอ:
    // - guest: แสดง banner
    // - login: แสดง modal
    checkServerStatus();
  }, []);

  return (
    <AuthLayout
      rightLabel="ยังไม่มีบัญชี"
      rightButton={
        <Link to="/guest/signup">
          <Button type="confirm-tourist" htmlType="button">
            ลงทะเบียน
          </Button>
        </Link>
      }
      color={"tourist"}
      logo={"/logo-black.png"}
    >
      <div className="min-h-screen grid place-items-center px-4">
        <LoginTouristCard />
      </div>

      <ServerMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => {
          setIsMaintenanceModalOpen(false);
          navigate("/", { replace: true });
        }}
      />
    </AuthLayout>
  );
}
