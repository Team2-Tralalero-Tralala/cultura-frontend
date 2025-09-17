import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const SidebarAdmin = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  const toggleSubMenu = (menu: string) => {
    setActiveSubMenu(prev => (prev === menu ? null : menu));
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
          {/* จัดการชุมชน + sub menu จัดการร้านค้า, จัดการที่พัก*/}
          <div>
            <button
              onClick={() => toggleSubMenu('community')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${activeSubMenu === 'community' ? 'bg-[#0D845A]' : ''
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="ri:community-line" className="text-xl" />
                จัดการชุมชน
              </span>
              <Icon icon={activeSubMenu === 'community' ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="text-sm" />
            </button>
            {activeSubMenu === 'community' && (
              <div className="ml-8 mt-1 flex flex-col gap-1">
                {/* sub menu จัดการร้านค้า, จัดการที่พัก */}
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base-semibold">จัดการร้านค้า</a>
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base-semibold">จัดการที่พัก</a>
              </div>
            )}
          </div>

          {/* จัดการสมาชิก + sub menu การระงับบัญชี*/}
          <div>
            <button
              onClick={() => toggleSubMenu('member')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition text-base-semibold ${activeSubMenu === 'member' ? 'bg-[#0D845A]' : ''
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="mdi:account-cog-outline" className="text-xl" />
                จัดการสมาชิก
              </span>
              <Icon icon={activeSubMenu === 'member' ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="text-sm" />
            </button>
            {activeSubMenu === 'member' && (
              //sub menu การระงับบัญชี
              <div className="ml-8 mt-1 flex flex-col gap-1">
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base-semibold">การระงับบัญชี</a>
              </div>
            )}
          </div>

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
              // Sub menu คำขออนุมัติ, ฉบับร่าง, ประวัติแพ็กเกจ, ข้อเสนอแนะ
              <div className="ml-8 mt-1 flex flex-col gap-1">
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base-semibold">คำขออนุมัติ</a>
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base-semibold">ฉบับร่าง</a>
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base-semibold">ประวัติแพ็กเกจ</a>
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base-semibold">ข้อเสนอแนะ</a>
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
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base-semibold">คำขอคืนเงิน</a>
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base-semibold">ประวัติการจอง</a>
              </div>
            )}
          </div>

          {/* รายงาน */}

          <a href="#" className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition">
            <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
            รายงาน
          </a>
          {/* ประวัติการเข้าใช้งาน */}
          <a href="#" className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition">
            <Icon icon="ix:log" className="text-xl" />
            ประวัติการเข้าใช้งาน
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

export default SidebarAdmin;
