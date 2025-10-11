import React from 'react';
import SidebarSuperAdmin from '../../Components/SidebarSuperAdmin';
import { Outlet } from 'react-router-dom';

const SuperAdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <SidebarSuperAdmin />
      <div className="flex-1 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminLayout;
