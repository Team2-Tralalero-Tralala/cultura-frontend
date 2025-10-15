import React, { useState, useEffect } from "react";
import TextField from "../TextField";
import Button from "../Button";
import SubmitButton from "../SubmitButton";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import api from "../../Libs/api";
import { useNavigate, useLocation } from "react-router-dom";

/*
 * Component : CreateAccountPage
 * คำอธิบาย : หน้าสร้างบัญชีใหม่ (เปลี่ยน path ตาม Role)
 */

type RoleType = "Admin" | "Member" | "Tourist";

type CreateAccountPageProps = {
  defaultRole?: RoleType;
};

const CreateAccountPage: React.FC<CreateAccountPageProps> = ({
  defaultRole = "Admin",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  /** ตรวจ role จาก path เช่น /super/account/admin/create */
  const getRoleFromPath = (): RoleType => {
    if (location.pathname.includes("member")) return "Member";
    if (location.pathname.includes("tourist")) return "Tourist";
    return "Admin";
  };

  /** ค่าเริ่มต้นของฟอร์ม */
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: defaultRole,
  });

  /** ฟิลด์เพิ่มเติมเฉพาะแต่ละ Role */
  const [extraData, setExtraData] = useState({
    communityId: "", // member only
    gender: "", // tourist only
    birthDate: "", // tourist only
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });

  /** ถ้าเปลี่ยน path → อัปเดต role ให้ตรง */
  useEffect(() => {
    setFormData((prev) => ({ ...prev, role: getRoleFromPath() }));
  }, [location.pathname]);

  /** handle input change */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /** handle role select (เปลี่ยน path) */
  const handleRoleSelect = (role: RoleType) => {
    if (role === "Admin") navigate("/super/account/admin/create");
    if (role === "Member") navigate("/super/account/member/create");
    if (role === "Tourist") navigate("/super/account/tourist/create");
  };

  /** handle submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔸 ตรวจรหัสผ่านตรงกันไหม
    if (formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน กรุณาลองใหม่อีกครั้ง");
      return;
    }

    try {
      let roleId = 2; // Admin
      if (formData.role === "Member") roleId = 3;
      if (formData.role === "Tourist") roleId = 4;

      // 🔹 payload หลัก
      const body: any = {
        roleId,
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      };

      // 🔹 เพิ่มข้อมูลเฉพาะ Role
      if (formData.role === "Member") {
        body.memberOfCommunity = Number(extraData.communityId);
      } else if (formData.role === "Tourist") {
        // ✅ แปลงค่าก่อนส่งให้ตรง DTO
        body.gender =
          extraData.gender === "ชาย"
            ? "MALE"
            : extraData.gender === "หญิง"
            ? "FEMALE"
            : "NONE";

        body.birthDate = extraData.birthDate
          ? new Date(extraData.birthDate).toISOString().split("T")[0]
          : null;

        body.province = extraData.province.trim();
        body.district = extraData.district.trim();
        body.subDistrict = extraData.subdistrict.trim(); // ✅ ตัว D ใหญ่
        body.postalCode = extraData.postalCode.trim();
      }

      console.log("🔍 ส่งข้อมูลไป backend:", body); // debug ดูใน console

      const res = await api.post("/accounts", body);
      toast.success(res.data.message || "สร้างบัญชีสำเร็จ ✅");

      // reset form
      setFormData({
        fname: "",
        lname: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: getRoleFromPath(),
      });
      setExtraData({
        communityId: "",
        gender: "",
        birthDate: "",
        province: "",
        district: "",
        subdistrict: "",
        postalCode: "",
      });
    } catch (err: any) {
      console.error("Error creating account:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "ไม่สามารถสร้างบัญชีได้";

      if (msg.includes("exists") || msg.includes("duplicate")) {
        toast.error("ชื่อผู้ใช้ / อีเมล / เบอร์โทร ถูกใช้แล้ว");
      } else if (msg.includes("Role")) {
        toast.error("Role ไม่ถูกต้อง");
      } else if (msg.includes("Unauthorized") || msg.includes("token")) {
        toast.error("ไม่มีสิทธิ์ในการสร้างบัญชี (โปรดล็อกอินใหม่)");
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="p-10 h-full bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] max-w-6xl mx-auto text-[15px] space-y-10 border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 text-center tracking-tight">
          สร้างบัญชี
        </h2>

        <div className="grid grid-cols-[320px_1fr] gap-14 items-start">
          {/* ---------- รูปโปรไฟล์ ---------- */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 bg-[#E3E5E9] rounded-full flex items-center justify-center shadow-sm">
              <Icon icon="mdi:account" className="text-gray-500 w-24 h-24" />
              <label
                htmlFor="profileImage"
                className="absolute bottom-2 right-2 bg-[#E3E5E9] p-[6px] rounded-full border border-gray-300 cursor-pointer shadow-sm hover:bg-gray-100 transition-all"
              >
                <Icon
                  icon="mdi:pencil"
                  className="text-gray-800 w-[15px] h-[15px]"
                />
              </label>
              <input id="profileImage" type="file" className="hidden" />
            </div>
          </div>

          {/* ---------- ฟอร์มข้อมูล ---------- */}
          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <TextField
                id="fname"
                label="ชื่อ (ไม่ต้องใส่คำนำหน้า)"
                required
                placeholder="ชื่อ"
                value={formData.fname}
                onChange={handleChange}
              />
              <TextField
                id="lname"
                label="นามสกุล"
                required
                placeholder="นามสกุล"
                value={formData.lname}
                onChange={handleChange}
              />
            </div>

            <TextField
              id="username"
              label="ชื่อผู้ใช้"
              required
              placeholder="ชื่อผู้ใช้"
              value={formData.username}
              onChange={handleChange}
            />

            <TextField
              id="email"
              label="อีเมล"
              required
              placeholder="อีเมล"
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              id="phone"
              label="โทรศัพท์"
              required
              placeholder="หมายเลขโทรศัพท์"
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-6">
              <TextField
                id="password"
                label="รหัสผ่าน"
                required
                placeholder="รหัสผ่าน"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
              <TextField
                id="confirmPassword"
                label="ยืนยันรหัสผ่าน"
                required
                placeholder="ยืนยันรหัสผ่าน"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* ===== ปุ่มเปลี่ยน Role ===== */}
            <div className="space-y-1">
              <label className="font-semibold text-gray-800">
                Role <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-3 mt-1">
                {(["Admin", "Member", "Tourist"] as RoleType[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all ${
                      formData.role === role
                        ? "bg-green-800 text-white border-green-800"
                        : "bg-white text-gray-700 border-gray-300 hover:border-green-800"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* ===== ฟิลด์เฉพาะ Role ===== */}
            {formData.role === "Member" && (
              <div className="space-y-3">
                <label className="font-semibold text-gray-800">
                  ชุมชนที่สังกัด *
                </label>
                <select
                  id="communityId"
                  value={extraData.communityId}
                  onChange={(e) =>
                    setExtraData((prev) => ({
                      ...prev,
                      communityId: e.target.value,
                    }))
                  }
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">-- เลือกชุมชน --</option>
                  <option value="1">ชุมชนวัดใหม่</option>
                  <option value="2">ชุมชนบ้านเหนือ</option>
                </select>
              </div>
            )}

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

        {/* ===== ปุ่มบันทึก / ยกเลิก ===== */}
        <div className="flex justify-end gap-4 pt-4">
          <div className="w-32">
            <Button type="cancel">ยกเลิก</Button>
          </div>
          <div className="w-32">
            <SubmitButton>สร้างบัญชี</SubmitButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAccountPage;
