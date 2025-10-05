/*
 * คำอธิบาย : Component Sidebar สำหรับสมาชิก (Member)
 * สมาชิกสามารถจัดการแพ็กเกจ, การจอง, รายงาน และออกจากระบบ
 */
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';

const SidebarMember = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const location = useLocation();

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
        <nav className="flex flex-col gap-2 text-sm">
          {/* ชุมชนของฉัน */}
          <div>
            <Link to="/communities">
              <button
                onClick={() => toggleSubMenu('community')}
                className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${activeSubMenu === 'community' || location.pathname.startsWith('/community') ? 'bg-[#0D845A]' : ''
                  }`}
              >
                <span className="flex items-center gap-3">
                  <Icon icon="material-symbols:group-outline" className="text-xl" />
                  ชุมชนของฉัน
                </span>
                
              </button>
            </Link>
          </div>
          {/* จัดการแพ็กเกจ */}
          <div>
            <Link to="/packages">
              <button
                onClick={() => toggleSubMenu('package')}
                className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${activeSubMenu === 'package' || location.pathname.startsWith('/package') ? 'bg-[#0D845A]' : ''
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
                  to="/package/draft"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/package/draft' ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  ฉบับร่าง
                </Link>
                <Link
                  to="/package/done"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/package/history' ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  ประวัติแพ็กเกจ
                </Link>
                <Link
                  to="/package/reviews"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/package/reviews' ? 'bg-[#0D845A]' : ''
                    }`}
                >
                  ข้อเสนอแนะ
                </Link>
              </div>
            )}
          </div>

          {/* จัดการการจอง */}
          <div>
            <Link to="/bookings">
              <button
                onClick={() => toggleSubMenu('booking')}
                className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${activeSubMenu === 'booking' || location.pathname.startsWith('/booking') ? 'bg-[#0D845A]' : ''
                  }`}
              >
                <span className="flex items-center gap-3">
                  <Icon icon="fluent-mdl2:reservation-orders" className="text-xl" />
                  จัดการการจอง
                </span>
                <Icon icon={activeSubMenu === 'booking' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
              </button>
            </Link>
            {(activeSubMenu === 'booking' || location.pathname.startsWith('/booking')) && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/booking/refunds"
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${location.pathname === '/booking/refund' ? 'bg-[#0D845A]' : ''
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
};

export default SidebarMember;
