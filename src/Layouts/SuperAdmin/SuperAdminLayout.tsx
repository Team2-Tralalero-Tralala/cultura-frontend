import { Outlet } from "react-router-dom";
import SidebarSuperAdmin from "../../Components/SidebarSuperAdmin";
import NavbarSam from "../../Components/NavbarSam";

export default function SuperAdminLayout() {
    return (
        <div className="flex h-screen">
            <SidebarSuperAdmin />
            <div className="flex-1 min-w-0 flex flex-col">
                <NavbarSam />
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}