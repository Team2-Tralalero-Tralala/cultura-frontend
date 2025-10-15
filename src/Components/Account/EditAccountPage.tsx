import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TextField from "../TextField";
import Button from "../Button";
import SubmitButton from "../SubmitButton";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import api from "../../Libs/api";

/*
 * Component : EditAccountPage
 * ใช้สำหรับหน้าแก้ไขบัญชี Admin / Member / Tourist
 */

type RoleType = "Admin" | "Member" | "Tourist";

const EditAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 ดึง ID จาก URL (รองรับทุก role)
  const { adminId, memberId, touristId } = useParams();
  const userId = adminId || memberId || touristId;

  // 🔹 หาว่าเป็น role ไหนจาก path
  const getRoleFromPath = (): RoleType => {
    if (location.pathname.includes("member")) return "Member";
    if (location.pathname.includes("tourist")) return "Tourist";
    return "Admin";
  };

  const [role] = useState<RoleType>(getRoleFromPath());

  // ฟอร์มหลัก
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // ฟิลด์เฉพาะ Tourist / Member
  const [extraData, setExtraData] = useState({
    communityId: "",
    gender: "",
    birthDate: "",
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });

  // โหลดข้อมูลผู้ใช้มาใส่ในฟอร์ม
  useEffect(() => {
    const fetchUser = async () => {
      try {
        let endpoint = "";
        if (role === "Admin") endpoint = `/super/account/admin/${userId}`;
        else if (role === "Member") endpoint = `/super/account/member/${userId}`;
        else endpoint = `/super/account/tourist/${userId}`;

        console.log("📡 Fetch user from:", endpoint);
        const res = await api.get(endpoint);

        const user = res.data?.data;
        if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้");

        setFormData({
          fname: user.fname || "",
          lname: user.lname || "",
          username: user.username || "",
          email: user.email || "",
          phone: user.phone || "",
          password: "",
          confirmPassword: "",
        });

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

    if (userId && Number(userId) > 0) fetchUser();
  }, [userId, role]);

  // handle change input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      // ✅ สร้าง body ที่จะส่ง
      const body: any = {
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      if (formData.password) body.password = formData.password;

      if (role === "Member") {
        body.memberOfCommunity = Number(extraData.communityId);
      } else if (role === "Tourist") {
        body.gender =
          extraData.gender === "ชาย"
            ? "MALE"
            : extraData.gender === "หญิง"
            ? "FEMALE"
            : "NONE";
        body.birthDate = extraData.birthDate
          ? new Date(extraData.birthDate).toISOString().split("T")[0]
          : null;
        body.province = extraData.province;
        body.district = extraData.district;
        body.subDistrict = extraData.subdistrict;
        body.postalCode = extraData.postalCode;
      }

      // 🔹 endpoint แยกตาม role เหมือนตอนโหลดข้อมูล
      let endpoint = "";
      if (role === "Admin") endpoint = `/super/account/admin/${userId}`;
      else if (role === "Member") endpoint = `/super/account/member/${userId}`;
      else endpoint = `/super/account/tourist/${userId}`;

      console.log("📡 Updating user to:", endpoint, body);
      const res = await api.patch(endpoint, body);

      toast.success(res.data.message || "บันทึกการแก้ไขสำเร็จ ✅");
      if (role === "Admin") navigate("/super/account/admin");
      else if (role === "Member") navigate("/super/account/member");
      else navigate("/super/account/tourist");
    } catch (err: any) {
      console.error("❌ Error updating account:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "ไม่สามารถบันทึกการแก้ไขได้";
      toast.error(msg);
    }
  };

  return (
    <div className="p-10 h-full bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow max-w-6xl mx-auto text-[15px] space-y-10 border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 text-center tracking-tight">
          {role === "Admin"
            ? "แก้ไขบัญชีผู้ดูแลระบบ (Admin)"
            : role === "Member"
            ? "แก้ไขบัญชีสมาชิก (Member)"
            : "แก้ไขบัญชีผู้ใช้ทั่วไป (Tourist)"}
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

            {/* ฟิลด์เฉพาะ Member / Tourist */}
            {role === "Member" && (
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

            {role === "Tourist" && (
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
