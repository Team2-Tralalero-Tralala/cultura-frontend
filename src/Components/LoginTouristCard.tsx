/*
 * คำอธิบาย : Component ฟอร์มเข้าสู่ระบบสำหรับผู้ใช้ทั่วไป (Tourist)
 * ใช้ Zod schema ในการตรวจสอบข้อมูล input, มีการ validate แบบ real-time,
 * และเรียกใช้งาน AuthContext เพื่อทำการ login
 */

import TextField from "./TextField";
import Button from "./Button";
import { Link } from "react-router-dom";
import { AuthContext } from "../Libs/AuthProvider";
import ModalBlocked from "./Modal/ModalBlocked";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useContext, useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้หรืออีเมล"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});
/*
 * คำอธิบาย : ฟอร์มเข้าสู่ระบบสำหรับ Tourist
 * Input : -
 * Output : React Component ที่แสดงฟอร์ม login และจัดการ redirect/error
 */
export function LoginTouristCard() {
  const [showBlocked, setShowBlocked] = useState(false);
  const { login } = useContext(AuthContext);
  // State สำหรับควบคุม input และ error
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  /*
   * คำอธิบาย : ตรวจสอบค่าของฟิลด์เดียว (username หรือ password) และอัปเดต formErrors
   * Input : field ("username" | "password"), value (string)
   * Output : - (อัปเดต state formErrors)
   */
  const validateField = (field: "username" | "password", value: string) => {
    const result = loginSchema.safeParse({
      username: field === "username" ? value : username,
      password: field === "password" ? value : password,
    });
    setFormErrors((prev) => ({
      ...prev,
      [field]: result.success
        ? undefined
        : result.error.issues.find((issue) => issue.path[0] === field)?.message,
    }));
  };

  type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  /**
   * คำอธิบาย : Handler เมื่อกรอก username
   * Input : event (React.ChangeEvent<FormElement>)
   * Output : -
   */
  const handleUsernameChange = (event: React.ChangeEvent<FormElement>) => {
    const value = event.target.value;
    setUsername(value);
    validateField("username", value);
  };
  /**
   * คำอธิบาย : Handler เมื่อกรอกรหัสผ่าน
   * Input : event (React.ChangeEvent<FormElement>)
   * Output : -
   */
  const handlePasswordChange = (event: React.ChangeEvent<FormElement>) => {
    const value = event.target.value;
    setPassword(value);
    validateField("password", value);
  };

  /*
   * คำอธิบาย : จัดการ event เมื่อผู้ใช้กด submit
   * Input : event (React.FormEvent)
   * Output :
   *   - redirect → /tourist ถ้า role == tourist
   *   - setError หรือ ModalBlocked ถ้าไม่ผ่าน
   */
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFormErrors({});
    setIsLoading(true);

    // Validate with Zod
    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      const errors: { username?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === "username") errors.username = err.message;
        if (err.path[0] === "password") errors.password = err.message;
      });
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }
    try {
      const loggedInUser = await login(username, password); // ให้ login return user

      if (loggedInUser.user.role !== "tourist") {
        setError("ไม่พบบัญชี");
      } else {
        loggedInUser.navigateToFirstPage();
      }
    } catch (error: any) {
      const blockedMsg = error?.response?.data?.message;
      const isBlocked = blockedMsg.includes("is blocked");

      // กรณี User is blocked
      if (isBlocked) {
        if (blockedMsg && !blockedMsg.includes("tourist")) {
          setError("ไม่พบบัญชี");
        } else {
          setError("บัญชีนี้ถูกระงับการใช้งาน โปรดติดต่อผู้ดูแลระบบ");
          setShowBlocked(true);
        }
        setIsLoading(false);
        return;
      }

      // ส่ง error ภาษาไทยมาแสดง
      const backendMsg = error?.response?.data?.message;
      setError(backendMsg);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" flex shadow-auth-card p-10 rounded-auth-card">
      <form className="w-sm space-y-1" onSubmit={handleLogin}>
        <div className="text-26 text-center">เข้าสู่ระบบ</div>
        <TextField
          id="username"
          label="ชื่อผู้ใช้ / อีเมล"
          required
          placeholder="ป้อนชื่อผู้ใช้หรืออีเมล"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          error={!!formErrors.username}
          helperText={formErrors.username}
        />

        <TextField
          id="password"
          label="รหัสผ่าน"
          required
          placeholder="ป้อนรหัสผ่าน"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          error={!!formErrors.password}
          helperText={formErrors.password}
        />

        <div className="flex items-center justify-between mb-3 min-h-[24px]">
          {/* Error message: always reserve space, align right */}
          <p className="text-sm text-red-600 min-h-[24px]">{error ? error : "\u00A0"}</p>
          <Link to="/forgot-password" className="text-right whitespace-nowrap">
            ลืมรหัสผ่าน
          </Link>
        </div>
        <Button type="confirm-tourist" htmlType="submit">
          {isLoading ? <CircularProgress color="inherit" size="28px" /> : "เข้าสู่ระบบ"}
        </Button>
      </form>
      <ModalBlocked open={showBlocked} onClose={() => setShowBlocked(false)} />
    </div>
  );
}
