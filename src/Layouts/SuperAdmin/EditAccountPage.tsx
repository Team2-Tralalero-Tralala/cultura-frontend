/*
 * Component: EditAccountPage
 * Description: หน้าสำหรับแก้ไขข้อมูลบัญชีผู้ใช้เดิมของระบบ Super Admin
 * รองรับการแก้ไขบัญชี 3 ประเภท (Admin / Member / Tourist)
 * ดึงข้อมูลผู้ใช้จาก API ตาม ID และมี popup ยืนยันก่อนบันทึก
 */

//  External libraries
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";

//  Internal modules
import api from "../../Libs/api";

//  Local components
import TextField from "../../Components/TextField";
import Button from "../../Components/Button";
import SubmitButton from "../../Components/SubmitButton";

//  Types
type RoleType = "Admin" | "Member" | "Tourist";

interface EditAccountBody {
  fname: string;
  lname: string;
  username: string;
  email: string;
  phone: string;
  roleId: number;
  password?: string;
  memberOfCommunity?: number | null;
  gender?: "MALE" | "FEMALE" | "NONE";
  birthDate?: string | null;
  province?: string | null;
  district?: string | null;
  subDistrict?: string | null;
  postalCode?: string | null;
}

/** Component หลัก */
const EditAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminId, memberId, touristId } = useParams();
  const userId = adminId || memberId || touristId;

  /**  ดึง role จาก path */
  const getRoleFromPath = (): RoleType => {
    if (location.pathname.includes("member")) return "Member";
    if (location.pathname.includes("tourist")) return "Tourist";
    return "Admin";
  };

  /**  state หลักของฟอร์ม */
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

  /**  ข้อมูลเฉพาะ role */
  const [roleSpecificData, setRoleSpecificData] = useState({
    communityId: "",
    gender: "",
    birthDate: "",
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });

  /**  state popup ยืนยัน */
  const [showConfirm, setShowConfirm] = useState(false);

  /**  แปลงชื่อ role เป็น id */
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

  /**  โหลดข้อมูลผู้ใช้จาก API */
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

  /**  โหลดข้อมูลเมื่อเปิดหน้า */
  useEffect(() => {
    if (userId && Number(userId) > 0) fetchUser(formData.role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /**  handle input change */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /**  เมื่อกดบันทึก */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      const body: EditAccountBody = {
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        roleId: mapRoleToId(formData.role),
      };

      if (formData.password) body.password = formData.password;

      if (formData.role === "Member") {
        body.memberOfCommunity = Number(roleSpecificData.communityId) || null;
      } else if (formData.role === "Tourist") {
        body.gender =
          roleSpecificData.gender === "ชาย"
            ? "MALE"
            : roleSpecificData.gender === "หญิง"
            ? "FEMALE"
            : "NONE";
        body.birthDate = roleSpecificData.birthDate
          ? new Date(roleSpecificData.birthDate).toISOString().split("T")[0]
          : null;
        body.province = roleSpecificData.province || null;
        body.district = roleSpecificData.district || null;
        body.subDistrict = roleSpecificData.subdistrict || null;
        body.postalCode = roleSpecificData.postalCode || null;
      }

      let endpoint = "";
      if (formData.role === "Admin") endpoint = `/super/account/admin/${userId}`;
      else if (formData.role === "Member") endpoint = `/super/account/member/${userId}`;
      else endpoint = `/super/account/tourist/${userId}`;

      console.log("📡 PATCH:", endpoint, body);
      const res = await api.patch(endpoint, body);

      toast.success(res.data.message || "บันทึกการแก้ไขสำเร็จ ✅");
      setShowConfirm(false);
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
    <div className="pl-0 pr-6 pt-6 pb-6 h-full bg-transparent relative">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow max-w-6xl mx-auto text-[15px] space-y-10 border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 text-center tracking-tight">
          แก้ไขบัญชี
        </h2>

        <div className="grid grid-cols-[320px_1fr] gap-14 items-start">
          {/*  รูปโปรไฟล์ */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 bg-[#E3E5E9] rounded-full flex items-center justify-center shadow-sm">
              <Icon icon="mdi:account" className="text-gray-500 w-24 h-24" />
            </div>
          </div>

          {/*  ฟอร์มหลัก */}
          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <TextField id="fname" label="ชื่อ" required value={formData.fname} onChange={handleChange} />
              <TextField id="lname" label="นามสกุล" required value={formData.lname} onChange={handleChange} />
            </div>

            <TextField id="username" label="ชื่อผู้ใช้" required value={formData.username} onChange={handleChange} />
            <TextField id="email" label="อีเมล" required value={formData.email} onChange={handleChange} />
            <TextField id="phone" label="โทรศัพท์" required value={formData.phone} onChange={handleChange} />

            <div className="grid grid-cols-2 gap-6">
              <TextField id="password" label="รหัสผ่านใหม่ (ถ้ามี)" type="password" value={formData.password} onChange={handleChange} />
              <TextField id="confirmPassword" label="ยืนยันรหัสผ่าน" type="password" value={formData.confirmPassword} onChange={handleChange} />
            </div>

            {/*  Role Selection */}
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

            {/*  เฉพาะ Member */}
            {formData.role === "Member" && (
              <div>
                <label className="font-semibold text-gray-800">ชุมชนที่สังกัด</label>
                <input
                  id="communityId"
                  className="border rounded px-3 py-2 w-full"
                  value={roleSpecificData.communityId}
                  onChange={(e) =>
                    setRoleSpecificData((prev) => ({
                      ...prev,
                      communityId: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {/*  เฉพาะ Tourist */}
            {formData.role === "Tourist" && (
              <div className="grid grid-cols-2 gap-4">
                <TextField id="birthDate" label="วัน/เดือน/ปีเกิด" type="date" value={roleSpecificData.birthDate} onChange={(e) =>
                  setRoleSpecificData((prev) => ({ ...prev, birthDate: e.target.value }))
                } />

                <div>
                  <label className="font-semibold text-gray-800 block mb-1">เพศ</label>
                  <div className="flex gap-4">
                    {["ชาย", "หญิง", "ไม่ระบุ"].map((g) => (
                      <label key={g} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={roleSpecificData.gender === g}
                          onChange={(e) =>
                            setRoleSpecificData((prev) => ({
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

                <TextField id="province" label="จังหวัด" value={roleSpecificData.province} onChange={(e) =>
                  setRoleSpecificData((prev) => ({ ...prev, province: e.target.value }))
                } />
                <TextField id="district" label="อำเภอ/เขต" value={roleSpecificData.district} onChange={(e) =>
                  setRoleSpecificData((prev) => ({ ...prev, district: e.target.value }))
                } />
                <TextField id="subdistrict" label="ตำบล/แขวง" value={roleSpecificData.subdistrict} onChange={(e) =>
                  setRoleSpecificData((prev) => ({ ...prev, subdistrict: e.target.value }))
                } />
                <TextField id="postalCode" label="รหัสไปรษณีย์" value={roleSpecificData.postalCode} onChange={(e) =>
                  setRoleSpecificData((prev) => ({ ...prev, postalCode: e.target.value }))
                } />
              </div>
            )}
          </div>
        </div>

        {/*  ปุ่มบันทึก / ยกเลิก */}
        <div className="flex justify-end gap-4 pt-4">
          <div className="w-32">
            <Button type="cancel" onClick={() => navigate(-1)}>
              ยกเลิก
            </Button>
          </div>
          <div className="w-32">
            <SubmitButton htmlType="button" onClick={() => setShowConfirm(true)}>
              บันทึก
            </SubmitButton>
          </div>
        </div>
      </form>

      {/*  Popup ยืนยัน */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-6 border border-gray-200 animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <Icon icon="mdi:alert-circle-outline" className="text-green-800 text-6xl" />
              <h3 className="text-xl font-bold text-gray-800">ยืนยันการบันทึกข้อมูล</h3>
              <p className="text-gray-600 text-sm">
                คุณต้องการบันทึกการแก้ไขบัญชีนี้หรือไม่
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <div className="w-28">
                <Button type="cancel" onClick={() => setShowConfirm(false)}>
                  ยกเลิก
                </Button>
              </div>
              <div className="w-28">
                <SubmitButton
                  htmlType="button"
                  onClick={() => {
                    setShowConfirm(false);
                    handleSubmit(
                      new Event("submit") as unknown as React.FormEvent<HTMLFormElement>
                    );
                  }}
                >
                  ยืนยัน
                </SubmitButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAccountPage;
