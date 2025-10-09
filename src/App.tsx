import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';

type MenuKey =
  | 'community'
  | 'community-stores'
  | 'community-homestays'
  | 'member'
  | 'member-blocked'
  | 'package'
  | 'package-requests'
  | 'package-draft'
  | 'package-histories'
  | 'package-feedbacks'
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

  const [activeMenuKey, setActiveMenuKey] = useState<MenuKey>(null);
  const [openDropdown, setOpenDropdown] = useState<MenuKey | null>(null);

  useEffect(() => {
    // community submenu
    if (pathname.startsWith('/community/stores')) {
      setActiveMenuKey('community-stores');
      setOpenDropdown('community');
    } else if (pathname.startsWith('/community/homestays')) {
      setActiveMenuKey('community-homestays');
      setOpenDropdown('community');
    } else if (pathname.startsWith('/community')) {
      setActiveMenuKey('community');
      setOpenDropdown('community');
    }
    // member submenu
    else if (pathname === '/member/status') {
      setActiveMenuKey('member-blocked');
      setOpenDropdown('member');
    } else if (pathname.startsWith('/member')) {
      setActiveMenuKey('member');
      setOpenDropdown('member');
    }
    // package submenu
    else if (pathname === '/package/requests') {
      setActiveMenuKey('package-requests');
      setOpenDropdown('package');
    } else if (pathname === '/package/draft') {
      setActiveMenuKey('package-draft');
      setOpenDropdown('package');
    } else if (pathname === '/package/histories') {
      setActiveMenuKey('package-histories');
      setOpenDropdown('package');
    } else if (pathname === '/package/feedbacks') {
      setActiveMenuKey('package-feedbacks');
      setOpenDropdown('package');
    } else if (pathname.startsWith('/package')) {
      setActiveMenuKey('package');
      setOpenDropdown('package');
    }
    // booking submenu
    else if (pathname === '/booking/refunds') {
      setActiveMenuKey('booking-refunds');
      setOpenDropdown('booking');
    } else if (pathname === '/booking/histories') {
      setActiveMenuKey('booking-histories');
      setOpenDropdown('booking');
    } else if (pathname.startsWith('/booking')) {
      setActiveMenuKey('booking');
      setOpenDropdown('booking');
    }
    // main menu only
    else if (pathname === '/dashboard') {
      setActiveMenuKey('dashboard');
      setOpenDropdown(null);
    } else if (pathname === '/logs') {
      setActiveMenuKey('logs');
      setOpenDropdown(null);
    } else if (pathname === '/logout') {
      setActiveMenuKey('logout');
      setOpenDropdown(null);
    } else {
      setActiveMenuKey(null);
      setOpenDropdown(null);
    }
  }, [pathname]);

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
        {/* โลโก้ */}
        <div className="flex items-center justify-center mb-6">
          <img src="/Cultura.png" alt="Cultura logo" className="h-10" />
        </div>

        <nav className="flex flex-col gap-2 text-base-semibold">

          {/* จัดการชุมชน */}
          <div>
            <button
              onClick={() => handleClick('community')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${isActive('community') ? 'bg-[#0D845A]' : ''}`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="ri:community-line" className="text-xl" />
                จัดการชุมชน
              </span>
              <Icon icon={openDropdown === 'community' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            </button>
            {openDropdown === 'community' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/community/stores"
                  onClick={() => handleClick('community-stores', 'community')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('community-stores') ? 'bg-[#0D845A]' : ''}`}
                >
                  จัดการร้านค้า
                </Link>
                <Link
                  to="/community/homestays"
                  onClick={() => handleClick('community-homestays', 'community')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('community-homestays') ? 'bg-[#0D845A]' : ''}`}
                >
                  จัดการที่พัก
                </Link>
              </div>
            )}
          </div>

          {/* จัดการสมาชิก */}
          <div>
            <button
              onClick={() => handleClick('member')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${isActive('member') ? 'bg-[#0D845A]' : ''}`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="mdi:account-cog-outline" className="text-xl" />
                จัดการสมาชิก
              </span>
              <Icon icon={openDropdown === 'member' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            </button>
            {openDropdown === 'member' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/member/status"
                  onClick={() => handleClick('member-blocked', 'member')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('member-blocked') ? 'bg-[#0D845A]' : ''}`}
                >
                  การระงับบัญชี
                </Link>
              </div>
            )}
          </div>

          {/* จัดการแพ็กเกจ */}
          <div>
            <button
              onClick={() => handleClick('package')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${isActive('package') ? 'bg-[#0D845A]' : ''}`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="material-symbols:card-travel-outline" className="text-xl" />
                จัดการแพ็กเกจ
              </span>
              <Icon icon={openDropdown === 'package' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            </button>
            {openDropdown === 'package' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/package/requests"
                  onClick={() => handleClick('package-requests', 'package')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('package-requests') ? 'bg-[#0D845A]' : ''}`}
                >
                  คำขออนุมัติ
                </Link>
                <Link
                  to="/package/draft"
                  onClick={() => handleClick('package-draft', 'package')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('package-draft') ? 'bg-[#0D845A]' : ''}`}
                >
                  ฉบับร่าง
                </Link>
                <Link
                  to="/package/histories"
                  onClick={() => handleClick('package-histories', 'package')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('package-histories') ? 'bg-[#0D845A]' : ''}`}
                >
                  ประวัติแพ็กเกจ
                </Link>
                <Link
                  to="/package/feedbacks"
                  onClick={() => handleClick('package-feedbacks', 'package')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('package-feedbacks') ? 'bg-[#0D845A]' : ''}`}
                >
                  ข้อเสนอแนะ
                </Link>
              </div>
            )}
          </div>

          {/* จัดการการจอง */}
          <div>
            <Link to="/booking">
            <button
              onClick={() => handleClick('booking')}
              className={`flex items-center justify-between w-full p-2 rounded hover:bg-[#0D845A] transition ${isActive('booking') ? 'bg-[#0D845A]' : ''}`}
            >
              <span className="flex items-center gap-3">
                <Icon icon="fluent-mdl2:reservation-orders" className="text-xl" />
                จัดการการจอง
              </span>
              <Icon icon={openDropdown === 'booking' ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            </button>
            </Link>
            {openDropdown === 'booking' && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/40 pl-2">
                <Link
                  to="/booking/refunds"
                  onClick={() => handleClick('booking-refunds', 'booking')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('booking-refunds') ? 'bg-[#0D845A]' : ''}`}
                >
                  คำขอคืนเงิน
                </Link>
                <Link
                  to="/booking/histories"
                  onClick={() => handleClick('booking-histories', 'booking')}
                  className={`pl-6 p-2 rounded hover:bg-[#0D845A] transition ${isActive('booking-histories') ? 'bg-[#0D845A]' : ''}`}
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
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive('dashboard') ? 'bg-[#0D845A]' : ''}`}
          >
            <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
            รายงาน
          </Link>

          {/* ประวัติการเข้าใช้งาน */}
          <Link
            to="/logs"
            onClick={() => handleClick('logs')}
            className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive('logs') ? 'bg-[#0D845A]' : ''}`}
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
          onClick={() => handleClick('logout')}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#0D845A] transition ${isActive('logout') ? 'bg-[#0D845A]' : ''}`}
        >
          <Icon icon="solar:logout-2-outline" className="text-xl" />
          ออกจากระบบ
        </Link>
      </div>
    </div>
  );
};

export default SidebarAdmin;