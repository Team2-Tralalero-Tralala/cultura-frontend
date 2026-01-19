/**
* คำอธิบาย : Component สำหรับแก้ไขข้อมูลส่วนตัวของ Tourist
*/
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "@/Libs/api";
import NavbarTourist from "@/Components/NavbarTourist";
import Footer from "@/Components/Footer";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import AvatarUploader from "@/Components/AvatarUploader";
import TextField from "@/Components/TextField";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import ThailandLocationSelector from "@/Components/Selector/ThailandLocationSelector";

type Gender = "MALE" | "FEMALE" | "NONE" | "";

interface UserProfile {
  username: string;
  email: string;
  fname: string;
  lname: string;
  phone: string;
  birthDate: string;
  gender: Gender;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

const initialForm: UserProfile = {
  username: "",
  email: "",
  fname: "",
  lname: "",
  phone: "",
  birthDate: "",
  gender: "",
  subDistrict: "",
  district: "",
  province: "",
  postalCode: "",
};

const genderOptions: { label: string; value: Exclude<Gender, ""> }[] = [
  { label: "ชาย", value: "MALE" },
  { label: "หญิง", value: "FEMALE" },
  { label: "ไม่ระบุ", value: "NONE" },
];

/*
* คําอธิบาย : ฟังก์ชันสำหรับแก้ไขข้อมูลส่วนตัวของ Tourist
* Input : ไม่มี
* Output : แสดงหน้าจอแก้ไขข้อมูลส่วนตัวของ Tourist
*/
const EditProfileTourist: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<UserProfile>(initialForm);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

/*
* คําอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลส่วนตัวของ Tourist
* Input : ไม่มี
* Output : ข้อมูลส่วนตัวของ Tourist
*/
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/shared/profile");
      const profile = data?.data;

      if (!profile) throw new Error("Profile not found");
      setFormData({
        username: profile.username ?? "",
        email: profile.email ?? "",
        fname: profile.fname ?? "",
        lname: profile.lname ?? "",
        phone: profile.phone ?? "",
        birthDate: profile.birthDate
          ? new Date(profile.birthDate).toISOString().split("T")[0]
          : "",
        gender: profile.gender ?? "",
        subDistrict: profile.subDistrict ?? "",
        district: profile.district ?? "",
        province: profile.province ?? "",
        postalCode: profile.postalCode ?? "",
      });
      
      if (profile.profileImage) {
        const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
        const baseUrl = apiUrl.replace(/\/api$/, "").replace(/\/$/, "");
        setAvatarUrl(
          `${baseUrl}/${profile.profileImage.replace(/\\/g, "/")}`
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถโหลดข้อมูลสมาชิกได้");
      navigate(-1);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

/*
* คําอธิบาย : ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงในฟอร์มแก้ไขข้อมูลส่วนตัวของ Tourist
* Input : event - เหตุการณ์การเปลี่ยนแปลงในฟอร์มแก้ไขข้อมูลส่วนตัวของ Tourist
* Output : อัปเดตสถานะ formData เมื่อมีการเปลี่ยนแปลงในฟอร์ม
*/
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

/*
* คําอธิบาย : ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงที่อยู่ในฟอร์มแก้ไขข้อมูลส่วนตัวของ Tourist
* Input : location - ข้อมูลที่อยู่ที่ถูกเลือกในฟอร์มแก้ไขข้อมูลส่วนตัวของ Tourist
* Output : อัปเดตสถานะ formData เมื่อมีการเปลี่ยนแปลงที่อยู่ในฟอร์ม
*/
  const handleLocationChange = (location: any) => {
    setFormData((prev) => ({
      ...prev,
      province: location.province ?? "",
      district: location.district ?? "",
      subDistrict: location.subdistrict ?? "",
      postalCode: location.postalCode ?? "",
    }));
  };

/*
* คําอธิบาย : ฟังก์ชันสำหรับส่งข้อมูลที่แก้ไขในฟอร์มแก้ไขข้อมูลส่วนตัวของ Tourist
* Input : ไม่มี
* Output : ส่งคำขอไปยัง API เพื่ออัปเดตข้อมูลส่วนตัวของ Tourist
*/
  const handleSubmit = async () => {
    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (profileFile) {
        payload.append("profileImage", profileFile);
      }

      await api.put("/tourist/edit-profile", payload);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      const response = error?.response?.data;
      let message = "ไม่สามารถบันทึกข้อมูลได้";

      if (response?.errors) {
        message = Object.values(response.errors).flat().join("\n");
      } else if (response?.message) {
        message = response.message;
      }

      setErrorMessage(message);
      setIsErrorModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarTourist />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-6 pb-12">
        <Breadcrumb
          current={{ label: "แก้ไขข้อมูลส่วนตัว", to: location.pathname }}
        />

        <h1 className="text-3xl font-bold mt-4 mb-8">
          แก้ไขข้อมูลส่วนตัว
        </h1>

        <section className="px-10 py-6 pr-20">
          <div className="grid grid-cols-[280px_1fr] gap-16">
            {/* Avatar */}
            <div className="flex justify-center">
              <AvatarUploader
                avatarUrl={avatarUrl}
                avatarSize={240}
                onAvatarChange={(file) => {
                  if (!file) return;
                  setProfileFile(file);
                  setAvatarUrl(URL.createObjectURL(file));
                }}
              />
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <TextField id="fname" label="ชื่อ (ไม่ต้องใส่คำนำหน้า)" required value={formData.fname} onChange={handleChange} />
                <TextField id="lname" label="นามสกุล" required value={formData.lname} onChange={handleChange} />
              </div>

              <TextField id="username" label="ชื่อผู้ใช้" required value={formData.username} onChange={handleChange} />
              <TextField id="email" label="อีเมล" required value={formData.email} onChange={handleChange} />
              <div className="mr-85">
               <TextField id="phone" label="หมายเลขโทรศัพท์" required value={formData.phone} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <TextField id="birthDate" type="date" label="วัน-เดือน-ปีเกิด" required value={formData.birthDate} onChange={handleChange} />

                <div>
                  <label className="block mb-2 font-medium">
                    เพศ <span className="text-red-500">*</span>
                  </label>

                  <div className="flex gap-10">
                    {genderOptions.map((option) => {
                      const isChecked = formData.gender === option.value;

                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            hidden
                            checked={isChecked}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                gender: option.value,
                              }))
                            }
                          />
                          <div className="w-5 h-5 rounded-full border flex items-center justify-center bg-gray-200">
                            {isChecked && (
                              <div className="w-3 h-3 rounded-full bg-[#00BF6A]" />
                            )}
                          </div>
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Thailand Location Selector ใช้เลือกที่อยู่ของ Tourist */}
              <ThailandLocationSelector
                value={{
                  province: formData.province,
                  district: formData.district,
                  subdistrict: formData.subDistrict,
                  postalCode: formData.postalCode,
                }}
                onChange={handleLocationChange}
              />

              <div className="flex justify-end gap-4 pt-8 pl-90">
                <Button type="cancel" onClick={() => navigate(-1)}>
                  ยกเลิก
                </Button>
                <Button
                  type="confirm-tourist"
                  onClick={() => setIsConfirmModalOpen(true)}
                >
                  บันทึก
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modals ยืนยันการเเก้ไขข้อมูลส่วนตัว */}
      <Modal
        open={isConfirmModalOpen}
        title="ยืนยันการเเก้ไขข้อมูลส่วนตัว"
        text="คุณต้องการยืนยันแก้ไขข้อมูลส่วนตัวหรือไม่?"
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          handleSubmit();
        }}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
      {/* Modals เเก้ไขข้อมูลส่วนตัวสำเร็จ */}
      <ModalAlert
        open={isSuccessModalOpen}
        type="success"
        title="แก้ไขข้อมูลส่วนตัวสำเร็จ"
        message="ข้อมูลส่วนตัวของคุณถูกแก้ไขเรียบร้อยแล้ว"
        onClose={() => window.location.reload()}
      />
      {/* Modals เกิดข้อผิดพลาด */}
      <ModalAlert
        open={isErrorModalOpen}
        type="error"
        title="ไม่สามารถบันทึกข้อมูลได้"
        message={errorMessage}
        onClose={() => setIsErrorModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default EditProfileTourist;
