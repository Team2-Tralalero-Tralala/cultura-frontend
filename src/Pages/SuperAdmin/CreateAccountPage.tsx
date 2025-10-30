/*
 * Component: CreateAccountPage
 * Description: หน้าสำหรับสร้างบัญชีผู้ใช้ใหม่ (Admin / Member / Tourist)
 * Author: Team 2 (Cultura)
 * Last Modified: 30 ตุลาคม 2568
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import * as z from "zod";
import { Modal } from "@/Components/Modal/Modal";
import { api } from "@/Libs/axios";
import TextField from "../../Components/TextField";
import Button from "../../Components/Button";
import SubmitButton from "../../Components/SubmitButton";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "../../Components/Selector/ThailandLocationSelector";
import CommunitySelector from "../../Components/Selector/CommunitySelector";
import AvatarUploader from "@/Components/AvatarUploader";

type RoleType = "Admin" | "Member" | "Tourist";

/* ---------------- Schema ---------------- */
const accountSchema = z.object({
  fname: z.string().min(1, "กรุณากรอกชื่อ"),
  lname: z.string().min(1, "กรุณากรอกนามสกุล"),
  username: z.string().min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z
    .string()
    .regex(/^0[0-9]{9}$/, "เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string(),

  birthDate: z
    .string()
    .min(1, "กรุณากรอกวัน/เดือน/ปีเกิด")
    .refine(
      (dateString) => {
        const dateObject = new Date(dateString);
        const currentDate = new Date();
        return !isNaN(dateObject.getTime()) && dateObject <= currentDate;
      },
      { message: "วันเกิดต้องเป็นวันที่ถูกต้อง และไม่เกินวันที่ปัจจุบัน" }
    )
    .optional(),

  gender: z
    .string()
    .min(1, "กรุณาเลือกเพศ")
    .refine((genderValue) => ["ชาย", "หญิง", "ไม่ระบุ"].includes(genderValue), {
      message: "เพศไม่ถูกต้อง",
    })
    .optional(),

  province: z.string().min(1, "กรุณาเลือกจังหวัด").optional(),
  district: z.string().min(1, "กรุณาเลือกอำเภอ").optional(),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล").optional(),
  postalCode: z.string().min(1, "กรุณาใส่รหัสไปรษณีย์").optional(),
});

/* ---------------- Interfaces ---------------- */
interface CreateAccountPageProps {
  defaultRole?: RoleType;
}

interface RoleSpecificData {
  communityId: string;
  gender: string;
  birthDate: string;
}

interface CreateAccountBody {
  roleId: number;
  fname: string;
  lname: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  profileImage?: string | null;
  memberOfCommunity?: number | null;
  gender?: "MALE" | "FEMALE" | "NONE";
  birthDate?: string | null;
  province?: string;
  district?: string;
  subDistrict?: string;
  postalCode?: string;
}

/* ---------------- Component ---------------- */
const CreateAccountPage: React.FC<CreateAccountPageProps> = ({
  defaultRole,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ดึง role จาก path
  const getRoleFromPath = (): RoleType => {
    if (defaultRole) return defaultRole;
    if (location.pathname.includes("member")) return "Member";
    if (location.pathname.includes("tourist")) return "Tourist";
    return "Admin";
  };

  const [role, setRole] = useState<RoleType>(getRoleFromPath());
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profileImage: null as File | null,
  });
  const [formErrors, setFormErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [roleSpecificData, setRoleSpecificData] = useState<RoleSpecificData>({
    communityId: "",
    gender: "",
    birthDate: "",
  });
  const [locationData, setLocationData] = useState<ThailandLocation>({
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setRole(getRoleFromPath());
  }, [location.pathname]);

  // ตรวจสอบความถูกต้องของข้อมูล
  const validateField = (fieldName?: string, fieldValue?: unknown) => {
    if (fieldName) {
      const result = accountSchema.safeParse({
        ...formData,
        [fieldName]: fieldValue,
      });
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: result.success
          ? undefined
          : result.error.issues.find((issue) => issue.path[0] === fieldName)
              ?.message,
      }));
      return result.success;
    } else {
      const result = accountSchema.safeParse(formData);
      if (!result.success) {
        const validationErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          validationErrors[issue.path[0] as string] = issue.message;
        });
        setFormErrors(validationErrors);
        return false;
      }
      setFormErrors({});
      return true;
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    const updatedFormData = { ...formData, [id]: value };
    setFormData(updatedFormData);
    validateField(id, value);
  };

  const handleAvatarChange = (file: File | null) => {
    if (!file) return;

    setFormData((prev) => ({ ...prev, profileImage: file }));

    console.log("📸 ได้ไฟล์ใหม่:", file.name);
  };

  const handleRoleSelect = (newRole: RoleType) => {
    if (role !== newRole) {
      setRole(newRole);
      navigate(`/super/account/${newRole.toLowerCase()}/create`, {
        replace: true,
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const isValid = validateField();
    if (!isValid) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน ❌");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน ❌");
      return;
    }

    try {
      let roleId = 2;
      if (role === "Member") roleId = 3;
      if (role === "Tourist") roleId = 4;

      const requestBody: CreateAccountBody = {
        roleId,
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        profileImage: formData.profileImage ? formData.profileImage.name : null,
      };

      if (role === "Member") {
        requestBody.memberOfCommunity =
          Number(roleSpecificData.communityId) || null;
      } else if (role === "Tourist") {
        requestBody.gender =
          roleSpecificData.gender === "ชาย"
            ? "MALE"
            : roleSpecificData.gender === "หญิง"
            ? "FEMALE"
            : "NONE";
        requestBody.birthDate = roleSpecificData.birthDate || null;
        requestBody.province = locationData.province;
        requestBody.district = locationData.district;
        requestBody.subDistrict = locationData.subdistrict;
        requestBody.postalCode = String(locationData.postalCode || "");
      }
      const response = await api.post(`/super/account`, requestBody);
      toast.success(response.data.message || "สร้างบัญชีสำเร็จ ✅");

      setFormData({
        fname: "",
        lname: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        profileImage: null,
      });
      setRoleSpecificData({ communityId: "", gender: "", birthDate: "" });
      setLocationData({
        province: "",
        district: "",
        subdistrict: "",
        postalCode: "",
      });
      setShowConfirm(false);
    } catch (error: any) {
      console.error("❌ Error creating account:", error);
      toast.error(error.response?.data?.message || "ไม่สามารถสร้างบัญชีได้");
    }
  };

  return (
    <div className="pl-0 pr-4 pt-6 pb-6 h-full bg-transparent relative">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow w-full ml-0 text-[15px] space-y-10 border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 text-center tracking-tight">
          สร้างบัญชี
        </h2>

        <div className="grid grid-cols-[320px_1fr] gap-14 items-start">
          {/* รูปโปรไฟล์ */}
          <div className="flex flex-col items-center">
            <AvatarUploader
              avatarUrl={null}
              onAvatarChange={handleAvatarChange}
              avatarSize={180}
            />
          </div>

          {/* ฟอร์มข้อมูล */}
          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <TextField
                id="fname"
                label="ชื่อ"
                placeholder="ชื่อ"
                required
                value={formData.fname}
                onChange={handleChange}
                error={!!formErrors.fname}
                helperText={formErrors.fname}
              />
              <TextField
                id="lname"
                label="นามสกุล"
                placeholder="นามสกุล"
                required
                value={formData.lname}
                onChange={handleChange}
                error={!!formErrors.lname}
                helperText={formErrors.lname}
              />
            </div>

            <TextField
              id="username"
              label="ชื่อผู้ใช้"
              placeholder="ชื่อผู้ใช้"
              required
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
            />
            <TextField
              id="email"
              label="อีเมล"
              placeholder="อีเมล"
              required
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              id="phone"
              label="โทรศัพท์"
              placeholder="หมายเลขโทรศัพท์"
              required
              value={formData.phone}
              onChange={handleChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />

            <div className="grid grid-cols-2 gap-6">
              <TextField
                id="password"
                label="รหัสผ่าน"
                placeholder="รหัสผ่าน"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
              <TextField
                id="confirmPassword"
                label="ยืนยันรหัสผ่าน"
                placeholder="ยืนยันรหัสผ่าน"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="font-semibold text-gray-800 block mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {(["Admin", "Member", "Tourist"] as RoleType[]).map(
                  (roleItem) => (
                    <button
                      key={roleItem}
                      type="button"
                      onClick={() => handleRoleSelect(roleItem)}
                      className={`px-4 py-1.5 rounded-full border font-medium transition-all ${
                        role === roleItem
                          ? "bg-green-800 text-white border-green-800"
                          : "border-gray-300 text-gray-600 hover:border-green-700 hover:text-green-800"
                      }`}
                    >
                      {roleItem}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Member extra field */}
            {role === "Member" && (
              <CommunitySelector
                value={
                  roleSpecificData.communityId
                    ? Number(roleSpecificData.communityId)
                    : null
                }
                onChange={(communityId) =>
                  setRoleSpecificData((prevData) => ({
                    ...prevData,
                    communityId: communityId ? String(communityId) : "",
                  }))
                }
              />
            )}

            {/* Tourist extra fields */}
            {role === "Tourist" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    id="birthDate"
                    label="วัน/เดือน/ปีเกิด"
                    type="date"
                    required
                    value={roleSpecificData.birthDate}
                    onChange={(event) =>
                      setRoleSpecificData((prevData) => ({
                        ...prevData,
                        birthDate: event.target.value,
                      }))
                    }
                  />
                  <div>
                    <label className="font-semibold text-gray-800 block mb-1">
                      เพศ <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      {["ชาย", "หญิง", "ไม่ระบุ"].map((genderLabel) => (
                        <label
                          key={genderLabel}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={genderLabel}
                            checked={roleSpecificData.gender === genderLabel}
                            onChange={() =>
                              setRoleSpecificData((prevData) => ({
                                ...prevData,
                                gender: genderLabel,
                              }))
                            }
                          />
                          {genderLabel}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <ThailandLocationSelector
                  value={locationData}
                  onChange={(updatedLocation: ThailandLocation) =>
                    setLocationData(updatedLocation)
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* ปุ่มบันทึก / ยกเลิก */}
        <div className="flex justify-end gap-4 pt-4">
          <div className="w-32">
            <Button type="cancel" onClick={() => navigate(-1)}>
              ยกเลิก
            </Button>
          </div>
          <div className="w-32">
            <SubmitButton
              htmlType="button"
              onClick={() => setShowConfirm(true)}
            >
              สร้างบัญชี
            </SubmitButton>
          </div>
        </div>
      </form>

      {/* Popup ยืนยัน */}
      <Modal
        open={showConfirm}
        title="ยืนยันการสร้างบัญชี"
        text="คุณต้องการยืนยันการสร้างบัญชีนี้หรือไม่"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          setShowConfirm(false);
          handleSubmit(
            new Event("submit") as unknown as React.FormEvent<HTMLFormElement>
          );
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default CreateAccountPage;
