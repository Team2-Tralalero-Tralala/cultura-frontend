/*
 * คำอธิบาย : Component Sidebar สำหรับผู้ดูแล (Admin)
  * ผู้ดูแลสามารถจัดการชุมชน, สมาชิก, แพ็กเกจ, การจอง, รายงาน, ประวัติการเข้าใช้งาน และออกจากระบบ
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';

const SidebarAdmin = () => {
  const location = useLocation();
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  // ตรวจสอบ path เพื่อ set active submenu ตอนโหลดหน้า
  useEffect(() => {
    if (location.pathname.startsWith('/community')) setActiveSubMenu('community');
    else if (location.pathname.startsWith('/member')) setActiveSubMenu('member');
    else if (location.pathname.startsWith('/package')) setActiveSubMenu('package');
    else if (location.pathname.startsWith('/booking')) setActiveSubMenu('booking');
    else setActiveSubMenu(null);
  }, [location.pathname]);

  // ถ้ากดเปิด/ปิด main menu ให้ reset submenu item ไปด้วย
  const toggleSubMenu = (menu: string) => {
    setActiveSubMenu(activeSubMenu === menu ? null : menu);
  };

  return (
    <div className="h-screen w-60 bg-[#055035] text-white flex flex-col justify-between py-6 px-4">
      <div>
        {/* โลโก้ */}
        <div className="flex items-center justify-center mb-6">
          <img src="/Cultura.png" alt="Cultura logo" className="h-10" />
        </div>
        {/* เมนู */}
        <nav className="flex flex-col gap-2 text-base-semibold">
          {/* จัดการชุมชน + sub menu */}
          <div>
            <Link to="/communities">
              <button
                onClick={() => toggleSubMenu('community')}
                className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition
                  ${activeSubMenu === 'community' ? 'bg-[#0D845A]' : ''}
                `}
              >
                <span className="flex items-center gap-3">
                  <Icon icon="ri:community-line" className="text-xl" />
                  จัดการชุมชน
                </span>
                <Icon icon={activeSubMenu === 'community' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
              </button>
            </Link>

            {activeSubMenu === 'community' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/community/stores"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/community/stores' ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  จัดการร้านค้า
                </Link>
                <Link
                  to="/community/homestays"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/community/homestays' ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  จัดการที่พัก
                </Link>
              </div>
            )}
          </div>

          {/* จัดการสมาชิก + sub menu */}
          <div>
            <Link to="/members">
              <button
                onClick={() => toggleSubMenu('member')}
                className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition
                ${activeSubMenu === 'member' ? 'bg-[#0D845A]' : ''}
              `}
              >
                <span className="flex items-center gap-3">
                  <Icon icon="mdi:account-cog-outline" className="text-xl" />
                  จัดการสมาชิก
                </span>
                <Icon icon={activeSubMenu === 'member' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
              </button>
            </Link>
            {activeSubMenu === 'member' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/member/status"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/member/status' ? 'bg-[#0D845A]' : ''
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
                className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition
                ${activeSubMenu === 'package' ? 'bg-[#0D845A]' : ''}
              `}
              >
                <span className="flex items-center gap-3">
                  <Icon icon="material-symbols:card-travel-outline" className="text-xl" />
                  จัดการแพ็กเกจ
                </span>
                <Icon icon={activeSubMenu === 'package' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
              </button>
            </Link>
            {activeSubMenu === 'package' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/package/requests"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/package/requests' ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  คำขออนุมัติ
                </Link>
                <Link
                  to="/package/draft"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/package/draft' ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  ฉบับร่าง
                </Link>
                <Link
                  to="/package/histories"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/package/histories' ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  ประวัติแพ็กเกจ
                </Link>
                <Link
                  to="/package/feedbacks"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/package/feedbacks' ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  ข้อเสนอแนะ
                </Link>
              </div>
            )}
          </div>

          {/* จัดการการจอง + sub menu */}
          <div>
            <Link to="/bookings">
              <button
                onClick={() => toggleSubMenu('booking')}
                className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition
                ${activeSubMenu === 'booking' ? 'bg-[#0D845A]' : ''}
              `}
              >
                <span className="flex items-center gap-3">
                  <Icon icon="fluent-mdl2:reservation-orders" className="text-xl" />
                  จัดการการจอง
                </span>
                <Icon icon={activeSubMenu === 'booking' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
              </button>
            </Link>

            {activeSubMenu === 'booking' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/booking/refunds"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/booking/refunds' ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  คำขอคืนเงิน
                </Link>

                <Link
                  to="/booking/histories"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/booking/histories' ? 'bg-[#0D845A]' : ''
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
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/dashboard' ? 'bg-[#0D845A]' : ''
              }`}
          >
            <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
            รายงาน
          </Link>

          {/* ประวัติการเข้าใช้งาน */}
          <Link
            to="/logs"
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/logs' ? 'bg-[#0D845A]' : ''
              }`}
          >
            <Icon icon="ix:log" className="text-xl" />
            ประวัติการเข้าใช้งาน
          </Link>
        </nav>
      </div>

      {/* ออกจากระบบ */}
      <div className="flex flex-col gap-2 text-sm">
        <Link
          to="/logout"
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/logout' ? 'bg-[#0D845A]' : ''
            }`}
        >
          <Icon icon="solar:logout-2-outline" className="text-xl" />
          ออกจากระบบ
        </Link>
      </div>
    </div>
  );
}
export default SidebarAdmin;