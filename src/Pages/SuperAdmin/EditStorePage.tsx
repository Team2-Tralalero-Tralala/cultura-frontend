/**
 * คำอธิบาย: หน้าแก้ไขข้อมูลร้านค้า (Edit Store)
 * ดึงข้อมูลร้านค้า แสดงฟอร์มแก้ไข และบันทึกข้อมูล
 */
import { Icon } from "@iconify/react";
import React from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import zod from "zod";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import Button from "@/Components/Button";
import UploadCard from "@/Components/upload/UploadCard";
import MapPicker from "@/Components/MapPicker";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import { TagSelector, type Tag } from "@/Components/Selector/TagSelector";
import ThailandLocationSelector, {
  type ThailandLocation,
} from "@/Components/Selector/ThailandLocationSelector";
import TextArea from "@/Components/Input/TextArea";
import TextField from "@/Components/Input/TextField";
import { editStore, getStoreById } from "@/Libs/StoreService";
import type { StoreData } from "@/Types/Store";

/**
 * คำอธิบาย: Schema สำหรับตรวจสอบข้อมูลร้านค้าด้วย Zod
 */
const storeSchema = zod.object({
  name: zod.string("กรุณากรอกชื่อร้านค้า").min(1, "กรุณากรอกชื่อร้านค้า"),
  detail: zod.string("กรุณากรอกรายละเอียดของร้านค้า").min(1, "กรุณากรอกรายละเอียดของร้านค้า"),
  houseNumber: zod.string("กรุณากรอกบ้านเลขที่").min(1, "กรุณากรอกบ้านเลขที่"),
  province: zod.string("กรุณาเลือกจังหวัด").min(1, "กรุณาเลือกจังหวัด"),
  district: zod.string("กรุณาเลือกอำเภอ/เขต").min(1, "กรุณาเลือกอำเภอ/เขต"),
  subDistrict: zod.string("กรุณาเลือกตำบล/แขวง").min(1, "กรุณาเลือกตำบล/แขวง"),
  postalCode: zod.string("กรุณากรอกรหัสไปรษณีย์").min(1, "กรุณากรอกรหัสไปรษณีย์"),
  latitude: zod.union([
    zod.string().min(1, "กรุณากรอกละติจูด"),
    zod.number().refine((number) => !isNaN(number), "กรุณากรอกละติจูด"),
  ]),
  longitude: zod.union([
    zod.string().min(1, "กรุณากรอกลองจิจูด"),
    zod.number().refine((number) => !isNaN(number), "กรุณากรอกลองจิจูด"),
  ]),
  tagStores: zod
    .array(zod.number(), "กรุณาเลือกประเภทร้านค้าอย่างน้อย 1 รายการ")
    .min(1, "กรุณาเลือกประเภทร้านค้าอย่างน้อย 1 รายการ"),
});

/**
 * คำอธิบาย: แปลง URL ของไฟล์จาก backend ให้เป็น File object เพื่อใช้กับ UploadCard ได้
 * Input: url - ที่อยู่ของไฟล์, filename - ชื่อไฟล์
 * Output: File object (พร้อม type และ flag isFromServer)
 */
async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url, {
    credentials: "include",
  });
  const blob = await res.blob();
  const ext = filename.split(".").pop() || "jpg";
  const type = blob.type || `image/${ext}`;
  const file = new File([blob], filename, { type });
  (file as any).isFromServer = true;
  return file;
}
/**
 * คำอธิบาย: แสดงฟอร์มแก้ไขร้านค้า พร้อมโหลดข้อมูลเดิมจาก backend
 * Input: - (รับ Params storeId จาก URL)
 * Output: JSX Element หน้า EditStorePage
 */
export function EditStorePage() {
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [coverFiles, setCoverFiles] = React.useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [formErrors, setFormErrors] = React.useState<Record<string, string | undefined>>({});
  const [location, setLocation] = React.useState<ThailandLocation>({
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });

  const startingZoom = 13;
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [formData, setFormData] = React.useState<Partial<StoreData>>({
    latitude: position[0],
    longitude: position[1],
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelConfirmModalOpen, setIsCancelConfirmModalOpen] = useState(false);
  const { storeId } = useParams();
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();
  const { communityId } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * คำอธิบาย: โหลดข้อมูลร้านค้าจาก backend เมื่อมี storeId
   * Input: -
   */
  React.useEffect(() => {
    async function loadData() {
      if (!storeId) return;
      try {
        const response = await getStoreById(Number(storeId));
        const data = response.data.data;
        const lat = Number(data.location?.latitude ?? 13.736717);
        const lng = Number(data.location?.longitude ?? 100.523186);
        setFormData({
          ...data,
          latitude: String(data.location?.latitude),
          longitude: String(data.location?.longitude),
          houseNumber: data.location?.houseNumber,
          villageNumber: data.location?.villageNumber,
          tagStores: data.tagStores?.map((tagStore: any) => tagStore.tag.id) ?? [],
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
        setPosition([lat, lng]);

        setTags(
          data.tagStores?.map((tag: any) => ({
            id: tag.id,
            name: tag.name,
          })) ?? [],
        );

        // โหลดภาพจาก backend แล้วแปลงเป็น File จริง เพื่อให้ UploadCard แสดง preview ได้
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const backendUrl = apiUrl.replace("/api", "/uploads") || "http://localhost:3000/uploads";
        const coverFilesFetched: File[] = await Promise.all(
          (data.storeImage || [])
            .filter((img: any) => img.type === "COVER")
            .map(async (img: any) => {
              const fullUrl = `${backendUrl}/${img.image}`;
              return await urlToFile(fullUrl, img.image);
            }),
        );

        const galleryFilesFetched: File[] = await Promise.all(
          (data.storeImage || [])
            .filter((img: any) => img.type === "GALLERY")
            .map(async (img: any) => {
              const fullUrl = `${backendUrl}/${img.image}`;
              return await urlToFile(fullUrl, img.image);
            }),
        );

        setCoverFiles(coverFilesFetched);
        setGalleryFiles(galleryFilesFetched);

        const tagIds = data.tagStores?.map((tagStore: any) => tagStore.tag.id) ?? [];
        setSelectedTagIds(tagIds);
        setIsLoaded(true);
      } catch (error) {
        console.error(error);
      }
    }
    loadData();
  }, [storeId]);
  /**
   * คำอธิบาย: ฟังก์ชันสำหรับอัปเดต location ใน formData เมื่อผู้ใช้เลือกจังหวัด/อำเภอ/ตำบลใหม่
   * Input: location - ข้อมูลจังหวัด/อำเภอ/ตำบลที่เลือก
   * Output: -
   */
  React.useEffect(() => {
    if (location.province) {
      setFormData((prev) => ({
        ...prev,
        province: location.province,
        district: location.district,
        subDistrict: location.subdistrict,
        postalCode: location.postalCode,
      }));

      validateField("province", location.province);
      validateField("district", location.district);
      validateField("subDistrict", location.subdistrict);
    }
  }, [location]);
  /**
   * คำอธิบาย: ฟังก์ชัน validateField สำหรับตรวจสอบความถูกต้องของข้อมูลในฟอร์ม
   * Input: field (ชื่อฟิลด์ที่ต้องการตรวจสอบ), value (ค่าของฟิลด์นั้น)
   * Output: boolean (true หากข้อมูลถูกต้อง, false หากไม่ถูกต้อง)
   */
  const validateField = (field?: string, value?: any) => {
    if (field) {
      const result = storeSchema.safeParse({
        ...formData,
        [field]: value,
      });
      setFormErrors((prev) => ({
        ...prev,
        [field]: result.success
          ? undefined
          : result.error.issues.find((err) => err.path[0] === field)?.message,
      }));
      return result.success;
    }

    const result = storeSchema.safeParse(formData);
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
   * คำอธิบาย: ฟังก์ชัน handleFormChange สำหรับ input ทั่วไป
   * Input: event (React ChangeEvent จาก input หรือ textarea)
   * Output: -
   */
  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    const updated = { ...formData, [id]: value };
    setFormData(updated);
    validateField(id as keyof typeof formData, value);
  };

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่าของ select หรือ custom input
   * Input: field (ชื่อฟิลด์ที่ต้องการอัปเดต), value (ค่าที่จะตั้งให้กับฟิลด์นั้น)
   * Output: -
   */
  const handleValueChange = (field: keyof typeof formData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    validateField(field, value);
  };
  /**
   * คำอธิบาย: ฟังก์ชัน tagList สำหรับส่ง props ให้ TagSelector
   * Input: -
   * Output: tagList (Array<Tag>)
   */
  const tagList = React.useMemo<Tag[]>(
    () => (formData.tagStores ?? []).map((id) => ({ id, name: "" })),
    [formData.tagStores],
  );
  /**
   * คำอธิบาย: ฟังก์ชันส่งข้อมูลไป backend เมื่อกดบันทึก
   * Input: -
   * Output: -
   */
  const handleSubmit = async () => {
    try {
      const isValid = validateField();

      if (!isValid) {
        setAlertType("error");
        setAlertTitle("ข้อมูลไม่ถูกต้อง");
        setAlertMessage("กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก");
        setIsAlertOpen(true);
        return;
      }
      if (coverFiles.length === 0 || galleryFiles.length === 0) {
        setAlertType("error");
        setAlertTitle("ข้อมูลไม่ถูกต้อง");
        setAlertMessage("กรุณาอัพโหลดรูปภาพให้ครบถ้วน");
        setIsAlertOpen(true);
        return;
      }
      const {
        id,
        communityId,
        houseNumber,
        longitude,
        latitude,
        villageNumber,
        province,
        district,
        subDistrict,
        postalCode,
        locationDetail,
        ...cleanForm
      } = formData;

      const payload = {
        ...cleanForm,
        tagStores: selectedTagIds,
        location: {
          houseNumber: formData.houseNumber,
          villageNumber: Number(formData.villageNumber),
          province: location.province,
          district: location.district,
          subDistrict: location.subdistrict,
          postalCode: String(location.postalCode),
          detail: formData.locationDetail,
          latitude: Number(position[0]),
          longitude: Number(position[1]),
        },
      };

      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify(payload));

      coverFiles.forEach((file: any) => {
        formDataToSend.append("cover", file);
      });

      galleryFiles.forEach((file: any) => {
        formDataToSend.append("gallery", file);
      });
      formDataToSend.forEach((value, key) => {
        console.log(key, value);
      });
      await editStore(Number(storeId), formDataToSend);
      setAlertType("success");
      setAlertTitle("สร้างแก้ไขร้านค้าสำเร็จ");
      setAlertMessage("ข้อมูลร้านค้าถูกแก้ไข");
      setIsAlertOpen(true);
      navigate(-1);
    } catch (error: any) {
      setAlertType("error");
      setAlertTitle("เกิดข้อผิดพลาด");
      setAlertMessage("เกิดข้อผิดพลาดจากระบบ กรุณาลองใหม่อีกครั้ง");
      setIsAlertOpen(true);
    }
  };
  return (
    <div>
      <div>
        <Breadcrumb
          current={{
            label: "แก้ไขร้านค้า",
            to: `/super/community/${communityId}/store/${storeId}/edit`,
          }}
        />
      </div>
      <div className="bg-white p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <Link
            to={`/super/community/${communityId}/stores/all`}
            className="inline-flex items-center gap-2 text-gray-800 hover:text-dark-green"
          >
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
            <h1 className="text-xl font-bold">แก้ไขร้านค้า</h1>
          </Link>
        </div>
        <div className="border-2 p-6 rounded-lg grid gap-y-[24px] gap-x-[30px]">
          {/* ฟิลด์ข้อมูลร้าน */}
          <div className="col-span-2">
            <TextField
              id="name"
              label="ชื่อร้านค้า"
              required
              placeholder="ป้อนชื่อร้านค้า"
              value={formData.name}
              onChange={handleFormChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
          </div>

          <div className="col-span-2">
            <TextArea
              id="detail"
              label="รายละเอียดร้านค้า"
              required
              placeholder="ป้อนรายละเอียดร้านค้า"
              value={formData.detail}
              onChange={handleFormChange}
              error={!!formErrors.detail}
              helperText={formErrors.detail}
            />
          </div>

          <div>
            <TextField
              id="houseNumber"
              label="บ้านเลขที่"
              required
              placeholder="ป้อนบ้านเลขที่ร้านค้า"
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
              placeholder="ป้อนหมู่ของร้านค้า"
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
              id="locationDetail"
              label="คำอธิบายที่อยู่"
              placeholder="คำอธิบายที่อยู่"
              value={formData.locationDetail}
              onChange={handleFormChange}
              error={!!formErrors.locationDetail}
              helperText={formErrors.locationDetail}
            />
          </div>

          <div className="col-span-2">
            {isLoaded && (
              <MapPicker
                startingPosition={position}
                startingZoom={startingZoom}
                onChange={setPosition}
              />
            )}
          </div>

          <div className="col-span-2">
            <TagSelector
              value={formData.tagStores}
              tag={tagList}
              onChange={(ids) => handleValueChange("tagStores", ids)}
              error={!!formErrors.tagStores}
              helperText={formErrors.tagStores}
            />
          </div>

          {/* UploadCard Section */}
          <div className="col-span-2">
            <h3 className="font-bold text-base mb-3">
              อัพโหลดภาพหน้าปก<span className="text-red-600">*</span>
            </h3>
            <UploadCard
              max={1}
              accept="image/*"
              multiple={false}
              value={coverFiles}
              onChange={setCoverFiles}
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

          <div className="col-span-2">
            <h3 className="font-bold text-base mb-3">
              อัพโหลดรูปภาพเพิ่มเติม<span className="text-red-600">*</span>
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
        </div>

        {/* ปุ่ม action */}
        <div className="flex justify-end mt-5">
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

        {/* Modal Confirm */}
        <Modal
          isOpen={isConfirmModalOpen}
          title="ยืนยันการแก้ไขร้านค้า"
          text="คุณต้องการยืนยันการแก้ไขร้านค้านี้หรือไม่"
          onConfirm={async () => {
            setIsConfirmModalOpen(false);
            await handleSubmit();
          }}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
        <Modal
          isOpen={isCancelConfirmModalOpen}
          title="ยืนยันการยกเลิก"
          text="ต้องการยกเลิกการแก้ไขร้านค้าหรือไม่"
          onConfirm={() => {
            setIsCancelConfirmModalOpen(false);
            navigate(-1);
          }}
          onCancel={() => setIsCancelConfirmModalOpen(false)}
        />
        <ModalAlert
          isOpen={isAlertOpen}
          type={alertType}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setIsAlertOpen(false)}
        />
      </div>
    </div>
  );
}
