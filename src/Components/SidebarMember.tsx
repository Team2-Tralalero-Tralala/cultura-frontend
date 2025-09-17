import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const SidebarMember = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  const toggleSubMenu = (menu: string) => {
    setActiveSubMenu(prev => (prev === menu ? null : menu));
  };

  return (
    <div className="h-screen w-60 bg-[#055035] text-white flex flex-col justify-between py-6 px-4">
      {/* ส่วนบน: โลโก้ + เมนู */}
      <div>
        {/* โลโก้ */}
        <div className="flex items-center justify-center mb-6">
          <img src="/Cultura.png" alt="Cultura logo" className="h-10" />
        </div>

        {/* เมนู */}
        <nav className="flex flex-col gap-2 text-sm">
          {/* จัดการแพ็กเกจ + sub menu */}
          <div>
            <button
              onClick={() => toggleSubMenu('package')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${activeSubMenu === 'package' ? 'bg-[#0D845A]' : ''
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="material-symbols:card-travel-outline" className="text-xl" />
                จัดการแพ็กเกจ
              </span>
              <Icon icon={activeSubMenu === 'package' ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="text-sm" />
            </button>
            {activeSubMenu === 'package' && (
              //sub menu ฉบับร่าง, ประวัติแพ็กเกจ, ข้อเสนอแนะ
              <div className="ml-8 mt-1 flex flex-col gap-1">
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-sm">ฉบับร่าง</a>
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-sm">ประวัติแพ็กเกจ</a>
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-sm">ข้อเสนอแนะ</a>
              </div>
            )}
          </div>

          {/* จัดการการจอง + sub menu */}
          <div>
            <button
              onClick={() => toggleSubMenu('booking')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${activeSubMenu === 'booking' ? 'bg-[#0D845A]' : ''
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="fluent-mdl2:reservation-orders" className="text-xl" />
                จัดการการจอง
              </span>
              <Icon icon={activeSubMenu === 'booking' ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="text-sm" />
            </button>
            {activeSubMenu === 'booking' && (
              //sub menu คำขอคืนเงิน, ประวัติการจอง
              <div className="ml-8 mt-1 flex flex-col gap-1">
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base">คำขอคืนเงิน</a>
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base">ประวัติการจอง</a>
              </div>
            )}
          </div>

          {/* รายงาน */}
          <a href="#" className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition">
            <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
            รายงาน
          </a>
        </nav>
      </div>

      {/* ออกจากระบบ */}
      <div className="flex flex-col gap-2 text-sm">
        <a href="#" className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition">
          <Icon icon="solar:logout-2-outline" className="text-xl" />
          ออกจากระบบ
        </a>
      </div>
    </div>
  );
};

export default SidebarMember;
