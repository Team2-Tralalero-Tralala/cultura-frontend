/*
 * Component: CreateMemberPage (Admin)
 * Description: หน้าสำหรับ Admin สร้างสมาชิกในชุมชน (ใช้ ModalAlert ตอนสำเร็จ)
 * Author: Team 2 (Cultura)
 * Last Modified: 07 ธันวาคม 2568 (Smart Fetch Community)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as z from "zod";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert"; 
import api from "@/Libs/api"; 
import TextField from "../../Components/TextField"; 
import Button from "../../Components/Button"; 
import SubmitButton from "../../Components/SubmitButton"; 
import AvatarUploader from "@/Components/AvatarUploader";
import Breadcrumb from "@/Components/BreadcrumbNavigation"; 

/*
 * คำอธิบาย : Schema สำหรับตรวจสอบความถูกต้องของข้อมูลสมาชิกก่อนสร้างบัญชี
 */
const memberSchema = z.object({
  fname: z.string().min(1, "กรุณากรอกชื่อ"),
  lname: z.string().min(1, "กรุณากรอกนามสกุล"),
  username: z.string().min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z.string().regex(/^0[0-9]{9}$/, "เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string(),
  communityRole: z.string().min(1, "กรุณากรอกตำแหน่งในชุมชน"),
});

/*
 * คำอธิบาย : Component สำหรับสร้างบัญชีสมาชิกโดย Admin
 */
const CreateMemberPage: React.FC = () => {
  const navigate = useNavigate();

 /*
   * คำอธิบาย : State สำหรับเก็บค่าข้อมูลจากฟอร์ม
   */
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    communityRole: "", 
    profileImage: null as File | null,
  });

  /*
   * คำอธิบาย : State สำหรับเก็บข้อความ Error ของแต่ละฟิลด์
   */
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});

   /*
   * คำอธิบาย : State สำหรับควบคุมการแสดง Modal ยืนยันการสร้างบัญชี
   */
  const [showConfirm, setShowConfirm] = useState(false);

   /*
   * คำอธิบาย : State สำหรับควบคุมการแสดง Modal เมื่อสร้างบัญชีสำเร็จ
   */
  const [showSuccessModal, setShowSuccessModal] = useState(false);

   /*
   * คำอธิบาย : ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลในฟอร์ม
   * Input : fieldName, fieldValue
   * Output : boolean
   */
  const validateField = (fieldName?: string, fieldValue?: unknown) => {
    if (fieldName) {
      const result = memberSchema.safeParse({
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
      const result = memberSchema.safeParse(formData);
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

   /*
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่าของ Input
   * Input : event
   * Output : -
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => {
        const newData = { ...prev, [id]: value };
        validateField(id, value); 
        return newData;
    });
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการการอัปโหลดรูปโปรไฟล์
   * Input : file
   * Output : -
   */
  const handleAvatarChange = (file: File | null) => {
    if (!file) return;
    setFormData((prev) => ({ ...prev, profileImage: file }));
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับส่งข้อมูลฟอร์มเพื่อสร้างบัญชีสมาชิก
   * Input : event
   * Output : -
   */
  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    const isValid = validateField();
    if (!isValid) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน ❌");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน ❌");
      return;
    }

    try {
      const payload = {
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password, 
        communityRole: formData.communityRole.trim(),
      };

      const response = await api.post("/admin/member", payload);
      const newUserId = response.data?.data?.id;

      if (!newUserId) {
         setShowSuccessModal(true);
         return;
      }

      if (formData.profileImage) {
        const formDataUpload = new FormData();
        formDataUpload.append("profileImage", formData.profileImage);

        await api.put(`/users/profile/${newUserId}`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setShowSuccessModal(true);

    } catch (error: any) {
      console.error("❌ Error creating member:", error);
      const msg = error.response?.data?.message || error.response?.data?.error || "ไม่สามารถสร้างบัญชีได้";
      toast.error(`เกิดข้อผิดพลาด: ${msg}`);
    }
  };

  return (
    <div className="pl-0 pr-4 pt-6 pb-6 h-full bg-transparent relative">
      <div>
        <Breadcrumb
          current={{
            label: "สร้างบัญชีสมาชิก",
            to: "/admin/members/create",
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
        <h1 className="text-xl font-bold text-black tracking-tight">สร้างบัญชีสมาชิก</h1>
      </div>

      <form className="bg-white p-10 rounded-xl shadow w-full ml-0 text-[15px] space-y-10 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 text-center tracking-tight">
          สร้างบัญชีสมาชิก
        </h2>

        <div className="grid grid-cols-[320px_1fr] gap-14 items-start">
          <div className="flex flex-col items-center">
            <AvatarUploader 
                avatarUrl={null} 
                onAvatarChange={handleAvatarChange} 
                avatarSize={270} 
            />
          </div>

          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <TextField
                id="fname"
                label="ชื่อ (ไม่ต้องใส่คำนำหน้า)"
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
                label="ยืนยันรหัสผ่าน"
                placeholder="ยืนยันรหัสผ่าน"
                required
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <TextField
              id="communityRole"
              label="บทบาทวิสาหกิจ"
              placeholder="เช่น แม่บ้าน, ฝ่ายบัญชี"
              required
              value={formData.communityRole}
              onChange={handleChange}
              error={!!formErrors.communityRole}
              helperText={formErrors.communityRole}
            />

          </div>
        </div>

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
              สร้างบัญชี
            </SubmitButton>
          </div>
        </div>
      </form>

      <Modal
        open={showConfirm}
        title="ยืนยันการสร้างบัญชี"
        text="คุณต้องการยืนยันการสร้างบัญชีสมาชิกนี้หรือไม่?"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          setShowConfirm(false);
          handleSubmit();
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <ModalAlert
        open={showSuccessModal}
        type="success"
        title="สร้างบัญชีสมาชิกสำเร็จ"
        message="ข้อมูลสมาชิกถูกสร้างเรียบร้อยแล้ว"
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/admin/members"); 
        }}
      />
    </div>
  );
};

export default CreateMemberPage;