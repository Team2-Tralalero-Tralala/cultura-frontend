/**
 * คำอธิบาย : Component สำหรับหน้าสร้างบัญชีผู้ใช้ใหม่ (Admin / Member / Tourist)
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import zod from "zod";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import api from "@/Libs/Api";
import TextField from "@/Components/Input/TextField";
import Button from "../../Components/Button";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "../../Components/Selector/ThailandLocationSelector";
import AvatarUploader from "@/Components/upload/AvatarUploader";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

import Autocomplete from "@mui/material/Autocomplete";
import Popper from "@mui/material/Popper";
import { Icon } from "@iconify/react";

type RoleType = "Admin" | "Member" | "Tourist";

interface CommunityOption {
  id: number;
  name: string;
}

const accountSchema = zod
  .object({
    fname: zod.string().min(1, "กรุณากรอกชื่อ"),
    lname: zod.string().min(1, "กรุณากรอกนามสกุล"),
    username: zod
      .string()
      .min(4, "ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร")
      .regex(/^[a-zA-Z0-9]+$/, "ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น"),
    
    email: zod
      .string()
      .min(1, "กรุณากรอกอีเมล")
      .email("รูปแบบอีเมลไม่ถูกต้อง"),
      
    phone: zod.string().regex(/^0[0-9]{9}$/, "กรุณากรอกหมายเลขโทรศัพท์"),

    password: zod
      .string()
      .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
      .regex(/[a-z]/, "ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว")
      .regex(/[A-Z]/, "ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว")
      .regex(/[0-9]/, "ต้องประกอบด้วยตัวเลข (0-9) อย่างน้อย 1 ตัว"),

    confirmPassword: zod.string().min(1, "กรุณายืนยันรหัสผ่าน"),

    birthDate: zod
      .string()
      .min(1, "กรุณากรอกวัน/เดือน/ปีเกิด")
      .refine(
        (dateString) => {
          const dateObject = new Date(dateString);
          const currentDate = new Date();
          return !isNaN(dateObject.getTime()) && dateObject <= currentDate;
        },
        { message: "วันเกิดต้องเป็นวันที่ถูกต้อง และไม่เกินวันที่ปัจจุบัน" },
      )
      .optional(),

    gender: zod
      .string()
      .min(1, "กรุณาเลือกเพศ")
      .refine((genderValue) => ["ชาย", "หญิง", "ไม่ระบุ"].includes(genderValue), {
        message: "เพศไม่ถูกต้อง",
      })
      .optional(),

    province: zod.string().min(1, "กรุณาเลือกจังหวัด").optional(),
    district: zod.string().min(1, "กรุณาเลือกอำเภอ").optional(),
    subDistrict: zod.string().min(1, "กรุณาเลือกตำบล").optional(),
    postalCode: zod.string().min(1, "กรุณาใส่รหัสไปรษณีย์").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

interface CreateAccountPageProps {
  defaultRole?: RoleType;
}

interface RoleSpecificData {
  communityId: string;
  activityRole: string;
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
  communityRole?: string;
  gender?: "MALE" | "FEMALE" | "NONE";
  birthDate?: string | null;
  province?: string;
  district?: string;
  subDistrict?: string;
  postalCode?: string;
}

/**
 * คำอธิบาย : Popper Component สำหรับปรับแต่งหน้าต่าง AutoComplete ของ MUI
 * Input: props (any) - properties ที่ส่งมาจาก MUI Autocomplete
 * Output: JSX Element Popper
 */
function CustomPopper(props: any) {
  const { anchorEl } = props;
  return (
    <Popper
      {...props}
      placement="bottom-start"
      modifiers={[
        { name: "flip", enabled: false },
        { name: "preventOverflow", enabled: true },
      ]}
      style={{
        zIndex: 1300,
        width: anchorEl ? anchorEl.clientWidth : undefined,
        paddingTop: "4px",
      }}
    />
  );
}

/**
 * คำอธิบาย : ฟังก์ชัน Component สำหรับหน้าสร้างบัญชีผู้ใช้ใหม่
 * Input: props (CreateAccountPageProps) - รับ defaultRole สำหรับกำหนดค่าเริ่มต้นของ Role
 * Output: หน้าจอ (UI) ฟอร์มสำหรับกรอกข้อมูลเพื่อสร้างบัญชี
 */
const CreateAccountPage: React.FC<CreateAccountPageProps> = ({ defaultRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับหาค่า Role จาก URL Path ปัจจุบัน หรือจาก Props
   * Input: -
   * Output: RoleType (Admin, Member, หรือ Tourist)
   */
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
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});

  const [roleSpecificData, setRoleSpecificData] = useState<RoleSpecificData>({
    communityId: "",
    activityRole: "",
    gender: "",
    birthDate: "",
  });

  const [locationData, setLocationData] = useState<ThailandLocation>({
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [isShowErrorModal, setIsShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isShowSuccessModal, setIsShowSuccessModal] = useState(false);

  const [communityOptions, setCommunityOptions] = useState<CommunityOption[]>([]);
  const [isCommunityLoading, setIsCommunityLoading] = useState(false);

  /**
   * คำอธิบาย : Hook สำหรับตั้งค่า Role ใหม่เมื่อ Pathname ของ URL มีการเปลี่ยนแปลง
   * Input: -
   * Output: -
   */
  useEffect(() => {
    setRole(getRoleFromPath());
  }, [location.pathname]);

  /**
   * คำอธิบาย : Hook สำหรับดึงข้อมูลรายชื่อวิสาหกิจชุมชนเพื่อนำมาแสดงใน Dropdown เมื่อสร้างบัญชี Member
   * Input: -
   * Output: -
   */
  useEffect(() => {
    if (role === "Member") {

      /**
       * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลรายชื่อวิสาหกิจชุมชนเพื่อนำมาแสดงเป็นตัวเลือก
       * Input: -
       * Output: -
       */
      const fetchCommunities = async () => {
        setIsCommunityLoading(true);
        try {
          const res = await api.get("/super/communities");

          let data: CommunityOption[] = [];

          if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
            data = res.data.data.data;
          } else if (res.data?.data && Array.isArray(res.data.data)) {
            data = res.data.data;
          } else if (Array.isArray(res.data)) {
            data = res.data;
          }

          if (data.length === 0) {
            console.log("SuperAdmin fetch empty, trying Admin fetch...");
            try {
              const resAdmin = await api.get("/admin/community");
              const adminCommunity = resAdmin.data?.data;
              if (adminCommunity && adminCommunity.id && adminCommunity.name) {
                data = [{ id: adminCommunity.id, name: adminCommunity.name }];

                setRoleSpecificData((prev) => ({
                  ...prev,
                  communityId: String(adminCommunity.id),
                }));
              }
            } catch (errAdmin) {
              console.warn("Failed to fetch admin community", errAdmin);
            }
          }

          setCommunityOptions(data);
        } catch (error) {
          console.error("Failed to fetch communities", error);
          try {
            const resAdmin = await api.get("/admin/community");
            const adminCommunity = resAdmin.data?.data;
            if (adminCommunity) {
              setCommunityOptions([{ id: adminCommunity.id, name: adminCommunity.name }]);
            }
          } catch (adminFetchError) {
            setCommunityOptions([]);
          }
        } finally {
          setIsCommunityLoading(false);
        }
      };
      fetchCommunities();
    }
  }, [role]);

  /**
   * คำอธิบาย : ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลใน Form ด้วย Schema (Zod)
   * Input: fieldName (ชื่อฟิลด์ที่ต้องการตรวจสอบ - Optional), fieldValue (ค่าของฟิลด์ - Optional)
   * Output: boolean (ส่งคืน true หากข้อมูลถูกต้อง, false หากผิดพลาด)
   */
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
          : result.error.issues.find((issue) => issue.path[0] === fieldName)?.message,
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

  /**
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงค่าในช่อง Input ของฟอร์ม
   * Input: event (React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
   * Output: -
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    const updatedFormData = { ...formData, [id]: value };
    setFormData(updatedFormData);
    validateField(id, value);
  };

  /**
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อมีการเลือกอัปโหลดรูปภาพโปรไฟล์
   * Input: file (ไฟล์รูปภาพที่เลือก หรือ null)
   * Output: -
   */
  const handleAvatarChange = (file: File | null) => {
    if (!file) return;
    setFormData((prev) => ({ ...prev, profileImage: file }));
  };

  /**
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้งานกดเปลี่ยนปุ่ม Role ในฟอร์ม
   * Input: newRole (บทบาทใหม่ที่ถูกเลือก)
   * Output: -
   */
  const handleRoleSelect = (newRole: RoleType) => {
    if (role !== newRole) {
      setRole(newRole);
      navigate(`/super/account/${newRole.toLowerCase()}/create`, {
        replace: true,
      });
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันเช็คความถูกต้องของข้อมูล (Validation & Role Check) ก่อนเปิด Modal ยืนยันการสร้างบัญชี
   * Input: -
   * Output: -
   */
  const handlePreCheck = () => {
    const isFormValid = validateField();

    let isRoleValid = true;
    if (role === "Member") {
      if (!roleSpecificData.communityId) {
        isRoleValid = false;
        setFormErrors((prev) => ({ ...prev, communityId: "กรุณาเลือกวิสาหกิจชุมชน" }));
      } else {
        setFormErrors((prev) => ({ ...prev, communityId: undefined }));
      }
    }

    if (!isFormValid || !isRoleValid || formData.password !== formData.confirmPassword) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      setIsShowErrorModal(true);
    } else {
      setIsShowConfirm(true);
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับส่งข้อมูลแบบฟอร์มเพื่อสร้างบัญชีผู้ใช้ใหม่ในระบบ
   * Input: event (React.FormEvent)
   * Output: -
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const isValid = validateField();
    if (!isValid) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      setIsShowErrorModal(true);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("รหัสผ่านไม่ตรงกัน");
      setIsShowErrorModal(true);
      return;
    }

    if (role === "Member") {
      if (!roleSpecificData.communityId) {
        setFormErrors((prev) => ({ ...prev, communityId: "กรุณาเลือกวิสาหกิจชุมชน" }));
        setErrorMessage("กรุณาเลือกชุมชน");
        setIsShowErrorModal(true);
        return;
      }
    }

    try {
      let roleId = 3;
      if (role === "Member") roleId = 1;
      if (role === "Tourist") roleId = 2;

      const accountBody: CreateAccountBody = {
        roleId,
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        profileImage: null,
      };

      if (role === "Member") {
        accountBody.memberOfCommunity = Number(roleSpecificData.communityId) || null;
        accountBody.communityRole = roleSpecificData.activityRole.trim();
      } else if (role === "Tourist") {
        accountBody.gender =
          roleSpecificData.gender === "ชาย"
            ? "MALE"
            : roleSpecificData.gender === "หญิง"
              ? "FEMALE"
              : "NONE";
        accountBody.birthDate = roleSpecificData.birthDate || null;
        accountBody.province = locationData.province;
        accountBody.district = locationData.district;
        accountBody.subDistrict = locationData.subdistrict;
        accountBody.postalCode = String(locationData.postalCode || "");
      }

      const response = await api.post(`/super/account/${role.toLowerCase()}`, accountBody);
      const newUserId = response.data?.data?.id;

      if (!newUserId) {
        setIsShowConfirm(false);
        setIsShowSuccessModal(true);
        return;
      }

      if (formData.profileImage) {
        const formDataUpload = new FormData();
        formDataUpload.append("profileImage", formData.profileImage);

        await api.put(`/super/users/profile/${newUserId}`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setIsShowConfirm(false);
      setIsShowSuccessModal(true);
   } catch (error: any) {
      console.error("❌ Error updating account:", error);

      const errorResponse = error.response?.data;
      const errorMsg = errorResponse?.message || error.message || "ไม่สามารถบันทึกการแก้ไขได้";
      const errorData = errorResponse?.errors || {}; 

      const newErrors: Record<string, string> = {};
      const errorMsgLower = errorMsg.toLowerCase();

      if (errorMsgLower.includes("ชื่อผู้ใช้") || errorMsgLower.includes("username") || errorMsgLower.includes("duplicate_username") || errorData.username) {
        newErrors.username = "ชื่อผู้ใช้นี้มีในระบบแล้ว";
      } 
      if (errorMsgLower.includes("อีเมล") || errorMsgLower.includes("email") || errorMsgLower.includes("duplicate_email") || errorData.email) {
        newErrors.email = "อีเมลนี้ถูกใช้งานแล้ว";
      } 
      if (
        errorMsgLower.includes("โทรศัพท์") || errorMsgLower.includes("เบอร์") || errorMsgLower.includes("phone") || errorMsgLower.includes("duplicate_phone") || errorData.phone
      ) {
        newErrors.phone = "เบอร์โทรศัพท์นี้มีในระบบแล้ว";
      }

      const errorKeys = Object.keys(newErrors);

      if (errorKeys.length > 0) {
        setFormErrors((prev) => ({ ...prev, ...newErrors }));

        if (errorKeys.length === 1) {
          setErrorMessage(newErrors[errorKeys[0]]);
        } else {
          setErrorMessage("ข้อมูลบางอย่างซ้ำในระบบ กรุณาตรวจสอบการแจ้งเตือนที่แบบฟอร์ม");
        }
      } else {
        setErrorMessage(errorMsg);
      }

      setIsShowConfirm(false);
      setIsShowErrorModal(true);
    }
  };

  return (
    <div className="pl-0 pr-4 pt-6 pb-6 h-full bg-transparent relative">
      <div>
        <Breadcrumb
          current={{
            label: "เพิ่มบัญชี",
            to: "/super/account/admin/create",
          }}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow w-full ml-0 text-[15px] space-y-10 border border-gray-200"
      >
        <div className="flex items-center gap-3 pb-6">
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="p-1 -ml-1 rounded-full hover:bg-gray-100 text-black transition-colors"
            title="ย้อนกลับ"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1
            onClick={() => navigate(-1)}
            className="text-xl font-bold text-black tracking-tight cursor-pointer"
          >
            สร้างบัญชี
          </h1>
        </div>
        <h2 className="text-xl font-bold text-gray-800 text-center tracking-tight">สร้างบัญชี</h2>

        <div className="grid grid-cols-[320px_1fr] gap-14 items-start">
          <div className="flex flex-col items-center">
            <AvatarUploader avatarUrl={null} onAvatarChange={handleAvatarChange} avatarSize={270} />
          </div>

          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <TextField
                id="fname"
                label="ชื่อ(ไม่ต้องใส่คำนำหน้า)"
                placeholder="กรอกชื่อ"
                required
                value={formData.fname}
                onChange={handleChange}
                error={!!formErrors.fname}
                helperText={formErrors.fname}
              />
              <TextField
                id="lname"
                label="นามสกุล"
                placeholder="กรอกนามสกุล"
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
              placeholder="กรอกชื่อผู้ใช้"
              required
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
            />
            <ul className="mt-1.5 ml-1 text-xs text-gray-500 list-disc pl-4 space-y-0.5">
              <li>ความยาวอย่างน้อย 4 ตัวอักษร</li>
              <li>ควรประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข</li>
            </ul>
            <TextField
              id="email"
              label="อีเมล"
              placeholder="กรอกอีเมล"
              required
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              id="phone"
              label="โทรศัพท์"
              placeholder="กรอกหมายเลขโทรศัพท์"
              required
              value={formData.phone}
              onChange={handleChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />

            <div className="grid grid-cols-2 gap-6 items-start">
              <div>
                <TextField
                  id="password"
                  label="รหัสผ่าน"
                  placeholder="กรอกรหัสผ่าน"
                  required
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
                <ul className="mt-1.5 ml-1 text-xs text-gray-500 list-disc pl-4 space-y-0.5">
                  <li>ความยาวอย่างน้อย 8 ตัวอักษร</li>
                  <li>ประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z) พิมพ์ใหญ่ (A-Z)</li>
                  <li>ประกอบด้วยตัวเลข (0-9)</li>
                </ul>
              </div>

              <TextField
                id="confirmPassword"
                label="กรอกยืนยันรหัสผ่าน"
                placeholder="ยืนยันรหัสผ่าน"
                required
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
              />
            </div>

            <div>
              <label className="font-semibold text-gray-800 block mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {(["Admin", "Member", "Tourist"] as RoleType[]).map((roleItem) => (
                  <button
                    key={roleItem}
                    type="button"
                    onClick={() => handleRoleSelect(roleItem)}
                    className={`min-w-[100px] px-6 py-2 rounded-lg border font-medium transition-all ${
                      role === roleItem
                        ? "bg-[#0A4B32] text-white border-[#0A4B32]"
                        : "bg-white border-gray-300 text-gray-600 hover:border-[#0A4B32] hover:text-[#0A4B32]"
                    }`}
                  >
                    {roleItem}
                  </button>
                ))}
              </div>
            </div>

            {role === "Member" && (
              <div className="space-y-6">
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <label className="block text-base font-semibold text-black">
                      ชื่อวิสาหกิจชุมชน
                    </label>
                  </div>
                  <Autocomplete
                    id="community-selector-custom"
                    options={communityOptions}
                    getOptionLabel={(option) => option.name}
                    value={
                      communityOptions.find(
                        (c) => String(c.id) === String(roleSpecificData.communityId),
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      setRoleSpecificData((prev) => ({
                        ...prev,
                        communityId: newValue ? String(newValue.id) : "",
                      }));
                      if (newValue) {
                        setFormErrors((prev) => ({ ...prev, communityId: undefined }));
                      }
                    }}
                    loading={isCommunityLoading}
                    noOptionsText="ไม่พบข้อมูลชุมชน"
                    loadingText="กำลังโหลด..."
                    disableClearable={false}
                    PopperComponent={CustomPopper}
                    renderInput={(params) => {
                      const { InputProps, inputProps } = params;
                      const hasError = !!formErrors.communityId;

                      return (
                        <div ref={InputProps.ref} className="relative w-full">
                          <input
                            {...inputProps}
                            type="text"
                            placeholder={
                              isCommunityLoading ? "กำลังโหลด..." : "กรอกชื่อวิสาหกิจชุมชน"
                            }
                            className={`block w-full rounded-form border-1
                              bg-white px-5 py-2 text-black text-base
                              placeholder:text-[#606060] placeholder:font-normal leading-relaxed
                              focus:outline-none focus:ring-1 transition-shadow pr-10
                              ${
                                hasError
                                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-400 focus:ring-gray-400 focus:border-gray-500"
                              }`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none flex items-center">
                            <Icon icon="mdi:magnify" style={{ fontSize: "24px" }} />
                          </div>

                          {hasError && (
                            <p className="mt-1.5 ml-1 text-xs text-red-500">
                              {formErrors.communityId}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
            )}

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
                        <label key={genderLabel} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={genderLabel}
                            checked={roleSpecificData.gender === genderLabel}
                            className="accent-[#0A4B32] w-4 h-4 cursor-pointer"
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
                  onChange={(updatedLocation: ThailandLocation) => setLocationData(updatedLocation)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <div className="w-32">
            <Button type="cancel" onClick={() => navigate(-1)}>
              ยกเลิก
            </Button>
          </div>
          <div className="w-32">
            <Button type="confirm-admin" onClick={handlePreCheck}>
              สร้างบัญชี
            </Button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={isShowConfirm}
        title="ยืนยันการสร้างบัญชี"
        text="คุณต้องการยืนยันการสร้างบัญชีนี้หรือไม่"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          setIsShowConfirm(false);
          handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>);
        }}
        onCancel={() => setIsShowConfirm(false)}
      />

      <ModalAlert
        isOpen={isShowErrorModal}
        type="error"
        title="ไม่สามารถสร้างบัญชีได้"
        message={errorMessage}
        onClose={() => setIsShowErrorModal(false)}
      />

      <ModalAlert
        isOpen={isShowSuccessModal}
        type="success"
        title="สร้างบัญชีสำเร็จ"
        message="บัญชีผู้ใช้ถูกสร้างเรียบร้อยแล้ว"
        onClose={() => {
          setIsShowSuccessModal(false);
          navigate("/super/accounts/all");
        }}
      />
    </div>
  );
};

export default CreateAccountPage; 