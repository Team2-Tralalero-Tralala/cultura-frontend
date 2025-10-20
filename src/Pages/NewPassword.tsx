import Button from "@/Components/Button";
import AuthLayout from "@/Layouts/AuthLayout";
import { Link } from "react-router-dom";
import { NewPasswordCard } from "@/Components/NewPasswordCard";

export default function NewPassword() {
  return (
    <AuthLayout
      rightLabel="ยังไม่มีบัญชี"
      rightButton={
        <Link to="/guest/partner/register">
          <Button type="confirm-admin" htmlType="button">
            ลงทะเบียน
          </Button>
        </Link>
      }
      color="admin"
      logo="/logo-white.png"
    >
      <div className="w-full max-w-md mx-auto px-4">
        <NewPasswordCard />
      </div>
    </AuthLayout>
  );
}
