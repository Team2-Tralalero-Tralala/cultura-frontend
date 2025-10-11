import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TextField from "../TextField";
import Button from "../Button";
import SubmitButton from "../SubmitButton";
import api from "@/Libs/api";
import { toast } from "react-toastify";

const EditAccountPage: React.FC = () => {
  const { adminId } = useParams(); // ดึง id จาก URL
  const navigate = useNavigate();

  // state ฟอร์ม
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // โหลดข้อมูลเดิมของ admin
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await api.get(`/accounts/${adminId}`);
        setFormData({
          fname: res.data.data.fname || "",
          lname: res.data.data.lname || "",
          username: res.data.data.username || "",
          email: res.data.data.email || "",
          phone: res.data.data.phone || "",
          password: "",
          confirmPassword: "",
        });
      } catch (err: any) {
        toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      }
    };
    if (adminId) fetchAccount();
  }, [adminId]);

  // เมื่อเปลี่ยนค่าใน input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // เมื่อกด submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      const payload = {
        fname: formData.fname,
        lname: formData.lname,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        ...(formData.password && { password: formData.password }),
      };

      const res = await api.put(`/accounts/${adminId}`, payload);

      if (res.data.status === 200) {
        toast.success("แก้ไขบัญชีสำเร็จ");
        navigate("/super/account/admin/list");
      } else {
        toast.error(res.data.message || "เกิดข้อผิดพลาด");
      }
    } catch (error: any) {
      toast.error("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">แก้ไขบัญชีผู้ดูแลระบบ</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            label="ยืนยันรหัสผ่านใหม่"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <div className="w-32">
            <Button htmlType="button" type="cancel" onClick={() => navigate(-1)}>
              ยกเลิก
            </Button>
          </div>
          <div className="w-32">
            <SubmitButton htmlType="submit">บันทึก</SubmitButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditAccountPage;
