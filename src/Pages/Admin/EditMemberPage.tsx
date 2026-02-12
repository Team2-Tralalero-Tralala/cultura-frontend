/*
 * Component: EditMemberPage (Admin)
 * Description: หน้าสำหรับ Admin แก้ไขข้อมูลสมาชิกในชุมชน และอัปเดตรูปโปรไฟล์
 * Author: Team 2 (Cultura)
 * Last Modified: 20 มกราคม 2569 (Smart Fetch Community)
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import * as z from "zod"; // [เพิ่ม] import zod
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import api from "@/Libs/Api";
import TextField from "@/Components/Input/TextField";
import Button from "../../Components/Button";

import AvatarUploader from "@/Components/upload/AvatarUploader";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { Icon } from "@iconify/react";

/*
 *  Schema สำหรับตรวจสอบความถูกต้องของข้อมูล (ไม่รวมรหัสผ่าน)
 */
const editMemberSchema = z.object({
  fname: z.string().min(1, "กรุณากรอกชื่อ"),
  lname: z.string().min(1, "กรุณากรอกนามสกุล"),
  username: z.string().min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z.string().regex(/^0[0-9]{9}$/, "เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก"),
  communityRole: z.string().min(1, "กรุณากรอกตำแหน่งในชุมชน"),
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

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  /*
   *  ฟังก์ชันตรวจสอบ Validation
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
        setFormErrors(validationErrors);
        return false;
      }
      setFormErrors({});
      return true;
    }
  };

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
        communityRole: member.communityRole || "",
      });

      setAvatarUrl(member.profileImageUrl || null);
    } catch (error: any) {
      console.error("❌ Error fetching member:", error);
      toast.error("ไม่สามารถโหลดข้อมูลสมาชิกได้");
      navigate("/admin/members");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMemberData();
    }
  }, [userId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => {
      const newData = { ...prev, [id]: value };
      //  ลบ Error ทันทีเมื่อมีการพิมพ์แก้ไข
      if (formErrors[id]) {
        setFormErrors((prevErr) => ({ ...prevErr, [id]: undefined }));
      }
      return newData;
    });
  };

  /*
   * ฟังก์ชัน Pre-check ก่อนเปิด Modal ยืนยัน
   */
  const handlePreCheck = () => {
    const isValid = validateField();
    if (!isValid) {
      setShowErrorModal(true);
    } else {
      setShowConfirm(true);
    }
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    if (!validateField()) return;

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

      setShowConfirm(false);
      setShowSuccessModal(true);

      if (imageWasUpdated) {
        setProfileImage(null);
      }
    } catch (error: any) {
      console.error("❌ Error updating member:", error);
      const msg = error.response?.data?.message || error.message || "บันทึกข้อมูลไม่สำเร็จ";
      toast.error(msg);
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

      <form className="bg-white p-10 rounded-xl shadow w-full ml-0 text-[15px] space-y-10 border border-gray-200 mt-6">
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
            <ul className="mt-1.5 ml-1 text-xs text-gray-500 list-disc pl-4 space-y-0.5">
              <li>ความยาวอย่างน้อย 4 ตัวอักษร</li>
              <li>ควรประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข</li>
            </ul>

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

            <TextField
              id="communityRole"
              label="บทบาทในชุมชน"
              placeholder="กรอกบทบาทในชุมชน"
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
              บันทึก
            </Button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={showConfirm}
        title="ยืนยันการบันทึกข้อมูล"
        text="คุณต้องการบันทึกการแก้ไขข้อมูลสมาชิกนี้หรือไม่?"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          setShowConfirm(false);
          handleSubmit();
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <ModalAlert
        isOpen={showSuccessModal}
        type="success"
        title="แก้ไขสมาชิกสำเร็จ"
        message="ข้อมูลสมาชิกถูกแก้ไขเรียบร้อยแล้ว"
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/admin/members");
        }}
      />

      <ModalAlert
        isOpen={showErrorModal}
        type="error"
        title="กรอกข้อมูลไม่ครบถ้วน"
        message="กรุณาตรวจสอบข้อมูลให้ครบถ้วน"
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default EditMemberPage;
