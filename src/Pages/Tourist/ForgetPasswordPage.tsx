/*
 * คำอธิบาย : หน้า TOURIST ลืมรหัสผ่าน (Guest flow)
 * Route: /guest/forget-password
 * Flow: ระบุตัวตน -> ตั้งรหัสผ่านใหม่ -> สำเร็จ
 */

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthLayout from "@/Layouts/AuthLayout";
import Button from "@/Components/Button";
import TextField from "@/Components/TextField";
import BoxDateInput from "@/Components/calendar/input_calendar/BoxDateInput";
import api from "@/Libs/api";
import { SuccessCard } from "@/Components/SuccessCard";
import { Icon } from "@iconify/react";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

type Step = "identify" | "set" | "success";

function formatToBEString(dateAD: Date) {
  const pad2 = (n: number) => n.toString().padStart(2, "0");
  const dd = pad2(dateAD.getDate());
  const mm = pad2(dateAD.getMonth() + 1);
  const yyyyBE = String(dateAD.getFullYear() + 543);
  return `${dd}/${mm}/${yyyyBE}`;
}

export default function ForgetPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("identify");

  const [contact, setContact] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [changePasswordCode, setChangePasswordCode] = useState<string | null>(
    sessionStorage.getItem("changePasswordCode")
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strengthHint = useMemo(() => {
    if (!newPassword) return null;
    if (!passwordRule.test(newPassword)) {
      return (
        <div className="mt-1 text-xs">
          <ul className="list-disc pl-4 space-y-0.5">
            <li>ความยาวอย่างน้อย 8 ตัวอักษร</li>
            <li>ประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z)</li>
            <li>ประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ (A-Z)</li>
            <li>ประกอบด้วยตัวเลข (0-9)</li>
          </ul>
        </div>
      );
    }
    return (
      <div className="mt-1 text-xs text-emerald-600">
        <Icon icon="mdi:check" className="inline mr-1" />
        รหัสผ่านปลอดภัย
      </div>
    );
  }, [newPassword]);

  const canSubmitIdentify = useMemo(() => {
    return contact.trim().length > 0 && birthDate instanceof Date;
  }, [contact, birthDate]);

  const canSubmitSet = useMemo(() => {
    if (!changePasswordCode) return false;
    if (!newPassword || !confirmNewPassword) return false;
    if (newPassword !== confirmNewPassword) return false;
    if (!passwordRule.test(newPassword)) return false;
    return true;
  }, [changePasswordCode, newPassword, confirmNewPassword]);

  async function handleIdentifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    if (!canSubmitIdentify || !birthDate) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post("/auth/forget-password", {
        contact: contact.trim(),
        birthDateBE: formatToBEString(birthDate),
      });

      const code = res?.data?.data?.changePasswordCode as string | undefined;
      if (!code) throw new Error("ไม่พบ changePasswordCode จากระบบ");

      sessionStorage.setItem("changePasswordCode", code);
      setChangePasswordCode(code);
      setStep("set");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    if (!canSubmitSet || !changePasswordCode) {
      setError("ข้อมูลไม่ครบหรือรูปแบบรหัสผ่านไม่ถูกต้อง");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/auth/set-password", {
        changePasswordCode,
        newPassword,
      });

      sessionStorage.removeItem("changePasswordCode");
      setChangePasswordCode(null);
      setStep("success");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
      color="tourist"
      logo="/logo-black.png"
    >
      <div className="min-h-screen grid place-items-center px-4">
        {step === "success" ? (
          <SuccessCard message="เปลี่ยนรหัสผ่านสำเร็จ!" link="/guest/login" />
        ) : (
          <div className="flex shadow-auth-card p-10 rounded-auth-card bg-white">
            {step === "identify" && (
              <form
                className="w-sm space-y-4"
                onSubmit={handleIdentifySubmit}
                noValidate
              >
                <div className="text-26 text-center">ลืมรหัสผ่าน</div>
                <TextField
                  id="contact"
                  label="อีเมล / โทรศัพท์"
                  required
                  placeholder="ป้อนอีเมลหรือเบอร์โทรศัพท์"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />

                <BoxDateInput
                  label="วัน-เดือน-ปีเกิด (พ.ศ)"
                  required
                  value={birthDate}
                  onChange={(d) => setBirthDate(d)}
                  placeholder="วว/ดด/ปปปป"
                  minDate={new Date(1900, 0, 1)}
                  maxDate={new Date()}
                />

                <div className="flex items-center justify-between min-h-[24px]">
                  <p className="text-sm text-red-600 min-h-[24px]">
                    {error ? error : "\u00A0"}
                  </p>
                </div>

                <Button type="confirm-tourist" htmlType="submit">
                  {isSubmitting ? "กำลังดำเนินการ..." : "ถัดไป"}
                </Button>
              </form>
            )}

            {step === "set" && (
              <form
                className="w-sm space-y-4"
                onSubmit={handleSetPasswordSubmit}
                noValidate
              >
                <div className="text-26 text-center">สร้างรหัสผ่านใหม่</div>

                <TextField
                  id="newPassword"
                  label="รหัสผ่านใหม่"
                  required
                  placeholder="ป้อนรหัสผ่านใหม่"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={!!newPassword && !passwordRule.test(newPassword)}
                />
                <div
                  className={`text-xs ${
                    !newPassword
                      ? "text-gray-400"
                      : passwordRule.test(newPassword)
                        ? "text-emerald-600"
                        : "text-red-500"
                  }`}
                >
                  {strengthHint}
                </div>

                <TextField
                  id="confirmNewPassword"
                  label="ยืนยันรหัสผ่านใหม่"
                  required
                  placeholder="ป้อนรหัสผ่านใหม่อีกครั้ง"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  error={!!confirmNewPassword && newPassword !== confirmNewPassword}
                  helperText={
                    !!confirmNewPassword && newPassword !== confirmNewPassword
                      ? "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน"
                      : ""
                  }
                />

                <div className="flex items-center justify-between min-h-[24px]">
                  <p className="text-sm text-red-600 min-h-[24px]">
                    {error ? error : "\u00A0"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="w-1/2">
                    <Button
                      type="cancel"
                      htmlType="button"
                      onClick={() => {
                        if (isSubmitting) return;
                        setError(null);
                        setNewPassword("");
                        setConfirmNewPassword("");
                        sessionStorage.removeItem("changePasswordCode");
                        setChangePasswordCode(null);
                        setStep("identify");
                      }}
                    >
                      ย้อนกลับ
                    </Button>
                  </div>
                  <div className="w-1/2">
                    <Button type="confirm-tourist" htmlType="submit">
                      {isSubmitting ? "กำลังบันทึก..." : "ถัดไป"}
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    className="text-sm text-gray-600 underline"
                    onClick={() => navigate("/guest/login")}
                  >
                    กลับไปหน้าเข้าสู่ระบบ
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}


