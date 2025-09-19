// Super Admin
import CommunityTable from "./components/superAdmin/CommunityTable";
import AccountTable from "./components/superAdmin/AccountTable";
import SuspendedAccountTable from "./components/superAdmin/SuspendedAccountTable";
import PackageTable from "./components/superAdmin/PackageTable";
import PackageApprovalTable from "./components/superAdmin/PackageApprovalTable";
import TagTable from "./components/superAdmin/TagTable";
import LogTable from "./components/superAdmin/LogTable";

// Admin
import ShopTable from "./components/Admin/ShopTable";
import AccommodationTable from "./components/Admin/AccommodationTable";
import MemberTable from "./components/Admin/MemberTable";
import SuspendedMemberTable from "./components/Admin/SuspendedMemberTable";
import PackageTableForAd from "./components/Admin/PackageTableForAd";
import PackageApprovalTableForAd from "./components/Admin/PackageApprovalTableForAd"; 
import DraftTableForAd from "./components/Admin/DraftTableForAd";
import PackageHistoryTableForAd from "./components/Admin/PackageHistoryTableForAd";
import BookingTableForAd from "./components/Admin/BookingTableForAd";
import RefundRequestTableForAd from "./components/Admin/RefundRequestTableForAd";
import BookingHistoryTableForAd from "./components/Admin/BookingHistoryTableForAd";
import LogTableForAd from "./components/Admin/LogTableForAd";

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
            <CommunityTable />
            <br />
            <p>จัดการบัญชี</p>
            <AccountTable />
            <br />
            <p>ระงับบัญชี</p>
            <SuspendedAccountTable />
            <br />
            <p>จัดการแพ็กเกจ</p>
            <PackageTable />
            <br />
            <p>อนุมัติคำขอแพ็กเกจ</p>
            <PackageApprovalTable />
            <br />
            <p>จัดการประเภท</p>
            <TagTable />
            <br />
            <p>ประวัติการใช้งาน</p>
            <LogTable />

            <h1>=====================================================================================================================</h1>
            <h1>Admin</h1>
            <br />
            <p>จัดการร้านค้า</p>
            <ShopTable />
            <br />
            <p>จัดการที่พัก</p>
            <AccommodationTable />
            <br />
            <p>จัดการสมาชิก</p>
            <MemberTable />
            <br />
            <p>ระงับการใช้งาน</p>
            <SuspendedMemberTable />
            <br />
            <p>จัดการแพ็กเกจ</p>
            <PackageTableForAd />
            <br />
            <p>อนุมัติคำขอ</p>
            <PackageApprovalTableForAd />
            <br />
            <p>ฉบับร่าง</p>
            <DraftTableForAd />
            <br />
            <p>ประวัติแพ็กเกจ</p>
            <PackageHistoryTableForAd />
            <br />
            <p>จัดการการจอง</p>
            <BookingTableForAd />
            <br />
            <p>จัดการคำขอคืนเงิน</p>
            <RefundRequestTableForAd />
            <br />
            <p>ประวัติการจอง</p>
            <BookingHistoryTableForAd />
            <br />
            <p>ประวัติการใช้งาน</p>
            <LogTableForAd />

          </div>
        </main>
      </div>
    </div>
  );
}
