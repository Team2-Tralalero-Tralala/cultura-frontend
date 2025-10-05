import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';

// กำหนด type ของ key แต่ละเมนู เพื่อใช้ตรวจสอบสถานะ active และ dropdown
type MenuKey =
  | 'community'
  | 'package'
  | 'package-draft'
  | 'package-history'
  | 'package-feedback'
  | 'booking'
  | 'booking-refunds'
  | 'booking-histories'
  | 'dashboard'
  | 'logout'
  | null;

const SidebarMember = () => {
  const location = useLocation();
  const { pathname } = location;

  // เก็บเมนูที่ active ตาม path ปัจจุบัน
  const [activeMenuKey, setActiveMenuKey] = useState<MenuKey>(null);
  // เก็บ dropdown ที่เปิดอยู่ (ถ้ามี)
  const [openDropdown, setOpenDropdown] = useState<MenuKey | null>(null);

  // useEffect ตรวจจับ path ที่เปลี่ยน เพื่ออัปเดตเมนูที่ active และ dropdown
  useEffect(() => {
    if (pathname.startsWith('/community')) {
      setActiveMenuKey('community');
      setOpenDropdown(null);
    } else if (pathname === '/package/draft') {
      setActiveMenuKey('package-draft');
      setOpenDropdown('package');
    } else if (pathname === '/package/done') {
      setActiveMenuKey('package-history');
      setOpenDropdown('package');
    } else if (pathname === '/package/reviews') {
      setActiveMenuKey('package-feedback');
      setOpenDropdown('package');
    } else if (pathname.startsWith('/package')) {
      setActiveMenuKey('package');
      setOpenDropdown('package');
    } else if (pathname === '/booking/refunds') {
      setActiveMenuKey('booking-refunds');
      setOpenDropdown('booking');
    } else if (pathname === '/booking/histories') {
      setActiveMenuKey('booking-histories');
      setOpenDropdown('booking');
    } else if (pathname.startsWith('/booking')) {
      setActiveMenuKey('booking');
      setOpenDropdown('booking');
    } else if (pathname === '/dashboard') {
      setActiveMenuKey('dashboard');
      setOpenDropdown(null);
    } else if (pathname === '/logout') {
      setActiveMenuKey('logout');
      setOpenDropdown(null);
    } else {
      setActiveMenuKey(null);
      setOpenDropdown(null);
    }
  }, [pathname]);

  // ฟังก์ชันจัดการคลิกเมนู
  // ถ้ามี parentKey ให้ตั้ง active เมนูย่อยและเปิด dropdown ของ parent
  // ถ้าไม่มี parentKey ให้ toggle dropdown ของเมนูหลัก
  const handleClick = (key: MenuKey, parentKey?: MenuKey) => {
    setActiveMenuKey(key);
    if (parentKey) {
      setOpenDropdown(parentKey);
    } else {
      setOpenDropdown((prev) => (prev === key ? null : key));
    }
  };

  // ตรวจสอบว่าเมนูนั้น ๆ active หรือไม่ เพื่อใช้ตั้ง className
  const isActive = (key: MenuKey) => activeMenuKey === key;

  return (
    <div className="h-screen w-60 bg-[#055035] text-white flex flex-col justify-between py-6 px-4">
      <div>
        {/* โลโก้ */}
        <div className="flex items-center justify-center mb-6">
          <img src="/Cultura.png" alt="Cultura logo" className="h-10" />
        </div>

        {/* เมนู */}
        <nav className="flex flex-col gap-2 text-sm">
          {/* ชุมชนของฉัน */}
          <Link
            to="/communities"
            onClick={() => handleClick('community')}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${
              isActive('community') ? 'bg-[#0D845A]' : ''
            }`}
          >
            <Icon icon="material-symbols:group-outline" className="text-xl" />
            ชุมชนของฉัน
          </Link>

          {/* จัดการแพ็กเกจ */}
          <div>
            <button
              onClick={() => handleClick('package')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${
                isActive('package') ? 'bg-[#0D845A]' : ''
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="material-symbols:card-travel-outline" className="text-xl" />
                จัดการแพ็กเกจ
              </span>
              <Icon icon={openDropdown === 'package' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            </button>

            {/* แสดงเมนูย่อยถ้า dropdown เปิด */}
            {openDropdown === 'package' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/package/draft"
                  onClick={() => handleClick('package-draft', 'package')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${
                    isActive('package-draft') ? 'bg-[#0D845A]' : ''
                  }`}
                >
                  ฉบับร่าง
                </Link>
                <Link
                  to="/package/done"
                  onClick={() => handleClick('package-history', 'package')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${
                    isActive('package-history') ? 'bg-[#0D845A]' : ''
                  }`}
                >
                  ประวัติแพ็กเกจ
                </Link>
                <Link
                  to="/package/reviews"
                  onClick={() => handleClick('package-feedback', 'package')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${
                    isActive('package-feedback') ? 'bg-[#0D845A]' : ''
                  }`}
                >
                  ข้อเสนอแนะ
                </Link>
              </div>
            )}
          </div>

          {/* จัดการการจอง */}
          <div>
            <button
              onClick={() => handleClick('booking')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${
                isActive('booking') ? 'bg-[#0D845A]' : ''
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="fluent-mdl2:reservation-orders" className="text-xl" />
                จัดการการจอง
              </span>
              <Icon icon={openDropdown === 'booking' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            </button>

            {/* แสดงเมนูย่อยถ้า dropdown เปิด */}
            {openDropdown === 'booking' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/booking/refunds"
                  onClick={() => handleClick('booking-refunds', 'booking')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${
                    isActive('booking-refunds') ? 'bg-[#0D845A]' : ''
                  }`}
                >
                  คำขอคืนเงิน
                </Link>
                <Link
                  to="/booking/histories"
                  onClick={() => handleClick('booking-histories', 'booking')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${
                    isActive('booking-histories') ? 'bg-[#0D845A]' : ''
                  }`}
                >
                  ประวัติการจอง
                </Link>
              </div>
            )}
          </div>

          {/* รายงาน */}
          <Link
            to="/dashboard"
            onClick={() => handleClick('dashboard')}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${
              isActive('dashboard') ? 'bg-[#0D845A]' : ''
            }`}
          >
            <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
            รายงาน
          </Link>
        </nav>
      </div>

      {/* ออกจากระบบ */}
      <div className="flex flex-col gap-2 text-sm">
        <Link
          to="/logout"
          onClick={() => handleClick('logout')}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${
            isActive('logout') ? 'bg-[#0D845A]' : ''
          }`}
        >
          <Icon icon="solar:logout-2-outline" className="text-xl" />
          ออกจากระบบ
        </Link>
      </div>
    </div>
  );
};

export default SidebarMember;
