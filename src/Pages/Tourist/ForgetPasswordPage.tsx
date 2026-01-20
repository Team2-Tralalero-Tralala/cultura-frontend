/**
 * คำอธิบาย: หน้า TOURIST ลืมรหัสผ่าน (Guest flow)s
 */

import Button from "@/Components/Button";
import { SuccessCard } from "@/Components/SuccessCard";
import TextField from "@/Components/TextField";
import BoxDateInput from "@/Components/calendar/InputCalendar/BoxDateInput";
import AuthLayout from "@/Layouts/AuthLayout";
import api from "@/Libs/Api";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

type Step = "identify" | "set" | "success";

/*
 * คำอธิบาย : แปลงวันที่ ค.ศ. (AD) เป็นรูปแบบวัน/เดือน/ปี พ.ศ. เพื่อส่งให้ API
 * Input : gregorianDate (Date) - วันที่รูปแบบ ค.ศ.
 * Output : string รูปแบบ "dd/mm/yyyy" (พ.ศ.)
 */
function formatGregorianDateToBuddhistEraString(gregorianDate: Date) {
  const toTwoDigitString = (value: number) => value.toString().padStart(2, "0");
  const dayOfMonthString = toTwoDigitString(gregorianDate.getDate());
  const monthString = toTwoDigitString(gregorianDate.getMonth() + 1);
  const buddhistYearString = String(gregorianDate.getFullYear() + 543);
  return `${dayOfMonthString}/${monthString}/${buddhistYearString}`;
}

/*
 * คำอธิบาย : แปลง error จาก API/Runtime ให้เป็นข้อความสำหรับแสดงผล
 * Input : error (unknown) - error ที่ catch ได้จาก try/catch
 * Output : string ข้อความที่เหมาะสมสำหรับแสดงผล
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const errorObject = error as {
      response?: { data?: { message?: unknown } };
      message?: unknown;
    };

    const apiMessage = errorObject.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
      return apiMessage;
    }

    const runtimeMessage = errorObject.message;
    if (typeof runtimeMessage === "string" && runtimeMessage.trim().length > 0) {
      return runtimeMessage;
    }
  }

  return "เกิดข้อผิดพลาด กรุณาลองใหม่";
}

/*
 * คำอธิบาย : หน้า TOURIST ลืมรหัสผ่าน (Guest flow)
 * Input: -
 * Output: JSX.Element
 */
export default function ForgetPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("identify");

  const [contact, setContact] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [changePasswordCode, setChangePasswordCode] = useState<string | null>(
    sessionStorage.getItem("changePasswordCode"),
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * คำอธิบาย : แสดงคำแนะนำความปลอดภัยของรหัสผ่านตามเงื่อนไข (passwordRule)
   * Input : newPassword (string) - รหัสผ่านใหม่จาก state
   * Output : ReactNode สำหรับ hint หรือ null หากยังไม่ต้องแสดง
   */
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

  /*
   * คำอธิบาย : ตรวจสอบความพร้อมของฟอร์มขั้นตอน "ระบุตัวตน"
   * Input : contact (string), birthDate (Date | null)
   * Output : boolean - true เมื่อกรอกข้อมูลครบ
   */
  const canSubmitIdentify = useMemo(() => {
    return contact.trim().length > 0 && birthDate instanceof Date;
  }, [contact, birthDate]);

  /*
   * คำอธิบาย : ตรวจสอบความพร้อมของฟอร์มขั้นตอน "ตั้งรหัสผ่านใหม่"
   * Input : changePasswordCode, newPassword, confirmNewPassword
   * Output : boolean - true เมื่อข้อมูลครบ/รหัสผ่านผ่านเงื่อนไข/ยืนยันตรงกัน
   */
  const canSubmitSet = useMemo(() => {
    if (!changePasswordCode) return false;
    if (!newPassword || !confirmNewPassword) return false;
    if (newPassword !== confirmNewPassword) return false;
    if (!passwordRule.test(newPassword)) return false;
    return true;
  }, [changePasswordCode, newPassword, confirmNewPassword]);

  /*
   * คำอธิบาย : ส่งข้อมูลระบุตัวตนเพื่อขอรหัสยืนยันสำหรับเปลี่ยนรหัสผ่าน (changePasswordCode)
   * Input : event (React.FormEvent) - event จากการ submit form
   * Output :
   *    - เรียก API /auth/forget-password
   *    - บันทึก changePasswordCode ลง sessionStorage และเปลี่ยน step ไป "set"
   */
  async function handleIdentifySubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmitting) return;
    setError(null);
    if (!canSubmitIdentify || !birthDate) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post("/auth/forget-password", {
        contact: contact.trim(),
        birthDateBE: formatGregorianDateToBuddhistEraString(birthDate),
      });

      const changePasswordCodeFromApi = response?.data?.data?.changePasswordCode as
        | string
        | undefined;
      if (!changePasswordCodeFromApi) {
        throw new Error("ไม่พบ changePasswordCode จากระบบ");
      }

      sessionStorage.setItem("changePasswordCode", changePasswordCodeFromApi);
      setChangePasswordCode(changePasswordCodeFromApi);
      setStep("set");
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * คำอธิบาย : ส่งข้อมูลตั้งรหัสผ่านใหม่ด้วย changePasswordCode
   * Input : event (React.FormEvent) - event จากการ submit form
   * Output :
   *    - เรียก API /auth/set-password
   *    - ลบ changePasswordCode จาก sessionStorage และเปลี่ยน step ไป "success"
   */
  async function handleSetPasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
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
    } catch (error: unknown) {
      setError(getErrorMessage(error));
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
              <form className="w-sm space-y-4" onSubmit={handleIdentifySubmit} noValidate>
                <div className="text-26 text-center">ลืมรหัสผ่าน</div>
                <TextField
                  id="contact"
                  label="อีเมล / โทรศัพท์"
                  required
                  placeholder="ป้อนอีเมลหรือเบอร์โทรศัพท์"
                  type="text"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
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
                  <p className="text-sm text-red-600 min-h-[24px]">{error ? error : "\u00A0"}</p>
                </div>

                <Button type="confirm-tourist" htmlType="submit">
                  {isSubmitting ? "กำลังดำเนินการ..." : "ถัดไป"}
                </Button>
              </form>
            )}

            {step === "set" && (
              <form className="w-sm space-y-4" onSubmit={handleSetPasswordSubmit} noValidate>
                <div className="text-26 text-center">สร้างรหัสผ่านใหม่</div>

                <TextField
                  id="newPassword"
                  label="รหัสผ่านใหม่"
                  required
                  placeholder="ป้อนรหัสผ่านใหม่"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
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
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                  error={!!confirmNewPassword && newPassword !== confirmNewPassword}
                  helperText={
                    !!confirmNewPassword && newPassword !== confirmNewPassword
                      ? "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน"
                      : ""
                  }
                />

                <div className="flex items-center justify-between min-h-[24px]">
                  <p className="text-sm text-red-600 min-h-[24px]">{error ? error : "\u00A0"}</p>
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
