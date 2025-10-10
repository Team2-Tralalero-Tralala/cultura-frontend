import React, { useState } from "react";
import TextField from "../TextField";
import Button from "../Button";
import SubmitButton from "../SubmitButton";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";

/*
 * Component : CreateAccountPage
 * คำอธิบาย : หน้าสำหรับสร้างบัญชีใหม่ (เฉพาะ SuperAdmin / Admin)
 * โดยเชื่อมต่อกับ API /api/accounts เพื่อเพิ่มข้อมูลผู้ใช้ใหม่
 */
const CreateAccountPage = () => {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Admin",
  });

  /** handle input change */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /** handle role select */
  const handleRoleSelect = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  /** submit form (ยิง API ไป backend) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //  ตรวจรหัสผ่านซ้ำ
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password and Confirm Password do not match ");
      return;
    }

    try {
      //  Mapping role → roleId
      let roleId = 2; // Admin (default)
      if (formData.role === "Member") roleId = 3;
      if (formData.role === "Tourist") roleId = 4;

      const body = {
        roleId,
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      };

      //  ยิง API ด้วย fetch (แทน axios)
      const response = await fetch("http://localhost:3000/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Request failed");

      //  แจ้งผลลัพธ์
      toast.success(data.message || "Account created successfully");
      console.log("API Response:", data);

      //  ล้างฟอร์มหลังสำเร็จ
      setFormData({
        fname: "",
        lname: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "Admin",
      });
    } catch (error: any) {
      console.error("Error creating account:", error);
      const errMsg =
        error.message || error.response?.data?.message || "Failed to create account";

      //  ตรวจข้อความ error จาก backend
      if (errMsg.includes("duplicate")) {
        toast.error("Username / Email / Phone already exists");
      } else if (errMsg.includes("role_not_found")) {
        toast.error("Invalid role selected");
      } else if (errMsg.includes("unauthorized")) {
        toast.error("You are not authorized to perform this action");
      } else {
        toast.error(errMsg);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-10 rounded-lg shadow-md max-w-6xl mx-auto text-[15px] space-y-10"
    >
      {/* ====== หัวข้อ ====== */}
      <h2 className="text-lg font-bold text-gray-800 text-center tracking-tight">
        สร้างบัญชี
      </h2>

      {/* ====== Layout หลัก ====== */}
      <div className="grid grid-cols-[320px_1fr] gap-14 items-start">
        {/* ---------- ฝั่งซ้าย: รูปโปรไฟล์ ---------- */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 bg-[#E3E5E9] rounded-full flex items-center justify-center shadow-sm">
            <Icon icon="mdi:account" className="text-gray-500 w-24 h-24" />

            {/* ปุ่มดินสอ */}
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

        {/* ---------- ฝั่งขวา: ฟอร์มข้อมูล ---------- */}
        <div className="w-full space-y-6">
          {/* ชื่อ - นามสกุล */}
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

          {/* ชื่อผู้ใช้ */}
          <TextField
            id="username"
            label="ชื่อผู้ใช้"
            required
            placeholder="ชื่อผู้ใช้"
            value={formData.username}
            onChange={handleChange}
          />

          {/* อีเมล */}
          <TextField
            id="email"
            label="อีเมล"
            required
            placeholder="อีเมล"
            value={formData.email}
            onChange={handleChange}
          />

          {/* โทรศัพท์ */}
          <TextField
            id="phone"
            label="โทรศัพท์"
            required
            placeholder="หมายเลขโทรศัพท์"
            value={formData.phone}
            onChange={handleChange}
          />

          {/* รหัสผ่าน + ยืนยันรหัสผ่าน */}
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

          {/* Role */}
          <div className="space-y-1">
            <label className="font-semibold text-gray-800">
              Role <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-3 mt-1">
              {["Admin", "Member", "Tourist"].map((role) => (
                <button
                  type="button"
                  key={role}
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
        </div>
      </div>

      {/* ====== ปุ่มบันทึก / ยกเลิก ====== */}
      <div className="flex justify-end gap-4 pt-4">
        <div className="w-32">
          <Button type="cancel">ยกเลิก</Button>
        </div>
        <div className="w-32">
          <SubmitButton>สร้างบัญชี</SubmitButton>
        </div>
      </div>
    </form>
  );
};

export default CreateAccountPage;
