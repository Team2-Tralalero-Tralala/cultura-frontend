/**
 * คำอธิบาย: Component สำหรับแก้ไขข้อมูลวิสาหกิจชุมชน (Admin)
 */

import { getCommunityOwn, updateCommunityOwn } from "@/Libs/CommunityService";
import type { CommunityFormData } from "@/Types/Community";
import Button from "@/Components/Button";
import MapPicker from "@/Components/MapPicker";
import { Modal } from "@/Components/Modal/Modal";
import { AdminSelector, type Admin } from "@/Components/Selector/AdminSelector";
import MemberSelector, { type Member } from "@/Components/Selector/MemberSelector";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import TextArea from "@/Components/TextArea";
import TextField from "@/Components/TextField";
import UploadCard from "@/Components/upload/UploadCard";
import UploadProfile from "@/Components/upload/UploadProfile";
import { Icon } from "@iconify/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Switch from "@/Components/Switch";
import * as React from "react";
import { Link, useNavigate } from "react-router";
import zod from "zod";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import { BankSelector } from "@/Components/Selector/BankSelector";
import BoxDateInput from "@/Components/calendar/InputCalendar/BoxDateInput";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

const communitySchema = zod.object({
  name: zod.string().min(1, "กรุณากรอกชื่อวิสาหกิจชุมชน"),
  type: zod.string().min(1, "กรุณากรอกประเภทวิสาหกิจชุมชน"),
  registerNumber: zod.string().min(1, "กรุณากรอกเลขทะเบียนวิสาหกิจชุมชน"),
  registerDate: zod
    .union([zod.string().min(1, "กรุณากรอกวันที่จดทะเบียนวิสาหกิจชุมชน"), zod.date()])
    .transform((value) => (typeof value === "string" ? value : value.toISOString().split("T")[0])),
  bankName: zod.string().min(1, "กรุณาเลือกธนาคาร").max(45, "ชื่อบัญชีต้องไม่เกิน 45 ตัวอักษร"),
  accountName: zod.string().min(1, "กรุณากรอกชื่อบัญชีธนาคาร"),
  accountNumber: zod.string().min(1, "กรุณากรอกหมายเลขบัญชี"),
  description: zod.string().min(1, "กรุณากรอกประวัติวิสาหกิจชุมชน"),
  mainActivityName: zod.string().min(1, "กรุณากรอกชื่อกิจกรรมหลัก"),
  mainActivityDescription: zod.string().min(1, "กรุณากรอกรายละเอียดกิจกรรมหลัก"),
  houseNumber: zod.string().min(1, "กรุณากรอกบ้านเลขที่"),
  province: zod.string().min(1, "กรุณาเลือกจังหวัด"),
  district: zod.string().min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: zod.string().min(1, "กรุณาเลือกตำบล/แขวง"),
  postalCode: zod.string().min(1, "กรุณากรอกรหัสไปรษณีย์"),
  latitude: zod.string().min(1, "กรุณากรอกละติจูด"),
  longitude: zod.string().min(1, "กรุณากรอกลองจิจูด"),
  phone: zod.string().min(1, "กรุณากรอกหมายเลขโทรศัพท์ของวิสาหกิจชุมชน"),
  email: zod.string().min(1, "กรุณากรอกอีเมลของวิสาหกิจชุมชน"),
  mainAdmin: zod.string().min(1, "กรุณากรอกชื่อผู้ดูแลหลัก"),
  mainAdminPhone: zod.string().min(1, "กรุณากรอกหมายเลขโทรศัพท์ของผู้ดูแลหลัก"),
});

/**
 * คำอธิบาย: แปลง URL ไฟล์เป็น File object
 * Input: url, filename
 * Output: File object พร้อม flag isFromServer
 */
async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url, {
    credentials: "include",
  });
  const blob = await response.blob();
  const extension = filename.split(".").pop() || "jpg";
  const type = blob.type || `image/${extension}`;
  const file = new File([blob], filename, { type });
  (file as any).isFromServer = true;
  return file;
}

/**
 * คำอธิบาย: สร้าง URL Preview สำหรับไฟล์
 * Input: file (File object)
 * Output: URL blob หรือ null
 */
const getFilePreview = (file: File | null): string | null => {
  if (!file) return null;
  return URL.createObjectURL(file);
};

/**
 * คำอธิบาย: ดึงไฟล์รูปภาพและวิดีโอจากรายการภาพของชุมชน
 * Input: communityImages (รายการภาพ), backendUrl (URL backend)
 * Output: { logo, cover, gallery, video } เป็น array ของ File objects
 */
const fetchCommunityFiles = async (communityImages: any[], backendUrl: string) => {
  const logoPromise = Promise.all(
    (communityImages || [])
      .filter((image: any) => image.type === "LOGO")
      .map(async (image: any) => await urlToFile(`${backendUrl}/${image.image}`, image.image)),
  );

  const coverPromise = Promise.all(
    (communityImages || [])
      .filter((image: any) => image.type === "COVER")
      .map(async (image: any) => await urlToFile(`${backendUrl}/${image.image}`, image.image)),
  );

  const galleryPromise = Promise.all(
    (communityImages || [])
      .filter((image: any) => image.type === "GALLERY")
      .map(async (image: any) => await urlToFile(`${backendUrl}/${image.image}`, image.image)),
  );

  const videoPromise = Promise.all(
    (communityImages || [])
      .filter((image: any) => image.type === "VIDEO")
      .map(async (image: any) => {
        const fullUrl = `${backendUrl}/${image.image}`;
        const response = await fetch(fullUrl, { credentials: "include" });
        const blob = await response.blob();
        const fixedBlob =
          blob.type && blob.type.startsWith("video/")
            ? blob
            : new Blob([blob], { type: "video/mp4" });
        return new File([fixedBlob], image.image, { type: fixedBlob.type });
      }),
  );

  const [logo, cover, gallery, video] = await Promise.all([
    logoPromise,
    coverPromise,
    galleryPromise,
    videoPromise,
  ]);

  return { logo, cover, gallery, video };
};

/**
 * คำอธิบาย: เตรียม FormData สำหรับการบันทึกข้อมูล
 * Input: ข้อมูลฟอร์มและไฟล์ต่างๆ
 * Output: FormData พร้อมส่ง
 */
const prepareSubmitData = ({
  formData,
  location,
  position,
  selectedMembers,
  registerDate,
  isVisibleRating,
  logoFile,
  coverFiles,
  galleryFiles,
  videoFiles,
}: {
  formData: any;
  location: any;
  position: any;
  selectedMembers: any;
  registerDate: any;
  isVisibleRating: any;
  logoFile: any;
  coverFiles: any;
  galleryFiles: any;
  videoFiles: any;
}) => {
  const {
    id,
    locationId,
    detail,
    houseNumber,
    longitude,
    latitude,
    villageNumber,
    province,
    district,
    bankName,
    subDistrict,
    postalCode,
    ...cleanForm
  } = formData;

  const payload = {
    ...cleanForm,
    communityMembers: selectedMembers,
    bankName: formData.bankName,
    registerDate: registerDate ? new Date(registerDate).toISOString() : undefined,
    isRatingVisible: isVisibleRating,
    location: {
      houseNumber: formData.houseNumber,
      villageNumber: formData.villageNumber! > 0 ? Number(formData.villageNumber) : null,
      province: location.province,
      district: location.district,
      subDistrict: location.subdistrict,
      postalCode: String(location.postalCode),
      detail: formData.detail,
      latitude: Number(position[0]),
      longitude: Number(position[1]),
    },
  };

  const formDataToSend = new FormData();
  formDataToSend.append("data", JSON.stringify(payload));

  if (logoFile) formDataToSend.append("logo", logoFile);
  if (coverFiles) formDataToSend.append("cover", coverFiles);

  galleryFiles.forEach((file: File) => formDataToSend.append("gallery", file));
  videoFiles.forEach((file: File) => formDataToSend.append("video", file));

  return formDataToSend;
};

/**
 * คำอธิบาย: Component หน้าแก้ไขข้อมูลวิสาหกิจชุมชน
 */
export default function EditCommunityPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState<Partial<CommunityFormData>>({
    communityMembers: [],
  });

  const [location, setLocation] = React.useState<ThailandLocation>({
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });

  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [formErrors, setFormErrors] = React.useState<Record<string, string | undefined>>({});
  const [isStatusOpen, setIsStatusOpen] = React.useState(true);
  const [isVisibleRating, setIsVisibleRating] = React.useState(true);
  const [admin, setAdmin] = React.useState<Admin>();
  const [members, setMembers] = React.useState<Member[]>();
  const [position, setPosition] = React.useState<[number, number]>([0, 0]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMapLoading, setIsMapLoading] = React.useState(false);
  const [coverFiles, setCoverFiles] = React.useState<File | null>(null);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [videoFiles, setVideoFiles] = React.useState<File[]>([]);
  const [selectedMembers, setSelectedMembers] = React.useState<number[]>([]);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [alertType, setAlertType] = React.useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [registerDate, setRegisterDate] = React.useState<Date | null>(null);
  const [isCancelConfirmModalOpen, setIsCancelConfirmModalOpen] = React.useState(false);

  /**
   * คำอธิบาย: โหลดข้อมูลชุมชน
   * Input: -
   * Output: - (อัปเดต state)
   */
  React.useEffect(() => {
    async function fetchData() {
      try {
        const delayPromise = new Promise((resolve) => setTimeout(resolve, 400));
        const fetchDataPromise = getCommunityOwn();

        const [response] = await Promise.all([fetchDataPromise, delayPromise]);

        const data = response.data.data;
        if (data.registerDate) {
          data.registerDate = new Date(data.registerDate).toISOString().split("T")[0];
        }
        const latitude = Number(data.location?.latitude ?? 13.736717);
        const longitude = Number(data.location?.longitude ?? 100.523186);

        setFormData({
          ...data,
          adminId: data.admin.id,
          houseNumber: data.location?.houseNumber,
          villageNumber: data.location?.villageNumber,
          detail: data.location?.detail,
          latitude: String(data.location?.latitude),
          longitude: String(data.location?.longitude),
          communityMembers: data.communityMembers?.map((member: Member) => member.id) ?? [],
          location: {
            province: data.location.province,
            district: data.location.district,
            subDistrict: data.location.subDistrict,
            postalCode: data.location.postalCode,
          },
          province: data.location.province,
          district: data.location.district,
          subDistrict: data.location.subDistrict,
          postalCode: data.location.postalCode,
        });

        setLocation({
          province: data.location.province,
          district: data.location.district,
          subdistrict: data.location.subDistrict,
          postalCode: data.location.postalCode,
        });

        setAdmin({
          id: data.admin.id,
          fname: data.admin.fname,
          lname: data.admin.lname,
        });

        setMembers(
          data.communityMembers?.map((member: any) => ({
            id: member.user.id,
            fname: member.user.fname,
            lname: member.user.lname,
          })) ?? [],
        );

        setRegisterDate(data.registerDate ? new Date(data.registerDate) : null);
        setPosition([latitude, longitude]);
        setIsStatusOpen(data.status === "OPEN" ? true : false);
        setIsVisibleRating(data.isRatingVisible);

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const backendUrl = apiUrl.replace("/api", "/uploads/") || "http://localhost:3000";

        const { logo, cover, gallery, video } = await fetchCommunityFiles(
          data.communityImage,
          backendUrl,
        );

        setLogoFile(logo[0] || null);
        setCoverFiles(cover[0] || null);
        setGalleryFiles(gallery);
        setVideoFiles(video);

        const memberIds = data.communityMembers?.map((member: any) => member.user.id) ?? [];
        setSelectedMembers(memberIds);
        setIsMapLoading(true);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  /**
   * คำอธิบาย: จัดการการเปิด/ปิด Accordion
   */
  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) =>
    setExpanded(isExpanded ? panel : false);

  /**
   * คำอธิบาย: ตรวจสอบความถูกต้องของข้อมูล
   */
  const validateField = (field?: string, value?: any) => {
    if (field) {
      const result = communitySchema.safeParse({ ...formData, [field]: value });
      setFormErrors((prev) => ({
        ...prev,
        [field]: result.success
          ? undefined
          : result.error.issues.find((err) => err.path[0] === field)?.message,
      }));
      return result.success;
    }

    const result = communitySchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        newErrors[fieldName as string] = issue.message;
      });
      setFormErrors(newErrors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  /**
   * คำอธิบาย: จัดการการเปลี่ยนสถานะชุมชน
   */
  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    setIsStatusOpen(newChecked);
    setFormData((prev) => ({
      ...prev,
      status: newChecked ? "OPEN" : "CLOSED",
    }));
  };

  /**
   * คำอธิบาย: จัดการการเปลี่ยนสถานะการแสดงคะแนน
   */
  const handleCheckRating = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    setIsVisibleRating(newChecked);
    setFormData((prev) => ({
      ...prev,
      isRatingVisible: newChecked,
    }));
  };

  /**
   * คำอธิบาย: จัดการการเปลี่ยนแปลง input form
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const updated = { ...formData, [id]: value };
    setFormData(updated);
    validateField(id as keyof typeof formData, value);
  };

  /**
   * คำอธิบาย: จัดการการเปลี่ยนแปลงค่า value โดยตรง
   */
  const handleValueChange = (field: keyof typeof formData, value: any) => {
    let newValue = value;
    if (field === "registerDate") {
      if (value instanceof Date) {
        newValue = value.toISOString().split("T")[0];
      }
    }
    const updated = { ...formData, [field]: newValue };
    setFormData(updated);
    validateField(field, newValue);
  };

  /**
   * คำอธิบาย: บันทึกการแก้ไขข้อมูล
   */
  const handleSubmit = async () => {
    const isFormValid = validateField();

    if (!isFormValid) {
      setAlertType("error");
      setAlertTitle("ข้อมูลไม่ถูกต้อง");
      setAlertMessage("กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก");
      setIsAlertOpen(true);
      return;
    }

    try {
      const formDataToSend = prepareSubmitData({
        formData,
        location,
        position,
        selectedMembers,
        registerDate,
        isVisibleRating,
        logoFile,
        coverFiles,
        galleryFiles,
        videoFiles,
      });

      await updateCommunityOwn(formDataToSend);

      setAlertType("success");
      setAlertTitle("แก้ไขวิสาหกิจชุมชนสำเร็จ");
      setAlertMessage("ข้อมูลวิสาหกิจถูกแก้ไขเรียบร้อยแล้ว");
      setIsAlertOpen(true);
      navigate("/admin/community/own");
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "เกิดข้อผิดพลาดจากระบบ กรุณาลองใหม่อีกครั้ง";

      setAlertType("error");
      setAlertTitle("เกิดข้อผิดพลาด");
      setAlertMessage(backendMessage);
      setIsAlertOpen(true);
    }
  };

  return (
    <div>
      <div>
        <Breadcrumb
          current={{
            label: "แก้ไขวิสาหกิจชุมชน",
            to: `/admin/community/own/edit`,
          }}
        />
      </div>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className="flex justify-between items-center">
        <Link
          to="/admin/community/own"
          className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          <h1 className="text-xl font-bold">แก้ไขวิสาหกิจชุมชน</h1>
        </Link>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <p>สถานะชุมชน</p>
          <Switch checked={isStatusOpen} onChange={handleCheck} />
        </Stack>
      </div>

      <Accordion
        className="!rounded-lg !bg-transparent !shadow-none !border-0  mt-3"
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
        sx={{ "&:before": { display: "none" } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
          className="!bg-white !rounded-lg !shadow-sm"
          sx={{
            "&.Mui-expanded": {
              minHeight: "48px",
            },
            "& .MuiAccordionSummary-content.Mui-expanded": {
              margin: "12px 0",
            },
          }}
        >
          <h1 className="text-xl font-bold inline-flex items-center gap-2">ข้อมูลชุมชน</h1>
        </AccordionSummary>
        <AccordionDetails className="!bg-white !rounded-lg !shadow-sm mt-[14px] !p-6">
          <div className="flex justify-between items-center w-full mb-[24px]">
            <h2 className="text-lg font-bold">ข้อมูลวิสาหกิจชุมชน</h2>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <p>แสดงคะแนนชุมชน</p>
              <Switch
                checked={isVisibleRating}
                onChange={handleCheckRating}
                labelOn="แสดง"
                labelOff="ซ่อน"
              />
            </Stack>
          </div>
          <div className="flex flex-col items-center mb-20">
            <UploadProfile
              roundedCover="rounded-[5px]"
              coverHeight={500}
              avatarSize={210} //รัศสมีวงกลม
              coverLabel="คลิกเพื่อเพิ่มรูปภาพหน้าปก"
              avatarLabel="เพิ่มรูปโลโก้ / โปรไฟล์"
              coverUrl={getFilePreview(coverFiles)}
              avatarUrl={getFilePreview(logoFile)}
              onCoverChange={setCoverFiles}
              onAvatarChange={setLogoFile}
            />
          </div>
          <div className="grid grid-cols-2 gap-y-[24px] gap-x-[30px]">
            <div>
              <TextField
                id="name"
                label="ชื่อวิสาหกิจชุมชน"
                required
                placeholder="กรอกชื่อวิสาหกิจชุมชน"
                type="text"
                value={formData.name}
                onChange={handleFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </div>
            <div>
              <TextField
                id="alias"
                label="ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)"
                placeholder="กรอกชื่อเรียกชุมชน"
                type="text"
                value={formData.alias}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <TextField
                id="type"
                label="ประเภทวิสาหกิจชุมชน"
                required
                placeholder="เช่น เกษตร หัตถกรรม ท่องเที่ยว"
                type="text"
                value={formData.type}
                onChange={handleFormChange}
                error={!!formErrors.type}
                helperText={formErrors.type}
              />
            </div>
            <div>
              <TextField
                id="registerNumber"
                label="เลขทะเบียนวิสาหกิจชุมชน"
                required
                placeholder="กรอกเลขทะเบียนวิสาหกิจชุมชน"
                type="text"
                value={formData.registerNumber}
                onChange={handleFormChange}
                error={!!formErrors.registerNumber}
                helperText={formErrors.registerNumber}
              />
            </div>
            <div>
              <BoxDateInput
                id="registerDate"
                label="วัน/เดือน/ปี (พ.ศ.) ที่จดทะเบียนวิสาหกิจชุมชน"
                value={registerDate}
                onChange={(date) => {
                  setRegisterDate(date);
                  const isoString = date ? date.toISOString().split("T")[0] : "";
                  handleValueChange("registerDate", isoString);
                }}
                required
                minDate={new Date(1980, 0, 1)}
                maxDate={new Date(2040, 12, 31)}
                errorText={formErrors.registerDate}
              />
            </div>
            <div>
              <BankSelector
                value={formData.bankName}
                onChange={(bankName) => handleValueChange("bankName", bankName)}
                error={!!formErrors.bankName}
                helperText={formErrors.bankName}
              />
            </div>
            <div>
              <TextField
                id="accountName"
                label="ชื่อบัญชีธนาคาร"
                required
                placeholder="กรอกชื่อบัญชีธนาคาร"
                type="text"
                value={formData.accountName}
                onChange={handleFormChange}
                error={!!formErrors.accountName}
                helperText={formErrors.accountName}
              />
            </div>
            <div>
              <TextField
                id="accountNumber"
                label="หมายเลขบัญชี"
                required
                placeholder="กรอกหมายเลขบัญชี"
                type="text"
                value={formData.accountNumber}
                onChange={handleFormChange}
                error={!!formErrors.accountNumber}
                helperText={formErrors.accountNumber}
              />
            </div>
            <div className="col-span-2">
              <TextArea
                id="description"
                label="ประวัติวิสาหกิจชุมชน"
                required
                placeholder="เล่าเรื่องราวหรือความเป็นมาของวิสาหกิจชุมชนนี้"
                value={formData.description}
                onChange={handleFormChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </div>
          </div>
          <h3 className="text-lg font-bold mt-[24px] mb-[24px]">กิจกรรมหลักของวิสาหกิจชุมชน</h3>
          <div className="grid grid-cols-1 gap-y-[24px] ">
            <div>
              <TextField
                id="mainActivityName"
                label="ชื่อกิจกรรมหลัก"
                required
                placeholder="กรอกชื่อกิจกรรมหลักของวิสาหกิจชุมชน"
                type="text"
                value={formData.mainActivityName}
                onChange={handleFormChange}
                error={!!formErrors.mainActivityName}
                helperText={formErrors.mainActivityName}
              />
            </div>
            <div className="col-span-2">
              <TextArea
                id="mainActivityDescription"
                label="รายละเอียดกิจกรรมหลัก"
                required
                placeholder="กรอกชื่อกิจกรรมหลักของวิสาหกิจชุมชน"
                value={formData.mainActivityDescription}
                onChange={handleFormChange}
                error={!!formErrors.mainActivityDescription}
                helperText={formErrors.mainActivityDescription}
              />
            </div>
            <div className="grid grid-cols-2 gap-y-[24px] gap-x-[30px]">
              <div>
                <h3 className="text-base font-bold mb-1.5">ร้านค้า</h3>
                <Link to={`/admin/community/stores`}>
                  <Button type="confirm-admin">
                    <Icon icon="carbon:store" style={{ fontSize: "24px" }} className="mr-2" />
                    จัดการร้านค้า
                  </Button>
                </Link>
              </div>
              <div>
                <div className="text-base font-bold mb-1.5">
                  <h3>ที่พัก</h3>
                </div>
                <Link to={`/admin/community/homestays`}>
                  <Button type="confirm-admin">
                    <Icon
                      icon="healthicons:home-outline"
                      style={{ fontSize: "24px" }}
                      className="mr-2"
                    />
                    จัดการที่พัก
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex col-span-2">
              <div className="mr-5">
                <h3 className="font-bold text-base mb-3">
                  อัพโหลดรูปภาพเพิ่มเติม
                  <span className="text-red-600"> *</span>{" "}
                </h3>
                <UploadCard
                  max={5}
                  accept="image/*"
                  multiple={false}
                  value={galleryFiles}
                  onChange={setGalleryFiles}
                  itemW={160}
                  itemH={110}
                  square={false}
                  itemClass="border border-dashed border-black/60 bg-slate-200/60"
                  rounded="rounded-lg"
                  gapCls="gap-4"
                  containerClass="w-full"
                  wrap
                  iconSizeCls="w-10 h-10"
                />
              </div>
              <div>
                <h3 className="font-bold text-base mb-3">
                  อัพโหลดวิดีโอเพิ่มเติม
                  <span className="text-red-600"> *</span>{" "}
                </h3>
                <UploadCard
                  max={5}
                  accept="video/*"
                  multiple={false}
                  value={videoFiles}
                  onChange={setVideoFiles}
                  itemW={160}
                  itemH={110}
                  square={false}
                  itemClass="border border-dashed border-black/60 bg-slate-200/60"
                  rounded="rounded-lg"
                  gapCls="gap-4"
                  containerClass="w-full"
                  wrap
                  iconSizeCls="w-10 h-10"
                />
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion
        className="!rounded-lg !bg-transparent !shadow-none !border-0  mt-3"
        expanded={expanded === "panel3"}
        onChange={handleChange("panel3")}
        sx={{ "&:before": { display: "none" } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
          className="!bg-white !rounded-lg !shadow-sm"
          sx={{
            "&.Mui-expanded": {
              minHeight: "48px",
            },
            "& .MuiAccordionSummary-content.Mui-expanded": {
              margin: "12px 0",
            },
          }}
        >
          <h2 className="text-xl font-bold">ที่อยู่วิสาหกิจชุมชน</h2>
        </AccordionSummary>
        <AccordionDetails className="!bg-white !rounded-lg !shadow-sm mt-[14px] !p-6">
          <div className="grid grid-cols-2 gap-y-[24px] gap-x-[30px]">
            <div>
              <TextField
                id="houseNumber"
                label="บ้านเลขที่"
                required
                placeholder="กรอกบ้านเลขที่วิสาหกิจชุมชน"
                type="text"
                value={formData.houseNumber}
                onChange={handleFormChange}
                error={!!formErrors.houseNumber}
                helperText={formErrors.houseNumber}
              />
            </div>
            <div>
              <TextField
                id="villageNumber"
                label="หมู่ที่"
                placeholder="กรอกหมู่ของวิสาหกิจชุมชน"
                type="number"
                value={formData.villageNumber}
                onChange={handleFormChange}
                error={!!formErrors.villageNumber}
                helperText={formErrors.villageNumber}
              />
            </div>
            <div className="col-span-2">
              <ThailandLocationSelector
                value={{
                  province: location.province,
                  district: location.district,
                  subdistrict: location.subdistrict,
                  postalCode: location.postalCode,
                }}
                onChange={(loc) => {
                  setLocation(loc);
                  setFormData((prev) => ({
                    ...prev,
                    province: loc.province,
                    district: loc.district,
                    subDistrict: loc.subdistrict,
                    postalCode: loc.postalCode,
                  }));
                  if (loc.province) validateField("province", loc.province);
                  if (loc.district) validateField("district", loc.district);
                  if (loc.subdistrict) validateField("subDistrict", loc.subdistrict);
                  if (loc.postalCode) validateField("postalCode", loc.postalCode);
                }}
                error={{
                  province: !!formErrors.province,
                  district: !!formErrors.district,
                  subdistrict: !!formErrors.subDistrict,
                }}
                helperText={{
                  province: formErrors.province,
                  district: formErrors.district,
                  subdistrict: formErrors.subDistrict,
                  postalCode: formErrors.postalCode,
                }}
              />
            </div>
            <div className="col-span-2">
              <TextArea
                id="detail"
                label="คำอธิบายที่อยู่"
                required
                placeholder="คำอธิบายที่อยู่"
                value={formData.detail}
                onChange={handleFormChange}
                error={!!formErrors.detail}
                helperText={formErrors.detail}
              />
            </div>
            <div className="text-lg font-bold">ที่ตั้งชุมชน</div>
          </div>
          <div className="grid grid-cols-2 gap-y-[24px] gap-x-[30px]">
            <div className="col-span-2">
              {isMapLoading && (
                <MapPicker startingPosition={position} startingZoom={13} onChange={setPosition} />
              )}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion
        className="!rounded-lg !bg-transparent !shadow-none !border-0  mt-3"
        expanded={expanded === "panel4"}
        onChange={handleChange("panel4")}
        sx={{ "&:before": { display: "none" } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel4bh-content"
          id="panel4bh-header"
          className="!bg-white !rounded-lg !shadow-sm"
          sx={{
            "&.Mui-expanded": {
              minHeight: "48px",
            },
            "& .MuiAccordionSummary-content.Mui-expanded": {
              margin: "12px 0",
            },
          }}
        >
          <h2 className="text-xl font-bold">ข้อมูลติดต่อและผู้ดูแล</h2>
        </AccordionSummary>
        <AccordionDetails className="!bg-white !rounded-lg !shadow-sm mt-[14px] !p-6">
          <h1 className="text-lg font-bold mb-[24px]">ข้อมูลติดต่อวิสาหกิจชุมชน</h1>
          <div className="grid grid-cols-2 gap-y-[24px] gap-x-[30px]">
            <div>
              <TextField
                id="phone"
                label="โทรศัพท์วิสาหกิจชุมชน"
                required
                placeholder="กรอกเบอร์โทรศัพท์ของวิสาหกิจชุมชน"
                type="text"
                value={formData.phone}
                onChange={handleFormChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </div>
            <div>
              <TextField
                id="email"
                label="อีเมลวิสาหกิจชุมชน"
                placeholder="กรอกอีเมลของวิสาหกิจชุมชน"
                required
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </div>
            <div className="col-span-2">
              <TextField
                id="urlWebsite"
                label="Link Website"
                placeholder="กรอก URL Website ของวิสาหกิจชุมชน"
                type="url"
                value={formData.urlWebsite}
                onChange={handleFormChange}
                error={!!formErrors.urlWebsite}
                helperText={formErrors.urlWebsite}
              />
            </div>
            <div className="col-span-2">
              <TextField
                id="urlFacebook"
                label="Link Facebook"
                placeholder="กรอก URL Facebook ของวิสาหกิจชุมชน"
                type="url"
                value={formData.urlFacebook}
                onChange={handleFormChange}
                error={!!formErrors.urlFacebook}
                helperText={formErrors.urlFacebook}
              />
            </div>
            <div className="col-span-2">
              <TextField
                id="urlLine"
                label="Link Line"
                placeholder="กรอก URL Line ของวิสาหกิจชุมชน"
                type="url"
                value={formData.urlLine}
                onChange={handleFormChange}
                error={!!formErrors.urlLine}
                helperText={formErrors.urlLine}
              />
            </div>
            <div className="col-span-2">
              <TextField
                id="urlTiktok"
                label="Link Tiktok"
                placeholder="กรอก URL Tiktok ของวิสาหกิจชุมชน"
                type="url"
                value={formData.urlTiktok}
                onChange={handleFormChange}
              />
            </div>
            <div className="col-span-2">
              <TextField
                id="urlOther"
                label="Link อื่นๆ"
                placeholder="กรอก URL อื่น ๆ ของวิสาหกิจชุมชน "
                type="url"
                value={formData.urlOther}
                onChange={handleFormChange}
                error={!!formErrors.urlOther}
                helperText={formErrors.urlOther}
              />
            </div>
          </div>
          <div className="text-lg font-bold mt-[24px] mb-[24px]">ข้อมูลผู้ดูแลวิสาหกิจชุมชน</div>
          <div className="grid grid-cols-2 gap-y-[24px] gap-x-[30px]">
            <div>
              <TextField
                id="mainAdmin"
                label="ชื่อผู้ดูแลหลัก"
                required
                placeholder="กรอกชื่อผู้ดูแลหลัก"
                type="text"
                value={formData.mainAdmin}
                onChange={handleFormChange}
                error={!!formErrors.mainAdmin}
                helperText={formErrors.mainAdmin}
              />
            </div>
            <div>
              <TextField
                id="mainAdminPhone"
                label="โทรศัพท์"
                required
                placeholder="กรอกเบอร์โทรศัพท์ของผู้ดูแลหลัก"
                type="text"
                value={formData.mainAdminPhone}
                onChange={handleFormChange}
                error={!!formErrors.mainAdminPhone}
                helperText={formErrors.mainAdminPhone}
              />
            </div>
            <div>
              <TextField
                id="coordinatorName"
                label="ชื่อผู้ประสานงาน "
                placeholder="กรอกชื่อชื่อผู้ประสานงาน "
                type="text"
                value={formData.coordinatorName}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <TextField
                id="coordinatorPhone"
                label="โทรศัพท์"
                placeholder="กรอกเบอร์โทรศัพท์ของผู้ประสานงาน"
                type="text"
                value={formData.coordinatorPhone}
                onChange={handleFormChange}
                error={!!formErrors.coordinatorPhone}
                helperText={formErrors.coordinatorPhone}
              />
            </div>
            <div>
              <AdminSelector
                value={formData.adminId}
                admin={admin}
                onChange={(adminId) => handleValueChange("adminId", Number(adminId))}
                error={!!formErrors.adminId}
                helperText={String(formErrors.adminId)}
                isDisable={true}
              />
            </div>

            <div>
              <MemberSelector
                value={selectedMembers}
                member={members}
                onChange={(ids) => setSelectedMembers(ids)}
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      <div className="flex justify-end mt-5 mb-10 mr-5">
        <div className="w-32 mr-2.5">
          <Button type="cancel" onClick={() => setIsCancelConfirmModalOpen(true)}>
            ยกเลิก
          </Button>
        </div>
        <div className="w-32">
          <Button type="confirm-admin" onClick={() => setIsConfirmModalOpen(true)}>
            บันทึก
          </Button>
        </div>
      </div>
      <Modal
        open={isConfirmModalOpen}
        title="ยืนยันการแก้ไขข้อมูล"
        text="คุณต้องการยืนยันการแก้ไขข้อมูลหรือไม่"
        onConfirm={async () => {
          setIsConfirmModalOpen(false);
          await handleSubmit();
        }}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
      <Modal
        open={isCancelConfirmModalOpen}
        title="ยืนยันการยกเลิก"
        text="เมื่อกดตกลง ข้อมูลที่คุณกรอกจะหายไปทั้งหมด"
        onConfirm={() => {
          setIsCancelConfirmModalOpen(false);
          navigate(-1);
        }}
        onCancel={() => setIsCancelConfirmModalOpen(false)}
      />
      <ModalAlert
        open={isAlertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setIsAlertOpen(false)}
      />
    </div>
  );
}
