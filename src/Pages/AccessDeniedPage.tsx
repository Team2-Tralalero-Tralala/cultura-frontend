/**
 * คำอธิบาย: หน้าสำหรับแสดงเมื่อผู้ใช้ไม่มีสิทธิ์เข้าถึง (Access Denied / 403)
 */
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router";
import Button from "@/Components/Button";
import { useAuth } from "@/Libs/UseAuth";
/**
 * คำอธิบาย: หน้าสำหรับแสดงเมื่อผู้ใช้ไม่มีสิทธิ์เข้าถึง (Access Denied / 403)
 */
export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // ตรวจสอบว่าเป็น tourist หรือไม่ ถ้าไม่มีข้อมูล user ก็ถือว่าเป็น tourist เป็นค่าเริ่มต้น
  const isTourist = !user || user.role === "tourist";

  const handleGoToLogin = async () => {
    let nextPath = "/guest/login";

    if (user) {
      if (user.role === "admin" || user.role === "superadmin" || user.role === "member") {
        nextPath = "/guest/partner/login";
      }
      await logout();
    }

    navigate(nextPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-auth-card shadow-auth-card p-8 text-center flex flex-col items-center">
        <div className="bg-red-100 p-4 rounded-full mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-75"></div>
          <ShieldAlert className="w-16 h-16 text-red-500 relative z-10" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
        <h2 className="text-xl font-semibold text-red-600 mb-6">Access Denied</h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          ขออภัย คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
          หรือเนื้อหาที่คุณพยายามเข้าถึงต้องการสิทธิ์ที่สูงกว่า
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Button
            type={isTourist ? "confirm-tourist" : "confirm-admin"}
            htmlType="button"
            onClick={() => navigate(-1)}
          >
            ย้อนกลับ
          </Button>

          <Button type="cancel" htmlType="button" onClick={handleGoToLogin}>
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    </div>
  );
}
