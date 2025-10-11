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
import { useEffect, useState } from "react";
import * as z from "zod";
import TextField from "../TextField";
import TextArea from "../TextArea";
import { type ThailandLocation } from "../LocationSelector";
import ThailandLocationSelect from "../LocationSelector";
/*
 * คำอธิบาย : Schema สำหรับตรวจสอบความถูกต้องของข้อมูลฟอร์มวิสาหกิจชุมชน
 * ใช้ Zod สำหรับ validate field แต่ละรายการ
 */
const communitySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อวิสาหกิจชุมชน"),
  type: z.string().min(1, "กรุณากรอกประเภทวิสาหกิจชุมชน"),
  registerNumber: z.string().min(1, "กรุณากรอกเลขทะเบียนวิสาหกิจชุมชน"),
  registerDate: z.date().min(1, "กรุณากรอกวันที่"),
  bankName: z
    .string()
    .min(1, "กรุณาเลือกธนาคาร")
    .max(45, "ชื่อบัญชีต้องไม่เกิน 45 ตัวอักษร"),
  accountName: z.string().min(1, "กรุณากรอกชื่อบัญชีธนาคาร"),
  accountNumber: z.string().min(1, "กรุณากรอกหมายเลขบัญชี"),
  description: z.string().min(1, "กรุณากรอกประวัติวิสาหกิจชุมชน"),
  mainActivityName: z.string().min(1, "กรุณากรอกชื่อกิจกรรมหลัก"),
  mainActivityDescription: z.string().min(1, "กรุณากรอกรายละเอียดกิจกรรมหลัก"),

  houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  villageNumber: z.number().min(1, "กรุณากรอกหมู่ที่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล/แขวง"),
  postalCode: z.string().min(1, "กรุณาเลือกรหัสไปรษณีย์"),
  latitude: z
    .string()
    .min(
      1,
      "หากคุณไม่ทราบละติจูดและลองจิจูดของวิสาหกิจชุมชน โปรดค้นหาวิสาหกิจชุมชนและปักหมุด"
    ),
  longitude: z
    .string()
    .min(
      1,
      "หากคุณไม่ทราบละติจูดและลองจิจูดของวิสาหกิจชุมชน โปรดค้นหาวิสาหกิจชุมชนและปักหมุด"
    ),

  phone: z.string().min(1, "กรุณาหมายเลขโทรศัพท์ของวิสาหกิจชุมชน"),
  email: z.string().min(1, "กรุณาอีเมลของวิสาหกิจชุมชน"),

  mainAdmin: z.string().min(1, "กรุณากรอกชื่อผู้ดูแลหลัก"),
  mainAdminPhone: z.string().min(1, "กรุณากรอกหมายเลขโทรศัพท์ของผู้ดูแลหลัก"),
  coordinatorPhone: z.string(),

  adminId: z.number().min(1, "กรุณาเลือกผู้ดูแล"),
});
/*
 * คำอธิบาย : Component หลักที่จัดการการแสดงผลแบบฟอร์มและจัดเก็บข้อมูลใน LocalStorage
 * Input : value (object ของข้อมูลฟอร์ม), onChange (callback เมื่อข้อมูลเปลี่ยน)
 * Output : UI Accordion ที่ผู้ใช้สามารถกรอกข้อมูลและตรวจสอบความถูกต้องได้
 */
export default function CommunityAccordion({
  value,
  onChange,
}: {
  value: any;
  onChange: (data: any) => void;
}) {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const formData = value;

  const [location, setLocation] = useState<ThailandLocation>({
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });
  /*
   * คำอธิบาย : โหลดข้อมูลจาก LocalStorage เมื่อหน้าเพจถูกเปิดครั้งแรก
   * Input : -
   * Output : เรียก onChange เพื่อเซ็ตค่าฟอร์มที่เก็บไว้ใน LocalStorage
   */
  useEffect(() => {
    const savedData = localStorage.getItem("communityForm");
    if (savedData) {
      onChange(JSON.parse(savedData));
    }
  }, []);
  /*
   * คำอธิบาย : บันทึกค่าฟอร์มปัจจุบันลง LocalStorage ทุกครั้งที่ formData เปลี่ยน
   * Input : formData (state ปัจจุบัน)
   * Output : เก็บข้อมูลใน localStorage ภายใต้ key "communityForm"
   */
  useEffect(() => {
    localStorage.setItem("communityForm", JSON.stringify(formData));
  }, [formData]);
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
   * คำอธิบาย : ฟังก์ชันเมื่อเปลี่ยนตำแหน่งที่อยู่ใน ThailandLocationSelect
   * Input : location (ThailandLocation)
   * Output : อัปเดตข้อมูล location ในฟอร์มหลัก
   */
  const handleLocationChange = (location: ThailandLocation) => {
    onChange({
      ...value,
      location,
    });
  };
  type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  const [formErrors, setFormErrors] = useState<
    Record<string, string | undefined>
  >({});
  /*
   * คำอธิบาย : ตรวจสอบความถูกต้องของ field เดี่ยวโดยใช้ Zod
   * Input : field (ชื่อฟิลด์), value (ค่าที่กรอก)
   * Output : เซ็ตข้อความ error ลงใน formErrors ถ้ามีการ validate ไม่ผ่าน
   */
  const validateField = (field: keyof typeof formData, value: string) => {
    const result = communitySchema.safeParse({
      ...formData,
      [field]: value,
    });

    setFormErrors((prev) => ({
      ...prev,
      [field]: result.success
        ? undefined
        : result.error.issues.find((i) => i.path[0] === field)?.message,
    }));
  };
  /*
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้กรอกข้อมูลในฟอร์ม
   * Input : e (React.ChangeEvent)
   * Output : อัปเดตค่าใน formData และตรวจสอบความถูกต้องของ field นั้น
   */
  const handleFormChange = (e: React.ChangeEvent<FormElement>) => {
    const { id, value } = e.target;
    onChange({ ...formData, [id]: value });
    validateField(id as keyof typeof formData, value);
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
                required
                placeholder="กรอกหมู่ของวิสาหกิจชุมชน"
                type="number"
                value={formData.villageNumber}
                onChange={handleFormChange}
                error={!!formErrors.villageNumber}
                helperText={formErrors.villageNumber}
              />
            </div>
            <div className="col-span-2">
              <ThailandLocationSelect
                value={location}
                onChange={handleLocationChange}
                labelPrefix=""
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
    </div>
  );
}
