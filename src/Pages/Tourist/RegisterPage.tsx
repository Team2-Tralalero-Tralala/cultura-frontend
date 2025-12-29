/**
 * คำอธิบาย: หน้าสำหรับสมัครบัญชีของนักท่องเที่ยว
 */
import Button from "@/Components/Button";
import BoxDateInput from "@/Components/calendar/input_calendar/BoxDateInput";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import TextField from "@/Components/TextField";
import AuthLayout from "@/Layouts/AuthLayout";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router";
import z from "zod";
import { SuccessCard } from "@/Components/SuccessCard";
import { ModalAlert } from "@/Components/Modal/ModalAlert";

/**
 * คำอธิบาย: registerSchema (Schema สำหรับตรวจสอบความถูกต้องของข้อมูลลงทะเบียนด้วย Zod)
 * input: ข้อมูลจากฟอร์ม (Object)
 * output: ผลลัพธ์การตรวจสอบ (Success หรือ Error)
 */
const registerSchema = z.object({
  fname: z.string().min(1, "กรุณาป้อนชื่อ"),
  lname: z.string().min(1, "กรุณาป้อนนามสกุล"),
  username: z
    .string()
    .min(4, "ความยาวอย่างน้อย 4 ตัวอักษร")
    .regex(/^[a-zA-Z0-9]+$/, "ประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข"),
  email: z.string().min(1, "กรุณาป้อนอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
    .regex(/[a-zA-Z]/, "ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ")
    .regex(/[a-z]/, "ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z)")
    .regex(/[A-Z]/, "ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ (A-Z)")
    .regex(/[0-9]/, "ต้องประกอบด้วยตัวเลข (0-9)"),
  passwordConfirm: z.string().min(1, "กรุณาป้อนรหัสผ่านอีกครั้ง"),
  phone: z
    .string()
    .min(9, "กรุณากรอกหมายเลขโทรศัพท์ให้ครบ 9 หลัก")
    .max(9, "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง")
    .regex(/^\d+$/, "กรุณากรอกเฉพาะตัวเลข"),
  birthDate: z
    .union([z.date(), z.null(), z.undefined()])
    .refine((dateValue) => dateValue instanceof Date, {
      message: "กรุณาระบุวัน-เดือน-ปีเกิด",
    }),
  gender: z.string().min(1, "กรุณาเลือกเพศ"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกอำเภอ"),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล"),
  postalCode: z.string().min(1, "กรุณาป้อนรหัสไปรษณีย์"),
  role: z.string().min(1, "กรุณาเลือกประเภทผู้ใช้"),
});

type RegisterSchema = z.infer<typeof registerSchema>;

/**
 * คำอธิบาย: RegisterPage (ฟังก์ชันสำหรับหน้าสมัครสมาชิก)
 * input: -
 * output: JSX.Element (หน้าสมัครสมาชิก)
 */
export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RegisterSchema, string>>>({});
  const [formData, setFormData] = useState<RegisterSchema>({
    fname: "",
    lname: "",
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    birthDate: undefined as unknown as Date,
    province: "",
    gender: "",
    district: "",
    subDistrict: "",
    postalCode: "",
    role: "tourist",
  });
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  /**
   * คำอธิบาย: validateField (ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลราย field)
   * input: field (ชื่อ field), value (ค่าของ field นั้น)
   * output: Boolean (true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง)
   */
  function validateField(field: keyof RegisterSchema, value: any) {
    if (field === "passwordConfirm") {
      if (value !== formData.password) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          passwordConfirm: "รหัสผ่านไม่ตรงกัน",
        }));
        return false;
      }
    }

    const result = registerSchema.shape[field].safeParse(value);
    if (!result.success) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [field]: result.error.issues[0].message,
      }));
      return false;
    } else {
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    }
  }

  /**
   * คำอธิบาย: validateAll (ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลทั้งฟอร์ม)
   * input: -
   * output: Boolean (true ถ้าฟอร์มถูกต้องทั้งหมด, false ถ้ามี error)
   */
  function validateAll() {
    const result = registerSchema.safeParse(formData);
    let isValid = result.success;
    const errors: Partial<Record<keyof RegisterSchema, string>> = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as keyof RegisterSchema] = issue.message;
        }
      });
    }

    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = "รหัสผ่านไม่ตรงกัน";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  /**
   * คำอธิบาย: handleFormSubmit (ฟังก์ชันจัดการการส่งฟอร์มลงทะเบียน)
   * input: -
   * output: - (ทำงานแบบ Async เพื่อเรียก API)
   */
  async function handleFormSubmit() {
    const isFormValid = validateAll();
    if (!isFormValid) return;

    try {
      setIsLoading(true);

      const { passwordConfirm, birthDate, ...submissionData } = formData;
      const payload = {
        ...submissionData,
        birthDate: birthDate,
        phone: `0${formData.phone}`,
      };

      await axios.post(`${API_URL}/auth/signup`, payload);
      setIsSuccess(true);
      setIsAlertOpen(true);
    } catch (error: any) {
      const backendError = error as { response: { data: { message: string } } };
      setIsAlertOpen(true);
      setAlertType("error");
      setAlertTitle("ลงทะเบียนไม่สำเร็จ");
      setAlertMessage(backendError?.response?.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * คำอธิบาย: handleTextInputChange (ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลในช่อง Input Text)
   * input: event (Event จากการพิมพ์ใน Input)
   * output: -
   */
  function handleTextInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { id, value } = event.target;
    const newFormData = { ...formData, [id]: value };
    setFormData(newFormData);
    validateField(id as keyof RegisterSchema, value);
  }

  /**
   * คำอธิบาย: handleGenderChange (ฟังก์ชันจัดการการเลือกเพศ)
   * input: event (Event จากการเลือก Radio Button)
   * output: -
   */
  function handleGenderChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    setFormData((prevData) => ({ ...prevData, gender: value }));
    validateField("gender", value);
  }

  /**
   * คำอธิบาย: handleDateChange (ฟังก์ชันจัดการการเลือกวันเกิด)
   * input: date (วันที่ที่เลือก)
   * output: -
   */
  function handleDateChange(date: Date | null) {
    setFormData((prevData) => ({ ...prevData, birthDate: date }));
    console.log(date);
    validateField("birthDate", date);
  }

  if (isSuccess) {
    return (
      <AuthLayout
        rightLabel="มีบัญชีอยู่แล้ว"
        rightButton={
          <Link to="/guest/login">
            <Button type="confirm-tourist" htmlType="button">
              เข้าสู่ระบบ
            </Button>
          </Link>
        }
        color="tourist"
        logo="/logo-black.png"
      >
        <div className="w-lg max-w-2xl mx-auto px-4">
          <SuccessCard />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      rightLabel="มีบัญชีอยู่แล้ว"
      rightButton={
        <Link to="/guest/login">
          <Button type="confirm-tourist" htmlType="button">
            เข้าสู่ระบบ
          </Button>
        </Link>
      }
      color="tourist"
      logo="/logo-black.png"
    >
      <div className="w-3xl mx-auto p-6 rounded-auth-card shadow-auth-card bg-white m-5">
        <h1 className="text-26 text-center pb-2 font-bold">ลงทะเบียน</h1>
        <div className="grid grid-cols-2 gap-x-7 gap-y-4">
          <div>
            <TextField
              id="fname"
              label="ชื่อ (ไม่ต้องใส่คำนำหน้า)"
              required
              placeholder="ชื่อจริง"
              type="text"
              value={formData.fname}
              onChange={handleTextInputChange}
              error={!!formErrors.fname}
              helperText={formErrors.fname}
            />
          </div>
          <div>
            <TextField
              id="lname"
              label="นามสกุล"
              required
              placeholder="นามสกุล"
              type="text"
              value={formData.lname}
              onChange={handleTextInputChange}
              error={!!formErrors.lname}
              helperText={formErrors.lname}
            />
          </div>
          <div>
            <TextField
              id="username"
              label="ชื่อผู้ใช้"
              required
              placeholder="ป้อนชื่อผู้ใช้"
              type="text"
              value={formData.username}
              onChange={handleTextInputChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
            />
            <div className="text-xs text-gray-500 pl-4 pt-2">
              <li>ความยาวอย่างน้อย 4 ตัวอักษร</li>
              <li>ควรประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข</li>
            </div>
          </div>
          <div>
            <TextField
              id="email"
              label="อีเมล"
              required
              placeholder="example@gmail.com"
              type="email"
              value={formData.email}
              onChange={handleTextInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
          </div>
          <div>
            <TextField
              id="password"
              label="รหัสผ่าน"
              required
              placeholder="ป้อนรหัสผ่าน"
              type="password"
              value={formData.password}
              onChange={handleTextInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            <div className="text-xs text-gray-500 pl-4 pt-2">
              <li>ความยาวอย่างน้อย 8 ตัวอักษร</li>
              <li>ประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z) พิมพ์ใหญ่ (A-Z)</li>
              <li>ประกอบด้วยตัวเลข (0-9)</li>
            </div>
          </div>
          <div>
            <TextField
              id="passwordConfirm"
              label="ยืนยันรหัสผ่าน"
              required
              placeholder="ป้อนรหัสผ่านอีกครั้ง"
              type="password"
              value={formData.passwordConfirm}
              onChange={handleTextInputChange}
              error={!!formErrors.passwordConfirm}
              helperText={formErrors.passwordConfirm}
            />
          </div>
          <div>
            <TextField
              id="phone"
              label="โทรศัพท์"
              required
              placeholder="หมายเลขโทรศัพท์"
              type="tel"
              value={formData.phone}
              onChange={handleTextInputChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />
          </div>
          <div>
            <div>
              <div className="flex items-center justify-between min-h-[28px]">
                <label className="block text-base font-semibold text-black">
                  วัน-เดือน-ปีเกิด (พ.ศ.) <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ml-2 transition-opacity whitespace-nowrap ${
                    formErrors.birthDate ? "text-red-600 opacity-100" : "opacity-0"
                  }`}
                >
                  {formErrors.birthDate || "placeholder"}
                </span>
              </div>
              <BoxDateInput
                required
                value={formData.birthDate || null}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>
        <div className="col-span-2 mt-2">
          <label className="block text-base font-semibold text-black mb-2">
            เพศ <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                value="MALE"
                name="gender"
                id="male"
                onChange={handleGenderChange}
                checked={formData.gender === "MALE"}
                className="appearance-none w-6 h-6 rounded-full border-2 border-gray-300 bg-white checked:bg-[#1DC9A0] checked:border-4 checked:border-white checked:ring-1 checked:ring-[#1DC9A0] cursor-pointer"
              />
              <label htmlFor="male" className="text-base text-black cursor-pointer">
                ชาย
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                value="FEMALE"
                name="gender"
                id="female"
                onChange={handleGenderChange}
                checked={formData.gender === "FEMALE"}
                className="appearance-none w-6 h-6 rounded-full border-2 border-gray-300 bg-white checked:bg-[#1DC9A0] checked:border-4 checked:border-white checked:ring-1 checked:ring-[#1DC9A0] cursor-pointer"
              />
              <label htmlFor="female" className="text-base text-black cursor-pointer">
                หญิง
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                value="NONE"
                name="gender"
                id="none"
                onChange={handleGenderChange}
                checked={formData.gender === "NONE"}
                className="appearance-none w-6 h-6 rounded-full border-2 border-gray-300 bg-white checked:bg-[#1DC9A0] checked:border-4 checked:border-white checked:ring-1 checked:ring-[#1DC9A0] cursor-pointer"
              />
              <label htmlFor="none" className="text-base text-black cursor-pointer">
                ไม่ระบุ
              </label>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <ThailandLocationSelector
            value={{
              province: formData.province,
              district: formData.district,
              subdistrict: formData.subDistrict,
              postalCode: formData.postalCode,
            }}
            onChange={(location: ThailandLocation) => {
              const newLocationData = {
                ...formData,
                province: location.province || "",
                district: location.district || "",
                subDistrict: location.subdistrict || "",
                postalCode: location.postalCode || "",
              };
              setFormData(newLocationData);
              setFormErrors((prevErrors) => {
                const updatedErrors = { ...prevErrors };
                if (location.province) delete updatedErrors.province;
                if (location.district) delete updatedErrors.district;
                if (location.subdistrict) delete updatedErrors.subDistrict;
                if (location.postalCode) delete updatedErrors.postalCode;
                return updatedErrors;
              });
            }}
            error={{
              province: !!formErrors.province,
              district: !!formErrors.district,
              subdistrict: !!formErrors.subDistrict,
              postalCode: !!formErrors.postalCode,
            }}
            helperText={{
              province: formErrors.province,
              district: formErrors.district,
              subdistrict: formErrors.subDistrict,
              postalCode: formErrors.postalCode,
            }}
          />
        </div>
        <div className="mt-4">
          <Button type="confirm-tourist" htmlType="button" onClick={handleFormSubmit}>
            {isLoading ? <CircularProgress color="inherit" size="28px" /> : "ลงทะเบียน"}
          </Button>
        </div>
        <ModalAlert
          open={isAlertOpen}
          type={alertType}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setIsAlertOpen(false)}
        />
      </div>
    </AuthLayout>
  );
}
