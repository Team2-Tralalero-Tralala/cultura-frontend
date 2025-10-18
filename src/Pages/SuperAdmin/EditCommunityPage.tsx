/*
 * คำอธิบาย : Component สำหรับแก้ไขข้อมูลวิสาหกิจชุมชน (Community)
 * โดยแสดงแบบฟอร์มแบบ Accordion แบ่งเป็น 3 ส่วนหลัก ได้แก่
 * 1. ข้อมูลวิสาหกิจชุมชน (ชื่อ, ประเภท, กิจกรรมหลัก, บัญชีธนาคาร)
 * 2. ที่อยู่วิสาหกิจชุมชน (บ้านเลขที่, จังหวัด, พิกัด)
 * 3. ข้อมูลติดต่อและผู้ดูแล (โทรศัพท์, อีเมล, ผู้ดูแลหลัก)
 * ฟังก์ชันหลัก: โหลดข้อมูลจาก API, ตรวจสอบความถูกต้องของข้อมูลด้วย Zod,
 * และส่งคำขออัปเดตข้อมูลไปยังเซิร์ฟเวอร์ผ่าน updateCommunity()
 */
import * as React from "react";
import { Link, useParams } from "react-router";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { CommunityFormData } from "@/Types/CommunityForm";
import z from "zod";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import { getCommunityById, updateCommunity } from "@/Libs/CommunityService";
import Backdrop from "@mui/material/Backdrop";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/components/Selector/ThailandLocationSelector";
import TextArea from "@/components/TextArea";
import MapPicker from "@/components/MapPicker";
import { AdminSelector, type Admin } from "@/components/Selector/AdminSelector";
import Button from "@/components/Button";
import MemberSelector, {
  type Member,
} from "@/components/Selector/MemberSelector";
import TextField from "@/components/TextField";
import { Modal } from "@/components/Modal/Modal";
import { Icon } from "@iconify/react";
import UploadCard from "@/components/upload/UploadCard";
import UploadProfile from "@/components/upload/community/UploadProfile";

/*
 * คำอธิบาย : Schema สำหรับตรวจสอบความถูกต้องของข้อมูลฟอร์มวิสาหกิจชุมชน
 * ใช้ Zod สำหรับ validate field แต่ละรายการก่อนส่งไป backend
 * Input : object ของข้อมูลฟอร์มทั้งหมด
 * Output : หากไม่ผ่าน validation จะคืนข้อความ error ของแต่ละ field
 */
const communitySchema = z.object({
  name: z
    .string("กรุณากรอกชื่อวิสาหกิจชุมชน")
    .min(1, "กรุณากรอกชื่อวิสาหกิจชุมชน"),

  type: z
    .string("กรุณากรอกประเภทวิสาหกิจชุมชน")
    .min(1, "กรุณากรอกประเภทวิสาหกิจชุมชน"),

  registerNumber: z
    .string("กรุณากรอกเลขทะเบียนวิสาหกิจชุมชน")
    .min(1, "กรุณากรอกเลขทะเบียนวิสาหกิจชุมชน"),

  registerDate: z
    .string("กรุณากรอกวันที่จดทะเบียนวิสาหกิจชุมชน")
    .min(1, "กรุณากรอกวันที่จดทะเบียนวิสาหกิจชุมชน"),

  bankName: z
    .string("กรุณาเลือกธนาคาร")
    .min(1, "กรุณาเลือกธนาคาร")
    .max(45, "ชื่อบัญชีต้องไม่เกิน 45 ตัวอักษร"),

  accountName: z
    .string("กรุณากรอกชื่อบัญชีธนาคาร")
    .min(1, "กรุณากรอกชื่อบัญชีธนาคาร"),

  accountNumber: z
    .string("กรุณากรอกหมายเลขบัญชี")
    .min(1, "กรุณากรอกหมายเลขบัญชี"),

  description: z
    .string("กรุณากรอกประวัติวิสาหกิจชุมชน")
    .min(1, "กรุณากรอกประวัติวิสาหกิจชุมชน"),

  mainActivityName: z
    .string("กรุณากรอกชื่อกิจกรรมหลัก")
    .min(1, "กรุณากรอกชื่อกิจกรรมหลัก"),

  mainActivityDescription: z
    .string("กรุณากรอกรายละเอียดกิจกรรมหลัก")
    .min(1, "กรุณากรอกรายละเอียดกิจกรรมหลัก"),

  houseNumber: z.string("กรุณากรอกบ้านเลขที่").min(1, "กรุณากรอกบ้านเลขที่"),

  province: z.string("กรุณาเลือกจังหวัด").min(1, "กรุณาเลือกจังหวัด"),

  district: z.string("กรุณาเลือกอำเภอ/เขต").min(1, "กรุณาเลือกอำเภอ/เขต"),

  subDistrict: z.string("กรุณาเลือกตำบล/แขวง").min(1, "กรุณาเลือกตำบล/แขวง"),

  latitude: z
    .string("กรุณากรอกละติจูด")
    .min(
      1,
      "หากคุณไม่ทราบละติจูดและลองจิจูดของวิสาหกิจชุมชน โปรดค้นหาวิสาหกิจชุมชนและปักหมุด"
    ),

  longitude: z
    .string("กรุณากรอกลองจิจูด")
    .min(
      1,
      "หากคุณไม่ทราบละติจูดและลองจิจูดของวิสาหกิจชุมชน โปรดค้นหาวิสาหกิจชุมชนและปักหมุด"
    ),

  phone: z
    .string("กรุณากรอกหมายเลขโทรศัพท์ของวิสาหกิจชุมชน")
    .min(1, "กรุณากรอกหมายเลขโทรศัพท์ของวิสาหกิจชุมชน"),

  email: z
    .string("กรุณากรอกอีเมลของวิสาหกิจชุมชน")
    .min(1, "กรุณากรอกอีเมลของวิสาหกิจชุมชน"),

  mainAdmin: z
    .string("กรุณากรอกชื่อผู้ดูแลหลัก")
    .min(1, "กรุณากรอกชื่อผู้ดูแลหลัก"),

  mainAdminPhone: z
    .string("กรุณากรอกหมายเลขโทรศัพท์ของผู้ดูแลหลัก")
    .min(1, "กรุณากรอกหมายเลขโทรศัพท์ของผู้ดูแลหลัก"),

  adminId: z.coerce.number("กรุณาเลือกผู้ดูแล").min(1, "กรุณาเลือกผู้ดูแล"),
});
/*
 * คำอธิบาย : Component สำหรับแก้ไขข้อมูลวิสาหกิจชุมชน
 * ทำหน้าที่โหลดข้อมูลจาก API, แสดงข้อมูลในฟอร์ม, ตรวจสอบความถูกต้อง และบันทึกการแก้ไข
 * Input : communityId (ดึงจาก useParams)
 * Output : ส่งคำขออัปเดตข้อมูลวิสาหกิจชุมชนผ่าน API updateCommunity()
 */
export function EditCommunity() {
  const { communityId } = useParams();
  const [formData, setFormData] = React.useState<Partial<CommunityFormData>>({
    member: [],
  });

  const [location, setLocation] = React.useState<ThailandLocation>({
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [formErrors, setFormErrors] = React.useState<
    Record<string, string | undefined>
  >({});
  const [checked, setChecked] = React.useState(true);
  const [admin, setAdmin] = React.useState<Admin>();
  const [members, setMembers] = React.useState<Member[]>();
  const [position, setPosition] = React.useState<[number, number]>([
    13.736717, 100.523186,
  ]);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // สำหรับโหลดข้อมูลครั้งแรก
  const [isSubmitting, setIsSubmitting] = React.useState(false); // สำหรับตอนกดบันทึก
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [videoFiles, setVideoFiles] = React.useState<File[]>([]);

  /*
   * คำอธิบาย : โหลดข้อมูลชุมชนจาก API โดยใช้ communityId จาก URL
   * Input : ไม่มี (ใช้ communityId จาก useParams)
   * Output :
   * - เซ็ตค่า state formData, location, admin, members
   * - เซ็ตค่าพิกัดตำแหน่ง (position) สำหรับแผนที่
   */
  /*
   * คำอธิบาย : โหลดข้อมูลชุมชนจาก API โดยใช้ communityId จาก URL
   * Input : ไม่มี (ใช้ communityId จาก useParams)
   * Output :
   * - เซ็ตค่า state formData, location, admin, members
   * - เซ็ตค่าพิกัดตำแหน่ง (position) สำหรับแผนที่
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
          data.registerDate = new Date(data.registerDate)
            .toISOString()
            .split("T")[0];
        }
        const lat = Number(data.location?.latitude ?? 13.736717);
        const lng = Number(data.location?.longitude ?? 100.523186);
        setFormData({
          ...data,
          adminId: data.admin.id,
          member: data.member.map((m: any) => m.id) ?? [],
          houseNumber: data.location?.houseNumber,
          villageNumber: data.location?.villageNumber,
          detail: data.location?.detail,
          latitude: String(data.location?.latitude),
          longitude: String(data.location?.longitude),
          location: {
            province: data.location.province,
            district: data.location.district,
            subDistrict: data.location.subDistrict,
            postalCode: data.location.postalCode,
          },
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
          data.member?.map((m: any) => ({
            id: m.id,
            fname: m.fname,
            lname: m.lname,
          })) ?? []
        );
        setPosition([lat, lng]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [communityId]);

  React.useEffect(() => {
    if (location.province) {
      setFormData((prev) => ({
        ...prev,
        province: location.province,
        district: location.district,
        subDistrict: location.subdistrict,
        postalCode: location.postalCode,
      }));

      // ตรวจสอบ error ทันที
      validateField("province", location.province);
      validateField("district", location.district);
      validateField("subDistrict", location.subdistrict);
    }
  }, [location]);

  /*
   * คำอธิบาย : ฟังก์ชันควบคุมการขยาย/ย่อของ Accordion
   * Input : panel (string) — รหัสของ panel ที่ต้องการเปิด/ปิด
   * Output : อัปเดต state expanded เพื่อควบคุมการเปิด/ปิด Accordion
   */
  const handleChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) =>
      setExpanded(isExpanded ? panel : false);
  /*
   * คำอธิบาย : ตรวจสอบความถูกต้องของข้อมูลในฟอร์มด้วย Zod Schema
   * Input :
   * - field (string) : ชื่อฟิลด์ที่ต้องการตรวจสอบ
   * - value (any) : ค่าของฟิลด์นั้น
   * Output :
   * - คืนค่า boolean (true = ผ่าน, false = ไม่ผ่าน)
   * - อัปเดต state formErrors ให้แสดงข้อความ error ของฟิลด์ที่ไม่ผ่าน
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
   * Input : event (React.ChangeEvent<HTMLInputElement>)
   * Output : อัปเดตค่า checked และ status ("OPEN" / "CLOSED") ใน formData
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
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้กรอกข้อมูลใน TextField หรือ TextArea
   * Input : e (React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
   * Output : อัปเดตค่าใน formData และเรียก validateField() เพื่อตรวจสอบข้อมูล
   */
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    const updated = { ...formData, [id]: value };
    setFormData(updated);
    validateField(id as keyof typeof formData, value);
  };
  /*
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อมีการเปลี่ยนค่าใน field เฉพาะ (ใช้กับ Selector/MapPicker)
   * Input :
   * - field (keyof typeof formData) : ชื่อฟิลด์ที่ต้องอัปเดต
   * - value (any) : ค่าที่ต้องการเซ็ตลงใน formData
   * Output : อัปเดตค่าใน formData และเรียก validateField เพื่อเช็กความถูกต้อง
   */
  const handleValueChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });

    // เรียก validateField ถ้ามีฟังก์ชันตรวจ
    if (typeof validateField === "function") {
      validateField(field, value);
    }
  };

  /*
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้กดปุ่ม "บันทึก"
   * ✅ อัปเดต:
   * 1. ตรวจสอบ validation แล้วเปิด Accordion ที่มี error แรกให้เอง
   * 2. เพิ่มการแจ้งเตือน (alert) ทั้งกรณีสำเร็จและล้มเหลว
   */

  const handleSubmit = async () => {
    const isFormValid = validateField();

    if (!isFormValid) {
      // หาชื่อ field แรกที่เกิด error
      const firstErrorField = Object.keys(formErrors).find(
        (key) => formErrors[key]
      );
      console.log(formData.location?.province);
      console.log(firstErrorField);
      if (firstErrorField) {
        // เช็คว่า field นั้นอยู่ใน Accordion ไหน แล้วเปิด Accordion นั้น
        const panel2Fields = [
          "name",
          "type",
          "registerNumber",
          "registerDate",
          "bankName",
          "accountName",
          "accountNumber",
          "description",
          "mainActivityName",
          "mainActivityDescription",
        ];
        const panel3Fields = [
          "houseNumber",
          "province",
          "district",
          "subDistrict",
          "postalCode",
          "latitude",
          "longitude",
        ];
        const panel4Fields = [
          "phone",
          "email",
          "mainAdmin",
          "mainAdminPhone",
          "adminId",
        ];

        if (panel2Fields.includes(firstErrorField)) {
          setExpanded("panel2");
        } else if (panel3Fields.includes(firstErrorField)) {
          setExpanded("panel3");
        } else if (panel4Fields.includes(firstErrorField)) {
          setExpanded("panel4");
        }
      }

      alert("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      return;
    }

    setIsSubmitting(true);
    try {
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

      const payload = {
        ...cleanForm,
        location: {
          houseNumber: formData.houseNumber,
          villageNumber:
            formData.villageNumber > 0 ? Number(formData.villageNumber) : null,
          province: location.province,
          district: location.district,
          subDistrict: location.subdistrict,
          postalCode: String(location.postalCode),
          detail: formData.detail,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        },
      };
      console.log(payload);
      await updateCommunity(Number(communityId), payload);
      alert("บันทึกข้อมูลสำเร็จ!"); // ✅ แจ้งเตือนเมื่อสำเร็จ

      // สามารถเพิ่มการ redirect ไปหน้าอื่นได้ตรงนี้ เช่น
      // window.location.href = '/super/community';
    } catch (error) {
      console.error("Failed to update community:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล"); // ✅ แจ้งเตือนเมื่อล้มเหลว
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* ✅ 3. เพิ่ม Backdrop เพื่อแสดงสถานะ Loading */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">แก้ไขวิสาหกิจชุมชน</h1>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          สถานะชุมชน
          <Switch checked={checked} onChange={handleCheck} />
        </Stack>
      </div>

      <Accordion
        className="!shadow-sm !rounded-lg !border-0 mt-3"
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
          className="!rounded-t-lg "
        >
          <div className="text-xl font-bold">ข้อมูลชุมชน</div>
        </AccordionSummary>
        <AccordionDetails>
          <h2 className="text-lg font-bold mb-[24px]">ข้อมูลวิสาหกิจชุมชน</h2>
          <div className="flex flex-col items-center mb-20">
            <UploadProfile
              roundedCover="rounded-[5px]"
              width={1024}
              coverHeight={360}
              avatarSize={210} //รัศสมีวงกลม
              coverLabel="คลิกเพื่อเพิ่มรูปภาพหน้าปก"
              avatarLabel="เพิ่มรูปโลโก้ / โปรไฟล์"
              onCoverChange={(file) => console.log("cover:", file)}
              onAvatarChange={(file) => console.log("avatar:", file)}
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
              <TextField
                id="registerDate"
                label="วัน/เดือน/ ปี (พ.ศ.) ที่จดทะเบียนวิสาหกิจชุมชน"
                required
                placeholder="กรอกเลขทะเบียนวิสาหกิจชุมชน"
                type="date"
                value={formData.registerDate}
                onChange={handleFormChange}
                error={!!formErrors.registerDate}
                helperText={formErrors.registerDate}
              />
            </div>
            <div>
              <TextField
                id="bankName"
                label="ธนาคาร"
                required
                placeholder="เลือกธนาคาร"
                type="text"
                value={formData.bankName}
                onChange={handleFormChange}
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
          <h3 className="text-lg font-bold mt-[24px] mb-[24px]">
            กิจกรรมหลักของวิสาหกิจชุมชน
          </h3>
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
                <Link to="/super/community/:communityId/store/create">
                  <Button type="confirm-admin">
                    <Icon
                      icon="carbon:store"
                      style={{ fontSize: "24px" }}
                      className="mr-2"
                    />
                    เพิ่มร้านค้า
                  </Button>
                </Link>
              </div>
              <div>
                <div className="text-base font-bold mb-1.5">
                  <h3>ที่พัก</h3>
                </div>
                <Link to="/super/community/:communityId/homestay/create">
                  <Button type="confirm-admin">
                    <Icon
                      icon="healthicons:home-outline"
                      style={{ fontSize: "24px" }}
                      className="mr-2"
                    />
                    เพิ่มที่พัก
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
        className="!shadow-sm !rounded-lg !border-0 mt-3"
        expanded={expanded === "panel3"}
        onChange={handleChange("panel3")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
        >
          <h2 className="text-xl font-bold">ที่อยู่วิสาหกิจชุมชน</h2>
        </AccordionSummary>
        <AccordionDetails>
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
                  validateField("province", loc.province);
                  validateField("district", loc.district);
                  validateField("subDistrict", loc.subdistrict);
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
            <div className="text-xl font-bold">ที่ตั้งชุมชน</div>
          </div>
          <div className="grid grid-cols-2 gap-y-[24px] gap-x-[30px]">
            <div className="col-span-2">
              <MapPicker
                startingPosition={position}
                startingZoom={13}
                onChange={([lat, lng]) => {
                  // เมื่อเลือกหมุดใหม่ ให้เซ็ตค่าทั้ง state position และ formData
                  setPosition([lat, lng]);
                  handleValueChange("latitude", lat);
                  handleValueChange("longitude", lng);
                }}
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion
        className="!shadow-sm !rounded-lg !border- mt-3"
        expanded={expanded === "panel4"}
        onChange={handleChange("panel4")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel4bh-content"
          id="panel4bh-header"
        >
          <h2 className="text-xl font-bold">ข้อมูลติดต่อและผู้ดูแล</h2>
        </AccordionSummary>
        <AccordionDetails>
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
          <div className="text-lg font-bold mt-[24px] mb-[24px]">
            ข้อมูลผู้ดูแลวิสาหกิจชุมชน
          </div>
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
                onChange={(adminId) =>
                  handleValueChange("adminId", Number(adminId))
                }
                error={!!formErrors.adminId}
                helperText={String(formErrors.adminId)}
              />
            </div>

            <div>
              <MemberSelector
                value={formData.member}
                member={members}
                onChange={(ids) => handleValueChange("member", ids)}
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      <div className="flex justify-end mt-2.5">
        <div className="w-36">
          <Button type="cancel">ยกเลิก</Button>
        </div>
        <div className="ml-2.5 w-36">
          <Button type="confirm-admin" onClick={() => setOpenConfirm(true)}>
            บันทึก
          </Button>
        </div>
      </div>
      <Modal
        open={openConfirm}
        title="ยืนยันการแก้ไขชุมชน"
        text="คุณต้องการยืนยันการแก้ไขชุมชนหรือไม่"
        onConfirm={async () => {
          setOpenConfirm(false);
          await handleSubmit();
        }}
        onCancel={() => setOpenConfirm(false)}
      />
    </div>
  );
}
