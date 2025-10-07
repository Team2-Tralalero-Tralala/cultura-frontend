import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TextField from "../TextField";
import { useState } from "react";
import TextArea from "../TextArea";
import * as z from "zod";

const communitySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อวิสาหกิจชุมชน"),
  type: z.string().min(1, "กรุณากรอกประเภทวิสาหกิจชุมชน"),
  registerNumber: z.string().min(1, "กรุณากรอกเลขทะเบียนวิสาหกิจชุมชน"),
  registerDate: z.string().min(1, "กรุณากรอกวันที่"),
  bankName: z.string().min(1, "กรุณาเลือกธนาคาร"),
  bankAcccountName: z.string().min(1, "กรุณากรอกชื่อบัญชีธนาคาร"),
  bankAcccountNumber: z.string().min(1, "กรุณากรอกหมายเลขบัญชี"),
  description: z.string().min(1, "กรุณากรอกประวัติวิสาหกิจชุมชน"),
  mainActivity: z.string().min(1, "กรุณากรอกชื่อกิจกรรมหลัก"),
  mainActivityDescription: z.string().min(1, "กรุณากรอกรายละเอียดกิจกรรมหลัก"),

  houseNumber: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  villageNumber: z.string().min(1, "กรุณากรอกหมู่ที่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล/แขวง"),
  postal: z.string().min(1, "กรุณาเลือกรหัสไปรษณีย์"),
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

  tel: z.string().min(1, "กรุณาหมายเลขโทรศัพท์ของวิสาหกิจชุมชน"),
  email: z.string().min(1, "กรุณาอีเมลของวิสาหกิจชุมชน"),

  mainAdmin: z.string().min(1, "กรุณากรอกชื่อผู้ดูแลหลัก"),
  adminPhone: z.string().min(1, "กรุณากรอกหมายเลขโทรศัพท์ของผู้ดูแลหลัก"),
  admin: z.string().min(1, "กรุณาเลือกผู้ดูแล"),
});

export default function CommunityAccordion() {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const [formData, setFormData] = useState({
    name: "",
    alias: "",
    type: "",
    registerNumber: "",
    registerDate: "",
    bankName: "",
    bankAcccountName: "",
    bankAcccountNumber: "",
    description: "",
    mainActivity: "",
    mainActivityDescription: "",

    houseNumber: "",
    villageNumber: "",
    province: "",
    district: "",
    subDistrict: "",
    postal: "",
    locationDetail: "",
    latitude: "",
    longitude: "",

    tel: "",
    email: "",
    urlWebsite: "",
    urlFacebook: "",
    urlLine: "",
    urlTiktok: "",
    urlOther: "",

    mainAdmin: "",
    adminPhone: "",
    coordinator: "",
    coordinatorPhone: "",

    admin: "",
    member: [],
  });
  type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  const [formErrors, setFormErrors] = useState<
    Record<string, string | undefined>
  >({});

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

  const handleFormChange = (e: React.ChangeEvent<FormElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    validateField(id as keyof typeof formData, value);
  };

  return (
    <div>
      <Accordion
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
                placeholder="ป้อนชื่อวิสาหกิจชุมชน"
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
                placeholder="ป้อนชื่อเรียกชุมชน"
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
                placeholder="ป้อนเลขทะเบียนวิสาหกิจชุมชน"
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
                placeholder="ป้อนเลขทะเบียนวิสาหกิจชุมชน"
                type="text"
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
                placeholder="ป้อนเลขทะเบียนวิสาหกิจชุมชน"
                type="text"
                value={formData.bankName}
                onChange={handleFormChange}
                error={!!formErrors.bankName}
                helperText={formErrors.bankName}
              />
            </div>
            <div>
              <TextField
                id="bankAcccountName"
                label="ชื่อบัญชีธนาคาร"
                required
                placeholder="ป้อนชื่อบัญชีธนาคาร"
                type="text"
                value={formData.bankAcccountName}
                onChange={handleFormChange}
                error={!!formErrors.bankAcccountName}
                helperText={formErrors.bankAcccountName}
              />
            </div>
            <div>
              <TextField
                id="bankAcccountNumber"
                label="หมายเลขบัญชี"
                required
                placeholder="ป้อนหมายเลขบัญชี"
                type="text"
                value={formData.bankAcccountNumber}
                onChange={handleFormChange}
                error={!!formErrors.bankAcccountNumber}
                helperText={formErrors.bankAcccountNumber}
              />
            </div>
            <div className="col-span-2">
              <TextArea
                id="description"
                label="เลขทะเบียนวิสาหกิจชุมชน"
                required
                placeholder="ป้อนเลขทะเบียนวิสาหกิจชุมชน"
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
                id="mainActivity"
                label="ชื่อกิจกรรมหลัก"
                required
                placeholder="ป้อนชื่อกิจกรรมหลักของวิสาหกิจชุมชน"
                type="text"
                value={formData.mainActivity}
                onChange={handleFormChange}
                error={!!formErrors.mainActivity}
                helperText={formErrors.mainActivity}
              />
            </div>
            <div className="col-span-2">
              <TextArea
                id="mainActivityDescription"
                label="รายละเอียดกิจกรรมหลัก"
                required
                placeholder="ป้อนชื่อกิจกรรมหลักของวิสาหกิจชุมชน"
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
        expanded={expanded === "panel3"}
        onChange={handleChange("panel3")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
        >
          <div className="text-xl font-bold">ข้อมูลที่อยู่ชุมชน</div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="grid grid-cols-2 gap-y-[24px] gap-x-[30px]">
            <div>
              <TextField
                id="houseNumber"
                label="บ้านเลขที่"
                required
                placeholder="ป้อนบ้านเลขที่วิสาหกิจชุมชน"
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
                placeholder="ป้อนหมู่ของวิสาหกิจชุมชน"
                type="text"
                value={formData.villageNumber}
                onChange={handleFormChange}
                error={!!formErrors.villageNumber}
                helperText={formErrors.villageNumber}
              />
            </div>
            <div>
              <TextField
                id="province"
                label="province"
                required
                placeholder="ป้อนหมู่ของวิสาหกิจชุมชน"
                type="text"
                value={formData.province}
                onChange={handleFormChange}
                error={!!formErrors.province}
                helperText={formErrors.province}
              />
            </div>
            <div>
              <TextField
                id="district"
                label="district"
                required
                placeholder="ป้อนหมู่ของวิสาหกิจชุมชน"
                type="text"
                value={formData.district}
                onChange={handleFormChange}
                error={!!formErrors.district}
                helperText={formErrors.district}
              />
            </div>
            <div>
              <TextField
                id="postal"
                label="postal"
                required
                placeholder="ป้อนหมู่ของวิสาหกิจชุมชน"
                type="text"
                value={formData.postal}
                onChange={handleFormChange}
                error={!!formErrors.postal}
                helperText={formErrors.postal}
              />
            </div>
            <div>
              <TextArea
                id="locationDetail"
                label="locationDetail"
                required
                placeholder="ป้อนหมู่ของวิสาหกิจชุมชน"
                value={formData.locationDetail}
                onChange={handleFormChange}
                error={!!formErrors.locationDetail}
                helperText={formErrors.locationDetail}
              />
            </div>
            <div>
              <TextArea
                id="latitude"
                label="latitude"
                required
                placeholder="ป้อนหมู่ของวิสาหกิจชุมชน"
                value={formData.latitude}
                onChange={handleFormChange}
                error={!!formErrors.latitude}
                helperText={formErrors.latitude}
              />
            </div>
            <div>
              <TextArea
                id="longitude"
                label="longitude"
                required
                placeholder="ป้อนหมู่ของวิสาหกิจชุมชน"
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
                id="tel"
                label="โทรศัพท์วิสาหกิจชุมชน"
                required
                placeholder="ป้อนเบอร์โทรศัพท์ของวิสาหกิจชุมชน"
                type="text"
                value={formData.tel}
                onChange={handleFormChange}
                error={!!formErrors.tel}
                helperText={formErrors.tel}
              />
            </div>
            <div>
              <TextField
                id="email"
                label="อีเมลวิสาหกิจชุมชน"
                placeholder="ป้อนอีเมลของวิสาหกิจชุมชน"
                required
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </div>
            <div>
              <TextField
                id="urlWebsite"
                label="Link Website"
                placeholder="ป้อน URL Website ของวิสาหกิจชุมชน"
                type="url"
                value={formData.urlWebsite}
                onChange={handleFormChange}
                error={!!formErrors.urlWebsite}
                helperText={formErrors.urlWebsite}
              />
            </div>
            <div>
              <TextField
                id="urlFacebook"
                label="Link Facebook"
                placeholder="ป้อน URL Facebook ของวิสาหกิจชุมชน"
                type="url"
                value={formData.urlFacebook}
                onChange={handleFormChange}
                error={!!formErrors.urlFacebook}
                helperText={formErrors.urlFacebook}
              />
            </div>
            <div>
              <TextField
                id="urlLine"
                label="Link Line"
                placeholder="ป้อน URL Line ของวิสาหกิจชุมชน"
                type="url"
                value={formData.urlLine}
                onChange={handleFormChange}
                error={!!formErrors.urlLine}
                helperText={formErrors.urlLine}
              />
            </div>
            <div>
              <TextField
                id="urlTiktok"
                label="Link Tiktok"
                placeholder="ป้อน URL Tiktok ของวิสาหกิจชุมชน"
                type="url"
                value={formData.urlTiktok}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <TextField
                id="urlOther"
                label="Link อื่นๆ"
                placeholder="ป้อน URL อื่น ๆ ของวิสาหกิจชุมชน "
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
                placeholder="ป้อนชื่อผู้ดูแลหลัก"
                type="text"
                value={formData.mainAdmin}
                onChange={handleFormChange}
                error={!!formErrors.mainAdmin}
                helperText={formErrors.mainAdmin}
              />
            </div>
            <div>
              <TextField
                id="adminPhone"
                label="โทรศัพท์"
                required
                placeholder="ป้อนเบอร์โทรศัพท์ของผู้ดูแลหลัก"
                type="text"
                value={formData.adminPhone}
                onChange={handleFormChange}
                // error={!!formErrors.password}
                // helperText={formErrors.password}
              />
            </div>
            <div>
              <TextField
                id="coordinator"
                label="ชื่อผู้ประสานงาน "
                placeholder="ป้อนชื่อชื่อผู้ประสานงาน "
                type="text"
                value={formData.coordinator}
                onChange={handleFormChange}
                // error={!!formErrors.password}
                // helperText={formErrors.password}
              />
            </div>
            <div>
              <TextField
                id="coordinatorPhone"
                label="โทรศัพท์"
                placeholder="ป้อนเบอร์โทรศัพท์ของผู้ประสานงาน"
                type="text"
                value={formData.coordinatorPhone}
                onChange={handleFormChange}
                // error={!!formErrors.password}
                // helperText={formErrors.password}
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
