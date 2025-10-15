import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../../Components/Button";
import { Backward, EditIcon } from "../../Icon/MaterialSymbolsLight";

const apiUrl = import.meta.env.VITE_API_URL;

interface DateTimeField {
  date: string | null;
  time: string | null;
}

interface UserRef {
  id: number;
  name: string;
}

interface LocationData {
  address: string;
  detail: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
}

interface HomestayData {
  id: number;
  name: string;
  roomType: string;
  capacity: number;
  detail: string;
  images: { id: number; path: string; type: string }[];
  location?: {
    subDistrict?: string;
    district?: string;
    province?: string;
    latitude?: number;
    longitude?: number;
  } | null;
}

interface HomestayHistory {
  id: number;
  guestAmount: number;
  checkInTime: string;
  checkOutTime: string;
  homestay?: HomestayData | null;
}

interface PackageData {
  id: number;
  name: string;
  description: string;
  capacity: number;
  price: number;
  facility: string;
  warning: string;
  statusPackage: string;
  statusApprove?: string | null;
  rejectReason?: string | null;
  createdBy?: UserRef | null;
  overseer?: UserRef | null;
  tags: string[];
  startDate: DateTimeField;
  dueDate: DateTimeField;
  openBookingAt: DateTimeField;
  closeBookingAt: DateTimeField;
  location?: LocationData | null;
  files: { id: number; path: string; type: string }[];
  homestayHistories: HomestayHistory[];
}

/**
 * Componant สำหรับแปลงวันที่เป็นรูปแบบ dd/mm/yyyy (ใช้ในกรณีที่ต้องการแสดงผล)
 */
function formatDateTH(dateStr: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function DetailPackageSuperAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackage() {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/packages/${id}`, {
          withCredentials: true,
        });
        console.log("Backend response:", res.data.data);
        setPkg(res.data.data);
      } catch (err) {
        console.error("Error fetching package:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [id]);

  if (loading)
    return <div className="p-6 text-gray-500">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!pkg) return <div className="p-6 text-gray-500">ไม่พบข้อมูลแพ็กเกจ</div>;

  const coverImage = pkg.files?.find((f) => f.type === "COVER");

  return (
    <div className="max-w-8xl mx-auto bg-white rounded-2xl shadow-sm p-8">
      {/* Header */}

      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-row">
          {/* ปุ่มย้อนกลับ */}
          <div
            className="mt-1 mr-3 cursor-pointer"
            onClick={() => navigate(`/super/packages`)}
          >
            <Backward></Backward>
          </div>
          <h1 className="text-xl font-bold mb-15">รายละเอียดแพ็กเกจ</h1>
        </div>
        <div className="w-60">
          {/* ปุ่มแก้ไขรายละเอียดแพ็กเกจ */}
          <Button onClick={() => navigate(`/super/package/${id}`)}>
            <EditIcon></EditIcon>แก้ไขรายละเอียดแพ็กเกจ
          </Button>
        </div>
      </div>
      {/* ชื่อแพ็กเกจ */}
      <div className="mb-6 flex flex-row">
        <p className="text-md text-gray-800">
          <strong>ชื่อแพ็กเกจ : </strong>
          {pkg.name}
        </p>
      </div>

      {/* คำอธิบาย */}
      <div className="mb-6">
        <div className="flex flex-row">
          <p className="text-md text-gray-800">
            <strong>คำอธิบาย : </strong>
            {pkg.description}
          </p>
        </div>
      </div>

      {/* จำนวนคน / ราคา */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex flex-row mr-30">
          <p className="text-md text-gray-800">
            <strong>จำนวนคนที่เปิดรับ : </strong>
            {pkg.capacity} คน
          </p>
        </div>
        <div className="flex flex-row">
          <p className="text-md ml-5 text-gray-800">
            <strong>ราคา : </strong>
            {pkg.price.toLocaleString()} บาท
          </p>
        </div>
      </div>
      {pkg.tags?.length > 0 && (
        <p className="mb-6">
          <strong>แท็ก :</strong> {pkg.tags.join(" ")}
        </p>
      )}
      
      {/* ภาพหลัก (ไม่รู้ว่ามี Componant ของรูปภาพ) */}
      {coverImage && (
        <div className="mb-6">
          <img
            //src={coverImage} //ใช้ในกรณีที่เก็บภาพในเครื่อง
            //src={`${apiUrl}/files/${coverImage.path}`} //ใช้ในกรณีที่เก็บภาพบน Backend
            src="/public/ViewTiwTouch.jpg" //ใช้ในกรณีที่เก็บภาพในโฟลเดอร์ public ของ Frontend
            alt="package cover"
            className="w-160 h-90 object-cover rounded-xl rounded-lg border-gray-400 border-2"
          />
        </div>
      )}

      {/* ข้อมูลผู้ดูแล */}
      <div className="grid md:grid-cols-2 gap-6 text-gray-700 mb-6">
        <div>
          <p className="mb-6">
            <strong>ผู้ดูแล : </strong> {pkg.overseer?.name || "-"}
          </p>
          <p className="mb-6">
            <strong>วันที่เริ่ม - วันที่สิ้นสุดแพ็กเกจ : </strong>{" "}
            {formatDateTH(pkg.startDate?.date)} -{" "}
            {formatDateTH(pkg.dueDate?.date)}
            <br />
            <strong>เวลา : </strong> {pkg.startDate?.time || "-"} -{" "}
            {pkg.dueDate?.time || "-"}
          </p>
        </div>

        <div>
          <p className="mb-6">
            <strong>สร้างโดย : </strong> {pkg.createdBy?.name || "-"}
          </p>
          <p className="mb-6">
            <strong>วันที่เปิด - วันที่ปิดการจอง : </strong>{" "}
            {formatDateTH(pkg.openBookingAt?.date)} -{" "}
            {formatDateTH(pkg.closeBookingAt?.date)}
            <br />
            <strong>เวลา : </strong> {pkg.openBookingAt?.time || "-"} -{" "}
            {pkg.closeBookingAt?.time || "-"}
          </p>
        </div>
      </div>

      {/* สิ่งอำนวยความสะดวก */}
      <div className="mb-6">
        <p>
          <strong>สิ่งอำนวยความสะดวกแพ็กเกจ : </strong> {pkg.facility || "-"}
        </p>
      </div>

      {/* แผนที่ */}
      {pkg.location && (
        <div className="mt-8">
          <h2 className="font-semibold text-lg mb-6">แผนที่</h2>
          <iframe
            title="map"
            src={`https://www.google.com/maps?q=${pkg.location.latitude},${pkg.location.longitude}&z=14&output=embed`}
            className="w-full h-96 rounded-xl border"
          ></iframe>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700 mb-6">
            <div className="mt-6">
              <p className="mb-4">
                <strong>ที่อยู่ :</strong> {pkg.location.address}
              </p>
              <p>
                <strong>ละติจูด / ลองจิจูด : </strong> {pkg.location.latitude},{" "}
                {pkg.location.longitude}
              </p>
            </div>
            <div className="mt-6">
              <p className="mb-4">
                <strong>คำอธิบายที่อยู่ :</strong> {pkg.location.detail}
              </p>
      
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
