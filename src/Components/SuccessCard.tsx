/**
 * คำอธิบาย: Component สำหรับหน้าสำเร็จ
 */
import { Link } from "react-router";
import Button from "./Button";
import { Icon } from "@iconify/react";

type SuccessCardProps = {
  message?: string;
  link?: string;
};
/**
 * คำอธิบาย: SuccessCard (ฟังก์ชันสำหรับหน้าสำเร็จ)
 * input: message (ข้อความสำเร็จ), link (ลิงค์สำหรับการส่งข้อมูล)
 * output: JSX.Element (หน้าสำเร็จ)
 */
export function SuccessCard({
  message = "ลงทะเบียนสำเร็จ!",
  link = "/guest/login",
}: SuccessCardProps) {
  return (
    <div className="w-full mx-auto p-6 rounded-auth-card shadow-auth-card bg-white flex flex-col items-center justify-center min-h-[300px]">
      <div className="mb-6 rounded-full bg-green-500 p-4">
        <Icon icon="mdi:check" className="text-white w-16 h-16" />
      </div>
      <h2 className="text-2xl font-bold mb-6">{message}</h2>
      <Link to={link} className="w-full">
        <Button type="confirm-tourist" htmlType="button">
          เข้าสู่ระบบ
        </Button>
      </Link>
    </div>
  );
}
