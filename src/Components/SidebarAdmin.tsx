/*
 * คำอธิบาย : Component Sidebar สำหรับผู้ดูแล (Admin)
  * ผู้ดูแลสามารถจัดการชุมชน, สมาชิก, แพ็กเกจ, การจอง, รายงาน, ประวัติการเข้าใช้งาน และออกจากระบบ
 */
import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const SidebarAdmin = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);  // menu หลักที่เปิด submenu
  const [activeSubMenuItem, setActiveSubMenuItem] = useState<string | null>(null); // submenu ที่ถูกคลิก

  const toggleSubMenu = (menu: string) => {
    // ถ้ากดเปิด/ปิด main menu ให้ reset submenu item ไปด้วย
    if (activeSubMenu === menu) {
      setActiveSubMenu(null);
      setActiveSubMenuItem(null);
    } else {
      setActiveSubMenu(menu);
      setActiveSubMenuItem(null);
    }
  };

  const onClickSubMenuItem = (menuItem: string, parentMenu: string) => {
    // ตั้ง submenu ที่คลิก
    setActiveSubMenuItem(menuItem);
    // ปิด main menu hover
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
          {/* จัดการชุมชน + sub menu */}
          <div>
            <button
              onClick={() => toggleSubMenu('community')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition 
                ${activeSubMenu === 'community' && !activeSubMenuItem ? 'bg-[#0D845A]' : ''}
              `}
            >
              <span className="flex items-center gap-3">
                <Icon icon="ri:community-line" className="text-xl" />
                จัดการชุมชน
              </span>
              <Icon icon={activeSubMenu === 'community' ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="text-sm" />
            </button>
            {(activeSubMenu === 'community' || activeSubMenuItem?.startsWith('community-')) && (
              <div className="relative ml-4 mt-1 flex flex-col gap-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/40">
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onClickSubMenuItem('community-store', 'community');
                  }}
                  className={`relative pl-8 p-2 rounded hover:bg-[#0D845A] text-base-semibold 
                    ${activeSubMenuItem === 'community-store' ? 'bg-[#0D845A]' : ''}
                  `}
                >
                  จัดการร้านค้า
                </a>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onClickSubMenuItem('community-lodging', 'community');
                  }}
                  className={`relative pl-8 p-2 rounded hover:bg-[#0D845A] text-base-semibold 
                    ${activeSubMenuItem === 'community-lodging' ? 'bg-[#0D845A]' : ''}
                  `}
                >
                  จัดการที่พัก
                </a>
              </div>
            )}
          </div>

          {/* จัดการสมาชิก + sub menu */}
          <div>
            <button
              onClick={() => toggleSubMenu('member')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition
                ${activeSubMenu === 'member' && !activeSubMenuItem ? 'bg-[#0D845A]' : ''}
              `}
            >
              <span className="flex items-center gap-3">
                <Icon icon="mdi:account-cog-outline" className="text-xl" />
                จัดการสมาชิก
              </span>
              <Icon icon={activeSubMenu === 'member' ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="text-sm" />
            </button>
            {(activeSubMenu === 'member' || activeSubMenuItem?.startsWith('member-')) && (
              <div className="relative ml-4 mt-1 flex flex-col gap-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/40">
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onClickSubMenuItem('member-suspend', 'member');
                  }}
                  className={`relative pl-8 p-2 rounded hover:bg-[#0D845A] text-base-semibold
                    ${activeSubMenuItem === 'member-suspend' ? 'bg-[#0D845A]' : ''}
                  `}
                >
                  การระงับบัญชี
                </a>
              </div>
            )}
          </div>

          {/* จัดการแพ็กเกจ + sub menu */}
          <div>
            <button
              onClick={() => toggleSubMenu('package')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition
                ${activeSubMenu === 'package' && !activeSubMenuItem ? 'bg-[#0D845A]' : ''}
              `}
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
                  className={`relative pl-8 p-2 rounded hover:bg-[#0D845A] text-base-semibold
                    ${activeSubMenuItem === 'package-approve' ? 'bg-[#0D845A]' : ''}
                  `}
                >
                  คำขออนุมัติ
                </a>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onClickSubMenuItem('package-draft', 'package');
                  }}
                  className={`relative pl-8 p-2 rounded hover:bg-[#0D845A] text-base-semibold
                    ${activeSubMenuItem === 'package-draft' ? 'bg-[#0D845A]' : ''}
                  `}
                >
                  ฉบับร่าง
                </a>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onClickSubMenuItem('package-history', 'package');
                  }}
                  className={`relative pl-8 p-2 rounded hover:bg-[#0D845A] text-base-semibold
                    ${activeSubMenuItem === 'package-history' ? 'bg-[#0D845A]' : ''}
                  `}
                >
                  ประวัติแพ็กเกจ
                </a>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onClickSubMenuItem('package-feedback', 'package');
                  }}
                  className={`relative pl-8 p-2 rounded hover:bg-[#0D845A] text-base-semibold
                    ${activeSubMenuItem === 'package-feedback' ? 'bg-[#0D845A]' : ''}
                  `}
                >
                  ข้อเสนอแนะ
                </a>
              </div>
            )}
          </div>

          {/* จัดการการจอง + sub menu */}
          <div>
            <button
              onClick={() => toggleSubMenu('booking')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition
                ${activeSubMenu === 'booking' && !activeSubMenuItem ? 'bg-[#0D845A]' : ''}
              `}
            >
              <span className="flex items-center gap-3">
                <Icon icon="fluent-mdl2:reservation-orders" className="text-xl" />
                จัดการการจอง
              </span>
              <Icon icon={activeSubMenu === 'booking' ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="text-sm" />
            </button>
            {(activeSubMenu === 'booking' || activeSubMenuItem?.startsWith('booking-')) && (
              <div className="relative ml-4 mt-1 flex flex-col gap-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/40">
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onClickSubMenuItem('booking-refund', 'booking');
                  }}
                  className={`relative pl-8 p-2 rounded hover:bg-[#0D845A] text-base-semibold
                    ${activeSubMenuItem === 'booking-refund' ? 'bg-[#0D845A]' : ''}
                  `}
                >
                  คำขอคืนเงิน
                </a>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onClickSubMenuItem('booking-history', 'booking');
                  }}
                  className={`relative pl-8 p-2 rounded hover:bg-[#0D845A] text-base-semibold
                    ${activeSubMenuItem === 'booking-history' ? 'bg-[#0D845A]' : ''}
                  `}
                >
                  ประวัติการจอง
                </a>
              </div>
            )}
          </div>

          {/* รายงาน */}
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition"
          >
            <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
            รายงาน
          </a>

          {/* ประวัติการเข้าใช้งาน */}
          <a
            href="#"
            className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition"
          >
            <Icon icon="ix:log" className="text-xl" />
            ประวัติการเข้าใช้งาน
          </a>
        </nav>
      </div>

      {/* ออกจากระบบ */}
      <div className="flex flex-col gap-2 text-sm">
        <a
          href="#"
          className="flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition"
        >
          <Icon icon="solar:logout-2-outline" className="text-xl" />
          ออกจากระบบ
        </a>
      </div>
    </div>
  );
};

export default SidebarAdmin;
