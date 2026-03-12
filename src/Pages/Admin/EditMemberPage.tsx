/**
 * คำอธิบาย : Component สำหรับหน้า Admin แก้ไขข้อมูลสมาชิกในชุมชน และอัปเดตรูปโปรไฟล์
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import zod from "zod";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import api from "@/Libs/Api";
import TextField from "@/Components/Input/TextField";
import Button from "../../Components/Button";
import AvatarUploader from "@/Components/upload/AvatarUploader";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { Icon } from "@iconify/react";

/**
 * Schema สำหรับตรวจสอบความถูกต้องของข้อมูล (ไม่รวมรหัสผ่าน)
 */
const editMemberSchema = zod.object({
  fname: zod.string().min(1, "กรุณากรอกชื่อ"),
  lname: zod.string().min(1, "กรุณากรอกนามสกุล"),
  username: zod
    .string()
    .min(4, "ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร")
    .regex(/^[a-zA-Z0-9]+$/, "ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น"),
  email: zod
    .string()
    .min(1, "กรุณากรอกอีเมล")
    .refine(
      (val) => val === "" || zod.string().email().safeParse(val).success,
      "รูปแบบอีเมลไม่ถูกต้อง"
    ),
  phone: zod
    .string()
    .min(1, "กรุณากรอกหมายเลขโทรศัพท์")
    .refine(
      (val) => val === "" || /^0[0-9]{9}$/.test(val),
      "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง"
    ),
});

interface EditMemberBody {
  fname: string;
  lname: string;
  username: string;
  email: string;
  phone: string;
  roleId: number;
  communityRole: string;
}

/**
 * คำอธิบาย : Component ฟังก์ชันสำหรับหน้าแก้ไขข้อมูลสมาชิกในชุมชน
 * Input: -
 * Output: หน้าจอ (UI) ฟอร์มสำหรับแก้ไขข้อมูลและรูปโปรไฟล์ของสมาชิก
 */
const EditMemberPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
    communityRole: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});

  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [isShowSuccessModal, setIsShowSuccessModal] = useState(false);
  const [isShowErrorModal, setIsShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 

  /**
   * คำอธิบาย : ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลในฟอร์ม (Validation)
   */
  const validateField = (fieldName?: string, fieldValue?: unknown) => {
    if (fieldName) {
      const result = editMemberSchema.safeParse({
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
      const result = editMemberSchema.safeParse(formData);
      if (!result.success) {
        const validationErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          validationErrors[issue.path[0] as string] = issue.message;
        });
        setFormErrors((prev) => ({ ...prev, ...validationErrors }));
        return false;
      }
      return true;
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลสมาชิกจากระบบเพื่อนำมาแสดงในฟอร์ม
   */
  const fetchMemberData = async () => {
    try {
      const response = await api.get(`/admin/member/${userId}`);
      const member = response.data?.data;

      if (!member) throw new Error("ไม่พบข้อมูลสมาชิก");

      setFormData({
        fname: member.fname || "",
        lname: member.lname || "",
        username: member.username || "",
        email: member.email || "",
        phone: member.phone || "",
        communityRole: member.activityRole || "",
      });

      setAvatarUrl(member.profileImageUrl || null);
    } catch (error: any) {
      console.error("❌ Error fetching member:", error);
      setErrorMessage("ไม่สามารถโหลดข้อมูลสมาชิกได้");
      setIsShowErrorModal(true);
      setTimeout(() => navigate("/admin/members"), 2000);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMemberData();
    }
  }, [userId]);

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่าของ Input ภายในฟอร์ม
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    validateField(id, value);
  };

  /**
   * คำอธิบาย : ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลก่อนเปิด Modal ยืนยันการบันทึก
   */
  const handlePreCheck = () => {
    const isFormValid = validateField();
    if (!isFormValid) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      setIsShowErrorModal(true);
    } else {
      setIsShowConfirm(true);
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับส่งข้อมูลฟอร์มและรูปภาพเพื่ออัปเดตข้อมูลสมาชิกในระบบ
   */
  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    const isFormValid = validateField();
    if (!isFormValid) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      setIsShowErrorModal(true);
      return;
    }

    try {
      let imageWasUpdated = false;

      if (profileImage) {
        const formDataUpload = new FormData();
        formDataUpload.append("profileImage", profileImage);

        await api.put(`/users/profile/${userId}`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageWasUpdated = true;
      }

      const requestBody: EditMemberBody = {
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        roleId: 1, 
        communityRole: formData.communityRole.trim(),
      };

      await api.put(`/admin/member/${userId}`, requestBody);

      setIsShowConfirm(false);
      setIsShowSuccessModal(true);

      if (imageWasUpdated) {
        setProfileImage(null);
      }
    } catch (error: any) {
      console.error("❌ Error updating account:", error);

      const errorResponse = error.response?.data;
      const errorMsg = errorResponse?.message || error.message || "ไม่สามารถบันทึกการแก้ไขได้";
      const errorData = errorResponse?.errors || {}; 

      const newErrors: Record<string, string> = {};
      const errorMsgLower = errorMsg.toLowerCase();

      if (errorMsgLower.includes("ชื่อผู้ใช้") || errorMsgLower.includes("username") || errorMsgLower.includes("duplicate_username") || errorData.username) {
        newErrors.username = "ชื่อผู้ใช้นี้มีในระบบแล้ว";
      } 
      if (errorMsgLower.includes("อีเมล") || errorMsgLower.includes("email") || errorMsgLower.includes("duplicate_email") || errorData.email) {
        newErrors.email = "อีเมลนี้ถูกใช้งานแล้ว";
      } 
      if (errorMsgLower.includes("โทรศัพท์") || errorMsgLower.includes("เบอร์") || errorMsgLower.includes("phone") || errorMsgLower.includes("duplicate_phone") || errorData.phone) {
        newErrors.phone = "เบอร์โทรศัพท์นี้มีในระบบแล้ว";
      }

      const errorKeys = Object.keys(newErrors);

      if (errorKeys.length > 0) {
        setFormErrors((prev) => ({ ...prev, ...newErrors }));
        const combinedErrorMessage = errorKeys.map(key => newErrors[key]).join(" และ ");
        setErrorMessage(combinedErrorMessage);
      } else {
        setErrorMessage(errorMsg);
      }

      setIsShowConfirm(false);
      setIsShowErrorModal(true);
    }
  };

  return (
    <div className="pl-0 pr-4 pt-6 pb-6 h-full bg-transparent relative">
      <div className="mb-2">
        <Breadcrumb
          current={{
            label: "แก้ไขสมาชิก",
            to: location.pathname,
          }}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow w-full ml-0 text-[15px] space-y-10 border border-gray-200 mt-6"
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
            className="text-xl font-bold text-black tracking-tight cursor-pointer hover:text-gray-600 transition-colors select-none"
          >
            แก้ไขสมาชิก
          </h1>
        </div>

        <div className="grid grid-cols-[320px_1fr] gap-14 items-start">
          <div className="flex flex-col items-center">
            <AvatarUploader
              avatarUrl={avatarUrl}
              onAvatarChange={(file) => setProfileImage(file)}
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

            <div className="relative w-full">
              <div className="absolute right-0 top-0 z-10">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/member/reset-password/${userId}`)}
                  className="text-sm font-medium text-[#0A4B32] hover:text-green-700 hover:underline flex items-center gap-1 transition-colors"
                >
                  <Icon icon="mdi:lock-reset" className="w-4 h-4" />
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>

              <TextField
                id="communityRole"
                label="บทบาทในชุมชน"
                placeholder="กรอกบทบาทในชุมชน"
                value={formData.communityRole}
                onChange={handleChange}
                error={!!formErrors.communityRole}
                helperText={formErrors.communityRole}
              />
            </div>
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
              บันทึก
            </Button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={isShowConfirm}
        title="ยืนยันการบันทึกข้อมูล"
        text="คุณต้องการบันทึกการแก้ไขข้อมูลสมาชิกนี้หรือไม่?"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          setIsShowConfirm(false);
          handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>);
        }}
        onCancel={() => setIsShowConfirm(false)}
      />

      <ModalAlert
        isOpen={isShowSuccessModal}
        type="success"
        title="แก้ไขสมาชิกสำเร็จ"
        message="ข้อมูลสมาชิกถูกแก้ไขเรียบร้อยแล้ว"
        onClose={() => {
          setIsShowSuccessModal(false);
          navigate("/admin/members");
        }}
      />

      <ModalAlert
        isOpen={isShowErrorModal}
        type="error"
        title="ไม่สามารถบันทึกข้อมูลได้"
        message={errorMessage} 
        onClose={() => setIsShowErrorModal(false)}
      />
    </div>
  );
};

export default EditMemberPage;