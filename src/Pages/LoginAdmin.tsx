/*
 * คำอธิบาย : Page Component สำหรับหน้าเข้าสู่ระบบของ "ผู้ดูแลระบบ (Admin)"
 * ใช้ AuthLayout ในการกำหนด Layout ของหน้า (โลโก้, สีพื้นหลัง, ปุ่มไปยังหน้า register)
 * และใช้ LoginAdminCard เป็นฟอร์มเข้าสู่ระบบ
 */
import Button from "@/Components/Button";
import AuthLayout from "../Layouts/AuthLayout";
import { Link } from "react-router";
import { ButtonType } from "@/Types/Button";
import { LoginAdminCard } from "@/Components/LoginAdminCard";
/*
 * ฟังก์ชัน : LoginAdmin
 * คำอธิบาย : แสดงหน้าเข้าสู่ระบบสำหรับ Admin
 * โดยประกอบด้วย:
 *   - Layout พื้นฐานจาก AuthLayout
 *   - ปุ่ม "ลงทะเบียน" สำหรับไปยังหน้าสมัครสมาชิก
 *   - ฟอร์มเข้าสู่ระบบ (LoginAdminCard)
 * Input : -
 * Output : React Component ที่ render หน้า Login ของ Admin
 */
export default function LoginAdmin() {
  return (
    <AuthLayout
      rightLabel="ยังไม่มีบัญชี"
      rightButton={
        <Link to="/register">
          <Button type={ButtonType.ConfirmAdmin} htmlType="button">
            ลงทะเบียน
          </Button>
        </Link>
      }
      color={"admin"}
      logo={"/logo-white.png"}
    >
      <div className="min-h-screen grid place-items-center px-4">
        <LoginAdminCard />
      </div>
    </AuthLayout>
  );
}
