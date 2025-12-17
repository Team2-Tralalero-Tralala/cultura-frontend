/**
 * หน้าที่: หน้า "สร้างข้อเสนอแนะ" สำหรับนักท่องเที่ยว
 * คุณสมบัติ:
 * - ดึง Token จาก Cookie "accessToken" มาส่งเอง เพื่อแก้ปัญหา 401
 * - ใช้ Components มาตรฐาน
 */
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as z from "zod";

import Button from "@/Components/Button";
import TextArea from "@/Components/TextArea";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import { ModalConfirm } from "@/Components/Modal/ModalConfirmTourist";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/NavbarTourist";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// --- Helper Functions ---

/**
 * ฟังก์ชันดึงค่าจาก Cookie ตามชื่อที่ระบุ
 * ใช้แก้ปัญหาเมื่อ Browser ไม่ยอมส่ง Cookie แบบอัตโนมัติ
 */
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};

type FileLike = File;

type FeedbackForm = {
  rating: number;
  message: string;
};

const initialForm: FeedbackForm = {
  rating: 0,
  message: "",
};

const feedbackSchema = z.object({
  rating: z.number().min(1, "กรุณาให้คะแนนอย่างน้อย 1 ดาว").max(5),
  message: z
    .string()
    .max(200, "ข้อเสนอแนะต้องไม่เกิน 200 ตัวอักษร")
    .optional(),
});

type FormErrors = Partial<Record<keyof FeedbackForm, string>>;

export function CreateFeedbackPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FeedbackForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [galleryFiles, setGalleryFiles] = useState<FileLike[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * อัปเดตฟิลด์ในฟอร์ม และ validate ทันที
   */
  function setField(key: keyof FeedbackForm, value: any) {
    setForm((prevForm) => {
      if (prevForm[key] === value) return prevForm;
      const nextForm = { ...prevForm, [key]: value };
      const parsed = feedbackSchema.safeParse(nextForm);
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };
        if (parsed.success) {
          delete nextErrors[key];
        } else {
          const found = parsed.error.issues.find((issue) => issue.path[0] === key);
          if (found) nextErrors[key] = found.message;
          else delete nextErrors[key];
        }
        return nextErrors;
      });
      return nextForm;
    });
  }

  /**
   * ตรวจสอบข้อมูลฟอร์มทั้งหมดก่อน Submit
   */
  function validateAll(): boolean {
    const result = feedbackSchema.safeParse(form);
    if (!result.success) {
      const validationErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        validationErrors[issue.path[0] as keyof FeedbackForm] = issue.message;
      }
      setErrors(validationErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  /**
   * Handler เมื่อกดปุ่ม "ยืนยัน" (เปิด Modal)
   */
  function handleSubmit(event?: React.FormEvent) {
    if (event) event.preventDefault();
    if (isSaving) return;

    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsConfirmOpen(true);
  }

  /**
   * ฟังก์ชันยืนยันการบันทึก (ยิง API)
   */
  const onConfirmSave = async () => {
    setIsConfirmOpen(false);
    setIsSaving(true);

    try {
      const token = getCookie("accessToken");
      if (!token) {
        alert("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณา Login ใหม่");
        navigate("/guest/login");
        return;
      }
      const imagePaths: string[] = galleryFiles.map(
        (file) => `/uploads/feedbacks/${file.name}`
      );
      const payload = {
        rating: form.rating,
        message: form.message || "",
        images: imagePaths,
      };
      await axios.post(
        `${API_URL}/tourist/booking-history/${bookingId}/feedback`,
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      alert("ส่งข้อเสนอแนะสำเร็จ!");
      navigate("/tourist/booking-history");
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งข้อมูล";
      if (error.response?.status === 401) {
        alert("เซสชันหมดอายุหรือยังไม่ได้เข้าสู่ระบบ กรุณา Login ใหม่");
        navigate("/guest/login");
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sarabun flex flex-col">
      <NavbarTourist />
      <div className="flex-grow">
        <Breadcrumb
          current={{
            label: "ข้อเสนอแนะ",
            to: `/tourist/booking-history/${bookingId}/feedback`,
          }}
        />
        <h1 className="text-3xl font-bold mb-8 mt-4">ประวัติการจอง</h1>
        <div className="bg-white rounded-[16px] p-8 shadow-sm max-w-4xl mx-auto border border-gray-200">
          <h2 className="text-xl font-bold mb-6">ส่งข้อเสนอแนะไปยังชุมชน</h2>
          <div className="border border-gray-300 rounded-[12px] p-6">
            <h3 className="text-lg font-bold mb-4">พักใจใต้เงาไม้</h3>
            {/* Rating Section */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-base text-gray-700">ให้คะแนนแพ็กเกจ</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setField("rating", star)}
                    className="focus:outline-none transition-transform active:scale-95"
                  >
                    {star <= form.rating ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#1DC9A0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1DC9A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              {errors.rating && (
                <span className="text-red-500 text-sm ml-2">{errors.rating}</span>
              )}
            </div>

            {/* Message Section */}
            <div className="mb-4">
              <TextArea
                id="message"
                label="ข้อเสนอแนะ"
                placeholder="ให้ข้อเสนอแนะแก่ชุมชน เช่น ประสบการณ์ คำติชม บริการชุมชน"
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                error={!!errors.message}
                rows={4}
              />
               <div className="text-right text-sm text-gray-500 mt-1">
                  {form.message.length}/200 ตัวอักษร
               </div>
            </div>

            {/* Image Upload Section */}
            <div className="mb-8">
              <label className="block text-base font-semibold mb-2">เพิ่มรูปภาพ</label>
              <UploadCard
                max={5}
                accept="image/*"
                multiple
                value={galleryFiles}
                onChange={setGalleryFiles}
                itemW={100}
                itemH={100}
                square={true}
                itemClass="border border-dashed border-gray-400 bg-gray-100"
                rounded="rounded-lg"
                gapCls="gap-3"
                containerClass="w-full"
                wrap
                iconSizeCls="w-8 h-8"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <div className="w-24">
                <Button type="cancel" onClick={() => navigate(-1)}>
                  ย้อนกลับ
                </Button>
              </div>
              <div className="w-24">
                <Button
                  type="confirm-tourist"
                  onClick={() => handleSubmit()}
                >
                  {isSaving ? "กำลังส่ง..." : "ยืนยัน"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ModalConfirm
        open={isConfirmOpen}
        title="ยืนยันการส่งข้อเสนอแนะ"
        message="คุณต้องการยืนยันการส่งข้อเสนอแนะไปยังชุมชนหรือไม่"
        onConfirm={onConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />

      <Footer />
    </div>
  );
}
