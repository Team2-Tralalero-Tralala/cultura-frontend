import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const SidebarSuper = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  const toggleSubMenu = (menu: string) => {
    setActiveSubMenu(prev => (prev === menu ? null : menu));
  };

  return (
    <div className="h-screen w-60 bg-[#055035] text-white flex flex-col justify-between py-6 px-4">
      <div>
        {/* โลโก้ */}
        <div className="flex items-center justify-center mb-6">
          <img src="public/Cultura.png" alt="Cultura logo" className="h-10" />
        </div>

        {/* เมนู */}
        <nav className="flex flex-col gap-2 text-base-semibold">
          {/* จัดการชุมชน */}
          <a href="#" className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition">
            <Icon icon="ri:community-line" className="text-xl" />
            จัดการชุมชน
          </a>

          {/* จัดการบัญชี + sub menu การระงับบัญชี*/}
          <div>
            <button
              onClick={() => toggleSubMenu('account')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${activeSubMenu === 'account' ? 'bg-[#0D845A]' : ''
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="mdi:account-cog-outline" className="text-xl" />
                จัดการบัญชี
              </span>
              <Icon icon={activeSubMenu === 'account' ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="text-sm" />
            </button>
            {activeSubMenu === 'account' && (
              //sub menu การระงับบัญชี
              <div className="ml-8 mt-1 flex flex-col gap-1">
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base-semibold">การระงับบัญชี</a>
              </div>
            )}
          </div>

          {/* จัดการแพ็กเกจ + sub menu คำขออนุมััติ*/}
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
              // Sub menu คำขออนุมัติ
              <div className="ml-8 mt-1 flex flex-col gap-1">
                <a href="#" className="p-2 rounded hover:bg-[#0D845A] text-base-semibold">คำขออนุมัติ</a>
              </div>
            )}
          </div>
          {/* จัดการประเภท */}
          <a href="#" className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition">
            <Icon icon="bi:tags" className="text-xl" />
            จัดการประเภท
          </a>
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

      {/* ตั้งค่าระบบ */}
      <div className="flex flex-col gap-2 text-sm">
        <a href="#" className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition">
          <Icon icon="mdi:cog-outline" className="text-xl" />
          การตั้งค่า
        </a>
        <a href="#" className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition">
          <Icon icon="solar:logout-2-outline" className="text-xl" />
          ออกจากระบบ
        </a>
      </div>
    </div>
  );
};

export default SidebarSuper;
