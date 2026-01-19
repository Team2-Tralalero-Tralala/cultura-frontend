/**
 * คำอธิบาย : หน้าสำหรับหน้าแก้ไขข้อมูลส่วนตัวของผู้ใช้งานที่ล็อกอินอยู่
 * ใช้งานร่วมกับ API กลาง (/shared/profile) รองรับทุก Role
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import api from "@/Libs/api";
import TextField from "../../Components/TextField";
import Button from "../../Components/Button";
import SubmitButton from "../../Components/SubmitButton";
import AvatarUploader from "@/Components/AvatarUploader";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { editProfile } from "@/Services/account-services";

/*
 * คำอธิบาย : Interface สำหรับโครงสร้างข้อมูลโปรไฟล์
 */
interface UserProfile {
  profileImage: string | null;
  username: string;
  email: string;
  fname: string;
  lname: string;
  phone: string;
}

export const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<UserProfile>({
    profileImage: null,
    username: "",
    email: "",
    fname: "",
    lname: "",
    phone: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  /*
   * คำอธิบาย : ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่จากระบบ นำข้อมูลมา set ลง form และจัดการ URL รูปภาพ
   * Input : -
   * Output : -
   */
  const fetchData = async () => {
    try {
      const response = await api.get(`/shared/profile`);
      const profile = response.data?.data;

      if (!profile) throw new Error("ไม่พบข้อมูลสมาชิก");

      setFormData({
        profileImage: profile.profileImage ?? null,
        username: profile.username ?? "",
        email: profile.email ?? "",
        fname: profile.fname ?? "",
        lname: profile.lname ?? "",
        phone: profile.phone ?? "",
      });

      // จัดการ URL รูปภาพ
      const backendUrl = import.meta.env.VITE_API_URL_BASE || "http://localhost:3000";

      let imageUrl = null;
      if (profile.profileImage) {
        if (profile.profileImage.startsWith("http")) {
           imageUrl = profile.profileImage;
        } else {
           imageUrl = `${backendUrl}${profile.profileImage}`;
        }
      }
      setAvatarUrl(imageUrl);

    } catch (error: any) {
      toast.error("ไม่สามารถโหลดข้อมูลสมาชิกได้");
      navigate(-1);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /*
   * คำอธิบาย : จัดการการเปลี่ยนแปลงค่าของ input ในฟอร์ม
   * Input : event
   * Output : -
   */
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /*
   * คำอธิบาย : ส่งข้อมูลโปรไฟล์และรูปภาพไปบันทึกผ่าน Service แบบ One-Step
   * Input : -
   * Output : -
   */
  const handleSubmit = async () => {
    try {
      // เตรียมข้อมูล Text
      const payload = {
        fname: formData.fname,
        lname: formData.lname,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        profileImage: formData.profileImage,
      };

      // เรียก Service (ส่ง payload คู่กับ file object)
      await editProfile(payload, profileImage);

      // แสดงผลสำเร็จ
      setShowSuccessModal(true);

    } catch (error: any) {
      const message =
        error?.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้";

      setErrorMessage(message);
      setShowErrorModal(true);
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
        <h1 className="text-xl font-bold text-black tracking-tight">
          แก้ไขข้อมูลส่วนตัว
        </h1>
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
          handleSubmit();
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <ModalAlert
        open={showSuccessModal}
        type="success"
        title="แก้ไขข้อมูลส่วนตัวสำเร็จ"
        message="ข้อมูลส่วนตัวของคุณถูกแก้ไขเรียบร้อยแล้ว"
        onClose={() => {
          setShowSuccessModal(false);
          // รีโหลดทั้งหน้า เพื่อให้ Navbar ไปโหลดชื่อใหม่และรูปใหม่จาก BE
          window.location.reload();
        }}
      />
      <ModalAlert
        open={showErrorModal}
        type="error"
        title="ไม่สามารถบันทึกข้อมูลได้"
        message={errorMessage}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage("");
        }}
      />
    </div>
  );
};
