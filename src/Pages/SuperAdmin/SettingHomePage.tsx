/*
 * คำอธิบาย : Component สำหรับหน้าแรกของการตั้งค่าระบบ (Super Admin)
 * โดยแบ่งออกเป็นส่วนหลัก ได้แก่
 * 1. แสดงสถานะเซิร์ฟเวอร์ (ออนไลน์/ออฟไลน์)
 * 2. เมนูการตั้งค่าต่างๆ ประกอบด้วย:
 *    - การเพิ่ม/แก้ไข โลโก้และรูปภาพ
 *    - การสำรองข้อมูล
 *    - การเปิด/ปิด ระบบ
 * ใช้ร่วมกับ Service สำหรับตรวจสอบสถานะเซิร์ฟเวอร์
 */
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { fetchServerStatus } from "@/Libs/ServerStatusService";
import { Icon } from "@iconify/react";
import React from "react";

/**
 * คำอธิบาย: Component สำหรับหน้าแรกของการตั้งค่าระบบ (Super Admin)
 * หน้าที่: จัดการการแสดงผลสถานะเซิร์ฟเวอร์และเมนูการตั้งค่า
 * Input: -
 * Output: JSX Element หน้า SettingHomePage
 */
export function SettingHomePage() {
  // ====== state ตาราง ======
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isServerOnline, setIsServerOnline] = React.useState<boolean>(true);
  /*
   * คำอธิบาย : ดึงสถานะเซิร์ฟเวอร์จาก API
   * Input : ไม่มี
   * Output :
   *    - อัพเดท state ของ serverStatus
   *    - หากเกิดข้อผิดพลาดจะเซ็ต errorMessage และ serverStatus เป็น false
   */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const serverStatusData = await fetchServerStatus();
      setIsServerOnline(serverStatusData.serverOnline);
    } catch (e: any) {
      setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
      setIsServerOnline(false); // Set to offline if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4 h-full">
      <div>
        <Breadcrumb
          current={{
            label: "การตั้งค่า",
            to: "/super/setting",
            fromSidebar: true,
          }}
        />
      </div>

      <div className="flex flex-col gap-2 w-full bg-white rounded-lg p-4 h-full">
        <div className="flex items-center justify-between align-top">
          <h1 className="text-xl">การตั้งค่า</h1>
          <div>
            สถานะเซิร์ฟเวอร์
            <div className={`flex items-center gap-2 px-2 py-2 rounded-full bg-black text-white`}>
              {isLoading ? (
                <div className="w-6 h-6 rounded-full bg-gray-400 animate-pulse"></div>
              ) : (
                <div
                  className={`w-6 h-6 rounded-full ${isServerOnline ? "bg-green-500" : "bg-red-500"}`}
                ></div>
              )}
              <span className="font-medium pr-4">
                {isLoading ? "กำลังตรวจสอบ..." : isServerOnline ? "ออนไลน์" : "ออฟไลน์"}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="flex gap-8 justify-center items-center h-full">
          {/* Logo and Images Card */}
          <a href="/super/banners">
            <div className="bg-white border-4 border-[#8FCEB7] rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 mb-4 flex items-center justify-center">
                  <Icon
                    icon="material-symbols:image-outline"
                    className="w-full h-full text-teal-600"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-800">การเพิ่ม/แก้ไข โลโก้และรูปภาพ</h3>
              </div>
            </div>
          </a>

          <a href="/super/backups">
            <div className="bg-white border-4 border-[#8FCEB7] rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 mb-4 flex items-center justify-center">
                  <Icon icon="mdi:cloud-upload-outline" className="w-full h-full text-teal-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800">การสำรองข้อมูล</h3>
              </div>
            </div>
          </a>

          <a href="/super/toggle-system">
            <div className="bg-white border-4 border-[#8FCEB7] rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 mb-4 flex items-center justify-center">
                  <Icon icon="clarity:power-solid" className="w-full h-full text-teal-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800">การเปิด/ปิด ระบบ</h3>
              </div>
            </div>
          </a>
        </div>
      </div>

      {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
    </div>
  );
}
