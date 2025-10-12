import React from 'react';
import SidebarMember from '../../Components/SidebarMember';
import { Outlet } from 'react-router-dom';

const MemberLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <SidebarMember />
      <div className="flex-1 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default MemberLayout;
