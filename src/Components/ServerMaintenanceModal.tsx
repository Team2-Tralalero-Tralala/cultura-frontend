/*
 * คำอธิบาย : Component Modal สำหรับแสดงข้อความเมื่อระบบอยู่ในโหมด maintenance
 * แสดงเมื่อเซิร์ฟเวอร์อยู่ในสถานะ offline (serverOnline = false)
 * มีปุ่มปิดและปุ่มกลับสู่หน้าหลัก
 */

import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

/*
 * Interface สำหรับ Props ของ Modal
 */
interface ServerMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/*
 * คำอธิบาย : Component สำหรับแสดง Modal แจ้งเตือนระบบปิดปรับปรุง
 * Input :
 *   - isOpen (boolean) - ควบคุมการแสดง/ซ่อน Modal
 *   - onClose (function) - ฟังก์ชันที่จะทำงานเมื่อปิด Modal
 * Output : React Component ที่แสดง Modal แจ้งเตือน
 */
export default function ServerMaintenanceModal({
  isOpen,
  onClose,
}: ServerMaintenanceModalProps) {
  const navigate = useNavigate();

  /*
   * คำอธิบาย : จัดการเมื่อคลิกปุ่มกลับสู่หน้าหลัก
   * Input : ไม่มี
   * Output : นำทางไปยังหน้าหลัก
   */
  const handleGoHome = () => {
    navigate("/");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg mx-4 relative px-32">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon icon="mdi:close" className="w-12 h-12" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Warning Icon */}
          <div className="flex justify-center mb-1">
            <div className="w-48 h-48 flex items-center justify-center">
              <Icon
                icon="mdi:alert-octagon-outline"
                className="w-48 h-48 text-yellow-300"
              />
            </div>
          </div>

          {/* Main Message */}
          <h2 className="text-2xl font-bold text-black mb-4">
            ระบบกำลังปิดปรับปรุงชั่วคราว
          </h2>
          <p className="text-lg text-black mb-8">
            กรุณาลองใหม่อีกครั้งในภายหลัง
          </p>

          {/* Action Button */}
          <button
            onClick={handleGoHome}
            className=" bg-yellow-300 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
}

