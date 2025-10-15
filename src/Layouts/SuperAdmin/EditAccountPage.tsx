import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import TextField from "../../Components/TextField";
import Button from "../../Components/Button";
import SubmitButton from "../../Components/SubmitButton";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import api from "../../Libs/api";

type RoleType = "Admin" | "Member" | "Tourist";

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
    password: "",
    confirmPassword: "",
    role: getRoleFromPath() as RoleType,
  });

  const [extraData, setExtraData] = useState({
    communityId: "",
    gender: "",
    birthDate: "",
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });

  // ✅ map role name → roleId ตามฐานข้อมูล
  const mapRoleToId = (role: RoleType): number => {
    switch (role) {
      case "Admin":
        return 2; // roleId ของ Admin
      case "Member":
        return 3; // roleId ของ Member
      case "Tourist":
        return 4; // roleId ของ Tourist
      default:
        return 2;
    }
  };

  const resetExtraDataByRole = (newRole: RoleType) => {
    if (newRole === "Admin") {
      setExtraData({
        communityId: "",
        gender: "",
        birthDate: "",
        province: "",
        district: "",
        subdistrict: "",
        postalCode: "",
      });
    } else if (newRole === "Member") {
      setExtraData({
        communityId: "",
        gender: "",
        birthDate: "",
        province: "",
        district: "",
        subdistrict: "",
        postalCode: "",
      });
    } else if (newRole === "Tourist") {
      setExtraData({
        communityId: "",
        gender: "",
        birthDate: "",
        province: "",
        district: "",
        subdistrict: "",
        postalCode: "",
      });
    }
  };

  const fetchUser = async (role: RoleType) => {
    try {
      let endpoint = "";
      if (role === "Admin") endpoint = `/super/account/admin/${userId}`;
      else if (role === "Member") endpoint = `/super/account/member/${userId}`;
      else endpoint = `/super/account/tourist/${userId}`;

      const res = await api.get(endpoint);
      const user = res.data?.data;
      if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้");

      setFormData((prev) => ({
        ...prev,
        fname: user.fname || "",
        lname: user.lname || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        confirmPassword: "",
        role:
          user.role?.name === "superadmin"
            ? "Admin"
            : user.role?.name === "member"
            ? "Member"
            : "Tourist",
      }));

      setExtraData({
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
        province: user.province || "",
        district: user.district || "",
        subdistrict: user.subDistrict || "",
        postalCode: user.postalCode || "",
      });
    } catch (err: any) {
      console.error("❌ Error fetching user:", err);
      toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    }
  };

  useEffect(() => {
    if (userId && Number(userId) > 0) fetchUser(formData.role);
  }, [userId]);

  useEffect(() => {
    resetExtraDataByRole(formData.role);
  }, [formData.role]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  //  PATCH ให้เปลี่ยน roleId และล้างฟิลด์ที่ไม่เกี่ยว
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      const body: any = {
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        roleId: mapRoleToId(formData.role), // ✅ ส่ง roleId ด้วย
      };

      if (formData.password) body.password = formData.password;

      if (formData.role === "Member") {
        body.memberOfCommunity = Number(extraData.communityId) || null;
        // ล้างฟิลด์อื่นๆ ที่ไม่เกี่ยว
        body.gender = null;
        body.birthDate = null;
        body.province = null;
        body.district = null;
        body.subDistrict = null;
        body.postalCode = null;
      } else if (formData.role === "Tourist") {
        body.gender =
          extraData.gender === "ชาย"
            ? "MALE"
            : extraData.gender === "หญิง"
            ? "FEMALE"
            : "NONE";
        body.birthDate = extraData.birthDate
          ? new Date(extraData.birthDate).toISOString().split("T")[0]
          : null;
        body.province = extraData.province || null;
        body.district = extraData.district || null;
        body.subDistrict = extraData.subdistrict || null;
        body.postalCode = extraData.postalCode || null;
        body.memberOfCommunity = null;
      } else if (formData.role === "Admin") {
        // ล้างฟิลด์ทั้งหมดที่ไม่เกี่ยว
        body.gender = null;
        body.birthDate = null;
        body.province = null;
        body.district = null;
        body.subDistrict = null;
        body.postalCode = null;
        body.memberOfCommunity = null;
      }

      // ✅ เพิ่มบรรทัดนี้ก่อน endpoint
      body.roleId =
        formData.role === "Admin"
          ? 2
          : formData.role === "Member"
          ? 3
          : formData.role === "Tourist"
          ? 4
          : 2;

      //  เพิ่ม log ตรวจสอบ
      console.log("📡 Updating user to:", body);

      //  กำหนด endpoint ให้ตรงกับ roleId จริง ๆ
      let endpoint = "";
      if (body.roleId === 2) endpoint = `/super/account/admin/${userId}`;
      else if (body.roleId === 3) endpoint = `/super/account/member/${userId}`;
      else if (body.roleId === 4) endpoint = `/super/account/tourist/${userId}`;

      console.log("📡 PATCH:", endpoint, body);
      const res = await api.patch(endpoint, body);

      toast.success(res.data.message || "บันทึกการแก้ไขสำเร็จ ✅");

      //  กลับไปหน้าเดิม (หรือ list ของ role ใหม่)
     //  setTimeout(() => navigate(-1), 1000);
    } catch (err: any) {
      console.error("❌ Error updating account:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "ไม่สามารถบันทึกการแก้ไขได้"
      );
    }
  };

  return (
    <div className="p-10 h-full bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow max-w-6xl mx-auto text-[15px] space-y-10 border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 text-center tracking-tight">
          แก้ไขบัญชี
        </h2>

        <div className="grid grid-cols-[320px_1fr] gap-14 items-start">
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 bg-[#E3E5E9] rounded-full flex items-center justify-center shadow-sm">
              <Icon icon="mdi:account" className="text-gray-500 w-24 h-24" />
            </div>
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

            <div className="grid grid-cols-2 gap-6">
              <TextField
                id="password"
                label="รหัสผ่านใหม่ (ถ้ามี)"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
              <TextField
                id="confirmPassword"
                label="ยืนยันรหัสผ่าน"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* Role Selector */}
            <div>
              <label className="font-semibold text-gray-800 block mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {(["Admin", "Member", "Tourist"] as RoleType[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      if (formData.role !== r) {
                        resetExtraDataByRole(r);
                        setFormData((prev) => ({ ...prev, role: r }));
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full border font-medium transition-all ${
                      formData.role === r
                        ? "bg-green-800 text-white border-green-800"
                        : "border-gray-300 text-gray-600 hover:border-green-700 hover:text-green-800"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Member */}
            {formData.role === "Member" && (
              <div>
                <label className="font-semibold text-gray-800">
                  ชุมชนที่สังกัด
                </label>
                <input
                  id="communityId"
                  className="border rounded px-3 py-2 w-full"
                  value={extraData.communityId}
                  onChange={(e) =>
                    setExtraData((prev) => ({
                      ...prev,
                      communityId: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {/* Tourist */}
            {formData.role === "Tourist" && (
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  id="birthDate"
                  label="วัน/เดือน/ปีเกิด"
                  type="date"
                  value={extraData.birthDate}
                  onChange={(e) =>
                    setExtraData((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }))
                  }
                />
                <div>
                  <label className="font-semibold text-gray-800 block mb-1">
                    เพศ
                  </label>
                  <div className="flex gap-4">
                    {["ชาย", "หญิง", "ไม่ระบุ"].map((g) => (
                      <label key={g} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={extraData.gender === g}
                          onChange={(e) =>
                            setExtraData((prev) => ({
                              ...prev,
                              gender: e.target.value,
                            }))
                          }
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>

                <TextField
                  id="province"
                  label="จังหวัด"
                  value={extraData.province}
                  onChange={(e) =>
                    setExtraData((prev) => ({
                      ...prev,
                      province: e.target.value,
                    }))
                  }
                />
                <TextField
                  id="district"
                  label="อำเภอ/เขต"
                  value={extraData.district}
                  onChange={(e) =>
                    setExtraData((prev) => ({
                      ...prev,
                      district: e.target.value,
                    }))
                  }
                />
                <TextField
                  id="subdistrict"
                  label="ตำบล/แขวง"
                  value={extraData.subdistrict}
                  onChange={(e) =>
                    setExtraData((prev) => ({
                      ...prev,
                      subdistrict: e.target.value,
                    }))
                  }
                />
                <TextField
                  id="postalCode"
                  label="รหัสไปรษณีย์"
                  value={extraData.postalCode}
                  onChange={(e) =>
                    setExtraData((prev) => ({
                      ...prev,
                      postalCode: e.target.value,
                    }))
                  }
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
            <SubmitButton>บันทึก</SubmitButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditAccountPage;
