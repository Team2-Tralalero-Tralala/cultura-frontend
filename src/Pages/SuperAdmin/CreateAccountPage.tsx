/*
 * Component: CreateAccountPage
 * Description: หน้าสำหรับสร้างบัญชีผู้ใช้ใหม่ (Admin / Member / Tourist)
 * Author: Team 2 (Cultura)
 * Last Modified: 02 ธันวาคม 2568 (Smart Fetch Community)
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import * as z from "zod";
import { Modal } from "@/Components/Modal/Modal";
import api from "@/Libs/api";
import TextField from "../../Components/TextField";
import Button from "../../Components/Button";
import SubmitButton from "../../Components/SubmitButton";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "../../Components/Selector/ThailandLocationSelector";
import AvatarUploader from "@/Components/AvatarUploader";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

// Import สำหรับ Dropdown
import Autocomplete from "@mui/material/Autocomplete";
import Popper from "@mui/material/Popper";
import { Icon } from "@iconify/react";

type RoleType = "Admin" | "Member" | "Tourist";

interface CommunityOption {
  id: number;
  name: string;
}

const accountSchema = z.object({
  fname: z.string().min(1, "กรุณากรอกชื่อ"),
  lname: z.string().min(1, "กรุณากรอกนามสกุล"),
  username: z.string().min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z.string().regex(/^0[0-9]{9}$/, "เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก"),
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

const CreateAccountPage: React.FC<CreateAccountPageProps> = ({ defaultRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [showConfirm, setShowConfirm] = useState(false);

  const [communityOptions, setCommunityOptions] = useState<CommunityOption[]>([]);
  const [isCommunityLoading, setIsCommunityLoading] = useState(false);

  useEffect(() => {
    setRole(getRoleFromPath());
  }, [location.pathname]);

  useEffect(() => {
    if (role === "Member") {
      const fetchCommunities = async () => {
        setIsCommunityLoading(true);
        try {
          // 1. ลองดึงแบบ SuperAdmin (เอาทั้งหมด)
          // ตัด limit=1000 ออกก่อน เผื่อ backend รับ type number แล้ว crash
          const res = await api.get("/super/communities"); 
          
          let data: CommunityOption[] = [];
          
          // แกะ Response (รองรับ Pagination)
          if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
             data = res.data.data.data;
          } else if (res.data?.data && Array.isArray(res.data.data)) {
             data = res.data.data;
          } else if (Array.isArray(res.data)) {
             data = res.data;
          }

          // 2. ถ้าไม่เจอข้อมูล (อาจจะเป็น Admin ธรรมดา) ให้ลองดึงของตัวเอง
          if (data.length === 0) {
            console.log("SuperAdmin fetch empty, trying Admin fetch...");
            try {
              const resAdmin = await api.get("/admin/community");
              // Response ของ Admin เป็น Single Object
              const adminCommunity = resAdmin.data?.data;
              if (adminCommunity && adminCommunity.id && adminCommunity.name) {
                data = [{ id: adminCommunity.id, name: adminCommunity.name }];
                
                // Auto select ให้เลย ถ้ามีอันเดียว
                setRoleSpecificData(prev => ({
                    ...prev,
                    communityId: String(adminCommunity.id)
                }));
              }
            } catch (errAdmin) {
              console.warn("Failed to fetch admin community", errAdmin);
            }
          }

          setCommunityOptions(data);
        } catch (error) {
          console.error("Failed to fetch communities", error);
          // ถ้า Error หลัก ให้ลอง fetch แบบ Admin เป็น Last Resort
          try {
             const resAdmin = await api.get("/admin/community");
             const adminCommunity = resAdmin.data?.data;
             if (adminCommunity) {
                setCommunityOptions([{ id: adminCommunity.id, name: adminCommunity.name }]);
             }
          } catch (e) {
             setCommunityOptions([]);
          }
        } finally {
          setIsCommunityLoading(false);
        }
      };
      fetchCommunities();
    }
  }, [role]);

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    const updatedFormData = { ...formData, [id]: value };
    setFormData(updatedFormData);
    validateField(id, value);
  };

  const handleAvatarChange = (file: File | null) => {
    if (!file) return;
    setFormData((prev) => ({ ...prev, profileImage: file }));
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

    if (role === "Member") {
       if (!roleSpecificData.communityId) {
         toast.error("กรุณาเลือกชุมชน ❌");
         return;
       }
       if (!roleSpecificData.activityRole) {
         toast.error("กรุณากรอกบทบาทในชุมชน ❌");
         return;
       }
    }

    try {
      let roleId = 2;
      if (role === "Member") roleId = 3;
      if (role === "Tourist") roleId = 4;

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
        toast.success("สร้างบัญชีสำเร็จ (แต่ไม่พบ ID สำหรับอัปโหลดรูป)");
        return;
      }

      if (formData.profileImage) {
        const formDataUpload = new FormData();
        formDataUpload.append("profileImage", formData.profileImage);

        await api.put(`/super/users/profile/${newUserId}`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success(response.data.message || "สร้างบัญชีและอัปโหลดรูปสำเร็จ ✅");

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
      setRoleSpecificData({ communityId: "", activityRole: "", gender: "", birthDate: "" });
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
      {/* 1. Breadcrumb */}
      <div>
        <Breadcrumb
              current={{
              label: "เพิ่มบัญชี",
               to: "/super/account/admin/create",

             }}
            />
      </div>

      <div className="flex items-center gap-3 mb-6 pl-6">
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
        <h1 className="text-xl font-bold text-black tracking-tight">สร้างบัญชี</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow w-full ml-0 text-[15px] space-y-10 border border-gray-200"
      >
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

            <div className="grid grid-cols-2 gap-6">
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
              <TextField
                id="confirmPassword"
                label="กรอกยืนยันรหัสผ่าน"
                placeholder="ยืนยันรหัสผ่าน"
                required
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                {/* 1. Community Selector (TextField Style) */}
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <label className="block text-base font-semibold text-black">
                      ชุมชนวิสาหกิจ <span className="text-red-600"> *</span>
                    </label>
                  </div>
                  <Autocomplete
                    id="community-selector-custom"
                    options={communityOptions}
                    getOptionLabel={(option) => option.name}
                    value={
                      communityOptions.find(
                        (c) => String(c.id) === String(roleSpecificData.communityId)
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      setRoleSpecificData((prev) => ({
                        ...prev,
                        communityId: newValue ? String(newValue.id) : "",
                      }));
                    }}
                    loading={isCommunityLoading}
                    noOptionsText="ไม่พบข้อมูลชุมชน"
                    loadingText="กำลังโหลด..."
                    disableClearable={false}
                    PopperComponent={CustomPopper}
                    renderInput={(params) => {
                      const { InputProps, inputProps } = params;
                      return (
                        <div ref={InputProps.ref} className="relative w-full">
                          <input
                            {...inputProps}
                            type="text"
                            placeholder={isCommunityLoading ? "กำลังโหลด..." : "ค้นหาชุมชน"}
                            className="block w-full rounded-form border-1
                              border-gray-400 focus:ring-gray-400 focus:border-gray-500
                              bg-white px-5 py-2 text-black text-base
                              placeholder:text-[#606060] placeholder:font-normal leading-relaxed
                              focus:outline-none focus:ring-1 transition-shadow pr-10"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none flex items-center">
                             <Icon icon="mdi:magnify" style={{ fontSize: "24px" }} />
                          </div>
                        </div>
                      );
                    }}
                  />
                </div>
                
                {/* 2. Activity Role */}
                <TextField
                  id="activityRole"
                  label="บทบาทในชุมชน"
                  placeholder="กรอกบทบาทในชุมชน"
                  required
                  value={roleSpecificData.activityRole}
                  onChange={(e) => 
                    setRoleSpecificData((prev) => ({
                      ...prev,
                      activityRole: e.target.value
                    }))
                  }
                />
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
            <SubmitButton htmlType="button" onClick={() => setShowConfirm(true)}>
              สร้างบัญชี
            </SubmitButton>
          </div>
        </div>
      </form>

      <Modal
        open={showConfirm}
        title="ยืนยันการสร้างบัญชี"
        text="คุณต้องการยืนยันการสร้างบัญชีนี้หรือไม่"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          setShowConfirm(false);
          handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default CreateAccountPage;
