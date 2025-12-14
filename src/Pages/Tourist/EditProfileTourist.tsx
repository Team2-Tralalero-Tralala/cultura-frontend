/*
 * Component: EditProfileTourist
 * Description:
 *   - หน้าสำหรับนักท่องเที่ยวที่ล็อกอินอยู่ แก้ไขข้อมูลส่วนตัวของตัวเอง
 *   - ใช้งานร่วมกับ API กลาง (/shared/profile)
 *
 * Behavior:
 *   - โหลดข้อมูลโปรไฟล์จากระบบเมื่อเปิดหน้า
 *   - แสดง Modal ยืนยันก่อนบันทึก
 *   - แสดง Modal แจ้งผลลัพธ์ (สำเร็จ / ไม่สำเร็จ)
 *   - เมื่อบันทึกสำเร็จ จะ reload หน้าเพื่ออัปเดตข้อมูลใน Navbar
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

// เพิ่มเติมประเภทเพศ
type Gender = "MALE" | "FEMALE" | "NONE" | "";
/*
 * Interface: UserProfile
 * Description:
 *   - โครงสร้างข้อมูลโปรไฟล์ที่ใช้ควบคุมฟอร์มแก้ไขข้อมูลส่วนตัวของนักท่องเที่ยว
 *   - mapping จากข้อมูลที่ได้จาก API /shared/profile
 */
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
/*
 * คำอธิบาย : ค่าเริ่มต้นของฟอร์มแก้ไขข้อมูลส่วนตัว
 */
const INITIAL_FORM: UserProfile = {
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
/*
 * คำอธิบาย : ตัวเลือกเพศสำหรับฟอร์มแก้ไขข้อมูลส่วนตัว
 */
const GENDER_OPTIONS: { label: string; value: Exclude<Gender, ""> }[] = [
  { label: "ชาย", value: "MALE" },
  { label: "หญิง", value: "FEMALE" },
  { label: "ไม่ระบุ", value: "NONE" },
];
/*
 * คำอธิบาย : Component EditProfileTourist
 * หน้าสำหรับนักท่องเที่ยวที่ล็อกอินอยู่ เพื่อแก้ไขข้อมูลส่วนตัวของตนเอง
 */
const EditProfileTourist: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<UserProfile>(INITIAL_FORM);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
/*
 * คำอธิบาย : ฟังก์ชัน fetchProfile
 * ดึงข้อมูลโปรไฟล์ของนักท่องเที่ยวที่ล็อกอินอยู่จากระบบ
 */
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/shared/profile");
      const profile = data?.data;

      if (!profile) throw new Error("Profile not found");
      
/*
 * คำอธิบาย : ตั้งค่าข้อมูลโปรไฟล์ลงในฟอร์มและ avatar
 */
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
  /*
   * คำอธิบาย : จัดการกรณีเกิดข้อผิดพลาดขณะดึงข้อมูลโปรไฟล์
   */
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
 * คำอธิบาย : ฟังก์ชัน handleChange
 * จัดการการเปลี่ยนแปลงข้อมูลในฟอร์มแก้ไขข้อมูลส่วนตัว
 */
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
/*
 * คำอธิบาย : ฟังก์ชัน handleSubmit
 * ส่งข้อมูลแก้ไขโปรไฟล์ไปยัง backend และจัดการผลลัพธ์ที่ได้รับ
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
      setShowSuccess(true);
    } catch (error: any) {
      const response = error?.response?.data;
      let message = "ไม่สามารถบันทึกข้อมูลได้";

      if (response?.errors) {
        message = Object.values(response.errors).flat().join("\n");
      } else if (response?.message) {
        message = response.message;
      }

      setErrorMessage(message);
      setShowError(true);
    }
  };
/*
 * คำอธิบาย :หน้า EditProfileTourist
 */
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
                    {GENDER_OPTIONS.map((option) => {
                      const checked = formData.gender === option.value;

                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            hidden
                            checked={checked}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                gender: option.value,
                              }))
                            }
                          />
                          <div className="w-5 h-5 rounded-full border flex items-center justify-center bg-gray-200">
                            {checked && (
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

              <div className="grid grid-cols-2 gap-6">
                <TextField id="province" label="จังหวัด" required value={formData.province} onChange={handleChange} />
                <TextField id="district" label="อำเภอ/เขต" required value={formData.district} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <TextField id="subDistrict" label="ตำบล/เเขวง" required value={formData.subDistrict} onChange={handleChange} />
                <TextField id="postalCode" label="รหัสไปรษณีย์" required value={formData.postalCode} onChange={handleChange} />
              </div>

              <div className="flex justify-end gap-4 pt-8 pl-90">
                <Button type="cancel" onClick={() => navigate(-1)}>
                  ยกเลิก
                </Button>
                <Button
                  type="confirm-tourist"
                  onClick={() => setShowConfirm(true)}
                >
                  บันทึก
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODALS */}
      <Modal
        open={showConfirm}
        title="ยืนยันการเเก้ไขข้อมูลส่วนตัว"
        text="คุณต้องการยืนยันแก้ไขข้อมูลส่วนตัวหรือไม่?"
        onConfirm={() => {
          setShowConfirm(false);
          handleSubmit();
        }}
        onCancel={() => setShowConfirm(false)}
      />
      {/* MODALS เเก้ไขข้อมูลส่วนตัวสำเร็จ */}
      <ModalAlert
        open={showSuccess}
        type="success"
        title="แก้ไขข้อมูลส่วนตัวสำเร็จ"
        message="ข้อมูลส่วนตัวของคุณถูกแก้ไขเรียบร้อยแล้ว"
        onClose={() => window.location.reload()}
      />
      {/* MODALS เกิดข้อผิดพลาด */}
      <ModalAlert
        open={showError}
        type="error"
        title="ไม่สามารถบันทึกข้อมูลได้"
        message={errorMessage}
        onClose={() => setShowError(false)}
      />

      <Footer />
    </div>
  );
};

export default EditProfileTourist;
