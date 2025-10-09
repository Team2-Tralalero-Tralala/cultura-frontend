import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';

type MenuKey =
  | 'communities'
  | 'users'
  | 'user-blocked'
  | 'packages'
  | 'package-requests'
  | 'tags'
  | 'dashboard'
  | 'logs'
  | 'setting'
  | 'logout'
  | null;

const SidebarSuperAdmin = () => {
  const location = useLocation();
  const { pathname } = location;

  // ใช้ state แยกสองตัว
  const [activeMenuKey, setActiveMenuKey] = useState<MenuKey>(null); // ใช้ไฮไลต์เมนูที่ถูกคลิก
  const [openDropdown, setOpenDropdown] = useState<MenuKey | null>(null); // ควบคุมการเปิด/ปิด dropdown

  // ตั้งค่าเมนูที่ active จาก path
  useEffect(() => {
  if (pathname === '/super/communities') setActiveMenuKey('communities');
  else if (pathname === '/super/user/blocked') { setActiveMenuKey('user-blocked'); setOpenDropdown('users'); }
  else if (pathname.startsWith('/super/users')) { setActiveMenuKey('users'); setOpenDropdown('users'); }
  else if (pathname === '/super/package-requests') { setActiveMenuKey('package-requests'); setOpenDropdown('packages'); }
  else if (pathname.startsWith('/super/packages')) { setActiveMenuKey('packages'); setOpenDropdown('packages'); }
  else if (pathname === '/super/tags') setActiveMenuKey('tags');
  else if (pathname === '/super/dashboard') setActiveMenuKey('dashboard');
  else if (pathname === '/super/logs') setActiveMenuKey('logs');
  else if (pathname === '/super/setting') setActiveMenuKey('setting');
  else if (pathname === '/super/logout') setActiveMenuKey('logout');
  else setActiveMenuKey(null);
}, [pathname]);


  // สำหรับเปลี่ยนเมนูที่ active และเปิด dropdown ถ้าเกี่ยวข้อง
  const handleClick = (key: MenuKey, parentKey?: MenuKey) => {
    setActiveMenuKey(key);
    if (parentKey) {
      setOpenDropdown(parentKey); // submenu → เปิด parent dropdown
    } else {
      setOpenDropdown(prev => (prev === key ? null : key)); // toggle dropdown
    }
  };

  const isActive = (key: MenuKey) => activeMenuKey === key;

  return (
    <div className="h-screen w-60 bg-[#055035] text-white flex flex-col justify-between py-6 px-4">
      <div>
        <div className="flex items-center justify-center mb-6">
          <img src="/Cultura.png" alt="Cultura logo" className="h-10" />
        </div>

        <nav className="flex flex-col gap-2 text-base-semibold">

          {/* จัดการชุมชน */}
          <Link
            to="/super/communities"
            onClick={() => handleClick('communities')}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive('communities') ? 'bg-[#0D845A]' : ''}`}
          >
            <Icon icon="ri:community-line" className="text-xl" />
            จัดการชุมชน
          </Link>

          {/* จัดการบัญชี */}
          <div>
            <button
              onClick={() => handleClick('users')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${isActive('users') ? 'bg-[#0D845A]' : ''}`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="mdi:account-cog-outline" className="text-xl" />
                จัดการบัญชี
              </span>
              <Icon icon={openDropdown === 'users' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            </button>

            {openDropdown === 'users' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/super/user/blocked"
                  onClick={() => handleClick('user-blocked', 'users')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('user-blocked') ? 'bg-[#0D845A]' : ''}`}
                >
                  การระงับบัญชี
                </Link>
              </div>
            )}
          </div>

          {/* จัดการแพ็กเกจ */}
          <div>
            <button
              onClick={() => handleClick('packages')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${isActive('packages') ? 'bg-[#0D845A]' : ''}`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="material-symbols:card-travel-outline" className="text-xl" />
                จัดการแพ็กเกจ
              </span>
              <Icon icon={openDropdown === 'packages' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            </button>

            {openDropdown === 'packages' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/super/package-requests"
                  onClick={() => handleClick('package-requests', 'packages')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('package-requests') ? 'bg-[#0D845A]' : ''}`}
                >
                  คำขออนุมัติ
                </Link>
              </div>
            )}
          </div>

          {/* จัดการประเภท */}
          <Link
            to="/super/tags"
            onClick={() => handleClick('tags')}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive('tags') ? 'bg-[#0D845A]' : ''}`}
          >
            <Icon icon="bi:tags" className="text-xl" />
            จัดการประเภท
          </Link>

          {/* รายงาน */}
          <Link
            to="/super/dashboard"
            onClick={() => handleClick('dashboard')}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive('dashboard') ? 'bg-[#0D845A]' : ''}`}
          >
            <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
            รายงาน
          </Link>

          {/* ประวัติการเข้าใช้งาน */}
          <Link
            to="/super/logs"
            onClick={() => handleClick('logs')}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive('logs') ? 'bg-[#0D845A]' : ''}`}
          >
            <Icon icon="ix:log" className="text-xl" />
            ประวัติการเข้าใช้งาน
          </Link>
        </nav>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        {/* ตั้งค่า */}
        <Link
          to="/super/setting"
          onClick={() => handleClick('setting')}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive('setting') ? 'bg-[#0D845A]' : ''}`}
        >
          <Icon icon="mdi:cog-outline" className="text-xl" />
          การตั้งค่า
        </Link>

        {/* ออกจากระบบ */}
        <Link
          to="/super/logout"
          onClick={() => handleClick('logout')}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive('logout') ? 'bg-[#0D845A]' : ''}`}
        >
          <Icon icon="mdi:logout" className="text-xl" />
          ออกจากระบบ
        </Link>
      </div>
    </div>
  );
};

export default SidebarSuperAdmin;
