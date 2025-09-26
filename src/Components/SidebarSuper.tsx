/*
 * คำอธิบาย : Component Sidebar สำหรับผู้ดูแลระบบ (Super Admin)
 * ผู้ดูแลระบบสามารถจัดการชุมชน, บัญชี, แพ็กเกจ, ประเภท, รายงาน และประวัติการเข้าใช้งานได้
 * รวมถึงการตั้งค่าระบบและออกจากระบบ
 */
import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const SidebarSuper = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [activeSubMenuItem, setActiveSubMenuItem] = useState<string | null>(null);

  const toggleSubMenu = (menu: string) => {
    if (activeSubMenu === menu) {
      setActiveSubMenu(null);
      setActiveSubMenuItem(null);
    } else {
      setActiveSubMenu(menu);
      setActiveSubMenuItem(null);
    }
  };

  const onClickSubMenuItem = (item: string, parentMenu: string) => {
    setActiveSubMenuItem(item);
    setActiveSubMenu(null);
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
          {/* จัดการชุมชน */}
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition"
            onClick={e => e.preventDefault()}
          >
            <Icon icon="ri:community-line" className="text-xl" />
            จัดการชุมชน
          </a>

          {/* จัดการบัญชี + sub menu การระงับบัญชี */}
          <div>
            <button
              onClick={() => toggleSubMenu('account')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${
                activeSubMenu === 'account' ? 'bg-[#0D845A]' : ''
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="mdi:account-cog-outline" className="text-xl" />
                จัดการบัญชี
              </span>
              <Icon icon={activeSubMenu === 'account' ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="text-sm" />
            </button>
            {(activeSubMenu === 'account' || activeSubMenuItem?.startsWith('account-')) && (
              <div className="relative ml-4 mt-1 flex flex-col gap-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/40">
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onClickSubMenuItem('account-suspend', 'account');
                  }}
                  className={`relative pl-8 p-2 rounded hover:bg-[#0D845A] text-base-semibold ${
                    activeSubMenuItem === 'account-suspend' ? 'bg-[#0D845A]' : ''
                  }`}
                >
                  การระงับบัญชี
                </a>
              </div>
            )}
          </div>

          {/* จัดการแพ็กเกจ + sub menu คำขออนุมัติ */}
          <div>
            <button
              onClick={() => toggleSubMenu('package')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${
                activeSubMenu === 'package' ? 'bg-[#0D845A]' : ''
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="material-symbols:card-travel-outline" className="text-xl" />
                จัดการแพ็กเกจ
              </span>
              <Icon icon={activeSubMenu === 'package' ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="text-sm" />
            </button>
            {(activeSubMenu === 'package' || activeSubMenuItem?.startsWith('package-')) && (
              <div className="relative ml-4 mt-1 flex flex-col gap-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/40">
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onClickSubMenuItem('package-approve', 'package');
                  }}
                  className={`relative pl-8 p-2 rounded hover:bg-[#0D845A] text-base-semibold ${
                    activeSubMenuItem === 'package-approve' ? 'bg-[#0D845A]' : ''
                  }`}
                >
                  คำขออนุมัติ
                </a>
              </div>
            )}
          </div>

          {/* จัดการประเภท */}
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition"
            onClick={e => e.preventDefault()}
          >
            <Icon icon="bi:tags" className="text-xl" />
            จัดการประเภท
          </a>

          {/* รายงาน */}
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition"
            onClick={e => e.preventDefault()}
          >
            <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
            รายงาน
          </a>

          {/* ประวัติการเข้าใช้งาน */}
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition"
            onClick={e => e.preventDefault()}
          >
            <Icon icon="ix:log" className="text-xl" />
            ประวัติการเข้าใช้งาน
          </a>
        </nav>
      </div>

      {/* ตั้งค่าระบบ */}
      <div className="flex flex-col gap-2 text-sm">
        <a
          href="#"
          className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition"
          onClick={e => e.preventDefault()}
        >
          <Icon icon="mdi:cog-outline" className="text-xl" />
          การตั้งค่า
        </a>
        <a
          href="#"
          className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition"
          onClick={e => e.preventDefault()}
        >
          <Icon icon="solar:logout-2-outline" className="text-xl" />
          ออกจากระบบ
        </a>
      </div>
    </div>
  );
};

export default SidebarSuper;
