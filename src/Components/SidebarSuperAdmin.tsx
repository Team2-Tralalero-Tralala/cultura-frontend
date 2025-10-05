/*
 * คำอธิบาย : Component Sidebar สำหรับผู้ดูแลระบบ (Super Admin)
 * ผู้ดูแลระบบสามารถจัดการชุมชน, บัญชี, แพ็กเกจ, ประเภท, รายงาน และประวัติการเข้าใช้งานได้
 * รวมถึงการตั้งค่าระบบและออกจากระบบ
 */
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';

const SidebarSuperAdmin = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const location = useLocation();

  const toggleSubMenu = (menu: string) => {
    setActiveSubMenu(activeSubMenu === menu ? null : menu);
  };

  return (
    <div className="h-screen w-60 bg-[#055035] text-white flex flex-col justify-between py-6 px-4">
      <div>
        <div className="flex items-center justify-center mb-6">
          <img src="/Cultura.png" alt="Cultura logo" className="h-10" />
        </div>

        <nav className="flex flex-col gap-2 text-base-semibold">
          {/* จัดการชุมชน */}
          <Link
            to="/communities"
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === "/communities" ? "bg-[#0D845A]" : ""
              }`}
          >
            <Icon icon="ri:community-line" className="text-xl" />
            จัดการชุมชน
          </Link>

          {/* จัดการบัญชี */}
          <div>
            <Link to="/users">
              <button
                onClick={() => toggleSubMenu('account')}
                className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${activeSubMenu === 'users' ? 'bg-[#0D845A]' : ''
                  }`}
              >
                <span className="flex items-center gap-3">
                  <Icon icon="mdi:account-cog-outline" className="text-xl" />
                  จัดการบัญชี
                </span>
                <Icon icon={activeSubMenu === 'users' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
              </button>
            </Link>

            {(activeSubMenu === 'users' || location.pathname.startsWith('/users')) && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/user/blocked"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === "/user/blocked" ? "bg-[#0D845A]" : ""
                    }`}
                >
                  การระงับบัญชี
                </Link>
              </div>
            )}
          </div>

          {/* จัดการแพ็กเกจ + sub menu */}
          <div>
            <Link to="/packages">
              <button
                onClick={() => toggleSubMenu('package')}
                className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${activeSubMenu === 'package' ? 'bg-[#0D845A]' : ''
                  }`}
              >
                <span className="flex items-center gap-3">
                  <Icon icon="material-symbols:card-travel-outline" className="text-xl" />
                  จัดการแพ็กเกจ
                </span>
                <Icon icon={activeSubMenu === 'package' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
              </button>
            </Link>

            {(activeSubMenu === 'package' || location.pathname.startsWith('/package')) && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/package-requests"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === "/package-requests" ? "bg-[#0D845A]" : ""
                    }`}
                >
                  คำขออนุมัติ
                </Link>
              </div>
            )}
          </div>

          {/* จัดการประเภท */}
          <Link
            to="/tags"
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === "/tags" ? "bg-[#0D845A]" : ""
              }`}
          >
            <Icon icon="bi:tags" className="text-xl" />
            จัดการประเภท
          </Link>

          {/* รายงาน */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === "/dashboard" ? "bg-[#0D845A]" : ""
              }`}
          >
            <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
            รายงาน
          </Link>
          {/* ประวัติการเข้าใช้งาน */}
          <Link
            to="/logs"
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === "/logs" ? "bg-[#0D845A]" : ""
              }`}
          >
            <Icon icon="ix:log" className="text-xl" />
            ประวัติการเข้าใช้งาน
          </Link>
        </nav>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        {/* ตั้งค่าระบบ */}
        <Link
          to="/setting"
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === "/setting" ? "bg-[#0D845A]" : ""
            }`}
        >
          <Icon icon="mdi:cog-outline" className="text-xl" />
          การตั้งค่า
        </Link>
        {/* ออกจากระบบ */}
        <Link
          to="/logout"
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === "/logout" ? "bg-[#0D845A]" : ""
            }`}
        >
          <Icon icon="mdi:logout" className="text-xl" />
          ออกจากระบบ
        </Link>
      </div>
    </div>
  );
};

export default SidebarSuperAdmin;
