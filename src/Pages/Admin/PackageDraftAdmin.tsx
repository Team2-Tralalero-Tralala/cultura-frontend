import { useEffect, useState } from "react";
import NavbarSam from "../../Components/NavbarSam";
import DataTable, { type Column } from "../../Components/Tables/Index";
import SearchBarTable from "../../Components/Search/SerachBarTable";
import { Plus, Edit, Trash } from "lucide-react";
import { ChevronRight } from "lucide-react";

// คำอธิบาย: โครงสร้างข้อมูลแพ็กเกจ
interface Package extends Record<string, unknown> {
  name: string;
  community: string;
  overseer: string;
  status: string;
}

// คำอธิบาย: หน้าจอจัดการแพ็กเกจฉบับร่าง สำหรับผู้ดูแลระบบ
const PackageDraftAdmin = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ดึงข้อมูลแพ็กเกจฉบับร่างเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/admin/packages/draft", {
          credentials: "include"
        });
        const result = await res.json();

        if (!result.data) {
          setPackages([]);
          return;
        }
        // แปลงข้อมูลให้ตรงกับโครงสร้าง Package
        const formatted: Package[] = result.data.map((pkg: any) => ({
          name: pkg.name ?? "-",
          community: pkg.community?.name ?? "-",
          overseer: pkg.overseerPackage?.username ?? "-",
          status: pkg.statusPackage === "DRAFT" ? "ฉบับร่าง" : pkg.statusPackage ?? "-",
        }));

        setPackages(formatted);
      } catch (err) {
        console.error("Fetch error:", err);
        setPackages([]);
      }
    };

    fetchPackages();
  }, []);
  // ฟังก์ชันจัดการการแก้ไขแพ็กเกจ
  const handleEdit = (pkg: Package) => {
    alert(`📝 แก้ไขแพ็กเกจ: ${pkg.name}`);
  };
  // ฟังก์ชันจัดการการลบแพ็กเกจ
  const handleDelete = (pkg: Package) => {
    if (confirm(`คุณต้องการลบแพ็กเกจ: ${pkg.name} ใช่ไหม?`)) {
      setPackages((prev) => prev.filter((p) => p.name !== pkg.name));
    }
  };

  // กำหนดคอลัมน์สำหรับ DataTable
  const columns: Column<Package>[] = [
    { key: "name", header: "ชื่อแพ็กเกจ" },
    { key: "community", header: "ชื่อชุมชน" },
    { key: "overseer", header: "ชื่อผู้ดูแล" },
    { key: "status", header: "สถานะแพ็กเกจ" },
    {
      key: "setting",
      header: "จัดการ",
      render: (pkg) => (
        <div className="flex space-x-2">
          <Edit
            size={20}
            strokeWidth={2.5}
            className="text-gray-500 hover:text-gray-700 cursor-pointer "
            onClick={() => handleEdit(pkg)}
          />
          <Trash
            size={20}
            strokeWidth={2.5}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => handleDelete(pkg)}
          />
        </div>
      ),
    },
  ];

  // กรองแพ็กเกจตามคำค้นหา
  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.community.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.overseer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="font-sarabun">
      <NavbarSam />
      {/* ส่วนหัว */}
      <div className="pt-2 px-4 pb-4">
      <div className="text-[14px] text-black mb-1 flex items-center">
          <span>จัดการแพ็กเกจ</span>
          <ChevronRight size={20} className="mx-1 text-black" />
          <span className="font-medium" style={{ color: "#494949" }}>
            ฉบับร่าง
          </span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[20px] font-medium">ฉบับร่าง</h1>
        </div>

        <div className="flex items-center justify-between mb-3 font-sarabun">
          <SearchBarTable
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
          {/* ปุ่มเพิ่มแพ็กเกจ */}
          <button
            className="flex items-center border text-white px-4 py-2 rounded-md transition h-10"
            style={{ backgroundColor: "#055035" }}
          >
            <Plus size={18} className="mr-2" />
            <div className="text-[14px] font-bold">เพิ่มแพ็กเกจ</div>
          </button>
        </div>
        {/* ตารางแสดงข้อมูลแพ็กเกจ */}
        <DataTable<Package>
          data={filteredPackages}
          columns={columns}
          getRowKey={(pkg) => pkg.name}
          pageSizeOptions={[10, 30, 50]}
          defaultPageSize={10}
          theme="brand"
        />
      </div>
    </div>
  );
};

export default PackageDraftAdmin;
