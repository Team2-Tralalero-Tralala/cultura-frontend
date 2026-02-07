/**
 * Component: EditMemberPage (Admin)
 * คำอธิบาย: หน้าสำหรับ Admin แก้ไขข้อมูลสมาชิกในชุมชน และอัปเดตรูปโปรไฟล์
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import api from "@/Libs/Api";
import TextField from "@/Components/Input/TextField";
import Button from "@/Components/Button";
import AvatarUploader from "@/Components/upload/AvatarUploader";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/**
 * คำอธิบาย: Interface สำหรับกำหนดโครงสร้างข้อมูลที่ใช้ในการแก้ไขข้อมูลสมาชิก
 */
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
 * คำอธิบาย: Component สำหรับแก้ไขข้อมูลสมาชิกโดย Admin
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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับดึงข้อมูลสมาชิกจากระบบเพื่อนำมาแสดงในฟอร์ม
   * Input: -
   * Output: - (อัปเดต state)
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
        communityRole: member.communityRole || "",
      });

      setAvatarUrl(member.profileImageUrl || null);
    } catch (error: any) {
      console.error("❌ Error fetching member:", error);
      toast.error("ไม่สามารถโหลดข้อมูลสมาชิกได้");
      navigate("/admin/members");
    }
  };

  /**
   * คำอธิบาย: Hook สำหรับโหลดข้อมูลสมาชิกเมื่อมี userId
   */
  useEffect(() => {
    if (userId) {
      fetchMemberData();
    }
  }, [userId]);

  /**
   * คำอธิบาย: ฟังก์ชันจัดการการเปลี่ยนแปลงค่าของ Input
   * Input: event
   * Output: -
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับบันทึกข้อมูลการแก้ไขสมาชิก
   * Input: event
   * Output: -
   */
  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    if (!formData.fname || !formData.lname || !formData.username || !formData.email) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
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
        roleId: 3,
        communityRole: formData.communityRole.trim(),
      };

      await api.put(`/admin/member/${userId}`, requestBody);

      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);

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
        <h1 className="text-xl font-bold text-black tracking-tight">แก้ไขสมาชิก</h1>
      </div>

      <form className="bg-white p-10 rounded-xl shadow w-full ml-0 text-[15px] space-y-10 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 text-center tracking-tight">
          แก้ไขข้อมูลสมาชิก
        </h2>

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
              />
              <TextField
                id="lname"
                label="นามสกุล"
                placeholder="กรอกนามสกุล"
                required
                value={formData.lname}
                onChange={handleChange}
              />
            </div>

            <TextField
              id="username"
              label="ชื่อผู้ใช้"
              placeholder="กรอกชื่อผู้ใช้"
              required
              value={formData.username}
              onChange={handleChange}
            />

            <TextField
              id="email"
              label="อีเมล"
              placeholder="กรอกอีเมล"
              required
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              id="phone"
              label="โทรศัพท์"
              placeholder="กรอกหมายเลขโทรศัพท์"
              required
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(`/admin/members/${userId}/reset-password`)}
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
              required
              value={formData.communityRole}
              onChange={handleChange}
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
            <Button type="confirm-admin" onClick={() => setIsConfirmModalOpen(true)}>
              บันทึก
            </Button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={isConfirmModalOpen}
        title="ยืนยันการบันทึกข้อมูล"
        text="คุณต้องการบันทึกการแก้ไขข้อมูลสมาชิกนี้หรือไม่?"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          handleSubmit();
        }}
        onCancel={() => setIsConfirmModalOpen(false)}
      />

      <ModalAlert
        isOpen={isSuccessModalOpen}
        type="success"
        title="แก้ไขสมาชิกสำเร็จ"
        message="ข้อมูลสมาชิกถูกแก้ไขเรียบร้อยแล้ว"
        onClose={() => {
          setIsSuccessModalOpen(false);
          navigate("/admin/members");
        }}
      />
    </div>
  );
};

export default EditMemberPage;
