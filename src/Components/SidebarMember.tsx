/**
 * Component: SidebarMember
 * คำอธิบาย: แถบเมนูด้านข้างสำหรับสมาชิกทั่วไป (Member)
 * Features:
 * - แสดงเมนูที่เกี่ยวข้องกับการจัดการของสมาชิก เช่น ชุมชน, แพ็กเกจ, การจอง
 * - รองรับเมนูหลักและเมนูย่อยแบบ dropdown
 * - ใช้ React Router สำหรับการนำทางภายในระบบ
 *  * - ใช้ไอคอนจาก Iconify
 */

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "@/Libs/useAuth";

type MenuKey =
  | 'community'
  | 'packages'
  | 'packages-draft'
  | 'packages-done'
  | 'feedbacks'
  | 'booking'
  | 'booking-refunds'
  | 'booking-done'
  | 'dashboard'
  | 'logout'
  | null;

const SidebarMember: React.FC = () => {
  const location = useLocation();
  const { pathname } = location;
  const { logout } = useAuth();

  const basePath = pathname.startsWith('/member') ? '/member' : '';

  const [activeMenuKey, setActiveMenuKey] = useState<MenuKey>(null);
  const [openDropdown, setOpenDropdown] = useState<MenuKey | null>(null);

  useEffect(() => {
    let subPath = pathname;
    if (basePath) {
      subPath = pathname.substring(basePath.length);
      if (!subPath.startsWith('/')) {
        subPath = '/' + subPath;
      }
    }

    if (subPath.startsWith('/community/own')) {
      setActiveMenuKey('community');
      setOpenDropdown(null);
    } else if (subPath === '/packages/draft') {
      setActiveMenuKey('packages-draft');
      setOpenDropdown('packages');
    } else if (subPath === '/packages/done') {
      setActiveMenuKey('packages-done');
      setOpenDropdown('packages');
    } else if (subPath === '/feedbacks') {
      setActiveMenuKey('feedbacks');
      setOpenDropdown('packages');
    } else if (subPath.startsWith('/packages/all')) {
      setActiveMenuKey('packages');
      setOpenDropdown('packages');
    } else if (subPath === '/bookings/refunded-pending') {
      setActiveMenuKey('booking-refunds');
      setOpenDropdown('booking');
    } else if (subPath === '/bookings-histories') {
      setActiveMenuKey('booking-done');
      setOpenDropdown('booking');
    } else if (subPath.startsWith('/bookings/panding')) {
      setActiveMenuKey('booking');
      setOpenDropdown('booking');
    } else if (subPath === '/dashboard') {
      setActiveMenuKey('dashboard');
      setOpenDropdown(null);
    } else if (subPath === '/logout') {
      setActiveMenuKey('logout');
      setOpenDropdown(null);
    } else {
      setActiveMenuKey(null);
      setOpenDropdown(null);
    }
  }, [pathname, basePath]);

  const handleClick = (key: MenuKey, parentKey?: MenuKey) => {
    setActiveMenuKey(key);
    if (parentKey) {
      setOpenDropdown(parentKey);
    } else {
      setOpenDropdown(prev => (prev === key ? null : key));
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
          {/* ชุมชนของฉัน */}
          <Link
            to={`${basePath}/community/own`}
            onClick={() => handleClick('community')}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive('community') ? 'bg-[#0D845A]' : ''
              }`}
          >
            <Icon icon="material-symbols:group-outline" className="text-xl" />
            ชุมชนของฉัน
          </Link>

          {/* จัดการแพ็กเกจ */}
          <div>
            <Link
              to={`${basePath}/packages/all`}
              onClick={() => handleClick('packages')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${isActive('packages') ? 'bg-[#0D845A]' : ''
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="material-symbols:card-travel-outline" className="text-xl" />
                จัดการแพ็กเกจ
              </span>
              <Icon icon={openDropdown === 'packages' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            </Link>

            {openDropdown === 'packages' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to={`${basePath}/packages/draft`}
                  onClick={() => handleClick('packages-draft', 'packages')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('packages-draft') ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  ฉบับร่าง
                </Link>
                <Link
                  to={`${basePath}/packages/done`}
                  onClick={() => handleClick('packages-done', 'packages')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('packages-done') ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  ประวัติแพ็กเกจ
                </Link>
                <Link
                  to={`${basePath}/feedbacks`}
                  onClick={() => handleClick('feedbacks', 'packages')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('feedbacks') ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  ข้อเสนอแนะ
                </Link>
              </div>
            )}
          </div>

          {/* จัดการการจอง */}
          <div>
            <Link
              to={`${basePath}/bookings/panding`}
              onClick={() => handleClick('booking')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${isActive('booking') ? 'bg-[#0D845A]' : ''
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="fluent-mdl2:reservation-orders" className="text-xl" />
                จัดการการจอง
              </span>
              <Icon icon={openDropdown === 'booking' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            </Link>

            {openDropdown === 'booking' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to={`${basePath}/bookings/refunded-pending`}
                  onClick={() => handleClick('booking-refunds', 'booking')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('booking-refunds') ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  คำขอคืนเงิน
                </Link>
                <Link
                  to={`${basePath}/bookings-histories`}
                  onClick={() => handleClick('booking-done', 'booking')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('booking-done') ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  ประวัติการจอง
                </Link>
              </div>
            )}
          </div>

          {/* รายงาน */}
          <Link
            to={`${basePath}/dashboard`}
            onClick={() => handleClick('dashboard')}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive('dashboard') ? 'bg-[#0D845A]' : ''
              }`}
          >
            <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
            รายงาน
          </Link>
        </nav>
      </div>

      {/* ออกจากระบบ */}
      <div className="flex flex-col gap-2 text-base-semibold">
        <button
          onClick={() => {
            handleClick('logout');
            logout();
          }}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition w-full text-left ${isActive('logout') ? 'bg-[#0D845A]' : ''
            }`}
        >
          <Icon icon="solar:logout-2-outline" className="text-xl" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default SidebarMember;
