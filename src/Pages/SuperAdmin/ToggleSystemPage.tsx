/*
 * คำอธิบาย : Component สำหรับการเปิด/ปิดระบบ (Super Admin)
 * โดยแบ่งออกเป็นส่วนหลัก ได้แก่
 * 1. แสดงสถานะปัจจุบันของระบบ (ออนไลน์/ออฟไลน์)
 * 2. ปุ่มสำหรับเปิด/ปิดระบบ
 * 3. แสดงไอคอนและข้อความสถานะแบบใหญ่
 * ใช้ร่วมกับ Service สำหรับจัดการการเปิด/ปิดระบบ
 */
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import { fetchServerStatus } from "@/Libs/ServerStatusService";
import { disableSystem, enableSystem } from "@/Libs/SystemToggleService";
import { Icon } from "@iconify/react";
import React from "react";

/**
 * คำอธิบาย: Component หน้า ToggleSystemPage สำหรับ Super Admin
 * หน้าที่: จัดการการเปิด/ปิดระบบ และแสดงสถานะปัจจุบัน
 * Input: -
 * Output: JSX Element หน้า ToggleSystemPage
 */
export function ToggleSystemPage() {
  // ====== state ======
  const [isServerOnline, setIsServerOnline] = React.useState<boolean>(true);

  /*
   * คำอธิบาย : ดึงสถานะปัจจุบันของระบบจาก API
   * Input : ไม่มี
   * Output :
   *    - อัพเดท state ของ serverStatus
   *    - หากเกิดข้อผิดพลาดจะเซ็ต serverStatus เป็น false
   */
  const fetchData = async () => {
    try {
      // Fetch server status
      const serverStatusData = await fetchServerStatus();
      setIsServerOnline(serverStatusData.serverOnline);
    } catch (e: any) {
      setIsServerOnline(false);
    }
  };

  /*
   * คำอธิบาย : เปิดระบบผ่าน API
   * Input : ไม่มี
   * Output :
   *    - เรียกใช้ enableSystem API
   *    - อัพเดท serverStatus ตามผลลัพธ์ที่ได้
   *    - แสดงผลลัพธ์ใน console
   */
  const handleTurnOnSystem = async () => {
    const result = await enableSystem();
    console.log(result);
    setIsServerOnline(result.data.serverOnline);
  };

  /*
   * คำอธิบาย : ปิดระบบผ่าน API
   * Input : ไม่มี
   * Output :
   *    - เรียกใช้ disableSystem API
   *    - อัพเดท serverStatus ตามผลลัพธ์ที่ได้
   */
  const handleTurnOffSystem = async () => {
    const result = await disableSystem();
    setIsServerOnline(result.data.serverOnline);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4 h-full">
      <div>
        <Breadcrumb
          current={{
            label: "การเปิด/ปิด ระบบ",
            to: "/super/toggle-system",
          }}
        />
      </div>
      <div className="flex flex-col gap-2 w-full bg-white rounded-lg p-4 h-full">
        <div className="flex items-center justify-between align-top">
          <h1 className="text-xl font-bold">การเปิด/ปิด ระบบ</h1>
          <div>
            สถานะเซิร์ฟเวอร์
            <div className="flex items-center gap-2 px-2 py-2 rounded-full bg-black text-white">
              <div
                className={`w-6 h-6 rounded-full ${isServerOnline ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span className="font-medium pr-4">{isServerOnline ? "ออนไลน์" : "ออฟไลน์"}</span>
            </div>
          </div>
        </div>

        {/* System Status Display */}
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          {/* Large Status Icon */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col items-center justify-center">
              <Icon
                icon={isServerOnline ? "wpf:online" : "heroicons-solid:status-offline"}
                className={`w-64 h-64  ${isServerOnline ? "text-green-500" : "text-red-500"}`}
              />
              <h2
                className={`text-4xl font-bold ${isServerOnline ? "text-green-500" : "text-red-500"}`}
              >
                {isServerOnline ? "ออนไลน์" : "ออฟไลน์"}
              </h2>
            </div>

            <h2 className="text-2xl font-medium flex items-center gap-2">
              <Icon
                icon="streamline-pixel:coding-apps-websites-setting-computer"
                className="w-5 h-5"
              />
              คลิกปุ่มหากต้องการ{isServerOnline ? "ปิด" : "เปิด"}ระบบ
            </h2>
          </div>

          {/* System Control Buttons */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex gap-4">
              {!isServerOnline ? (
                <button
                  onClick={handleTurnOnSystem}
                  className="px-6 py-3 rounded-lg shadow-lg bg-white text-black flex items-center gap-3 cursor-pointer"
                >
                  <Icon icon="mingcute:power-fill" className="w-5 h-5" />
                  <span>เปิดระบบ</span>
                </button>
              ) : (
                <button
                  onClick={handleTurnOffSystem}
                  className="px-6 py-3 rounded-lg shadow-lg bg-white text-black flex items-center gap-3 cursor-pointer"
                >
                  <Icon icon="mingcute:power-fill" className="w-5 h-5" />
                  <span>ปิดระบบ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
