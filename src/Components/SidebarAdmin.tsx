/**
 * Component: SidebarAdmin
 * คำอธิบาย: แถบเมนูด้านข้างสำหรับผู้ดูแลชุมชน (Admin)
 * Features:
 * - แสดงเมนูที่เกี่ยวข้องกับการจัดการ เช่น ชุมชน, สมาชิก, แพ็กเกจ, การจอง, รายงาน และ logs
 * - รองรับเมนูหลักและเมนูย่อยแบบ dropdown
 * - ใช้ React Router ในการจัดการการนำทาง
 * - ใช้ไอคอนจาก Iconify
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';

type MenuKey =
  | 'community'
  | 'community-stores'
  | 'community-homestays'
  | 'members'
  | 'member-status'
  | 'packages'
  | 'packages-requests'
  | 'packages-draft'
  | 'packages-histories'
  | 'packages-feedbacks'
  | 'booking'
  | 'booking-refunds'
  | 'booking-histories'
  | 'dashboard'
  | 'logs'
  | 'logout'
  | null;

const SidebarAdmin = () => {
  const location = useLocation();
  const { pathname } = location;

  const basePath = '/admin';
  const currentPath = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || '/'
    : pathname;

  const [activeMenuKey, setActiveMenuKey] = useState<MenuKey>(null);
  const [openDropdown, setOpenDropdown] = useState<MenuKey | null>(null);

  useEffect(() => {
    if (currentPath.startsWith('/community/stores')) {
      setActiveMenuKey('community-stores');
      setOpenDropdown('community');
    } else if (currentPath.startsWith('/community/homestays')) {
      setActiveMenuKey('community-homestays');
      setOpenDropdown('community');
    } else if (currentPath.startsWith('/community')) {
      setActiveMenuKey('community');
      setOpenDropdown('community');
    } else if (currentPath === '/member/status') {
      setActiveMenuKey('member-status');
      setOpenDropdown('members');
    } else if (currentPath.startsWith('/members')) {
      setActiveMenuKey('members');
      setOpenDropdown('members');
    } else if (currentPath === '/package/requests') {
      setActiveMenuKey('packages-requests');
      setOpenDropdown('packages');
    } else if (currentPath === '/package/draft') {
      setActiveMenuKey('packages-draft');
      setOpenDropdown('packages');
    } else if (currentPath === '/package/histories') {
      setActiveMenuKey('packages-histories');
      setOpenDropdown('packages');
    } else if (currentPath === '/package/feedbacks') {
      setActiveMenuKey('packages-feedbacks');
      setOpenDropdown('packages');
    } else if (currentPath.startsWith('/packages')) {
      setActiveMenuKey('packages');
      setOpenDropdown('packages');
    } else if (currentPath === '/booking/refunds') {
      setActiveMenuKey('booking-refunds');
      setOpenDropdown('booking');
    } else if (currentPath === '/booking/histories') {
      setActiveMenuKey('booking-histories');
      setOpenDropdown('booking');
    } else if (currentPath.startsWith('/booking')) {
      setActiveMenuKey('booking');
      setOpenDropdown('booking');
    } else if (currentPath === '/dashboard') {
      setActiveMenuKey('dashboard');
      setOpenDropdown(null);
    } else if (currentPath === '/logs') {
      setActiveMenuKey('logs');
      setOpenDropdown(null);
    } else if (currentPath === '/logout') {
      setActiveMenuKey('logout');
      setOpenDropdown(null);
    } else {
      setActiveMenuKey(null);
      setOpenDropdown(null);
    }
  }, [currentPath]);

  const isActive = (key: MenuKey) => activeMenuKey === key;

  const handleClick = (key: MenuKey, parentKey?: MenuKey) => {
    setActiveMenuKey(key);
    if (parentKey) {
      setOpenDropdown(parentKey);
    } else {
      setOpenDropdown(prev => (prev === key ? null : key));
    }
  };

  const menuLink = (
    label: string,
    to: string,
    icon: string,
    key: MenuKey,
    parentKey?: MenuKey
  ) => (
    <Link
      to={`${basePath}${to}`}
      onClick={() => handleClick(key, parentKey)}
      className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${
        isActive(key) ? 'bg-[#0D845A]' : ''
      }`}
    >
      <Icon icon={icon} className="text-xl" />
      {label}
    </Link>
  );

  return (
    <div className="h-screen w-60 bg-[#055035] text-white flex flex-col justify-between py-6 px-4">
      <div>
        {/* โลโก้ */}
        <div className="flex items-center justify-center mb-6">
          <img src="/Cultura.png" alt="Cultura logo" className="h-10" />
        </div>

        {/* เมนู */}
        <nav className="flex flex-col gap-2 text-sm">
          {/* === ชุมชน === */}
          <Link
            to={`${basePath}/community`}
            onClick={() => handleClick('community')}
            className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${
              isActive('community') ? 'bg-[#0D845A]' : ''
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon icon="ri:community-line" className="text-xl" />
              จัดการชุมชน
            </span>
            <Icon icon={openDropdown === 'community' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
          </Link>
          {openDropdown === 'community' && (
            <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
              {menuLink('จัดการร้านค้า', '/community/stores', 'mdi:store-outline', 'community-stores', 'community')}
              {menuLink('จัดการที่พัก', '/community/homestays', 'mdi:home-city-outline', 'community-homestays', 'community')}
            </div>
          )}

          {/* === สมาชิก === */}
          <Link
            to={`${basePath}/members`}
            onClick={() => handleClick('members')}
            className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${
              isActive('members') ? 'bg-[#0D845A]' : ''
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon icon="mdi:account-cog-outline" className="text-xl" />
              จัดการสมาชิก
            </span>
            <Icon icon={openDropdown === 'members' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
          </Link>
          {openDropdown === 'members' && (
            <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
              {menuLink('การระงับบัญชี', '/member/status', 'mdi:account-cancel-outline', 'member-status', 'members')}
            </div>
          )}

          {/* === แพ็กเกจ === */}
          <Link
            to={`${basePath}/packages`}
            onClick={() => handleClick('packages')}
            className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${
              isActive('packages') ? 'bg-[#0D845A]' : ''
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
              {menuLink('คำขออนุมัติ', '/package/requests', 'mdi:file-document-outline', 'packages-requests', 'packages')}
              {menuLink('ฉบับร่าง', '/package/draft', 'mdi:file-edit-outline', 'packages-draft', 'packages')}
              {menuLink('ประวัติแพ็กเกจ', '/package/histories', 'mdi:history', 'packages-histories', 'packages')}
              {menuLink('ข้อเสนอแนะ', '/package/feedbacks', 'mdi:comment-text-outline', 'packages-feedbacks', 'packages')}
            </div>
          )}

          {/* === การจอง === */}
          <Link
            to={`${basePath}/booking`}
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
          </Link>
          {openDropdown === 'booking' && (
            <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
              {menuLink('คำขอคืนเงิน', '/booking/refunds', 'mdi:cash-refund', 'booking-refunds', 'booking')}
              {menuLink('ประวัติการจอง', '/booking/histories', 'mdi:history', 'booking-histories', 'booking')}
            </div>
          )}

          {/* === รายงาน และ Logs === */}
          {menuLink('รายงาน', '/dashboard', 'mdi:view-dashboard-outline', 'dashboard')}
          {menuLink('ประวัติการเข้าใช้งาน', '/logs', 'mdi:clipboard-text-clock-outline', 'logs')}
        </nav>
      </div>

      {/* === ออกจากระบบ === */}
      <div className="flex flex-col gap-2 text-sm">
        {menuLink('ออกจากระบบ', '/logout', 'solar:logout-2-outline', 'logout')}
      </div>
    </div>
  );
};

export default SidebarAdmin;
