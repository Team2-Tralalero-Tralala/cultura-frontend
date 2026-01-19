/**
 * คำอธิบาย : หน้าการสร้างข้อเสนอแนะ (Feedback) ของนักท่องเที่ยว
 * โดยรองรับการให้คะแนน, เขียนข้อความติชม และอัปโหลดรูปภาพประกอบ
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as zod from "zod";

import Button from "@/Components/Button";
import TextArea from "@/Components/TextArea";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import { Modal } from "@/Components/Modal/Modal";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/NavbarTourist";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { Icon } from "@iconify/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

type FeedbackFormState = {
  ratingScore: number;
  feedbackMessage: string;
};

const initialFeedbackForm: FeedbackFormState = {
  ratingScore: 0,
  feedbackMessage: "",
};

const feedbackValidationSchema = zod.object({
  ratingScore: zod.number().min(1, "กรุณาให้คะแนนอย่างน้อย 1 ดาว").max(5),
  feedbackMessage: zod
    .string()
    .max(200, "ข้อเสนอแนะต้องไม่เกิน 200 ตัวอักษร")
    .optional(),
});

type FeedbackFormErrors = Partial<Record<keyof FeedbackFormState, string>>;

export function CreateFeedbackPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [feedbackFormData, setFeedbackFormData] = useState<FeedbackFormState>(initialFeedbackForm);
  const [feedbackFormErrors, setFeedbackFormErrors] = useState<FeedbackFormErrors>({});
  const [galleryFileLists, setGalleryFileLists] = useState<File[]>([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isDataSavingProcess, setIsDataSavingProcess] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalTitle, setAlertModalTitle] = useState("");
  const [alertModalMessage, setAlertModalMessage] = useState("");
  const [packageName, setPackageName] = useState<string>("ชื่อแพ็กเกจ");

  /**
 * คำอธิบาย : ฟังก์ชันสำหรับเปิด Modal แจ้งเตือนพร้อมกำหนดข้อความ
 * Input : title, message
 * Output : -
 */
  const showAlertModal = (title: string, message: string) => {
    setAlertModalTitle(title);
    setAlertModalMessage(message);
    setIsAlertModalOpen(true);
  };

  /**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงค่าจาก Cookie ตามชื่อที่ระบุ
 * Input : cookieName
 * Output : ค่าที่เก็บใน Cookie หรือ null
 */
  const getCookieValue = (cookieName: string): string | null => {
    const cookieMatch = document.cookie.match(new RegExp("(^| )" + cookieName + "=([^;]+)"));
    return cookieMatch ? cookieMatch[2] : null;
  };

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับอัปเดตข้อมูลในฟิลด์ของฟอร์มพร้อมตรวจสอบความถูกต้อง
   * Input : fieldKey, newValue
   * Output : -
   */
  function updateFormField(fieldKey: keyof FeedbackFormState, newValue: any) {
    setFeedbackFormData((previousForm) => {
      const nextForm = { ...previousForm, [fieldKey]: newValue };
      const validationResult = feedbackValidationSchema.safeParse(nextForm);
      setFeedbackFormErrors((previousErrors) => {
        const nextErrors = { ...previousErrors };
        if (validationResult.success) {
          delete nextErrors[fieldKey];
        } else {
          const foundIssue = validationResult.error.issues.find(
            (issue) => issue.path[0] === fieldKey
          );
          if (foundIssue) {
            nextErrors[fieldKey] = foundIssue.message;
          } else {
            delete nextErrors[fieldKey];
          }
        }
        return nextErrors;
      });
      return nextForm;
    });
  }

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูลทั้งหมดในฟอร์ม
   * Input : -
   * Output : boolean (true หากข้อมูลถูกต้อง)
   */
  function validateEntireForm(): boolean {
    const validationResult = feedbackValidationSchema.safeParse(feedbackFormData);
    if (!validationResult.success) {
      const fieldErrors: FeedbackFormErrors = {};
      for (const issue of validationResult.error.issues) {
        fieldErrors[issue.path[0] as keyof FeedbackFormState] = issue.message;
      }
      setFeedbackFormErrors(fieldErrors);
      return false;
    }
    setFeedbackFormErrors({});
    return true;
  }

  /**
   * คำอธิบาย : Handler เมื่อผู้ใช้กดปุ่มยืนยัน เพื่อเปิด Modal ยืนยันการทำงาน
   * Input : event (ทางเลือก)
   * Output : -
   */
  function handleFormSubmit(event?: React.FormEvent) {
    if (event) {
      event.preventDefault();
    }
    if (isDataSavingProcess) {
      return;
    }
    if (!validateEntireForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsConfirmationModalOpen(true);
  }

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับส่งข้อมูล Feedback ไปยัง Backend API
   * Input : -
   * Output : -
   */
  const onConfirmFeedbackSave = async () => {
    setIsConfirmationModalOpen(false);
    setIsDataSavingProcess(true);
    try {
      const accessToken = getCookieValue("accessToken");
      if (!accessToken) {
        navigate("/guest/login");
        return;
      }
      const feedbackMultipartFormData = new FormData();
      feedbackMultipartFormData.append("rating", feedbackFormData.ratingScore.toString());
      feedbackMultipartFormData.append("message", feedbackFormData.feedbackMessage || "");
      galleryFileLists.forEach((fileItem) => {
        feedbackMultipartFormData.append("gallery", fileItem);
      });

      await axios.post(
        `${API_URL}/tourist/booking-history/${bookingId}/feedback`,
        feedbackMultipartFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      showAlertModal("สำเร็จ", "ส่งข้อเสนอแนะของคุณเรียบร้อยแล้ว");
      navigate("/tourist/booking-histories");
    } catch (requestError: any) {
      const errorMessage = requestError.response?.data?.message || "เกิดข้อผิดพลาดในการส่งข้อมูล";
      if (requestError.response?.status === 401) {
        showAlertModal("เกิดข้อผิดพลาด", "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        navigate("/guest/login");
      } else {
        showAlertModal("เกิดข้อผิดพลาด", errorMessage);
      }
    } finally {
      setIsDataSavingProcess(false);
    }
  };

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        const accessToken = getCookieValue("accessToken");
        if (!accessToken) return;
        const response = await axios.get(`${API_URL}/tourist/booking-history/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const bookingData = response.data.data;
        if (bookingData?.package?.name) {
          setPackageName(bookingData.package.name);
        } else {
          setPackageName("ไม่พบชื่อแพ็กเกจ");
        }
      } catch (error) {
        console.error("Error fetching booking detail:", error);
        setPackageName("เกิดข้อผิดพลาดในการดึงข้อมูล");
      }
    };
    if (bookingId) {
      fetchBookingDetail();
    }
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sarabun flex flex-col">
      <NavbarTourist />

      {/* หัวข้อหลักของหน้า */}
      <div className="flex-grow max-w-[1200px] mx-auto w-full px-6 py-10">
        {/* ส่วนนำทาง (Breadcrumb) */}
        <div>
          <Breadcrumb
            current={{
              label: "ข้อเสนอแนะ",
              to: `/tourist/booking-history/${bookingId}/feedback`,
            }}
          />
        </div>
        <h1 className="text-3xl font-bold text-black">ประวัติการจอง</h1>
      </div>


      <hr className="border-gray-300 mb-8" />
      <main className="flex-grow max-w-[1200px] mx-auto w-full px-6 py-10">
        {/* การ์ดเนื้อหาหลัก (Main Content Card) */}
        <div className="rounded-[24px]">
          <h2 className="text-2xl font-bold text-black mb-8">ส่งข้อเสนอแนะไปยังชุมชน</h2>

          {/* กล่องแบบฟอร์มด้านใน (Inner Form Container) */}
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-10">
            <h3 className="text-xl font-bold text-black mb-8">{packageName}</h3>

            {/* ส่วนการให้คะแนน (Rating Section) */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-10">
                <label className="text-base font-medium text-black">
                  ให้คะแนนแพ็กเกจ
                </label>

                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((starRatingIndex) => (
                    <button
                      key={starRatingIndex}
                      type="button"
                      onClick={() => updateFormField("ratingScore", starRatingIndex)}
                      className="focus:outline-none transition-all hover:scale-110 active:scale-90"
                    >
                      <Icon
                        icon={starRatingIndex <= feedbackFormData.ratingScore ? "mdi:star" : "mdi:star-outline"}
                        className={`w-8 h-8 ${starRatingIndex <= feedbackFormData.ratingScore
                          ? "text-[#1DC9A0]"
                          : "text-[#D1D5DB]"
                          }`}
                      />
                    </button>
                  ))}
                  {feedbackFormErrors.ratingScore && (
                    <span className="text-red-500 text-sm ml-4 font-medium">
                      {feedbackFormErrors.ratingScore}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ส่วนข้อความเสนอแนะ (Message Section) */}
            <div className="mb-8">
              <TextArea
                id="feedbackMessage"
                label="ข้อเสนอแนะ"
                placeholder="ให้ข้อเสนอแนะแก่ชุมชน เช่น ประสบการณ์ คำติชม บริการชุมชน"
                value={feedbackFormData.feedbackMessage}
                onChange={(event) => updateFormField("feedbackMessage", event.target.value)}
                error={!!feedbackFormErrors.feedbackMessage}
                rows={4}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-red-500 text-sm font-medium">
                  {feedbackFormErrors.feedbackMessage}
                </div>
                <div className="text-sm text-gray-400">
                  {feedbackFormData.feedbackMessage.length}/200 ตัวอักษร
                </div>
              </div>
            </div>

            {/* ส่วนการอัปโหลดรูปภาพ (Image Section) */}
            <div className="mb-12">
              <label className="block text-base font-bold text-black mb-4">เพิ่มรูปภาพ</label>
              <UploadCard
                max={5}
                accept="image/*"
                multiple
                value={galleryFileLists}
                onChange={setGalleryFileLists}
                itemW={110}
                itemH={110}
                square={true}
                itemClass="border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                rounded="rounded-xl"
                gapCls="gap-4"
                containerClass="w-full"
                wrap
                iconSizeCls="w-10 h-10"
              />
            </div>

            {/* ส่วนปุ่มดำเนินการ (Action Buttons) */}
            <div className="flex justify-end gap-5 mt-4">
              <div className="w-[140px]">
                <Button type="cancel" onClick={() => navigate(-1)}>
                  ย้อนกลับ
                </Button>
              </div>
              <div className="w-[140px]">
                <Button
                  type="confirm-tourist"
                  onClick={() => handleFormSubmit()}
                >
                  {isDataSavingProcess ? "กำลังส่ง..." : "ยืนยัน"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal ยืนยันการส่งข้อเสนอแนะ */}
      <Modal
        open={isConfirmationModalOpen}
        title="ยืนยันการส่งข้อเสนอแนะ"
        text="คุณต้องการยืนยันการส่งข้อเสนอแนะไปยังชุมชนหรือไม่"
        onConfirm={onConfirmFeedbackSave}
        onCancel={() => setIsConfirmationModalOpen(false)}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
      />

      <Footer />
      <Modal
        open={isAlertModalOpen}
        title={alertModalTitle}
        text={alertModalMessage}
        confirmText="ตกลง"
        onConfirm={() => {
          setIsAlertModalOpen(false);
          if (alertModalTitle === "สำเร็จ") {
            navigate("/tourist/booking-histories");
          }
        }}
        cancelText=""
      />
    </div>
  );
}
