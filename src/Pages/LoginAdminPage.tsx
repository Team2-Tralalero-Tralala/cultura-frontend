/**
 * คำอธิบาย : Component LoginAdminPage
 */
import Button from "@/Components/Button";
import AuthLayout from "@/Layouts/AuthLayout";
import { Link } from "react-router-dom";
import LoginAdminCard from "@/Components/LoginAdminCard";
/**
 * คำอธิบาย : Component LoginAdminPage
 * Input : ไม่มี
 * Output : React Component ที่แสดงหน้า Login Admin
 */
export default function LoginAdminPage() {
  return (
    <AuthLayout
      rightLabel="ยังไม่มีบัญชี"
      rightButton={
        <Link to="/guest/partner/register">
          <Button type="confirm-admin" htmlType="button">ลงทะเบียน</Button>
        </Link>
      }
      color="admin"
      logo="/logo-white.png"
    >
      <div className="w-full max-w-md mx-auto px-4">
        <LoginAdminCard />
      </div>
    </AuthLayout>
  );
}
