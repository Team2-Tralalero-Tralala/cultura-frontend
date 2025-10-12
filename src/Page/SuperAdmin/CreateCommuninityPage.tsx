/*
 * คำอธิบาย : Component สำหรับแสดงแบบฟอร์มข้อมูลวิสาหกิจชุมชนในรูปแบบ Accordion
 * โดยแบ่งออกเป็น 3 ส่วนหลัก ได้แก่
 * 1. ข้อมูลวิสาหกิจชุมชน (ชื่อ, ประเภท, การจดทะเบียน, บัญชีธนาคาร)
 * 2. ที่อยู่วิสาหกิจชุมชน (บ้านเลขที่, หมู่, จังหวัด, พิกัด)
 * 3. ข้อมูลติดต่อและผู้ดูแล (เบอร์โทร, อีเมล, ผู้ดูแลหลัก)
 * ใช้ร่วมกับ Component ย่อย เช่น TextField, TextArea, ThailandLocationSelect
 */
import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import * as z from "zod";
import TextField from "@/Components/TextField";
import TextArea from "@/Components/TextArea";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/ThailandLocationSelector";
import type { CommunityFormData } from "@/Types/CommunityForm";
import Button from "@/Components/Button";
import { createCommunity } from "@/Libs/CommunityService";
/*
 * คำอธิบาย : Schema สำหรับตรวจสอบความถูกต้องของข้อมูลฟอร์มวิสาหกิจชุมชน
 * ใช้ Zod สำหรับ validate field แต่ละรายการ
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

  // villageNumber: z.number("กรุณากรอกเป็นตัวเลขเท่านั้น").optional(),

  province: z.string("กรุณาเลือกจังหวัด").min(1, "กรุณาเลือกจังหวัด"),

  district: z.string("กรุณาเลือกอำเภอ/เขต").min(1, "กรุณาเลือกอำเภอ/เขต"),

  subDistrict: z.string("กรุณาเลือกตำบล/แขวง").min(1, "กรุณาเลือกตำบล/แขวง"),

  postalCode: z
    .string("กรุณาเลือกรหัสไปรษณีย์")
    .min(1, "กรุณาเลือกรหัสไปรษณีย์"),

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

export default function CreateCommuninityPage() {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [formData, setFormData] = React.useState<Partial<CommunityFormData>>({
    status: "CLOSED",
    rating: 0,
  });
  const [location, setLocation] = useState<ThailandLocation>({
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });
  const [formErrors, setFormErrors] = useState<
    Record<string, string | undefined>
  >({});

  /*
   * คำอธิบาย : จัดการการขยาย/ย่อของ Accordion แต่ละ panel
   * Input : panel (string)
   * Output : อัปเดต state expanded
   */
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  /*
   * คำอธิบาย : ตรวจสอบความถูกต้องของข้อมูลในฟอร์มด้วย Zod Schema
   * Input :
   *    - field (ชื่อของฟิลด์ที่ต้องการตรวจสอบ)
   *    - value (ค่าที่ผู้ใช้กรอก)
   * Output :
   *    - หากตรวจสอบไม่ผ่าน จะเซ็ตข้อความ error ลงใน formErrors
   *    - คืนค่า boolean แสดงผลการตรวจสอบ (true = ผ่าน, false = ไม่ผ่าน)
   */
  const validateField = (field?: keyof typeof formData, value?: any) => {
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
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้กรอกข้อมูลใน TextField หรือ TextArea
   * Input : e (React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
   * Output : อัปเดตค่าใน formData และตรวจสอบความถูกต้องของ field นั้น ๆ
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
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้กดปุ่ม "สร้างชุมชน"
   * Input : ไม่มี (ใช้ค่าจาก state formData และ location)
   * Output :
   *    - ตรวจสอบความถูกต้องของข้อมูลด้วย validateField()
   *    - จัดรูปแบบข้อมูล payload ให้ตรงตามโครงสร้างของ backend
   *    - ส่งคำขอสร้างชุมชนใหม่ไปยัง API ผ่าน createCommunity()
   */
  const handleSubmit = async () => {
    validateField();
    const {
      id,
      locationId,
      detail,
      houseNumber,
      longitude,
      latitude,
      villageNumber,
      adminId,
      ...cleanForm
    } = formData;

    const payload = {
      adminId: Number(formData.adminId),
      ...cleanForm,
      location: {
        houseNumber: formData.houseNumber,
        villageNumber: Number(formData.villageNumber),
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

    await createCommunity(payload);
  };

  return (
    <div>
      <Accordion
        className="mt-3"
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
        >
          <div className="text-xl font-bold">ข้อมูลชุมชน</div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="text-lg font-bold mb-[24px]">ข้อมูลวิสาหกิจชุมชน</div>
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
          <div className="text-lg font-bold mt-[24px] mb-[24px]">
            กิจกรรมหลักของวิสาหกิจชุมชน
          </div>
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
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion
        className="mt-3"
        expanded={expanded === "panel3"}
        onChange={handleChange("panel3")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
        >
          <div className="text-xl font-bold">ที่อยู่วิสาหกิจชุมชน</div>
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
                value={location}
                onChange={(loc) => setLocation(loc)}
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
            <div className="text-xl font-bold">ที่ตั้งชุมชน</div>
          </div>
          <div className="grid grid-cols-2 gap-y-[24px] gap-x-[30px]">
            <div>
              <TextField
                id="latitude"
                label="ละติจูด"
                required
                placeholder="กรอกละติจูดของที่ตั้งวิสาหกิจชุมชน"
                value={formData.latitude}
                onChange={handleFormChange}
                error={!!formErrors.latitude}
                helperText={formErrors.latitude}
              />
            </div>
            <div>
              <TextField
                id="longitude"
                label="ลองจิจูด"
                required
                placeholder="กรอกลองจิจูดของที่ตั้งวิสาหกิจชุมชน"
                value={formData.longitude}
                onChange={handleFormChange}
                error={!!formErrors.longitude}
                helperText={formErrors.longitude}
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion
        className="mt-3"
        expanded={expanded === "panel4"}
        onChange={handleChange("panel4")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel4bh-content"
          id="panel4bh-header"
        >
          <div className="text-xl font-bold">ข้อมูลติดต่อและผู้ดูแแล</div>
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
            {/* ทดลองก่อน ยังไม่มี แอดมินมา */}
            <div>
              <TextField
                id="adminId"
                label="ผู้ดูแล"
                placeholder="เลือกผู้ดูแล"
                required
                type="number"
                value={formData.adminId}
                onChange={handleFormChange}
              />
            </div>

            {/* <div>
              <CheckboxAutocomplete
                onSelect={(names) =>
                  setFormData({ ...formData, member: names })
                }
              />
            </div> */}
          </div>
        </AccordionDetails>
      </Accordion>
      <div className="flex justify-end mt-2.5">
        <div className="w-36">
          <Button type="cancel">ยกเลิก</Button>
        </div>
        <div className="ml-2.5 w-36">
          <Button type="confirm-admin" onClick={handleSubmit}>
            สร้างชุมชน
          </Button>
        </div>
      </div>
    </div>
  );
}
