/*
 * Component: EditMemberPage (Admin)
 * Description: หน้าสำหรับ Admin แก้ไขข้อมูลสมาชิกในชุมชน และอัปเดตรูปโปรไฟล์
 * Author: Team 2 (Cultura)
 * Last Modified: 07 ธันวาคม 2568 (Smart Fetch Community)
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import api from "@/Libs/api";
import TextField from "../../Components/TextField";
import Button from "../../Components/Button";
import SubmitButton from "../../Components/SubmitButton";
import AvatarUploader from "@/Components/AvatarUploader";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { Icon } from "@iconify/react";

/*
 * คำอธิบาย : Interface สำหรับกำหนดโครงสร้างข้อมูลที่ใช้ในการแก้ไขข้อมูลสมาชิก
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

interface UserProfile {
  profileImage: string | null;
  username: string;
  email: string;
  fname: string;
  lname: string;
  phone: string;
}

/*
 * คำอธิบาย : Component สำหรับแก้ไขข้อมูลสมาชิกโดย Admin
 */
export const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();

  /*
   * คำอธิบาย : State สำหรับเก็บค่าฟอร์มข้อมูลสมาชิก
   */
  const [formData, setFormData] = useState<UserProfile>({
    profileImage: null,
    username: "",
    email: "",
    fname: "",
    lname: "",
    phone: "",
  });

  /*
   * คำอธิบาย : State สำหรับเก็บไฟล์รูปโปรไฟล์ที่อัปโหลดใหม่
   */
  const [profileImage, setProfileImage] = useState<File | null>(null);

  /*
   * คำอธิบาย : State สำหรับเก็บ URL รูปโปรไฟล์ที่โหลดจากระบบ
   */
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  /*
   * คำอธิบาย : State สำหรับควบคุม Modal ยืนยันการบันทึกข้อมูล
   */
  const [showConfirm, setShowConfirm] = useState(false);

  /*
   * คำอธิบาย : State สำหรับควบคุม Modal แสดงผลเมื่อแก้ไขสำเร็จ
   */
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลสมาชิกจากระบบเพื่อนำมาแสดงในฟอร์ม
   * Input : -
   * Output : -
   */
  const fetchData = async () => {
    try {
      const response = await api.get(`/shared/profile`);
      const profile = response.data?.data;

      if (!profile) throw new Error("ไม่พบข้อมูลสมาชิก");

      setFormData({ ...profile });

      setAvatarUrl(profile.profileImageUrl || null);
    } catch (error: any) {
      console.error("❌ Error fetching member:", error);
      toast.error("ไม่สามารถโหลดข้อมูลสมาชิกได้");
      navigate("/admin/members");
    }
  };

  /*
   * คำอธิบาย : Hook สำหรับโหลดข้อมูลสมาชิกเมื่อมี userId
   */
  /*
   * คำอธิบาย : Hook สำหรับโหลดข้อมูลสมาชิกเมื่อมี userId
   */
  useEffect(() => {
    fetchData();
  }, [userId]);

  /*
   * คำอธิบาย : ฟังก์ชันจัดการการเปลี่ยนแปลงค่าของ Input
   * Input : event
   * Output : -
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
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
        <h1 className="text-xl font-bold text-black tracking-tight">แก้ไขข้อมูลส่วนตัว</h1>
      </div>

      <form className="bg-white p-10 rounded-xl shadow w-full ml-0 text-[15px] space-y-10 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 text-center tracking-tight">
          แก้ไขข้อมูลส่วนตัว
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
          </div>
        </div>

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

      <Modal
        open={showConfirm}
        title="ยืนยันการบันทึกข้อมูล"
        text="คุณต้องการบันทึกการแก้ไขข้อมูลส่วนตัวหรือไม่?"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={() => {
          setShowConfirm(false);
          // handleSubmit();
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <ModalAlert
        open={showSuccessModal}
        type="success"
        title="แก้ไขสมาชิกสำเร็จ"
        message="ข้อมูลสมาชิกถูกแก้ไขเรียบร้อยแล้ว"
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/admin/members");
        }}
      />
    </div>
  );
};
