/*
 * Component: CreateAccountPage
 * Description: หน้าสำหรับแก้ไขบัญชีผู้ใช้ใหม่ (Admin / Member / Tourist)
 * Author: Team 2 (Cultura)
 * Last Modified: 20 มกราคม 2569 (Smart Fetch Community)
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
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

interface EditAccountBody {
  fname: string;
  lname: string;
  username: string;
  email: string;
  phone: string;
  roleId: number;
  profileImage?: string | null;
  memberOfCommunity?: number | null;
  communityRole?: string;
  gender?: "MALE" | "FEMALE" | "NONE";
  birthDate?: string | null;
  province?: string | null;
  district?: string | null;
  subDistrict?: string | null;
  postalCode?: string | null;
}

interface CommunityOption {
  id: number;
  name: string;
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

const EditAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminId, memberId, touristId } = useParams();
  const userId = adminId || memberId || touristId;

  const getRoleFromPath = (): RoleType => {
    if (location.pathname.includes("member")) return "Member";
    if (location.pathname.includes("tourist")) return "Tourist";
    return "Admin";
  };

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
    role: getRoleFromPath() as RoleType,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [roleSpecificData, setRoleSpecificData] = useState({
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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [communityOptions, setCommunityOptions] = useState<CommunityOption[]>([]);
  const [isCommunityLoading, setIsCommunityLoading] = useState(false);

  const mapRoleToId = (role: RoleType): number => {
    switch (role) {
      case "Admin":
        return 3;
      case "Member":
        return 1;
      case "Tourist":
        return 2;
      default:
        return 3;
    }
  };

  const fetchUser = async (role: RoleType) => {
    try {
      let endpoint = "";
      if (role === "Admin") endpoint = `/super/account/admin/${userId}`;
      else if (role === "Member") endpoint = `/super/account/member/${userId}`;
      else endpoint = `/super/account/tourist/${userId}`;

      const response = await api.get(endpoint);
      const user = response.data?.data;
      if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้");

      setFormData((previousState) => ({
        ...previousState,
        fname: user.fname || "",
        lname: user.lname || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        role:
          role === "Admin"
            ? "Admin"
            : role === "Member"
              ? "Member"
              : role === "Tourist"
                ? "Tourist"
                : user.role?.name === "superadmin"
                  ? "Admin"
                  : user.role?.name === "member"
                    ? "Member"
                    : "Tourist",
      }));
      setAvatarUrl(user.profileImageUrl || null);

      setRoleSpecificData({
        communityId: user.memberOfCommunity ? String(user.memberOfCommunity) : "",
        activityRole: user.activityRole || "",
        gender: user.gender === "MALE" ? "ชาย" : user.gender === "FEMALE" ? "หญิง" : "ไม่ระบุ",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : "",
      });

      setLocationData({
        province: user.province || "",
        district: user.district || "",
        subdistrict: user.subDistrict || "",
        postalCode: user.postalCode || "",
      });
    } catch (error: any) {
      console.error("❌ Error fetching user:", error);
      toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    }
  };

  useEffect(() => {
    if (userId && Number(userId) > 0) fetchUser(formData.role);
  }, [userId, formData.role]);

  useEffect(() => {
    if (formData.role === "Member") {
      const fetchCommunities = async () => {
        setIsCommunityLoading(true);
        try {
          const res = await api.get("/super/communities?limit=1000");

          let data: CommunityOption[] = [];
          if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
            data = res.data.data.data;
          } else if (res.data?.data && Array.isArray(res.data.data)) {
            data = res.data.data;
          } else if (Array.isArray(res.data)) {
            data = res.data;
          }

          if (data.length === 0) {
            try {
              const resAdmin = await api.get("/admin/community");
              const adminCommunity = resAdmin.data?.data;
              if (adminCommunity && adminCommunity.id && adminCommunity.name) {
                data = [{ id: adminCommunity.id, name: adminCommunity.name }];

                if (!roleSpecificData.communityId) {
                  setRoleSpecificData((prev) => ({
                    ...prev,
                    communityId: String(adminCommunity.id),
                  }));
                }
              }
            } catch (errAdmin) {
              console.warn("Failed to fetch admin community");
            }
          }

          setCommunityOptions(data);
        } catch (error) {
          console.error("Failed to fetch communities", error);
          try {
            const resAdmin = await api.get("/admin/community");
            if (resAdmin.data?.data) {
              setCommunityOptions([{ id: resAdmin.data.data.id, name: resAdmin.data.data.name }]);
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
  }, [formData.role]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    setFormData((previousState) => ({ ...previousState, [id]: value }));
  };

  const handleRoleSelect = (newRole: RoleType) => {
    if (formData.role !== newRole) {
      setFormData((previousState) => ({ ...previousState, role: newRole }));

      const newPath = `/super/account/${newRole.toLowerCase()}/${userId}/edit`;
      navigate(newPath, { replace: true });
      fetchUser(newRole);
    }
  };

  const handlePreCheck = () => {
    const isBasicValid =
      formData.fname.trim() !== "" &&
      formData.lname.trim() !== "" &&
      formData.username.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "";

    let isRoleSpecificValid = true;

    if (formData.role === "Member") {
      if (!roleSpecificData.communityId || !roleSpecificData.activityRole.trim()) {
        isRoleSpecificValid = false;
      }
    } else if (formData.role === "Tourist") {
      if (!roleSpecificData.birthDate) {
        isRoleSpecificValid = false;
      }
    }

    if (!isBasicValid || !isRoleSpecificValid) {
      setShowErrorModal(true);
    } else {
      setShowConfirm(true);
    }
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.role === "Member") {
      if (!roleSpecificData.communityId) {
        toast.error("กรุณาเลือกชุมชน");
        return;
      }
      if (!roleSpecificData.activityRole) {
        toast.error("กรุณากรอกบทบาทในชุมชน");
        return;
      }
    }

    try {
      let imageWasUpdated = false;
      if (profileImage) {
        const formDataUpload = new FormData();
        formDataUpload.append("profileImage", profileImage);

        await api.put(`/super/users/profile/${userId}`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageWasUpdated = true;
      }

      const requestBody: EditAccountBody = {
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        roleId: mapRoleToId(formData.role),
      };

      if (formData.role === "Member") {
        requestBody.memberOfCommunity = Number(roleSpecificData.communityId) || null;
        requestBody.communityRole = roleSpecificData.activityRole.trim();
      } else if (formData.role === "Tourist") {
        requestBody.gender =
          roleSpecificData.gender === "ชาย"
            ? "MALE"
            : roleSpecificData.gender === "หญิง"
              ? "FEMALE"
              : "NONE";
        requestBody.birthDate = roleSpecificData.birthDate
          ? new Date(roleSpecificData.birthDate).toISOString().split("T")[0]
          : null;
        requestBody.province = locationData.province || null;
        requestBody.district = locationData.district || null;
        requestBody.subDistrict = locationData.subdistrict || null;
        requestBody.postalCode = locationData.postalCode ? String(locationData.postalCode) : null;
      }

      let endpoint = "";
      if (formData.role === "Admin") endpoint = `/super/account/admin/${userId}`;
      else if (formData.role === "Member") endpoint = `/super/account/member/${userId}`;
      else endpoint = `/super/account/tourist/${userId}`;

      await api.put(endpoint, requestBody);

      setShowConfirm(false);
      setShowSuccessModal(true);

      if (imageWasUpdated) {
        fetchUser(formData.role);
        setProfileImage(null);
      }
    } catch (error: any) {
      console.error("❌ Error updating account:", error);
      toast.error(error.response?.data?.message || error.message || "ไม่สามารถบันทึกการแก้ไขได้");
    }
  };

  return (
    <div className="pl-0 pr-4 pt-6 pb-6 h-full bg-transparent relative">
      <div className="mb-2">
        <Breadcrumb
          current={{
            label: "แก้ไขบัญชี",
            to: location.pathname,
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
            แก้ไขบัญชี
          </h1>
        </div>
        <h2 className="text-xl font-bold text-gray-800 text-center tracking-tight">แก้ไขบัญชี</h2>

        <div className="grid grid-cols-[320px_1fr] gap-14 items-start">
          <div className="flex flex-col items-center">
            <AvatarUploader
              avatarUrl={avatarUrl}
              onAvatarChange={(file) => {
                setProfileImage(file);
              }}
              avatarSize={270}
            />
          </div>

          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <TextField
                id="fname"
                label="ชื่อ"
                required
                value={formData.fname}
                onChange={handleChange}
              />
              <TextField
                id="lname"
                label="นามสกุล"
                required
                value={formData.lname}
                onChange={handleChange}
              />
            </div>

            <TextField
              id="username"
              label="ชื่อผู้ใช้"
              required
              value={formData.username}
              onChange={handleChange}
            />
            <ul className="mt-1.5 ml-1 text-xs text-gray-500 list-disc pl-4 space-y-0.5">
              <li>ความยาวอย่างน้อย 4 ตัวอักษร</li>
              <li>ควรประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข</li>
            </ul>
            <TextField
              id="email"
              label="อีเมล"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              id="phone"
              label="โทรศัพท์"
              required
              value={formData.phone}
              onChange={handleChange}
            />

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="font-semibold text-gray-800 block">
                  Role <span className="text-red-500">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => navigate(`/super/account/reset-password/${userId}`)}
                  className="text-sm font-medium text-[#0A4B32] hover:text-green-700 hover:underline flex items-center gap-1 transition-colors"
                >
                  <Icon icon="mdi:lock-reset" className="w-4 h-4" />
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>

              <div className="flex gap-4">
                {(["Admin", "Member", "Tourist"] as RoleType[]).map((roleItem) => (
                  <button
                    key={roleItem}
                    type="button"
                    onClick={() => handleRoleSelect(roleItem)}
                    className={`min-w-[100px] px-6 py-2 rounded-lg border font-medium transition-all ${
                      formData.role === roleItem
                        ? "bg-[#0A4B32] text-white border-[#0A4B32]"
                        : "bg-white border-gray-300 text-gray-600 hover:border-[#0A4B32] hover:text-[#0A4B32]"
                    }`}
                  >
                    {roleItem}
                  </button>
                ))}
              </div>
            </div>

            {formData.role === "Member" && (
              <div className="space-y-6">
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <label className="block text-base font-semibold text-black">
                      ชุมชนวิสาหกิจ
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
                    }}
                    loading={isCommunityLoading}
                    noOptionsText={isCommunityLoading ? "กำลังโหลด..." : "ไม่พบข้อมูลชุมชน"}
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
              </div>
            )}

            {formData.role === "Tourist" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    id="birthDate"
                    label="วัน/เดือน/ปีเกิด"
                    type="date"
                    required
                    value={roleSpecificData.birthDate}
                    onChange={(event) =>
                      setRoleSpecificData((previousState) => ({
                        ...previousState,
                        birthDate: event.target.value,
                      }))
                    }
                  />
                  <div>
                    <label className="font-semibold text-gray-800 block mb-1">เพศ</label>
                    <div className="flex gap-4">
                      {["ชาย", "หญิง", "ไม่ระบุ"].map((genderLabel) => (
                        <label key={genderLabel} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={genderLabel}
                            checked={roleSpecificData.gender === genderLabel}
                            className="accent-[#0A4B32] w-4 h-4 cursor-pointer"
                            onChange={(event) =>
                              setRoleSpecificData((previousState) => ({
                                ...previousState,
                                gender: event.target.value,
                              }))
                            }
                          />
                          {genderLabel}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <ThailandLocationSelector value={locationData} onChange={setLocationData} />
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
              บันทึก
            </Button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={showConfirm}
        title="ยืนยันการบันทึกข้อมูล"
        text="คุณต้องการบันทึกการแก้ไขบัญชีนี้หรือไม่"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          setShowConfirm(false);
          handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>);
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <ModalAlert
        isOpen={showSuccessModal}
        type="success"
        title="แก้ไขบัญชีสำเร็จ"
        message="ข้อมูลบัญชีผู้ใช้ถูกแก้ไขเรียบร้อยแล้ว"
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/super/accounts/all");
        }}
      />

      <ModalAlert
        isOpen={showErrorModal}
        type="error"
        title="กรอกข้อมูลไม่ครบถ้วน"
        message="กรุณาตรวจสอบข้อมูลให้ครบก่อนทำการบันทึก"
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default EditAccountPage;
