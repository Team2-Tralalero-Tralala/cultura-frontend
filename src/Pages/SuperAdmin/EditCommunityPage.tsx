/**
 * คำอธิบาย : Component สำหรับแก้ไขข้อมูลวิสาหกิจชุมชน (Community)
 * โดยแสดงแบบฟอร์มแบบ Accordion แบ่งเป็น 3 ส่วนหลัก ได้แก่
 * 1. ข้อมูลวิสาหกิจชุมชน (ชื่อ, ประเภท, กิจกรรมหลัก, บัญชีธนาคาร)
 * 2. ที่อยู่วิสาหกิจชุมชน (บ้านเลขที่, จังหวัด, พิกัด)
 * 3. ข้อมูลติดต่อและผู้ดูแล (โทรศัพท์, อีเมล, ผู้ดูแลหลัก)
 * ฟังก์ชันหลัก: โหลดข้อมูลจาก API, ตรวจสอบความถูกต้องของข้อมูลด้วย Zod,
 * และส่งคำขออัปเดตข้อมูลไปยังเซิร์ฟเวอร์ผ่าน updateCommunity()
 */
import * as React from "react";
import { Link, redirect, useNavigate, useParams } from "react-router";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { CommunityFormData } from "@/Types/CommunityForm";
import z from "zod";
import Stack from "@mui/material/Stack";

import Switch from "@/Components/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import { getCommunityById, updateCommunity } from "@/Services/community-service";
import Backdrop from "@mui/material/Backdrop";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import TextArea from "@/Components/TextArea";
import MapPicker from "@/Components/MapPicker";
import { AdminSelector, type Admin } from "@/Components/Selector/AdminSelector";
import Button from "@/Components/Button";
import MemberSelector, { type Member } from "@/Components/Selector/MemberSelector";
import TextField from "@/Components/TextField";
import { Modal } from "@/Components/Modal/Modal";
import { Icon } from "@iconify/react";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import UploadProfile from "@/Components/calendar/upload/community/UploadProfile";
import { BankSelector } from "@/Components/Selector/BankSelector";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import BoxDateInput from "@/Components/calendar/input_calendar/BoxDateInput";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/*
 * คำอธิบาย : Schema สำหรับตรวจสอบความถูกต้องของข้อมูลฟอร์มวิสาหกิจชุมชน
 * ใช้ Zod สำหรับ validate field แต่ละรายการก่อนส่งไป backend
 * Input : object ของข้อมูลฟอร์มทั้งหมด
 * Output : หากไม่ผ่าน validation จะคืนข้อความ error ของแต่ละ field
 */
const communitySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อวิสาหกิจชุมชน"),
  type: z.string().min(1, "กรุณากรอกประเภทวิสาหกิจชุมชน"),
  registerNumber: z.string().min(1, "กรุณากรอกเลขทะเบียนวิสาหกิจชุมชน"),
  registerDate: z
    .union([z.string().min(1, "กรุณากรอกวันที่จดทะเบียนวิสาหกิจชุมชน"), z.date()])
    .transform((value) => (typeof value === "string" ? value : value.toISOString().split("T")[0])),
  bankName: z.string().min(1, "กรุณาเลือกธนาคาร").max(45, "ชื่อบัญชีต้องไม่เกิน 45 ตัวอักษร"),
  accountName: z.string().min(1, "กรุณากรอกชื่อบัญชีธนาคาร"),
  accountNumber: z.string().min(1, "กรุณากรอกหมายเลขบัญชี"),
  description: z.string().min(1, "กรุณากรอกประวัติวิสาหกิจชุมชน"),
  mainActivityName: z.string().min(1, "กรุณากรอกชื่อกิจกรรมหลัก"),
  mainActivityDescription: z.string().min(1, "กรุณากรอกรายละเอียดกิจกรรมหลัก"),
  houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล/แขวง"),
  postalCode: z.string().min(1, "กรุณากรอกรหัสไปรษณีย์"),
  latitude: z.string().min(1, "กรุณากรอกละติจูด"),
  longitude: z.string().min(1, "กรุณากรอกลองจิจูด"),
  phone: z.string().min(1, "กรุณากรอกหมายเลขโทรศัพท์ของวิสาหกิจชุมชน"),
  email: z.string().min(1, "กรุณากรอกอีเมลของวิสาหกิจชุมชน"),
  mainAdmin: z.string().min(1, "กรุณากรอกชื่อผู้ดูแลหลัก"),
  mainAdminPhone: z.string().min(1, "กรุณากรอกหมายเลขโทรศัพท์ของผู้ดูแลหลัก"),
});
/*
 * คำอธิบาย : ฟังก์ชันสำหรับแปลงไฟล์จาก URL ให้เป็นวัตถุ File เพื่อใช้งานในฟอร์มหรืออัปโหลดใหม่
 * Input : url, filename, defaultMimeType
 * Output : File object
 */
async function urlToFile(url: string, filename: string, defaultMimeType?: string): Promise<File> {
  const response = await fetch(url, {
    credentials: "include",
  });
  const blob = await response.blob();

  let type = blob.type;
  if (!type || (defaultMimeType && !type.startsWith(defaultMimeType.split("/")[0]))) {
    type = defaultMimeType || `image/${filename.split(".").pop() || "jpg"}`;
  }

  const finalBlob = blob.type === type ? blob : new Blob([blob], { type });
  const file = new File([finalBlob], filename, { type: finalBlob.type });

  (file as any).isFromServer = true;
  return file;
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้าง URL พรีวิวไฟล์ (เช่น รูปภาพหรือวิดีโอ) จากวัตถุ File
 * Input : file
 * Output : URL string หรือ null
 */
const getFilePreview = (file: File | null): string | null => {
  if (!file) return null;
  if ((file as any).isFromServer) {
    // ถ้าเป็นไฟล์จากเซิร์ฟเวอร์ (ถูก flag แล้ว)
    return URL.createObjectURL(file);
  }
  return URL.createObjectURL(file);
};

/*
 * คำอธิบาย : ดึงไฟล์รูปภาพและวิดีโอจากรายการภาพของชุมชนตามประเภท
 * Input :
 * - communityImages (array) : รายการรูปภาพจาก API
 * - backendUrl (string) : URL ของ Backend
 * Output : object ที่ประกอบด้วย logo, cover, gallery, video (File[])
 */
const fetchCommunityFiles = async (communityImages: any[], backendUrl: string) => {
  const getFiles = (type: string, defaultMimeType?: string) =>
    Promise.all(
      (communityImages || [])
        .filter((image: any) => image.type === type)
        .map((image: any) =>
          urlToFile(`${backendUrl}/${image.image}`, image.image, defaultMimeType)
        )
    );

  const [logo, cover, gallery, video] = await Promise.all([
    getFiles("LOGO"),
    getFiles("COVER"),
    getFiles("GALLERY"),
    getFiles("VIDEO", "video/mp4"),
  ]);

  return { logo, cover, gallery, video };
};

/*
 * คำอธิบาย : เตรียมข้อมูล FormData สำหรับส่งไปยัง Server
 * Input : object ที่รวมข้อมูล formData, selectedMembers, location, position, registerDate, isVisibleRating, files
 * Output : FormData object ที่พร้อมส่ง
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

/*
 * คำอธิบาย : Component สำหรับแก้ไขข้อมูลวิสาหกิจชุมชน
 * ทำหน้าที่โหลดข้อมูลจาก API, แสดงข้อมูลในฟอร์ม, ตรวจสอบความถูกต้อง และบันทึกการแก้ไข
 * Input : communityId (ดึงจาก useParams)
 * Output : ส่งคำขออัปเดตข้อมูลวิสาหกิจชุมชนผ่าน API updateCommunity()
 */
export function EditCommunity() {
  const { communityId } = useParams();
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
  const [checked, setChecked] = React.useState(true);
  const [isVisibleRating, setIsVisibleRating] = React.useState(true);
  const [admin, setAdmin] = React.useState<Admin>();
  const [members, setMembers] = React.useState<Member[]>();
  const [position, setPosition] = React.useState<[number, number]>([0, 0]);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // สำหรับโหลดข้อมูลครั้งแรก
  const [coverFiles, setCoverFiles] = React.useState<File | null>(null);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [videoFiles, setVideoFiles] = React.useState<File[]>([]);
  const [selectedMembers, setSelectedMembers] = React.useState<number[]>([]);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertType, setAlertType] = React.useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [registerDate, setRegisterDate] = React.useState<Date | null>(null);
  const [openCancelConfirm, setOpenCancelConfirm] = React.useState(false);

  const navigate = useNavigate();

  /*
   * คำอธิบาย : โหลดข้อมูลชุมชนจาก API โดยใช้ communityId จาก URL
   * Input : -
   * Output : -
   */
  React.useEffect(() => {
    async function fetchData() {
      if (!communityId) return;
      try {
        const delayPromise = new Promise((resolve) => setTimeout(resolve, 400));

        const fetchDataPromise = getCommunityById(Number(communityId));

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
          })) ?? []
        );
        setRegisterDate(data.registerDate ? new Date(data.registerDate) : null);
        setPosition([latitude, longitude]);
        setChecked(data.status === "OPEN" ? true : false);
        setIsVisibleRating(data.isRatingVisible);

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const backendUrl = apiUrl.replace("/api", "/uploads/") || "http://localhost:3000";

        const { logo, cover, gallery, video } = await fetchCommunityFiles(
          data.communityImage,
          backendUrl
        );

        setLogoFile(logo[0] || null);
        setCoverFiles(cover[0] || null);
        setGalleryFiles(gallery);
        setVideoFiles(video);
        const memberIds = data.communityMembers?.map((m: any) => m.user.id) ?? [];
        setSelectedMembers(memberIds);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [communityId]);

  /*
   * คำอธิบาย : ฟังก์ชันควบคุมการขยาย/ย่อของ Accordion
   * Input : panel
   * Output : -
   */
  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) =>
    setExpanded(isExpanded ? panel : false);
  /*
   * คำอธิบาย : ตรวจสอบความถูกต้องของข้อมูลในฟอร์มด้วย Zod Schema
   * Input : field, value
   * Output : boolean
   */
  const validateField = (field?: string, value?: any) => {
    // ถ้ามี field แสดงว่าตรวจเฉพาะช่องนั้น
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

    // ถ้าไม่มี field แปลว่าต้องตรวจทั้งฟอร์ม
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

    // ถ้าผ่านทั้งหมด
    setFormErrors({});
    return true;
  };
  /*
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้เปลี่ยนสถานะชุมชน (เปิด/ปิด)
   * Input : event
   * Output : -
   */
  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    setChecked(newChecked);
    setFormData((prev) => ({
      ...prev,
      status: newChecked ? "OPEN" : "CLOSED",
    }));
  };

  /*
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้เปิด/ปิดการแสดงคะแนนชุมชน
   * Input : event
   * Output : -
   */
  const handleCheckRating = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    setIsVisibleRating(newChecked);
    setFormData((prev) => ({
      ...prev,
      isRatingVisible: newChecked,
    }));
  };

  /*
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้กรอกข้อมูลใน TextField หรือ TextArea
   * Input : e
   * Output : -
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const updated = { ...formData, [id]: value };
    setFormData(updated);
    validateField(id as keyof typeof formData, value);
  };
  /*
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อมีการเปลี่ยนค่าใน field เฉพาะ
   * Input : field, value
   * Output : -
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

  /*
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้กดปุ่ม "บันทึก"
   * Input : -
   * Output : -
   */
  const handleSubmit = async () => {
    const isFormValid = validateField();

    if (!isFormValid) {
      setAlertType("error");
      setAlertTitle("ข้อมูลไม่ถูกต้อง");
      setAlertMessage("กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก");
      setAlertOpen(true);
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

      await updateCommunity(Number(communityId), formDataToSend);
      setAlertType("success");
      setAlertTitle("แก้ไขวิสาหกิจชุมชนสำเร็จ");
      setAlertMessage("ข้อมูลวิสาหกิจถูกแก้ไขเรียบร้อยแล้ว");
      setAlertOpen(true);
      navigate("/super/communities/all");
    } catch (error: any) {
      setAlertType("error");
      setAlertTitle("เกิดข้อผิดพลาด");
      setAlertMessage("เกิดข้อผิดพลาดจากระบบ กรุณาลองใหม่อีกครั้ง");
      setAlertOpen(true);
    }
  };

  return (
    <div>
      <div>
        <Breadcrumb
          current={{
            label: "แก้ไขวิสาหกิจชุมชน",
            to: `/super/community/${communityId}/edit`,
          }}
        />
      </div>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className="flex justify-between items-center">
        <Link
          to="/super/communities/all"
          className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          <h1 className="text-xl font-bold">แก้ไขวิสาหกิจชุมชน</h1>
        </Link>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <p>สถานะชุมชน</p>
          <Switch checked={checked} onChange={handleCheck} />
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
                <Link to={`/super/community/${communityId}/stores/all`}>
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
                <Link to={`/super/community/${communityId}/homestay/all`}>
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
              {position[0] !== 0 && position[1] !== 0 && (
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
          <Button type="cancel" onClick={() => setOpenCancelConfirm(true)}>
            ยกเลิก
          </Button>
        </div>
        <div className="w-32">
          <Button type="confirm-admin" onClick={() => setOpenConfirm(true)}>
            บันทึก
          </Button>
        </div>
      </div>
      <Modal
        open={openConfirm}
        title="ยืนยันการแก้ไขข้อมูล"
        text="คุณต้องการยืนยันการแก้ไขข้อมูลหรือไม่"
        onConfirm={async () => {
          setOpenConfirm(false);
          await handleSubmit();
        }}
        onCancel={() => setOpenConfirm(false)}
      />
      <Modal
        open={openCancelConfirm}
        title="ยืนยันการยกเลิก"
        text="เมื่อกดยืนยัน ข้อมูลที่คุณกรอกจะหายไปทั้งหมด"
        onConfirm={() => {
          setOpenCancelConfirm(false);
          navigate(-1);
        }}
        onCancel={() => setOpenCancelConfirm(false)}
      />
      <ModalAlert
        open={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}
