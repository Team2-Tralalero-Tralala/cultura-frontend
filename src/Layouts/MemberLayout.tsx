import { Outlet } from "react-router-dom";
import SidebarMember from "../Components/SidebarMember";
import NavbarSam from "../Components/NavbarSam";

export default function AdminLayout() {
    return (
        <div className="flex h-screen font-sarabun">
            <SidebarMember />
            <div className="flex-1 min-w-0 flex flex-col">
                <NavbarSam />
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
