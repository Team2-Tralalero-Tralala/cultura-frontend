/*
 * คำอธิบาย : Page Component สำหรับหน้าเข้าสู่ระบบของ "นักท่องเที่ยว (Tourist)"
 * ใช้ AuthLayout ในการจัด Layout ของหน้า (โลโก้, สีพื้นหลัง, ปุ่มไปยังหน้าสมัครสมาชิก)
 * และใช้ LoginTouristCard เป็นฟอร์มเข้าสู่ระบบ
 */

import Button from "@/Components/Button";
import { LoginTouristCard } from "../Components/LoginTouristCard";
import AuthLayout from "../Layouts/AuthLayout";
import { Link } from "react-router";
import { ButtonType } from "@/Types/Button";
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
  return (
    <AuthLayout
      rightLabel="ยังไม่มีบัญชี"
      rightButton={
        <Link to="/register">
          <Button type={ButtonType.ConfirmTourist} htmlType="button">
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
    </AuthLayout>
  );
}
