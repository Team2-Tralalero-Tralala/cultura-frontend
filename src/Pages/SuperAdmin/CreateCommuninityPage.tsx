/**
 * คำอธิบาย : Component สำหรับแสดงแบบฟอร์มข้อมูลวิสาหกิจชุมชนในรูปแบบ Accordion
 * โดยแบ่งออกเป็น 3 ส่วนหลัก ได้แก่
 * 1. ข้อมูลวิสาหกิจชุมชน (ชื่อ, ประเภท, การจดทะเบียน, บัญชีธนาคาร)
 * 2. ที่อยู่วิสาหกิจชุมชน (บ้านเลขที่, หมู่, จังหวัด, พิกัด)
 * 3. ข้อมูลติดต่อและผู้ดูแล (เบอร์โทร, อีเมล, ผู้ดูแลหลัก)
 * ใช้ร่วมกับ Component ย่อย เช่น TextField, TextArea, ThailandLocationSelect
 */
import Button from "@/Components/Button";
import MapPicker from "@/Components/MapPicker";
import { Modal } from "@/Components/Modal/Modal";
import { AdminSelector } from "@/Components/Selector/AdminSelector";
import MemberSelector, { type Member } from "@/Components/Selector/MemberSelector";
import UploadCard from "@/Components/upload/UploadCard";
import UploadProfile from "@/Components/upload/UploadProfile";
import { createCommunity } from "@/Libs/CommunityService";
import type { CommunityFormData } from "@/Types/Community";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import TextArea from "@/Components/Input/TextArea";
import TextField from "@/Components/Input/TextField";
import { Icon } from "@iconify/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import * as zod from "zod";
import BoxDateInput from "@/Components/calendar/InputCalendar/BoxDateInput";
import { BankSelector } from "@/Components/Selector/BankSelector";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/*
 * คำอธิบาย : Schema สำหรับตรวจสอบความถูกต้องของข้อมูลฟอร์มวิสาหกิจชุมชน
 * ใช้ zodod สำหรับ validate field แต่ละรายการก่อนส่งข้อมูลไป backend
 * Input: ข้อมูลในฟอร์มที่ผู้ใช้กรอก
 * Output: หากไม่ผ่าน validation จะส่งข้อความ error กลับให้แสดงในฟอร์ม
 */
const communitySchema = zod.object({
  name: zod.string("กรุณากรอกชื่อวิสาหกิจชุมชน").min(1, "กรุณากรอกชื่อวิสาหกิจชุมชน"),

  type: zod.string("กรุณากรอกประเภทวิสาหกิจชุมชน").min(1, "กรุณากรอกประเภทวิสาหกิจชุมชน"),

  registerNumber: zod
    .string("กรุณากรอกเลขทะเบียนวิสาหกิจชุมชน")
    .min(1, "กรุณากรอกเลขทะเบียนวิสาหกิจชุมชน"),

  registerDate: zod
    .union([zod.string().min(1, "กรุณากรอกวันที่จดทะเบียนวิสาหกิจชุมชน"), zod.date()])
    .transform((val) => (typeof val === "string" ? val : val.toISOString().split("T")[0])),

  bankName: zod
    .string("กรุณาเลือกธนาคาร")
    .min(1, "กรุณาเลือกธนาคาร")
    .max(45, "ชื่อบัญชีต้องไม่เกิน 45 ตัวอักษร"),

  accountName: zod.string("กรุณากรอกชื่อบัญชีธนาคาร").min(1, "กรุณากรอกชื่อบัญชีธนาคาร"),

  accountNumber: zod.number("กรุณากรอกหมายเลขบัญชีธนาคารเป็นตัวเลข").min(1, "กรุณากรอกหมายเลขบัญชี"),

  description: zod.string("กรุณากรอกประวัติวิสาหกิจชุมชน").min(1, "กรุณากรอกประวัติวิสาหกิจชุมชน"),

  mainActivityName: zod.string("กรุณากรอกชื่อกิจกรรมหลัก").min(1, "กรุณากรอกชื่อกิจกรรมหลัก"),

  mainActivityDescription: zod
    .string("กรุณากรอกรายละเอียดกิจกรรมหลัก")
    .min(1, "กรุณากรอกรายละเอียดกิจกรรมหลัก"),

  houseNumber: zod.string("กรุณากรอกบ้านเลขที่").min(1, "กรุณากรอกบ้านเลขที่"),

  province: zod.string("กรุณาเลือกจังหวัด").min(1, "กรุณาเลือกจังหวัด"),

  district: zod.string("กรุณาเลือกอำเภอ/เขต").min(1, "กรุณาเลือกอำเภอ/เขต"),

  subDistrict: zod.string("กรุณาเลือกตำบล/แขวง").min(1, "กรุณาเลือกตำบล/แขวง"),
  postalCode: zod.string("กรุณากรอกรหัสไปรษณีย์").min(1, "กรุณากรอกรหัสไปรษณีย์"),

  latitude: zod
    .union([zod.string(), zod.number()])
    .transform((value) => String(value))
    .refine(
      (latitude) => latitude.length > 0 && latitude !== "0",
      "หากคุณไม่ทราบละติจูดและลองจิจูดของวิสาหกิจชุมชน โปรดค้นหาวิสาหกิจชุมชนและปักหมุด",
    ),

  longitude: zod
    .union([zod.string(), zod.number()])
    .transform((value) => String(value))
    .refine(
      (longitude) => longitude.length > 0 && longitude !== "0",
      "หากคุณไม่ทราบละติจูดและลองจิจูดของวิสาหกิจชุมชน โปรดค้นหาวิสาหกิจชุมชนและปักหมุด",
    ),

  phone: zod
    .string("กรุณากรอกหมายเลขโทรศัพท์ของวิสาหกิจชุมชน")
    .min(1, "กรุณากรอกหมายเลขโทรศัพท์ของวิสาหกิจชุมชน"),

  email: zod.string("กรุณากรอกอีเมลของวิสาหกิจชุมชน").min(1, "กรุณากรอกอีเมลของวิสาหกิจชุมชน"),

  mainAdmin: zod.string("กรุณากรอกชื่อผู้ดูแลหลัก").min(1, "กรุณากรอกชื่อผู้ดูแลหลัก"),

  mainAdminPhone: zod
    .string("กรุณากรอกหมายเลขโทรศัพท์ของผู้ดูแลหลัก")
    .min(1, "กรุณากรอกหมายเลขโทรศัพท์ของผู้ดูแลหลัก"),

  adminId: zod.coerce.number("กรุณาเลือกผู้ดูแล").min(1, "กรุณาเลือกผู้ดูแล"),
});

/*
 * คำอธิบาย : เตรียมข้อมูล FormData สำหรับส่งไปยัง Server เพื่อสร้างชุมชนใหม่
 * Input : object ที่รวมข้อมูล formData, location, position, registerDate, logoFile, coverFiles, galleryFiles, videoFiles
 * Output : FormData object ที่พร้อมส่ง
 */
const prepareSubmitData = ({
  formData,
  location,
  position,
  registerDate,
  logoFile,
  coverFiles,
  galleryFiles,
  videoFiles,
}: {
  formData: any;
  location: any;
  position: any;
  registerDate: any;
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
    subDistrict,
    postalCode,
    ...cleanForm
  } = formData;

  // สร้าง FormData เพื่อส่ง multipart/form-data
  const formDataToSend = new FormData();

  formDataToSend.append(
    "data",
    JSON.stringify({
      adminId: Number(formData.adminId),
      communityMembers: formData.communityMembers ?? [],
      ...cleanForm,
      registerDate: registerDate ? new Date(registerDate).toISOString() : undefined,
      location: {
        houseNumber: formData.houseNumber,
        villageNumber: Number(formData.villageNumber),
        province: location.province,
        district: location.district,
        subDistrict: location.subdistrict,
        postalCode: String(location.postalCode),
        detail: formData.detail,
        latitude: Number(position[0]),
        longitude: Number(position[1]),
      },
    }),
  );

  if (logoFile) {
    formDataToSend.append("logo", logoFile);
  }
  if (coverFiles) {
    formDataToSend.append("cover", coverFiles);
  }

  galleryFiles.forEach((file: File) => {
    formDataToSend.append("gallery", file);
  });

  videoFiles.forEach((file: File) => {
    formDataToSend.append("video", file);
  });

  return formDataToSend;
};

/**
 * คำอธิบาย: Component หลักสำหรับหน้า "สร้างวิสาหกิจชุมชนใหม่"
 * ใช้จัดการ state ของข้อมูลฟอร์ม การตรวจสอบความถูกต้อง การส่งข้อมูลไป API
 * รวมถึง modal ยืนยันและการแจ้งเตือนผลลัพธ์
 * Input: -
 * Output: JSX Element หน้า Form สร้างวิสาหกิจชุมชน
 */
export default function CreateCommuninityPage() {
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [formData, setFormData] = React.useState<Partial<CommunityFormData>>({
    status: "CLOSED",
    rating: 0,
    communityMembers: [],
  });
  const [location, setLocation] = useState<ThailandLocation>({
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const startingPosition: [number, number] = [13.736717, 100.523186]; // BUU
  const startingZoom = 13;
  const [position, setPosition] = useState<[number, number]>(startingPosition);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [coverFiles, setCoverFiles] = useState<File | null>();
  const [logoFile, setLogoFile] = useState<File | null>();
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [registerDate, setRegisterDate] = React.useState<Date | null>(null);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertType, setAlertType] = React.useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const navigate = useNavigate();
  /*
   * คำอธิบาย: ฟังก์ชันนี้ใช้เพื่อตรวจสอบว่าฟอร์มมีการเปลี่ยนแปลงหรือไม่
   * Input: -
   * Output: boolean (true ถ้ามีการแก้ไขข้อมูล)
   */
  const checkIsDirty = () => {
    const isFormDirty =
      !!formData.name ||
      !!formData.type ||
      !!formData.registerNumber ||
      !!formData.bankName ||
      !!formData.accountName ||
      !!formData.accountNumber ||
      !!formData.description ||
      !!formData.mainActivityName ||
      !!formData.mainActivityDescription ||
      !!formData.houseNumber ||
      !!formData.villageNumber ||
      !!formData.detail ||
      !!formData.phone ||
      !!formData.email ||
      !!formData.urlWebsite ||
      !!formData.urlFacebook ||
      !!formData.urlLine ||
      !!formData.urlTiktok ||
      (formData.communityMembers && formData.communityMembers.length > 0);

    const isLocationDirty =
      !!location.province || !!location.district || !!location.subdistrict || !!location.postalCode;

    const isFilesDirty =
      !!coverFiles || !!logoFile || galleryFiles.length > 0 || videoFiles.length > 0;

    const isPositionDirty =
      position[0] !== startingPosition[0] || position[1] !== startingPosition[1];

    return isFormDirty || isLocationDirty || isFilesDirty || isPositionDirty;
  };

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับตรวจสอบการยกเลิก ถ้ามีการแก้ไขจะแจ้งเตือน
   * Input: -
   * Output: - (Navigate หรือเปิด Modal Confirm)
   */
  const handleCancel = () => {
    if (checkIsDirty()) {
      setOpenCancelConfirm(true);
    } else {
      navigate(-1);
    }
  };

  /**
   * คำอธิบาย: จัดการการขยาย/ย่อของ Accordion แต่ละ panel
   * Input: panel (string)
   * Output: - (Update expanded state)
   */
  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded((prev) =>
      isExpanded ? [...prev, panel] : prev.filter((activePanel) => activePanel !== panel),
    );
  };

  /**
   * คำอธิบาย: ตรวจสอบความถูกต้องของข้อมูลในฟอร์มด้วย zodod Schema
   * Input: field (optional string), value (optional any)
   * Output: boolean (true ถ้าข้อมูลถูกต้อง)
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

  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      latitude: position[0],
      longitude: position[1],
    }));
  }, [position]);
  /**
   * คำอธิบาย: ฟังก์ชันจัดการเมื่อผู้ใช้กรอกข้อมูลใน TextField หรือ TextArea
   * Input: e (ChangeEvent)
   * Output: - (Update formData state)
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    const updated = { ...formData, [id]: value };
    setFormData(updated);
    validateField(id as keyof typeof formData, value);
  };
  /**
   * คำอธิบาย: ฟังก์ชันสำหรับอัปเดตค่าใน formData ตามชื่อฟิลด์ที่ระบุ
   * Input: field (keyof CommunityFormData), value (any)
   * Output: - (Update formData state)
   */
  const handleValueChange = (field: keyof typeof formData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    validateField(field, value);
  };
  /**
   * คำอธิบาย: ตัวแปร memberList สำหรับสร้างรายการสมาชิกจากข้อมูลใน formData.communityMembers
   * ใช้ useMemo เพื่อป้องกันการคำนวณซ้ำโดยไม่จำเป็น (re-render optimizodation)
   * Input: - (ใช้ formData.communityMembers)
   * Output: Member[]
   */
  const memberList = React.useMemo<Member[]>(
    () =>
      (formData.communityMembers ?? []).map((id) => ({
        id,
        fname: "",
        lname: "",
      })),
    [formData.communityMembers],
  );

  /**
   * คำอธิบาย: ฟังก์ชันหลักสำหรับส่งข้อมูลฟอร์มไปยัง API เพื่อสร้างวิสาหกิจชุมชนใหม่
   * Input: -
   * Output: Promise<void>
   */
  const handleSubmit = async () => {
    try {
      const isFormValid = validateField();
      if (!isFormValid) {
        setAlertType("error");
        setAlertTitle("ข้อมูลไม่ถูกต้อง");
        setAlertMessage("กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก");
        setAlertOpen(true);
        return;
      }

      const formDataToSend = prepareSubmitData({
        formData,
        location,
        position,
        registerDate,
        logoFile,
        coverFiles,
        galleryFiles,
        videoFiles,
      });

      await createCommunity(formDataToSend);
      setAlertType("success");
      setAlertTitle("แก้ไขวิสาหกิจชุมชนสำเร็จ");
      setAlertMessage("ข้อมูลวิสาหกิจถูกแก้ไขเรียบร้อยแล้ว");
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
            label: "เพิ่มวิสาหกิจชุมชน",
            to: "/super/community/create",
          }}
        />
      </div>
      <div className="flex justify-between items-center">
        <Link
          to="/super/communities/all"
          className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          <h1 className="text-xl font-bold">เพิ่มวิสาหกิจชุมชน</h1>
        </Link>
      </div>
      <Accordion
        className="!rounded-lg !bg-transparent !shadow-none !border-0  mt-3"
        expanded={expanded.includes("panel2")}
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
          <div className="text-xl font-bold">ข้อมูลชุมชน</div>
        </AccordionSummary>
        <AccordionDetails className="!bg-white !rounded-lg !shadow-sm mt-[14px] !p-6">
          <h1 className="text-lg font-bold mb-[24px]">ข้อมูลวิสาหกิจชุมชน</h1>
          <div className="flex flex-col items-center mb-20">
            <UploadProfile
              roundedCover="rounded-[5px]"
              coverHeight={500}
              avatarSize={210} //รัศสมีวงกลม
              coverLabel="คลิกเพื่อเพิ่มรูปภาพหน้าปก"
              avatarLabel="เพิ่มรูปโลโก้ / โปรไฟล์"
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
          <div className="text-lg font-bold mt-[24px] mb-[24px]">กิจกรรมหลักของวิสาหกิจชุมชน</div>
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
            <div className="flex col-span-2">
              <div className="mr-5">
                <h3 className="font-bold text-base mb-3">อัพโหลดรูปภาพเพิ่มเติม</h3>
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
            </div>
            <div className="col-span-2">
              <div className="mr-5">
                <h3 className="font-bold text-base mb-3">อัพโหลดวิดีโอเพิ่มเติม</h3>
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
        expanded={expanded.includes("panel3")}
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
          <div className="text-xl font-bold">ที่อยู่วิสาหกิจชุมชน</div>
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
                value={location}
                onChange={(loc) => {
                  setLocation(loc); // เก็บไว้แสดงผลใน selector
                  setFormData((prev) => ({
                    ...prev,
                    province: loc.province,
                    district: loc.district,
                    subDistrict: loc.subdistrict,
                    postalCode: loc.postalCode,
                  }));
                  // ตรวจสอบความถูกต้องของ field ที่เกี่ยวข้อง
                  if (loc.province) validateField("province", loc.province);
                  if (loc.district) validateField("district", loc.district);
                  if (loc.subdistrict) validateField("subDistrict", loc.subdistrict);
                  if (loc.postalCode) validateField("postalCode", loc.postalCode);
                }}
                error={{
                  province: !!formErrors.province,
                  district: !!formErrors.district,
                  subdistrict: !!formErrors.subDistrict,
                  postalCode: !!formErrors.postalCode,
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
              <MapPicker
                startingPosition={[
                  Number(formData.latitude) || startingPosition[0],
                  Number(formData.longitude) || startingPosition[1],
                ]}
                startingZoom={startingZoom}
                onChange={setPosition}
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion
        className="!rounded-lg !bg-transparent !shadow-none !border-0  mt-3"
        expanded={expanded.includes("panel4")}
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
          <div className="text-xl font-bold">ข้อมูลติดต่อและผู้ดูแล</div>
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
            {/* ทดลองก่อน ยังไม่มี แอดมินมา */}
            <div>
              <AdminSelector
                value={formData.adminId}
                onChange={(adminId) => handleValueChange("adminId", adminId)}
                error={!!formErrors.adminId}
                helperText={formErrors.adminId}
              />
            </div>

            <div>
              <MemberSelector
                value={formData.communityMembers}
                member={memberList}
                onChange={(ids) => handleValueChange("communityMembers", ids)}
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      <div className="flex justify-end mt-5 mb-10 mr-5">
        <div className="w-32 mr-2.5">
          <Button type="cancel" onClick={handleCancel}>
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
        isOpen={openConfirm}
        title="ยืนยันการสร้างชุมชน"
        text="คุณต้องการยืนยันการสร้างชุมชนหรือไม่"
        onConfirm={async () => {
          setOpenConfirm(false);
          await handleSubmit();
        }}
        onCancel={() => setOpenConfirm(false)}
      />
      <Modal
        isOpen={openCancelConfirm}
        title="ยืนยันการยกเลิก"
        text="เเมื่อกดยืนยัน ข้อมูลที่คุณกรอกจะหายไปทั้งหมด"
        onConfirm={() => {
          setOpenCancelConfirm(false);
          navigate(-1);
        }}
        onCancel={() => setOpenCancelConfirm(false)}
      />
      <ModalAlert
        isOpen={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}
