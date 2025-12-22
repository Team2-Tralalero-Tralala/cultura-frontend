/*
 * Component: UploadBannerPage (Client)
 * หน้าที่: หน้าจอจัดการรูป Banner หน้าแรก (Upload, Crop, Delete)
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Icon } from "@iconify/react";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import api from "@/Libs/api"; 

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const apiBaseUrl = apiUrl.replace("/api", "") || "http://localhost:3000";

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแปลง area ที่ crop ให้เป็น File object
 * Input : file (ต้นฉบับ), area (พิกัด x,y,w,h), mime, quality
 * Output : Promise<File> (ไฟล์รูปภาพที่ถูกตัดแล้ว)
 */
async function cropImageToFile(
  file: File,
  area: { x: number; y: number; width: number; height: number },
  mime = "image/jpeg",
  quality = 0.95
): Promise<File> {
  const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
    const temporaryImage = new Image();
    temporaryImage.onload = () => resolve(temporaryImage);
    temporaryImage.onerror = reject;
    temporaryImage.src = URL.createObjectURL(file);
  });

  const canvasElement = document.createElement("canvas");
  canvasElement.width = Math.max(1, Math.floor(area.width));
  canvasElement.height = Math.max(1, Math.floor(area.height));

  const canvasContext = canvasElement.getContext("2d")!;
  canvasContext.drawImage(
    imageElement,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  const blobData: Blob = await new Promise((resolve) =>
    canvasElement.toBlob((blob) => resolve(blob!), mime, quality)
  );

  const outputName = file.name.replace(/\.(\w+)$/, "_cropped.$1");
  return new File([blobData], outputName, { type: blobData.type });
}

/*
 * คำอธิบาย : ตรวจสอบว่าเป็น URL แบบ Absolute หรือไม่
 * Input : urlString
 * Output : boolean
 */
const isAbsoluteUrl = (urlString?: string) => !!urlString && /^https?:\/\//i.test(urlString);

/*
 * คำอธิบาย : สร้าง URL สำหรับพรีวิว Banner
 * Input : item (path, url)
 * Output : string (URL สมบูรณ์)
 */
const getBannerPreviewUrl = (item: { path: string; url?: string }) => {
  if (isAbsoluteUrl(item.url)) return item.url as string;
  const rawPath = item.path || "";
  const leadingPath = "/" + rawPath.replace(/^\/+/, "");
  return `${apiBaseUrl}${leadingPath}`;
};

type RawBannerItem = {
  id: number;
  image: string;
  order?: number;
  url?: string;
};

type BannerItem = {
  id: number;
  order: number;
  path: string;
  url?: string;
};

/*
 * คำอธิบาย : ดึงข้อมูล Banner ทั้งหมดจาก API
 * Input : -
 * Output : Promise<BannerItem[]>
 */
async function fetchBanners(): Promise<BannerItem[]> {
  const response = await api.get(`/super/banner`, { params: { _: Date.now() } });
  const rawList = Array.isArray(response.data?.data)
    ? response.data.data
    : Array.isArray(response.data?.banners)
      ? response.data.banners
      : Array.isArray(response.data)
        ? response.data
        : [];

  return (rawList as RawBannerItem[]).map((rawItem, index) => {
    const bannerItem: BannerItem = {
      id: rawItem.id,
      path: rawItem.image,
      order: rawItem.order ?? index + 1,
    };
    return {
      ...bannerItem,
      url: bannerItem.url ?? getBannerPreviewUrl(bannerItem),
    };
  });
}

/*
 * คำอธิบาย : อัปโหลด Banner ไปยัง Server
 * Input : files[]
 * Output : Response data
 */
async function uploadBanners(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("banner", file, file.name));
  const response = await api.post(`/super/banner`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/*
 * คำอธิบาย : ลบ Banner ตาม ID
 * Input : id
 * Output : -
 */
async function deleteBanner(id: number) {
  await api.delete(`/super/banner/${id}`);
}

/*
 * คำอธิบาย : แทนที่ไฟล์ Banner เดิม
 * Input : id, file
 * Output : Response data
 */
async function replaceBanner(id: number, file: File) {
  const formData = new FormData();
  formData.append("banner", file, file.name);
  const response = await api.put(`/super/banner/${id}`, formData);
  return response.data;
}

/*
 * คำอธิบาย : Component Modal แจ้งผลลัพธ์การทำงาน
 * Input : open, status, message, onClose
 * Output : JSX Element
 */
function ResultModal({
  isOpen,
  status,
  message,
  onClose,
}: {
  isOpen: boolean;
  status: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  const headerClass =
    status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800";
  const title = status === "success" ? "สำเร็จ" : "ไม่สำเร็จ";
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40 z-0" onClick={onClose} />
      <div className="relative z-10 w-[612px] max-w-full h-[200px] rounded-2xl bg-white shadow-xl">
        <div className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl ${headerClass}`}>
          <Icon icon="circum:circle-alert" className="h-5 w-5" />
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        <div className="px-5 py-4 text-gray-700">{message}</div>
        <div className="px-5 pb-5">
          <Button type="confirm-admin" htmlType="button" onClick={onClose}>
            ตกลง
          </Button>
        </div>
      </div>
    </div>
  );
}

/*
 * คำอธิบาย : Component หลักสำหรับหน้าจัดการ Banner
 * Input : -
 * Output : JSX Element
 */
export default function UploadBannerPage() {
  const [serverBanners, setServerBanners] = useState<BannerItem[]>([]);
  const serverCount = serverBanners.length;

  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [localPreviews, setLocalPreviews] = useState<{ url: string }[]>([]);

  const remainingBannerSlots = Math.max(0, 5 - (serverCount + bannerFiles.length));

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<"edit" | "delete" | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);

  const [isResultOpen, setIsResultOpen] = useState(false);
  const [resultStatus, setResultStatus] = useState<"success" | "error">("success");
  const [resultMessage, setResultMessage] = useState("");

  const editInputRef = useRef<HTMLInputElement | null>(null);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [fileToCrop, setFileToCrop] = useState<File | null>(null);
  const [cropImageSource, setCropImageSource] = useState<string | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<any>(null);
  const [cropIntent, setCropIntent] = useState<"add" | "edit" | null>(null);

  const cropAspect = 1920 / 600;

  useEffect(() => {
    const previewUrls = bannerFiles.map((file) => ({ url: URL.createObjectURL(file) }));
    setLocalPreviews(previewUrls);
    return () => previewUrls.forEach((previewObject) => URL.revokeObjectURL(previewObject.url));
  }, [bannerFiles]);

  const combinedPreviews = useMemo(
    () => [
      ...serverBanners.map((banner) => ({ url: banner.url ?? getBannerPreviewUrl(banner) })),
      ...localPreviews,
    ],
    [serverBanners, localPreviews]
  );

  /*
   * คำอธิบาย : ฟังก์ชันดึงข้อมูลใหม่และรีเซ็ตค่า State
   * Input : -
   * Output : -
   */
  const refresh = async () => {
    try {
      const items = await fetchBanners();
      items.sort((bannerA, bannerB) => bannerA.order - bannerB.order);
      setServerBanners(items);
      setBannerFiles([]);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  /*
   * คำอธิบาย : เริ่มกระบวนการ Crop รูปภาพ
   * Input : file, intent ('add' หรือ 'edit')
   * Output : -
   */
  const startCrop = (file: File, intent: "add" | "edit") => {
    setFileToCrop(file);
    setCropImageSource(URL.createObjectURL(file));
    setCropIntent(intent);
    setCropZoom(1);
    setCropPosition({ x: 0, y: 0 });
    setIsCropModalOpen(true);
  };

  /*
   * คำอธิบาย : Callback เมื่อการ Crop สิ้นสุดลง (เก็บค่า Pixel Area)
   * Input : _unused, croppedAreaPixels
   * Output : -
   */
  const onCropComplete = (_unused: any, croppedAreaPixels: any) => {
    setCropPixels(croppedAreaPixels);
  };

  /*
   * คำอธิบาย : บันทึกรูปที่ Crop แล้วและดำเนินการต่อตาม Intent (เพิ่ม หรือ แก้ไข)
   * Input : -
   * Output : -
   */
  const handleCropSave = async () => {
    if (!fileToCrop || !cropPixels) return;

    try {
      const croppedFile = await cropImageToFile(fileToCrop, cropPixels);

      setIsCropModalOpen(false);
      URL.revokeObjectURL(cropImageSource!);
      setCropImageSource(null);

      if (cropIntent === "add") {
        await processAddBanner(croppedFile);
      } else if (cropIntent === "edit") {
        processEditBanner(croppedFile);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการตัดรูปภาพ");
    }
  };

  /*
   * คำอธิบาย : ยกเลิกการ Crop และล้างค่า State ที่เกี่ยวข้อง
   * Input : -
   * Output : -
   */
  const handleCropCancel = () => {
    setIsCropModalOpen(false);
    if (cropImageSource) URL.revokeObjectURL(cropImageSource);
    setFileToCrop(null);
    setCropImageSource(null);
    setCropIntent(null);
    if (editInputRef.current) editInputRef.current.value = "";
  };

  /*
   * คำอธิบาย : รับไฟล์จากการเพิ่มรูปและเรียกฟังก์ชัน Crop
   * Input : files
   * Output : -
   */
  const handleAddFiles = (files: File[]) => {
    if (!files.length) return;
    startCrop(files[0], "add");
  };

  /*
   * คำอธิบาย : อัปโหลดไฟล์หลัง Crop เสร็จ
   * Input : file
   * Output : -
   */
  const processAddBanner = async (file: File) => {
    try {
      await uploadBanners([file]);
      await refresh();
      setResultStatus("success");
      setResultMessage(`อัปโหลดสำเร็จ`);
      setIsResultOpen(true);
    } catch (error: any) {
      setResultStatus("error");
      setResultMessage(error?.message || "อัปโหลดไม่สำเร็จ");
      setIsResultOpen(true);
    }
  };

  /*
   * คำอธิบาย : เปิด File Input เพื่อเตรียมแก้ไขรูป
   * Input : index
   * Output : -
   */
  const onEditClick = (index: number) => {
    setPendingIndex(index);
    setPendingAction("edit");
    editInputRef.current?.click();
  };

  /*
   * คำอธิบาย : รับไฟล์จากการแก้ไขและเรียกฟังก์ชัน Crop
   * Input : event
   * Output : -
   */
  const handleEditFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pickedFiles = Array.from(event.target.files ?? []);
    if (!pickedFiles.length) return;

    startCrop(pickedFiles[0], "edit");
    event.target.value = "";
  };

  /*
   * คำอธิบาย : เตรียมไฟล์หลัง Crop เพื่อรอการยืนยันแก้ไข
   * Input : file
   * Output : -
   */
  const processEditBanner = (file: File) => {
    setTempFile(file);
    setConfirmTitle("ยืนยันการแก้ไขรูปภาพหรือไม่");
    setConfirmDescription("คุณจะไม่สามารถย้อนกลับได้");
    setIsConfirmOpen(true);
  };

  /*
   * คำอธิบาย : ตั้งค่าเพื่อเตรียมลบรูปภาพ
   * Input : index
   * Output : -
   */
  const onDeleteClick = (index: number) => {
    setPendingIndex(index);
    setPendingAction("delete");
    setConfirmTitle("ยืนยันการลบรูปภาพหรือไม่");
    setConfirmDescription("คุณจะไม่สามารถย้อนกลับได้");
    setIsConfirmOpen(true);
  };

  /*
   * คำอธิบาย : ยกเลิกการยืนยัน (Modal Confirm)
   * Input : -
   * Output : -
   */
  const handleCancelConfirm = () => {
    setIsConfirmOpen(false);
    setTempFile(null);
    setPendingIndex(null);
    setPendingAction(null);
  };

  /*
   * คำอธิบาย : ดำเนินการตาม Action ที่ยืนยัน (แก้ไข หรือ ลบ)
   * Input : -
   * Output : -
   */
  const handleConfirmAction = async () => {
    if (pendingIndex == null || pendingAction == null) {
      setIsConfirmOpen(false);
      return;
    }

    const isServerItem = pendingIndex < serverCount;
    try {
      if (pendingAction === "delete") {
        if (isServerItem) {
          await deleteBanner(serverBanners[pendingIndex].id);
          await refresh();
        } else {
          const localIndex = pendingIndex - serverCount;
          setBannerFiles((previousFiles) => previousFiles.filter((_unused, index) => index !== localIndex));
        }
        setResultStatus("success");
        setResultMessage("ลบรูปภาพสำเร็จ");
        setIsResultOpen(true);
      }

      if (pendingAction === "edit") {
        if (!tempFile) throw new Error("ไม่ได้เลือกไฟล์ใหม่");

        if (isServerItem) {
          await replaceBanner(serverBanners[pendingIndex].id, tempFile);
          await refresh();
        } else {
          const localIndex = pendingIndex - serverCount;
          setBannerFiles((previousFiles) => {
            const nextFiles = [...previousFiles];
            nextFiles[localIndex] = tempFile;
            return nextFiles;
          });
        }
        setResultStatus("success");
        setResultMessage("แก้ไขรูปภาพสำเร็จ");
        setIsResultOpen(true);
      }
    } catch (error: any) {
      setResultStatus("error");
      setResultMessage(error?.message || "ไม่สำเร็จ");
      setIsResultOpen(true);
    }

    setIsConfirmOpen(false);
    setTempFile(null);
    setPendingIndex(null);
    setPendingAction(null);
  };

  /*
   * คำอธิบาย : สร้าง JSX สำหรับแสดง Preview Card
   * Input : previews (array ของ url)
   * Output : Array ของ JSX Element
   */
  const renderPreviewCards = (previews: { url: string }[]) =>
    previews.map((preview, index) => (
      <div
        key={index}
        className="relative shrink-0 overflow-hidden rounded-xl shadow border border-gray-200 bg-gray-100"
        style={{ width: 200, height: 120 }}
      >
        <img
          src={preview.url}
          alt={`preview-banner-${index}`}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute bottom-2 right-2 z-20 flex space-x-2">
          <button
            type="button"
            onClick={() => onEditClick(index)}
            className="w-7 h-7 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            title="แก้ไขรูป"
          >
            <Icon icon="mdi:pencil" className="w-4 h-4 text-gray-700" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteClick(index)}
            className="w-7 h-7 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            title="ลบรูป"
          >
            <Icon icon="mdi:delete" className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>
    ));

  return (
    <>
      <Breadcrumb
        current={{
          label: "การเพิ่ม/แก้ไข รูปภาพ",
          to: `/super/banners`,
        }}
      />

      <main className="min-h-screen bg-white px-8 py-8 rounded-xl">
        <div className="flex items-center mb-6 ">
          <a
            className="items-center gap-2 mr-4 text-gray-800 hover:text-dark-green"
            href="/super/setting"
          >
            <Icon icon="lucide:arrow-left" className="w-7 h-7" />
          </a>
          <h1 className="text-[20px] font-bold">การเพิ่ม/แก้ไข รูปภาพ</h1>
        </div>

        <div className="relative pl-20 mb-8 ml-20 mt-10 border-l border-black">
          <div className="absolute -left-[13px] top-2 w-6 h-6 rounded-full bg-black"></div>

          <section>
            <h2 className="text-base font-medium text-gray-800 mb-4">รูปภาพในหน้าหลัก</h2>

            <div className="flex flex-wrap items-start gap-4">
              {renderPreviewCards(combinedPreviews)}

              {remainingBannerSlots > 0 && (
                <UploadCard
                  max={remainingBannerSlots}
                  accept="image/*"
                  multiple={false}
                  value={[]}
                  onChange={(files: File[]) => handleAddFiles(files)}
                  itemW={200}
                  itemH={120}
                  square={false}
                />
              )}
            </div>
          </section>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={editInputRef}
          className="hidden"
          onChange={handleEditFileChange}
        />

        <Modal
          open={isConfirmOpen}
          title={confirmTitle}
          text={confirmDescription}
          onCancel={handleCancelConfirm}
          onConfirm={handleConfirmAction}
          confirmText="ยืนยัน"
          cancelText="ยกเลิก"
        />

        <ResultModal
          isOpen={isResultOpen}
          status={resultStatus}
          message={resultMessage}
          onClose={() => setIsResultOpen(false)}
        />

        {isCropModalOpen && cropImageSource && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80" role="dialog">
            <div className="bg-white rounded-2xl p-4 w-[90vw] max-w-[640px] h-[80vh] flex flex-col gap-3">
              <h3 className="text-lg font-bold text-gray-800">ปรับขนาดรูปภาพ (Crop)</h3>

              <div className="relative flex-1 rounded-xl overflow-hidden bg-black">
                <Cropper
                  image={cropImageSource}
                  crop={cropPosition}
                  zoom={cropZoom}
                  aspect={cropAspect}
                  onCropChange={setCropPosition}
                  onZoomChange={setCropZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Zoom:</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={cropZoom}
                  onChange={(event) => setCropZoom(Number(event.target.value))}
                  className="flex-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="cancel" htmlType="button" onClick={handleCropCancel}>
                  ยกเลิก
                </Button>
                <Button type="confirm-admin" htmlType="button" onClick={handleCropSave}>
                  ยืนยันรูปภาพ
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}