/*
 * Component: EditAccountPage
 * Description: หน้าสำหรับแก้ไขข้อมูลบัญชีผู้ใช้เดิม (Admin / Member / Tourist)
 * Author: Team 2 (Cultura)
 * Last Modified: 30 ตุลาคม 2568
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
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

interface EditAccountBody {
  fname: string;
  lname: string;
  username: string;
  email: string;
  phone: string;
  roleId: number;
  password?: string;
  profileImage?: string | null;
  memberOfCommunity?: number | null;
  gender?: "MALE" | "FEMALE" | "NONE";
  birthDate?: string | null;
  province?: string | null;
  district?: string | null;
  subDistrict?: string | null;
  postalCode?: string | null;
}

const EditAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminId, memberId, touristId } = useParams();
  const userId = adminId || memberId || touristId;

  /** ดึง role จาก path เช่น /super/account/member/:id/edit */
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
    password: "",
    confirmPassword: "",
    role: getRoleFromPath() as RoleType,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [roleSpecificData, setRoleSpecificData] = useState({
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

  /** แปลงชื่อ role เป็น roleId */
  const mapRoleToId = (role: RoleType): number => {
    switch (role) {
      case "Admin":
        return 2;
      case "Member":
        return 3;
      case "Tourist":
        return 4;
      default:
        return 2;
    }
  };

  /** โหลดข้อมูลผู้ใช้จาก API */
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
        password: "",
        confirmPassword: "",
      }));
      setAvatarUrl(user.profileImageUrl || null);
      setRoleSpecificData({
        communityId: user.memberOfCommunity?.toString() || "",
        gender:
          user.gender === "MALE"
            ? "ชาย"
            : user.gender === "FEMALE"
            ? "หญิง"
            : "ไม่ระบุ",
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split("T")[0]
          : "",
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

  /** โหลดข้อมูลเมื่อเปิดหน้า */
  useEffect(() => {
    if (userId && Number(userId) > 0) fetchUser(formData.role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, formData.role]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    setFormData((previousState) => ({ ...previousState, [id]: value }));
  };

  /** เมื่อเปลี่ยน Role */
  const handleRoleSelect = (newRole: RoleType) => {
    if (formData.role !== newRole) {
      setFormData((previousState) => ({ ...previousState, role: newRole }));

      const newPath = `/super/account/${newRole.toLowerCase()}/${userId}/edit`;
      navigate(newPath, { replace: true });
      fetchUser(newRole);
    }
  };

  /** เมื่อกดปุ่มบันทึก */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      const requestBody: EditAccountBody = {
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        roleId: mapRoleToId(formData.role),
      };

      if (formData.password) requestBody.password = formData.password;

      if (profileImage) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", profileImage);
        const uploadRes = await api.post("/upload/profile", formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        requestBody.profileImage = uploadRes.data?.filename || null;
      }

      if (formData.role === "Member") {
        requestBody.memberOfCommunity =
          Number(roleSpecificData.communityId) || null;
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
        requestBody.postalCode = locationData.postalCode
          ? String(locationData.postalCode)
          : null;
      }

      let endpoint = "";
      if (formData.role === "Admin")
        endpoint = `/super/account/admin/${userId}`;
      else if (formData.role === "Member")
        endpoint = `/super/account/member/${userId}`;
      else endpoint = `/super/account/tourist/${userId}`;

      const response = await api.patch(endpoint, requestBody);
      toast.success(response.data.message || "บันทึกการแก้ไขสำเร็จ ✅");
      setShowConfirm(false);
    } catch (error: any) {
      console.error("❌ Error updating account:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "ไม่สามารถบันทึกการแก้ไขได้"
      );
    }
  };

  return (
    <div className="pl-0 pr-4 pt-6 pb-6 h-full bg-transparent relative">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow w-full ml-0 text-[15px] space-y-10 border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 text-center tracking-tight">
          แก้ไขบัญชี
        </h2>

        <div className="grid grid-cols-[320px_1fr] gap-14 items-start">
          {/* รูปโปรไฟล์ */}
          <div className="flex flex-col items-center">
            <AvatarUploader
              avatarUrl={avatarUrl}
              onAvatarChange={(file) => {
                setProfileImage(file);
                // อัปเดต preview ทันทีถ้าเปลี่ยนรูปใหม่
                setAvatarUrl(file ? URL.createObjectURL(file) : avatarUrl);
              }}
              avatarSize={270}
            />
          </div>

          {/* ฟอร์มข้อมูล */}
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

            {/* 🔹 ปุ่มเปลี่ยน Role */}
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
                        formData.role === roleItem
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

            {/* เฉพาะ Member */}
            {formData.role === "Member" && (
              <CommunitySelector
                value={
                  roleSpecificData.communityId
                    ? Number(roleSpecificData.communityId)
                    : null
                }
                onChange={(communityId) =>
                  setRoleSpecificData((previousState) => ({
                    ...previousState,
                    communityId: communityId ? String(communityId) : "",
                  }))
                }
              />
            )}

            {/* เฉพาะ Tourist */}
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
                    <label className="font-semibold text-gray-800 block mb-1">
                      เพศ
                    </label>
                    <div className="flex gap-4">
                      {["ชาย", "หญิง", "ไม่ระบุ"].map((genderLabel) => (
                        <label
                          key={genderLabel}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={genderLabel}
                            checked={roleSpecificData.gender === genderLabel}
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

                <ThailandLocationSelector
                  value={locationData}
                  onChange={setLocationData}
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
              บันทึก
            </SubmitButton>
          </div>
        </div>
      </form>

      {/* Popup ยืนยัน */}
      <Modal
  open={showConfirm}
  title="ยืนยันการบันทึกข้อมูล"
  text="คุณต้องการบันทึกการแก้ไขบัญชีนี้หรือไม่"
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

export default EditAccountPage;
