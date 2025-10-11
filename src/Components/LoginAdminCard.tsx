import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "./TextField";
import Button from "./Button";
import ModalBlocked from "./ModalBlocked";
import { useAuth } from "@/Libs/useAuth";

const loginSchema = z.object({
  username: z.string().min(1, "กรุณาป้อนอีเมล"),
  password: z.string().min(1, "กรุณาป้อนรหัสผ่าน"),
});

const redirectByRole: Record<string, string> = {
  superadmin: "/super/communities",
  admin: "/admin/home",
  member: "/member/home",
  tourist: "/guest/home",
};

export function LoginAdminCard() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{ username?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);

  const validateField = (field: "username" | "password", value: string) => {
    const result = loginSchema.safeParse({
      username: field === "username" ? value : username,
      password: field === "password" ? value : password,
    });
    setFormErrors((prev) => ({
      ...prev,
      [field]: result.success
        ? undefined
        : result.error.issues.find((i) => i.path[0] === field)?.message,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});
    setIsLoading(true);

    const parsed = loginSchema.safeParse({ username, password });
    if (!parsed.success) {
      const errs: typeof formErrors = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as "username" | "password"] = i.message));
      setFormErrors(errs);
      setIsLoading(false);
      return;
    }

    try {
      const user = await login(username, password);

      if (user.role === "tourist") {
        setError("ไม่พบบัญชี");
        return;
      }

      const to = redirectByRole[user.role] ?? "/";
      navigate(to, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "";
      const isBlocked = /blocked|ระงับ/i.test(msg);

      if (isBlocked) {
        if (/tourist/i.test(msg)) setError("ไม่พบบัญชี");
        else {
          setError("บัญชีนี้ถูกระงับการใช้งาน โปรดติดต่อผู้ดูแลระบบ");
          setShowBlocked(true);
        }
      } else {
        setError(msg || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex shadow-auth-card p-10 rounded-auth-card">
      <form className="w-full max-w-sm space-y-3" onSubmit={handleLogin}>
        <div className="text-[26px] text-center">เข้าสู่ระบบวิสาหกิจชุมชน</div>

        <TextField
          id="username"
          label="อีเมล"
          required
          placeholder="ป้อนชื่ออีเมล"
          type="text"
          value={username}
          onChange={(e) => {
            const v = (e.target as HTMLInputElement).value;
            setUsername(v);
            validateField("username", v);
          }}
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
          onChange={(e) => {
            const v = (e.target as HTMLInputElement).value;
            setPassword(v);
            validateField("password", v);
          }}
          error={!!formErrors.password}
          helperText={formErrors.password}
        />

        <div className="flex items-center justify-between min-h-[24px]">
          <p className="text-sm text-red-600 min-h-[24px]">{error || "\u00A0"}</p>
          <Link to="/forgot-password" className="text-sm whitespace-nowrap hover:underline">
            ลืมรหัสผ่าน
          </Link>
        </div>

        <Button type="confirm-admin" htmlType="submit" className="w-full">
          {isLoading ? <CircularProgress color="inherit" size="28px" /> : "เข้าสู่ระบบ"}
        </Button>
      </form>

      <ModalBlocked open={showBlocked} onClose={() => setShowBlocked(false)} />
    </div>
  );
}
