/**
 * คำอธิบาย: Component สำหรับแถบเมนูด้านข้างสำหรับผู้ดูแลระบบระดับสูง (Super Admin)
 * - แสดงเมนูทั้งหมดที่เกี่ยวข้องกับการจัดการระบบ (เช่น ชุมชน, บัญชี, แพ็กเกจ)
 */

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/Libs/UseAuth";

type MenuKey =
  | "communities"
  | "accounts"
  | "users-blocked"
  | "packages"
  | "package-requests"
  | "tags"
  | "dashboard"
  | "logs"
  | "setting"
  | "logout"
  | null;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับแสดง Sidebar ของผู้ใช้กลุ่ม Super Admin
 * Input : ไม่มี
 * Output : ส่วนแสดงผล Sidebar
 */
const SidebarSuperAdmin: React.FC = () => {
  const location = useLocation();
  const { pathname } = location;
  const { logout } = useAuth();

  const basePath = pathname.startsWith("/super") ? "/super" : "";

  const [activeMenuKey, setActiveMenuKey] = useState<MenuKey>(null);
  const [openDropdown, setOpenDropdown] = useState<MenuKey | null>(null);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับตั้งเมนูที่ใช้งานอยู่ตามเส้นทางปัจจุบัน
   * Input : pathname, basePath
   * Output : -
   */
  useEffect(() => {
    let subPath = pathname;
    if (basePath) {
      subPath = pathname.substring(basePath.length);
      if (!subPath.startsWith("/")) {
        subPath = "/" + subPath;
      }
    }

    if (subPath.startsWith("/communities/all")) {
      setActiveMenuKey("communities");
      setOpenDropdown(null);
    }

    else if (subPath.startsWith("/users/blocked")) {
      setActiveMenuKey("users-blocked");
      setOpenDropdown("accounts");
    } else if (subPath.startsWith("/accounts/all")) {
      setActiveMenuKey("accounts");
      setOpenDropdown("accounts");
    }

    else if (subPath.startsWith("/package-requests")) {
      setActiveMenuKey("package-requests");
      setOpenDropdown("packages");
    } else if (
      subPath.startsWith("/packages/all") ||
      subPath.startsWith("/package/")
    ) {
      setActiveMenuKey("packages");
      setOpenDropdown("packages");
    }

    else if (subPath.startsWith("/tags")) {
      setActiveMenuKey("tags");
      setOpenDropdown(null);
    } else if (subPath.startsWith("/dashboard")) {
      setActiveMenuKey("dashboard");
      setOpenDropdown(null);
    } else if (subPath.startsWith("/logs")) {
      setActiveMenuKey("logs");
      setOpenDropdown(null);
    } else if (subPath.startsWith("/setting")) {
      setActiveMenuKey("setting");
      setOpenDropdown(null);
    } else if (subPath === "/logout") {
      setActiveMenuKey("logout");
      setOpenDropdown(null);
    } else {
      setActiveMenuKey(null);
      setOpenDropdown(null);
    }
  }, [pathname, basePath]);

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการการคลิกเมนู
   * Input : key, parentKey
   * Output : -
   */
  const handleClick = (key: MenuKey, parentKey?: MenuKey) => {
    setActiveMenuKey(key);
    if (parentKey) {
      setOpenDropdown(parentKey);
    } else {
      setOpenDropdown((prev) => (prev === key ? null : key));
    }
  };

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับตรวจสอบว่าเมนูใดที่กำลังใช้งานอยู่
   * Input : key
   * Output : boolean
   */
  const isActive = (key: MenuKey) => activeMenuKey === key;

  return (
    <div className="h-screen w-60 bg-[#055035] text-white flex flex-col justify-between py-6 px-4">
      <div>
        <div className="flex items-center justify-center mb-6">
          <Link to={`${basePath}/communities/all`} onClick={() => handleClick("communities")}>
            <img src="/logo-white.png" alt="Cultura logo" className="h-10 cursor-pointer" />
          </Link>
        </div>

        <nav className="flex flex-col gap-2 text-base-semibold">
          {/* จัดการชุมชน */}
          <Link
            to={`${basePath}/communities/all`}
            onClick={() => handleClick("communities")}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive("communities") ? "bg-[#0D845A]" : ""
              }`}
          >
            <Icon icon="ri:community-line" className="text-xl" />
            จัดการชุมชน
          </Link>

          {/* จัดการบัญชี */}
          <div>
            <Link
              to={`${basePath}/accounts/all`}
              onClick={() => handleClick("accounts")}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${isActive("accounts") ? "bg-[#0D845A]" : ""
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="mdi:account-cog-outline" className="text-xl" />
                จัดการบัญชี
              </span>
              <Icon icon={openDropdown === "accounts" ? "mdi:chevron-up" : "mdi:chevron-down"} />
            </Link>

            {openDropdown === "accounts" && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to={`${basePath}/users/blocked`}
                  onClick={() => handleClick("users-blocked", "accounts")}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive("users-blocked") ? "bg-[#0D845A]" : ""
                    }`}
                >
                  การระงับบัญชี
                </Link>
              </div>
            )}
          </div>

          {/* จัดการแพ็กเกจ */}
          <div>
            <Link
              to={`${basePath}/packages/all`}
              onClick={() => handleClick("packages")}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${isActive("packages") ? "bg-[#0D845A]" : ""
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="material-symbols:card-travel-outline" className="text-xl" />
                จัดการแพ็กเกจ
              </span>
              <Icon icon={openDropdown === "packages" ? "mdi:chevron-up" : "mdi:chevron-down"} />
            </Link>
            {openDropdown === "packages" && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to={`${basePath}/package-requests`}
                  onClick={() => handleClick("package-requests", "packages")}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive("package-requests") ? "bg-[#0D845A]" : ""
                    }`}
                >
                  คำขออนุมัติ
                </Link>
              </div>
            )}
          </div>

          {/* จัดการประเภท */}
          <Link
            to={`${basePath}/tags`}
            onClick={() => handleClick("tags")}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive("tags") ? "bg-[#0D845A]" : ""
              }`}
          >
            <Icon icon="bi:tags" className="text-xl" />
            จัดการประเภท
          </Link>

          {/* รายงาน */}
          <Link
            to={`${basePath}/dashboard`}
            onClick={() => handleClick("dashboard")}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive("dashboard") ? "bg-[#0D845A]" : ""
              }`}
          >
            <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
            รายงาน
          </Link>

          {/* ประวัติการเข้าใช้งาน */}
          <Link
            to={`${basePath}/logs`}
            onClick={() => handleClick("logs")}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive("logs") ? "bg-[#0D845A]" : ""
              }`}
          >
            <Icon icon="ix:log" className="text-xl" />
            ประวัติการเข้าใช้งาน
          </Link>
        </nav>
      </div>

      {/* ตั้งค่า & ออกจากระบบ */}
      <div className="flex flex-col gap-2 text-base-semibold">
        <Link
          to={`${basePath}/setting`}
          onClick={() => handleClick("setting")}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive("setting") ? "bg-[#0D845A]" : ""
            }`}
        >
          <Icon icon="mdi:cog-outline" className="text-xl" />
          การตั้งค่า
        </Link>

        <button
          onClick={() => {
            handleClick("logout");
            logout();
          }}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition w-full text-left ${isActive("logout") ? "bg-[#0D845A]" : ""
            }`}
        >
          <Icon icon="mdi:logout" className="text-xl" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default SidebarSuperAdmin;
