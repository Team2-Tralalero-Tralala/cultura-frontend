
import CommunityManagementTable from "./components/superAdmin/CommunityManagement";
import AccountManagementTable from "./components/superAdmin/AccountManagement";
import SuspendedAccountTable from "./components/superAdmin/SuspendedAccount";
import PackageManagementTable from "./components/superAdmin/PackageManagement";
import PackageApprovalTable from "./components/superAdmin/PackageApproval";
import TagManagementTable from "./components/superAdmin/TagManagement";
import LogManagementTable from "./components/superAdmin/LogManagement";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-[var(--font-sarabun)]">
      {/* Header */}
      <header className="sticky top-0 z-10 h-14 bg-white shadow flex items-center px-4">
        <div className="font-semibold">Header</div>
      </header>

      {/* Body */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-emerald-900 text-white min-h-[calc(100vh-3.5rem)] p-4">
          Sidebar
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* ถ้าหน้าจอแคบกว่าตาราง ให้เลื่อนแนวนอนได้ */}
          <div className="overflow-x-auto">
            <h1>Super Admin</h1>
            <br />
            <p>จัดการชุมชน</p>
            <CommunityManagementTable />
            <br />
            <p>จัดการบัญชี</p>
            <AccountManagementTable />
            <br />
            <p>ระงับบัญชี</p>
            <SuspendedAccountTable />
            <br />
            <p>จัดการแพ็กเกจ</p>
            <PackageManagementTable />
            <br />
            <p>อนุมัติคำขอแพ็กเกจ</p>
            <PackageApprovalTable />
            <br />
            <p>จัดการประเภท</p>
            <TagManagementTable />
            <br />
            <p>ประวัติการใช้งาน</p>
            <LogManagementTable />

          </div>
        </main>
      </div>
    </div>
  );
}
