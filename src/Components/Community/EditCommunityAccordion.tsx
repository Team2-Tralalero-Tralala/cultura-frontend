import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TextField from "../TextField";
import { useEffect } from "react";
import TextArea from "../TextArea";
import * as z from "zod";
import Button from "../Button";
import { Link, useParams } from "react-router";
import { type ThailandLocation } from "../LocationSelector";
import ThailandLocationSelect from "../LocationSelector";
import { getCommunityById } from "@/Libs/CommunityService";

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
export default function EditCommunityAccordion({
  onChange,
}: {
  value: any;
  onChange: (data: any) => void;
}) {
  const params = useParams();
  const communityId = params.id;

  // ✅ Hooks ทั้งหมดประกาศก่อนทุก return
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [formData, setFormData] = React.useState<any>("");
  const [location, setLocation] = React.useState<ThailandLocation>({
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });
  const [formErrors, setFormErrors] = React.useState<
    Record<string, string | undefined>
  >({});

  // ✅ โหลดข้อมูลจาก API
  useEffect(() => {
    const fetchData = async () => {
      if (!communityId) return;
      try {
        const res = await getCommunityById(Number(communityId));
        const data = res.data || res; // รองรับ response สองแบบ
        if (data.registerDate) {
          data.registerDate = new Date(data.registerDate)
            .toISOString()
            .split("T")[0];
        }
        setFormData(data);
        setLocation({
          province: data.location.province ?? "",
          district: data.location.district ?? "",
          subdistrict: data.location.subDistrict ?? "",
          postalCode: data.location.postalCode ?? "",
        });
      } catch (error) {
        console.error("❌ โหลดข้อมูลล้มเหลว:", error);
      }
    };

    fetchData();
  }, [communityId]);

  // 💾 โหลด/บันทึกลง localStorage
  useEffect(() => {
    const saved = localStorage.getItem("communityForm");
    if (saved) onChange(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (formData)
      localStorage.setItem("communityForm", JSON.stringify(formData));
  }, [formData]);

  // ✅ Handlers
  const handleChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) =>
      setExpanded(isExpanded ? panel : false);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    const updated = { ...formData, [id]: value };
    setFormData(updated);
    onChange(updated);
    validateField(id as keyof typeof formData, value);
  };

  const handleLocationChange = (loc: ThailandLocation) => {
    setLocation(loc);
    const updated = {
      ...formData,
      province: loc.province,
      district: loc.district,
      subDistrict: loc.subdistrict,
      postalCode: loc.postalCode,
    };
    setFormData(updated);
    onChange(updated);
  };

  const validateField = (field: keyof typeof formData, value: string) => {
    const result = communitySchema.safeParse({ ...formData, [field]: value });
    setFormErrors((prev) => ({
      ...prev,
      [field]: result.success
        ? undefined
        : result.error.issues.find((i) => i.path[0] === field)?.message,
    }));
  };

  if (!formData) {
    return (
      <div className="p-5 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
    );
  }

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
            <div className="grid grid-cols-2 gap-y-[24px] gap-x-[30px]">
              <div>
                <div className="text-base font-bold mb-1.5">ร้านค้า</div>
                <Link to="/super/community/:communityId/store/create">
                  <Button type="confirm-admin">เพิ่มร้านค้า</Button>
                </Link>
              </div>
              <div>
                <div className="text-base font-bold mb-1.5">ที่พัก</div>
                <Link to="/super/community/:communityId/homestay/create">
                  <Button type="confirm-admin">เพิ่มที่พัก</Button>
                </Link>
              </div>
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
                value={formData.houseNumber ?? formData.location.houseNumber}
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
                value={
                  formData.villageNumber ?? formData.location.villageNumber
                }
                onChange={handleFormChange}
                error={!!formErrors.villageNumber}
                helperText={formErrors.villageNumber}
              />
            </div>
            <div className="col-span-2">
              <ThailandLocationSelect
                value={{
                  province: formData.province ?? formData.location.province,
                  district: formData.district ?? formData.location.district,
                  subdistrict:
                    formData.subDistrict ?? formData.location.subDistrict,
                  postalCode:
                    formData.postalCode ?? formData.location.postalCode,
                }}
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
                value={formData.detail ?? formData.location.detail}
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
                value={formData.location.latitude}
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
                value={formData.location.longitude}
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
            <div>
              <TextField
                id="adminId"
                label="ผู้ดูแล"
                placeholder="เลือกผู้ดูแล"
                required
                type="number"
                value={formData.adminId}
                onChange={handleFormChange}
                // error={!!formErrors.password}
                // helperText={formErrors.password}
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
