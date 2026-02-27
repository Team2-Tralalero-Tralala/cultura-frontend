/**
 * คำอธิบาย : Component สำหรับหน้าสร้างสมาชิกในชุมชน (Admin)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as zod from "zod";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import api from "@/Libs/Api";
import TextField from "@/Components/Input/TextField";
import Button from "../../Components/Button";
import AvatarUploader from "@/Components/upload/AvatarUploader";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/**
 * คำอธิบาย : Schema สำหรับตรวจสอบความถูกต้องของข้อมูลสมาชิกก่อนสร้างบัญชี
 */
const memberSchema = zod
  .object({
    fname: zod.string().min(1, "กรุณากรอกชื่อ"),
    lname: zod.string().min(1, "กรุณากรอกนามสกุล"),
    username: zod
      .string()
      .min(4, "ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร")
      .regex(/^[a-zA-Z0-9]+$/, "ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น"),
    email: zod.string().email("กรุณากรอกอีเมล"),
    phone: zod.string().regex(/^0[0-9]{9}$/, "กรุณากรอกหมายเลขโทรศัพท์"),

    password: zod
      .string()
      .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
      .regex(/[a-z]/, "ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z)")
      .regex(/[A-Z]/, "ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ (A-Z)")
      .regex(/[0-9]/, "ต้องประกอบด้วยตัวเลข (0-9)"),

    confirmPassword: zod.string().min(8, "กรุณายืนยันรหัสผ่าน"),

    communityRole: zod.string().min(1, "กรุณากรอกตำแหน่งในชุมชน"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

/**
 * คำอธิบาย : Component สำหรับสร้างบัญชีสมาชิกโดย Admin
 * Input: -
 * Output: หน้าจอ (UI) ฟอร์มสำหรับสร้างบัญชีสมาชิกในชุมชน
 */
const CreateMemberPage: React.FC = () => {
  const navigate = useNavigate();

  /**
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
   * คำอธิบาย : State สำหรับควบคุมการแสดง Modal
   */
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [isShowSuccessModal, setIsShowSuccessModal] = useState(false);
  const [isShowErrorModal, setIsShowErrorModal] = useState(false);

  /**
   * คำอธิบาย : ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลในฟอร์ม
   * Input: fieldName (ชื่อฟิลด์ที่ต้องการตรวจสอบ), fieldValue (ค่าของฟิลด์นั้น)
   * Output : boolean (ส่งคืน true หากถูกต้อง, false หากผิดพลาด)
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

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่าของ Input
   * Input: event (เหตุการณ์การเปลี่ยนแปลง input)
   * Output : -
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => {
      const newData = { ...prev, [id]: value };
      // ลบ error ทันทีที่พิมพ์
      if (formErrors[id]) {
        setFormErrors((prevErr) => ({ ...prevErr, [id]: undefined }));
      }
      return newData;
    });
  };

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการการอัปโหลดรูปโปรไฟล์
   * Input: file (ไฟล์รูปภาพที่เลือก)
   * Output : -
   */
  const handleAvatarChange = (file: File | null) => {
    if (!file) return;
    setFormData((prev) => ({ ...prev, profileImage: file }));
  };

  /**
   * คำอธิบาย : ฟังก์ชันตรวจสอบความถูกต้องก่อนเปิด Modal Confirm
   * Input: -
   * Output : -
   */
  const handlePreCheck = () => {
    const isFormValid = validateField(); // ตรวจสอบ Schema (Zod)
    const isPasswordMatch = formData.password === formData.confirmPassword;

    if (!isFormValid || !isPasswordMatch) {
      // ถ้าไม่ผ่าน ให้แสดง Error Modal
      setIsShowErrorModal(true);

      // กรณีรหัสผ่านไม่ตรงกัน อาจจะ Toast บอกเพิ่มเพื่อให้ชัดเจน (Optional)
      if (!isPasswordMatch) {
        toast.error("รหัสผ่านไม่ตรงกัน");
      }
    } else {
      // ถ้าผ่าน ให้แสดง Confirm Modal
      setIsShowConfirm(true);
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับส่งข้อมูลฟอร์มเพื่อสร้างบัญชีสมาชิก
   * Input: event (เหตุการณ์จากฟอร์ม)
   * Output : -
   */
  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    // ตรวจสอบซ้ำอีกครั้ง (Defense in depth)
    const isValid = validateField();
    if (!isValid || formData.password !== formData.confirmPassword) {
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
        setIsShowSuccessModal(true);
        return;
      }

      if (formData.profileImage) {
        const formDataUpload = new FormData();
        formDataUpload.append("profileImage", formData.profileImage);

        await api.put(`/users/profile/${newUserId}`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setIsShowSuccessModal(true);
    } catch (error: any) {
      console.error("❌ Error creating member:", error);

      const errorMsg =
        error.response?.data?.message || error.response?.data?.error || "ไม่สามารถสร้างบัญชีได้";
      const newErrors: Record<string, string> = {};

      if (errorMsg.includes("ชื่อผู้ใช้")) {
        newErrors.username = "ชื่อผู้ใช้นี้มีในระบบแล้ว";
      } else if (errorMsg.includes("อีเมล")) {
        newErrors.email = "อีเมลนี้มีในระบบแล้ว";
      } else if (errorMsg.includes("โทรศัพท์") || errorMsg.includes("เบอร์")) {
        newErrors.phone = "เบอร์โทรศัพท์นี้มีในระบบแล้ว";
      } else {
        toast.error(`เกิดข้อผิดพลาด: ${errorMsg}`);
      }

      if (Object.keys(newErrors).length > 0) {
        setFormErrors((prev) => ({ ...prev, ...newErrors }));
      }
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

      <form className="bg-white p-10 rounded-xl shadow w-full ml-0 text-[15px] space-y-10 border border-gray-200 mt-6">
        <div className="flex items-center gap-3  pb-6">
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
            สร้างบัญชีสมาชิก
          </h1>
        </div>

        <div className="grid grid-cols-[320px_1fr] gap-14 items-start">
          <div className="flex flex-col items-center">
            <AvatarUploader avatarUrl={null} onAvatarChange={handleAvatarChange} avatarSize={270} />
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
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
              />
            </div>

            <TextField
              id="communityRole"
              label="บทบาทวิสาหกิจ"
              placeholder="กรอกบทบาทวิสาหกิจ"
              required
              value={formData.communityRole}
              onChange={handleChange}
              error={!!formErrors.communityRole}
              helperText={formErrors.communityRole}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 mt-8">
          <div className="w-32">
            <Button type="cancel" onClick={() => navigate(-1)}>
              ยกเลิก
            </Button>
          </div>
          <div className="w-32">
            <Button type="confirm-admin" onClick={handlePreCheck}>
              สร้างบัญชี
            </Button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={isShowConfirm}
        title="ยืนยันการสร้างบัญชี"
        text="คุณต้องการยืนยันการสร้างบัญชีสมาชิกนี้หรือไม่?"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          setIsShowConfirm(false);
          handleSubmit();
        }}
        onCancel={() => setIsShowConfirm(false)}
      />

      <ModalAlert
        isOpen={isShowSuccessModal}
        type="success"
        title="สร้างบัญชีสมาชิกสำเร็จ"
        message="ข้อมูลสมาชิกถูกสร้างเรียบร้อยแล้ว"
        onClose={() => {
          setIsShowSuccessModal(false);
          navigate("/admin/members");
        }}
      />

      <ModalAlert
        isOpen={isShowErrorModal}
        type="error"
        title="กรอกข้อมูลไม่ครบถ้วน"
        message="กรุณาตรวจสอบข้อมูลให้ครบถ้วน"
        onClose={() => setIsShowErrorModal(false)}
      />
    </div>
  );
};

export default CreateMemberPage;
